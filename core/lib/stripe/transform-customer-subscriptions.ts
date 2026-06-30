import type { CustomerSubscription } from './subscriptions';
import { isSubscriptionPaymentFailed } from './subscription-delivery-payment';
import {
  getShipmentBatchReadiness,
  getSubscriptionsInShipmentGroup,
} from './finalize-subscription-shipment';
import type { SubscriptionOrderBatch } from './subscription-order-batch';
import { getSubscriptionOrderBatchesForCustomer } from './subscription-order-batch';
import type { FinalizedShipmentRecord } from './subscription-shipment-records';
import { buildShipmentStorageKey } from './subscription-shipment-records';
import { isPastShipmentCutoff } from './subscription-shipment-cutoff';
import {
  getCurrentShipmentTimestamp,
  getPortalUpcomingShipmentTimestamp,
  getShipmentCalendarDayKey,
} from './subscription-shipment-grouping';

export { getShipmentCalendarDayKey } from './subscription-shipment-grouping';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  variantSubtitle?: string;
  quantity: number;
  image?: { src: string; alt: string };
  price?: string;
  priceNote?: string;
  intervalLabel: string;
  paymentMethodLabel: string;
  statusLabel: string;
  statusKey: string;
  scheduleDetail?: string;
  paymentFailed?: boolean;
  skippedReasonLabel?: string;
}

export interface SubscriptionDeliveryGroup {
  id: string;
  shippingAddressLabel: string;
  shippingMethodLabel?: string;
  shipmentHeading?: string;
  subtotalExTax?: string;
  tax?: string;
  totalIncTax?: string;
  totalsPending?: boolean;
  totalsNote?: string;
  shipmentPaused?: boolean;
  fulfillmentNote?: string;
  isPast?: boolean;
  bigcommerceOrderId?: number;
  bigcommerceOrderHref?: string;
  bigcommerceOrderLabel?: string;
  outcomeNote?: string;
  items: SubscriptionListItem[];
}

export interface SubscriptionDateGroup {
  id: string;
  title: string;
  deliveries: SubscriptionDeliveryGroup[];
}

/** @deprecated Use SubscriptionDateGroup */
export interface SubscriptionShipmentGroup {
  id: string;
  title: string;
  items: SubscriptionListItem[];
}

export interface SubscriptionPortalSections {
  upcomingShipments: SubscriptionDateGroup[];
  pastShipments: SubscriptionDateGroup[];
  active: SubscriptionListItem[];
  canceled: SubscriptionListItem[];
}

type Format = {
  number: (
    value: number,
    options?: { style?: 'currency'; currency?: string },
  ) => string;
  dateTime: (value: Date, options?: { dateStyle?: 'medium' }) => string;
};

type SubscriptionsT = (key: string, values?: Record<string, string | number | Date>) => string;

