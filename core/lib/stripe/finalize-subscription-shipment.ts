import 'server-only';

import { createBigCommerceBatchedSubscriptionOrder } from '~/lib/bigcommerce/subscription-order';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

import type { CustomerSubscription } from './subscriptions';
import {
  getSubscriptionOrderBatch,
  removeSubscriptionOrderBatch,
  type SubscriptionOrderBatch,
} from './subscription-order-batch';
import {
  isSubscriptionPaymentFailed,
  releaseSubscriptionFromFailedShipmentDeadline,
  skipSubscriptionDelivery,
} from './subscription-delivery-payment';
import { isPastShipmentCutoff } from './subscription-shipment-cutoff';
import {
  buildShipmentStorageKey,
  getFinalizedShipmentRecord,
  isShipmentFinalized,
  saveFinalizedShipmentRecord,
  type FinalizedShipmentRecord,
  type ShipmentSkippedItem,
} from './subscription-shipment-records';
import {
  getNextShipmentTimestamp,
  getShipmentCalendarDayKey,
} from './subscription-shipment-grouping';
import { markSubscriptionOrderCreated } from './storage';

export function getSubscriptionsInShipmentGroup(
  subscriptions: CustomerSubscription[],
  dayKey: string,
  shippingAddressKey: string,
): CustomerSubscription[] {
  return subscriptions.filter(
    (subscription) =>
      subscription.shippingAddressKey === shippingAddressKey &&
      getShipmentCalendarDayKey(getNextShipmentTimestamp(subscription)) === dayKey,
  );
}

export type ShipmentBatchReadiness = 'pending' | 'ready' | 'blocked_failed_payment';

export function getShipmentBatchReadiness({
  groupSubscriptions,
  batch,
  dayKey,
  shippingAddressKey,
  pastCutoff,
}: {
  groupSubscriptions: CustomerSubscription[];
  batch: SubscriptionOrderBatch | null;
  dayKey: string;
  shippingAddressKey: string;
  pastCutoff: boolean;
}): ShipmentBatchReadiness {
  if (!batch || batch.items.length === 0) {
    return 'pending';
  }

  const paidSubscriptionIds = new Set(batch.items.map((item) => item.stripeSubscriptionId));

  for (const subscription of groupSubscriptions) {
    if (paidSubscriptionIds.has(subscription.id)) {
      continue;
    }

    const skippedDay = subscription.metadata.skipped_shipment_day?.trim();
    const addressKey =
      subscription.metadata.shipping_address_key?.trim() || subscription.shippingAddressKey;

    if (skippedDay === dayKey && addressKey === shippingAddressKey) {
      continue;
    }

    if (isSubscriptionPaymentFailed(subscription.status)) {
      if (!pastCutoff) {
        return 'blocked_failed_payment';
      }

      continue;
    }

    return 'pending';
  }

  return 'ready';
}

function getCustomerSkippedItemsForShipment(
  subscriptions: CustomerSubscription[],
  dayKey: string,
  shippingAddressKey: string,
): ShipmentSkippedItem[] {
  return subscriptions
    .filter((subscription) => {
      const skippedDay = subscription.metadata.skipped_shipment_day?.trim();
      const addressKey =
        subscription.metadata.shipping_address_key?.trim() || subscription.shippingAddressKey;

      return skippedDay === dayKey && addressKey === shippingAddressKey;
    })
    .map((subscription) => ({
      subscriptionId: subscription.id,
      productName: subscription.productName,
      quantity: subscription.quantity,
      reason:
        subscription.metadata.shipment_skip_reason === 'payment_deadline'
          ? 'payment_deadline'
          : 'customer_skip',
    }));
}