function formatMoney(
  format: Format,
  amountCents: number,
  currency: string,
): string {
  return format.number(amountCents / 100, {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
}

function formatIntervalLabel(
  subscription: CustomerSubscription,
  t: SubscriptionsT,
): string {
  const { interval, intervalCount } = subscription;

  if (intervalCount === 1) {
    return t(`intervals.${interval}`);
  }

  return t(`intervals.${interval}Plural`, { count: intervalCount });
}

function getStatusKey(subscription: CustomerSubscription): string {
  const now = Math.floor(Date.now() / 1000);

  if (isCanceledSubscription(subscription)) {
    return 'canceled';
  }

  if (
    subscription.status === 'trialing' ||
    (subscription.status === 'active' &&
      subscription.billingCycleAnchor != null &&
      subscription.billingCycleAnchor > now)
  ) {
    return 'scheduled';
  }

  if (subscription.status in { active: 1, past_due: 1, unpaid: 1, paused: 1 }) {
    return subscription.status as 'active' | 'past_due' | 'unpaid' | 'paused';
  }

  if (subscription.status === 'incomplete_expired') {
    return 'incomplete_expired';
  }

  if (subscription.status === 'incomplete') {
    return 'incomplete';
  }

  return 'active';
}

function getScheduleDetail(
  subscription: CustomerSubscription,
  t: SubscriptionsT,
  format: Format,
): string | undefined {
  if (isCanceledSubscription(subscription)) {
    return undefined;
  }

  const formatDate = (timestamp: number) =>
    format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' });

  const now = Math.floor(Date.now() / 1000);
  const firstChargeTimestamp =
    subscription.trialEnd && subscription.trialEnd > now
      ? subscription.trialEnd
      : subscription.billingCycleAnchor && subscription.billingCycleAnchor > now
        ? subscription.billingCycleAnchor
        : null;

  if (firstChargeTimestamp) {
    return t('firstChargeOn', { date: formatDate(firstChargeTimestamp) });
  }

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return t('renewsOn', { date: formatDate(subscription.currentPeriodEnd) });
  }

  return undefined;
}

export { getCurrentShipmentTimestamp, getPortalUpcomingShipmentTimestamp } from './subscription-shipment-grouping';

export function transformCustomerSubscription(
  subscription: CustomerSubscription,
  t: SubscriptionsT,
  format: Format,
  options: { hidePricing?: boolean } = {},
): SubscriptionListItem {
  const statusKey = getStatusKey(subscription);
  let price: string | undefined;
  let priceNote: string | undefined;

  if (!options.hidePricing) {
    if (subscription.subtotalExTaxCents != null) {
      price = formatMoney(format, subscription.subtotalExTaxCents, subscription.currency);

      if (subscription.priceConfirmedAtBilling) {
        priceNote = t('subjectToChangeAtBilling');
      }
    } else if (subscription.priceConfirmedAtBilling) {
      priceNote = t('priceAtBilling');
    } else if (subscription.unitAmount == null) {
      priceNote = t('customPricing');
    } else {
      price = formatMoney(
        format,
        subscription.unitAmount * subscription.quantity,
        subscription.currency,
      );
    }
  }

  return {
    id: subscription.id,
    productName: subscription.productName,
    variantSubtitle: subscription.variantSubtitle,
    quantity: subscription.quantity,
    image: subscription.image,
    price,
    priceNote,
    intervalLabel: formatIntervalLabel(subscription, t),
    paymentMethodLabel: subscription.paymentMethodLabel,
    statusLabel: t(`status.${statusKey}`),
    statusKey,
    scheduleDetail: getScheduleDetail(subscription, t, format),
    paymentFailed: isSubscriptionPaymentFailed(subscription.status),
  };
}

export function transformCustomerSubscriptions(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  options: { hidePricing?: boolean } = {},
): SubscriptionListItem[] {
  return subscriptions.map((subscription) =>
    transformCustomerSubscription(subscription, t, format, options),
  );
}

export function isCanceledSubscription(subscription: CustomerSubscription): boolean {
  if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
    return true;
  }

  return (
    subscription.cancelAtPeriodEnd &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}

function buildDeliveryTotals(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
): Pick<
  SubscriptionDeliveryGroup,
  'subtotalExTax' | 'tax' | 'totalIncTax' | 'totalsPending' | 'totalsNote'
> {
  const billableSubscriptions = subscriptions.filter(
    (subscription) => !isSubscriptionPaymentFailed(subscription.status),
  );

  if (billableSubscriptions.length === 0) {
    return { totalsPending: true };
  }

  const hasPendingPricing = billableSubscriptions.some(
    (subscription) =>
      subscription.priceConfirmedAtBilling && subscription.subtotalExTaxCents == null,
  );

  if (hasPendingPricing) {
    return { totalsPending: true };
  }

  const currency = billableSubscriptions[0]?.currency ?? 'usd';
  const subtotalExTaxCents = billableSubscriptions.reduce(
    (sum, subscription) => sum + (subscription.subtotalExTaxCents ?? 0),
    0,
  );
  const taxCents = billableSubscriptions.reduce(
    (sum, subscription) => sum + (subscription.taxCents ?? 0),
    0,
  );
  const totalIncTaxCents = billableSubscriptions.reduce(
    (sum, subscription) =>
      sum + (subscription.totalIncTaxCents ?? subscription.subtotalExTaxCents ?? 0),
    0,
  );

  const hasEstimatedPricing = billableSubscriptions.some(
    (subscription) => subscription.priceConfirmedAtBilling,
  );

  return {
    subtotalExTax: formatMoney(format, subtotalExTaxCents, currency),
    tax: formatMoney(format, taxCents, currency),
    totalIncTax: formatMoney(format, totalIncTaxCents, currency),
    totalsPending: false,
    totalsNote: hasEstimatedPricing ? t('subjectToChangeAtBilling') : undefined,
  };
}

function applyBatchStatusToDelivery(
  delivery: SubscriptionDeliveryGroup,
  addressKey: string,
  batchEnrichment: {
    customerId: number;
    dayKey: string;
    allSubscriptionsInDateGroup: CustomerSubscription[];
    batchesByStorageKey: Map<string, SubscriptionOrderBatch>;
    t: SubscriptionsT;
  },
): SubscriptionDeliveryGroup {
  const storageKey = buildShipmentStorageKey({
    customerId: batchEnrichment.customerId,
    dayKey: batchEnrichment.dayKey,
    shippingAddressKey: addressKey,
  });
  const batch = batchEnrichment.batchesByStorageKey.get(storageKey) ?? null;

  if (!batch || batch.items.length === 0) {
    return delivery;
  }

  const paidSubscriptionIds = new Set(batch.items.map((item) => item.stripeSubscriptionId));
  const groupSubscriptions = getSubscriptionsInShipmentGroup(
    batchEnrichment.allSubscriptionsInDateGroup,
    batchEnrichment.dayKey,
    addressKey,
  );
  const items = delivery.items.map((item) => {
    if (!paidSubscriptionIds.has(item.id)) {
      return item;
    }

    return {
      ...item,
      statusKey: 'charged',
      statusLabel: batchEnrichment.t('delivery.charged'),
    };
  });
  const readiness = getShipmentBatchReadiness({
    groupSubscriptions,
    batch,
    dayKey: batchEnrichment.dayKey,
    shippingAddressKey: addressKey,
    pastCutoff: isPastShipmentCutoff(batchEnrichment.dayKey),
  });

  let fulfillmentNote: string | undefined;

  if (readiness === 'ready') {
    fulfillmentNote = batchEnrichment.t('delivery.processingOrder');
  } else if (readiness === 'pending') {
    fulfillmentNote = batchEnrichment.t('delivery.waitingForPayments', {
      paid: batch.items.length,
      total: groupSubscriptions.length,
    });
  }

  return {
    ...delivery,
    items,
    fulfillmentNote,
  };
}

function groupSubscriptionsIntoDeliveries(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  idPrefix: string,
  batchEnrichment?: {
    customerId: number;
    dayKey: string;
    allSubscriptionsInDateGroup: CustomerSubscription[];
    batchesByStorageKey: Map<string, SubscriptionOrderBatch>;
  },
): SubscriptionDeliveryGroup[] {
  const deliveries = new Map<
    string,
    {
      shippingAddressLabel: string;
      shippingMethodLabel?: string;
      subscriptions: CustomerSubscription[];
    }
  >();

  for (const subscription of subscriptions) {
    const key = subscription.shippingAddressKey;
    const existing = deliveries.get(key);

    if (existing) {
      existing.subscriptions.push(subscription);
      continue;
    }

    deliveries.set(key, {
      shippingAddressLabel: subscription.shippingAddressLabel,
      shippingMethodLabel: subscription.shippingMethodLabel,
      subscriptions: [subscription],
    });
  }

  return Array.from(deliveries.entries()).map(([addressKey, delivery]) => {
    const totals = buildDeliveryTotals(delivery.subscriptions, t, format);
    const deliveryPaused = delivery.subscriptions.some((subscription) =>
      isSubscriptionPaymentFailed(subscription.status),
    );

    const baseDelivery: SubscriptionDeliveryGroup = {
      id: `${idPrefix}-${addressKey}`,
      shippingAddressLabel: delivery.shippingAddressLabel,
      shippingMethodLabel: t('delivery.freeShipping'),
      items: delivery.subscriptions.map((subscription) =>
        transformCustomerSubscription(subscription, t, format),
      ),
      shipmentPaused: deliveryPaused,
      ...totals,
    };

    if (!batchEnrichment) {
      return baseDelivery;
    }

    return applyBatchStatusToDelivery(baseDelivery, addressKey, { ...batchEnrichment, t });
  });
}

function formatPastShipmentSkipReasonLabel(
  reason: FinalizedShipmentRecord['skippedItems'][number]['reason'],
  t: SubscriptionsT,
): string {
  if (reason === 'customer_skip') {
    return t('pastShipment.skipReason.customer_skip');
  }

  return t('pastShipment.skipReason.missedDeadline');
}

function buildPastShipmentDeliveryGroups(
  records: FinalizedShipmentRecord[],
  t: SubscriptionsT,
): SubscriptionDeliveryGroup[] {
  return records.map((record) => {
    const chargedItems: SubscriptionListItem[] = record.chargedItems.map((item) => ({
      id: item.subscriptionId,
      productName: item.productName,
      quantity: item.quantity,
      intervalLabel: '',
      paymentMethodLabel: '',
      statusLabel: t('pastShipment.statusCharged'),
      statusKey: 'active',
    }));

    const skippedItems: SubscriptionListItem[] = record.skippedItems.map((item) => ({
      id: item.subscriptionId,
      productName: item.productName,
      quantity: item.quantity,
      intervalLabel: '',
      paymentMethodLabel: '',
      statusLabel: t('pastShipment.statusSkipped'),
      statusKey: 'skipped',
      skippedReasonLabel: formatPastShipmentSkipReasonLabel(item.reason, t),
    }));

    const outcomeNote =
      record.outcome === 'partial_skipped'
        ? t('pastShipment.outcomePartialNote')
        : record.outcome === 'all_failed'
          ? t('pastShipment.outcomeAllFailed')
          : undefined;

    return {
      id: `past-${record.storageKey}`,
      shippingAddressLabel: record.shippingAddressLabel,
      shippingMethodLabel: record.shippingMethodLabel ?? t('delivery.freeShipping'),
      isPast: true,
      bigcommerceOrderId: record.bigcommerceOrderId,
      bigcommerceOrderHref: record.bigcommerceOrderId
        ? `/account/orders/${record.bigcommerceOrderId}/`
        : undefined,
      bigcommerceOrderLabel: record.bigcommerceOrderId
        ? t('pastShipment.orderLink', { orderId: record.bigcommerceOrderId })
        : undefined,
      outcomeNote,
      totalsPending: record.outcome === 'all_failed',
      items: [...chargedItems, ...skippedItems],
    };
  });
}

function buildPastShipmentGroups(
  records: FinalizedShipmentRecord[],
  t: SubscriptionsT,
  format: Format,
): SubscriptionDateGroup[] {
  const groups = new Map<string, FinalizedShipmentRecord[]>();

  for (const record of records) {
    const existing = groups.get(record.dayKey);

    if (existing) {
      existing.push(record);
      continue;
    }

    groups.set(record.dayKey, [record]);
  }

  return Array.from(groups.entries())
    .sort(([leftDay], [rightDay]) => rightDay.localeCompare(leftDay))
    .map(([dayKey, dayRecords]) => {
      const [year, month, day] = dayKey.split('-').map(Number);
      const sortTimestamp = Math.floor(Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1) / 1000);
      const deliveries = buildPastShipmentDeliveryGroups(dayRecords, t);

      return {
        id: `past-shipment-${dayKey}`,
        title: t('shipmentOn', {
          date: format.dateTime(new Date(sortTimestamp * 1000), { dateStyle: 'medium' }),
        }),
        deliveries:
          deliveries.length > 1
            ? deliveries.map((delivery, index) => ({
                ...delivery,
                shipmentHeading: t('delivery.shipment', { number: index + 1 }),
              }))
            : deliveries,
      };
    });
}

function filterSubscriptionsForUpcomingShipments(
  subscriptions: CustomerSubscription[],
  customerId: number,
  finalizedStorageKeys: Set<string>,
): CustomerSubscription[] {
  const todayKey = getShipmentCalendarDayKey(Math.floor(Date.now() / 1000));

  return subscriptions.filter((subscription) => {
    const shipmentTimestamp = getPortalUpcomingShipmentTimestamp(subscription);
    const dayKey = getShipmentCalendarDayKey(shipmentTimestamp);

    if (dayKey < todayKey) {
      return false;
    }

    const storageKey = buildShipmentStorageKey({
      customerId,
      dayKey,
      shippingAddressKey: subscription.shippingAddressKey,
    });

    return !finalizedStorageKeys.has(storageKey);
  });
}

function groupSubscriptionsByDate(
  subscriptions: CustomerSubscription[],
  getTimestamp: (subscription: CustomerSubscription) => number,
  formatTitle: (timestamp: number) => string,
  idPrefix: string,
  t: SubscriptionsT,
  format: Format,
  batchOptions?: {
    customerId: number;
    batchesByStorageKey: Map<string, SubscriptionOrderBatch>;
  },
): SubscriptionDateGroup[] {
  const dateGroups = new Map<
    string,
    { subscriptions: CustomerSubscription[]; sortTimestamp: number }
  >();

  for (const subscription of subscriptions) {
    const timestamp = getTimestamp(subscription);
    const dayKey = getShipmentCalendarDayKey(timestamp);
    const existing = dateGroups.get(dayKey);

    if (existing) {
      existing.subscriptions.push(subscription);
      existing.sortTimestamp = Math.min(existing.sortTimestamp, timestamp);
      continue;
    }

    dateGroups.set(dayKey, { subscriptions: [subscription], sortTimestamp: timestamp });
  }

  return Array.from(dateGroups.entries())
    .sort(([, left], [, right]) => left.sortTimestamp - right.sortTimestamp)
    .map(([dayKey, { subscriptions: groupSubscriptions, sortTimestamp }]) => {
      const deliveries = groupSubscriptionsIntoDeliveries(
        groupSubscriptions,
        t,
        format,
        `${idPrefix}-${dayKey}`,
        batchOptions
          ? {
              customerId: batchOptions.customerId,
              dayKey,
              allSubscriptionsInDateGroup: groupSubscriptions,
              batchesByStorageKey: batchOptions.batchesByStorageKey,
            }
          : undefined,
      );

      return {
        id: `${idPrefix}-${dayKey}`,
        title: formatTitle(sortTimestamp),
        deliveries:
          deliveries.length > 1
            ? deliveries.map((delivery, index) => ({
                ...delivery,
                shipmentHeading: t('delivery.shipment', { number: index + 1 }),
              }))
            : deliveries,
      };
    });
}