export async function tryFinalizeSubscriptionShipment({
  customerId,
  dayKey,
  shippingAddressKey,
  subscriptions,
  stripeCustomerId,
}: {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
  subscriptions: CustomerSubscription[];
  stripeCustomerId: string;
}): Promise<FinalizedShipmentRecord | null> {
  const storageKey = buildShipmentStorageKey({ customerId, dayKey, shippingAddressKey });

  const existing = await getFinalizedShipmentRecord(storageKey);

  if (existing) {
    return existing;
  }

  const groupSubscriptions = getSubscriptionsInShipmentGroup(
    subscriptions,
    dayKey,
    shippingAddressKey,
  );
  const pastCutoff = isPastShipmentCutoff(dayKey);
  const batch = await getSubscriptionOrderBatch(storageKey);
  const batchReadiness = getShipmentBatchReadiness({
    groupSubscriptions,
    batch,
    dayKey,
    shippingAddressKey,
    pastCutoff,
  });

  if (batchReadiness !== 'ready') {
    return null;
  }

  const failedSubscriptions = groupSubscriptions.filter((subscription) =>
    isSubscriptionPaymentFailed(subscription.status),
  );
  const customerSkippedItems = getCustomerSkippedItemsForShipment(
    subscriptions,
    dayKey,
    shippingAddressKey,
  );

  if (failedSubscriptions.length > 0 && !pastCutoff) {
    return null;
  }

  const skippedItems: ShipmentSkippedItem[] = [...customerSkippedItems];

  if (pastCutoff) {
    for (const subscription of failedSubscriptions) {
      if (skippedItems.some((item) => item.subscriptionId === subscription.id)) {
        continue;
      }

      const result = await skipSubscriptionDelivery({
        subscriptionId: subscription.id,
        stripeCustomerId,
        skipReason: 'payment_deadline',
        shipmentDayKey: dayKey,
      });

      if (result.ok) {
        skippedItems.push({
          subscriptionId: subscription.id,
          productName: subscription.productName,
          quantity: subscription.quantity,
          reason: 'payment_deadline',
        });
        continue;
      }

      if (result.reason === 'not_failed') {
        skippedItems.push({
          subscriptionId: subscription.id,
          productName: subscription.productName,
          quantity: subscription.quantity,
          reason: 'payment_deadline',
        });
        continue;
      }

      const released = await releaseSubscriptionFromFailedShipmentDeadline({
        subscriptionId: subscription.id,
        stripeCustomerId,
        shipmentDayKey: dayKey,
      });

      skippedItems.push({
        subscriptionId: subscription.id,
        productName: subscription.productName,
        quantity: subscription.quantity,
        reason: released.ok ? 'payment_deadline' : 'payment_failed',
      });
    }
  }

  const shippingAddressLabel =
    groupSubscriptions[0]?.shippingAddressLabel ??
    batch?.shippingMetadata.shipping_address_label ??
    'Shipping address';
  const shippingMethodLabel = groupSubscriptions[0]?.shippingMethodLabel;

  let bigcommerceOrderId: number | undefined;
  const batchLines = batch?.items ?? [];

  if (batch && batch.items.length > 0 && isBigCommerceAdminConfigured()) {
    bigcommerceOrderId = await createBigCommerceBatchedSubscriptionOrder({
      customerId: batch.customerId,
      shippingMetadata: batch.shippingMetadata,
      currencyCode: batch.currencyCode,
      orderType: batch.orderType,
      batchStorageKey: storageKey,
      dayKey: batch.dayKey,
      lines: batch.items,
    });

    await Promise.all(
      batch.items.map((item) => markSubscriptionOrderCreated(item.invoiceReferenceId, bigcommerceOrderId!)),
    );

    await removeSubscriptionOrderBatch(storageKey, customerId);
  }

  const chargedItems = batchLines.map((item) => ({
    subscriptionId: item.stripeSubscriptionId,
    productName: item.productName,
    quantity: item.quantity,
  }));
  const hasSkipped = skippedItems.length > 0;
  const hasOrder = bigcommerceOrderId != null;

  if (!hasOrder && !hasSkipped) {
    return null;
  }

  const outcome = hasOrder ? (hasSkipped ? 'partial_skipped' : 'ordered') : 'all_failed';

  const record: FinalizedShipmentRecord = {
    storageKey,
    customerId,
    dayKey,
    shippingAddressKey,
    shippingAddressLabel,
    shippingMethodLabel,
    outcome,
    bigcommerceOrderId,
    chargedItems,
    skippedItems,
    finalizedAt: Math.floor(Date.now() / 1000),
  };

  await saveFinalizedShipmentRecord(record);

  // eslint-disable-next-line no-console
  console.info(
    `Finalized subscription shipment ${storageKey} (outcome=${outcome}, order=${bigcommerceOrderId ?? 'none'})`,
  );

  return record;
}

export async function finalizeDueShipmentsForCustomer({
  customerId,
  stripeCustomerId,
  subscriptions,
}: {
  customerId: number;
  stripeCustomerId: string;
  subscriptions: CustomerSubscription[];
}): Promise<void> {
  const shipmentGroups = new Map<string, { dayKey: string; shippingAddressKey: string }>();

  for (const subscription of subscriptions) {
    const dayKey = getShipmentCalendarDayKey(getNextShipmentTimestamp(subscription));
    const storageKey = buildShipmentStorageKey({
      customerId,
      dayKey,
      shippingAddressKey: subscription.shippingAddressKey,
    });

    if (await isShipmentFinalized(storageKey)) {
      continue;
    }

    shipmentGroups.set(storageKey, {
      dayKey,
      shippingAddressKey: subscription.shippingAddressKey,
    });
  }

  const batch = await import('./subscription-order-batch');
  const batchKeys = await batch.getSubscriptionOrderBatchIndex(customerId);

  for (const storageKey of batchKeys) {
    if (await isShipmentFinalized(storageKey)) {
      continue;
    }

    const parts = storageKey.split(':');

    if (parts.length >= 3) {
      shipmentGroups.set(storageKey, {
        dayKey: parts[1]!,
        shippingAddressKey: parts.slice(2).join(':'),
      });
    }
  }

  for (const group of shipmentGroups.values()) {
    try {
      await tryFinalizeSubscriptionShipment({
        customerId,
        dayKey: group.dayKey,
        shippingAddressKey: group.shippingAddressKey,
        subscriptions,
        stripeCustomerId,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to finalize shipment ${group.dayKey}:${group.shippingAddressKey}:`, error);
    }
  }
}

export async function tryFinalizeSubscriptionShipmentByStorageKey({
  customerId,
  batchStorageKey,
  stripeCustomerId,
  subscriptions,
}: {
  customerId: number;
  batchStorageKey: string;
  stripeCustomerId: string;
  subscriptions: CustomerSubscription[];
}): Promise<FinalizedShipmentRecord | null> {
  const parts = batchStorageKey.split(':');

  if (parts.length < 3) {
    return null;
  }

  const dayKey = parts[1]!;
  const shippingAddressKey = parts.slice(2).join(':');

  return tryFinalizeSubscriptionShipment({
    customerId,
    dayKey,
    shippingAddressKey,
    subscriptions,
    stripeCustomerId,
  });
}