export function groupSubscriptionsByShipmentDate(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  batchOptions?: {
    customerId: number;
    batchesByStorageKey: Map<string, SubscriptionOrderBatch>;
  },
): SubscriptionDateGroup[] {
  return groupSubscriptionsByDate(
    subscriptions,
    getPortalUpcomingShipmentTimestamp,
    (timestamp) =>
      t('shipmentOn', {
        date: format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
      }),
    'shipment',
    t,
    format,
    batchOptions,
  );
}

export async function groupSubscriptionsForPortal(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  options: {
    customerId: number;
    finalizedShipments?: FinalizedShipmentRecord[];
  },
): Promise<SubscriptionPortalSections> {
  const activeSubscriptions = subscriptions.filter((subscription) => !isCanceledSubscription(subscription));
  const canceledSubscriptions = subscriptions.filter(isCanceledSubscription);
  const finalizedStorageKeys = new Set(
    (options.finalizedShipments ?? []).map((record) => record.storageKey),
  );
  const batchesByStorageKey = await getSubscriptionOrderBatchesForCustomer(options.customerId);
  const upcomingSubscriptions = filterSubscriptionsForUpcomingShipments(
    activeSubscriptions,
    options.customerId,
    finalizedStorageKeys,
  );

  return {
    upcomingShipments: groupSubscriptionsByShipmentDate(upcomingSubscriptions, t, format, {
      customerId: options.customerId,
      batchesByStorageKey,
    }),
    pastShipments: buildPastShipmentGroups(options.finalizedShipments ?? [], t, format),
    active: transformCustomerSubscriptions(activeSubscriptions, t, format),
    canceled: transformCustomerSubscriptions(canceledSubscriptions, t, format, {
      hidePricing: true,
    }),
  };
}
