import type { CustomerSubscription } from './subscriptions';
import { isSubscriptionPaymentFailed } from './subscription-delivery-payment';
import {
  getShipmentBatchReadiness,
  getSubscriptionsInShipmentGroup,
} from './finalize-subscription-shipment';
import type { SubscriptionOrderBatch } from './subscription-order-batch';
import { getSubscriptionOrderBatchesForCustomer } from './subscription-order-batch';
import type {
  FinalizedShipmentRecord,
  ShipmentChargedItem,
  ShipmentSkippedItem,
} from './subscription-shipment-records';
import { buildShipmentStorageKey } from './subscription-shipment-records';
import { isPastShipmentCutoff } from './subscription-shipment-cutoff';
import {
  getCurrentShipmentTimestamp,
  getPortalUpcomingShipmentTimestamp,
  getShipmentCalendarDayKey,
  resolveUpcomingPortalShipmentTimestamp,
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
  shippingAddressLabel?: string;
  shippingAddressGroupNumber?: number;
  shippingAddressKey?: string;
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
    shippingAddressLabel: subscription.shippingAddressLabel,
    shippingAddressKey: subscription.shippingAddressKey,
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

function annotateSubscriptionsWithShippingAddressGroups(
  subscriptions: CustomerSubscription[],
  items: SubscriptionListItem[],
): SubscriptionListItem[] {
  const addressOrder: string[] = [];

  for (const subscription of subscriptions) {
    const key = subscription.shippingAddressKey;

    if (!addressOrder.includes(key)) {
      addressOrder.push(key);
    }
  }

  if (addressOrder.length <= 1) {
    return items;
  }

  const groupNumberByAddressKey = new Map(
    addressOrder.map((key, index) => [key, index + 1]),
  );
  const addressLabelByKey = new Map(
    subscriptions.map((subscription) => [
      subscription.shippingAddressKey,
      subscription.shippingAddressLabel,
    ]),
  );

  return items.map((item, index) => {
    const subscription = subscriptions[index];

    if (!subscription) {
      return item;
    }

    const groupNumber = groupNumberByAddressKey.get(subscription.shippingAddressKey);

    if (!groupNumber) {
      return item;
    }

    return {
      ...item,
      shippingAddressGroupNumber: groupNumber,
      shippingAddressLabel: addressLabelByKey.get(subscription.shippingAddressKey),
    };
  });
}

export function transformCustomerSubscriptionsGroupedByShippingAddress(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  options: { hidePricing?: boolean } = {},
): SubscriptionListItem[] {
  const addressOrder: string[] = [];
  const subscriptionsByAddress = new Map<string, CustomerSubscription[]>();

  for (const subscription of subscriptions) {
    const key = subscription.shippingAddressKey;
    const existing = subscriptionsByAddress.get(key);

    if (existing) {
      existing.push(subscription);
      continue;
    }

    addressOrder.push(key);
    subscriptionsByAddress.set(key, [subscription]);
  }

  if (addressOrder.length <= 1) {
    return transformCustomerSubscriptions(subscriptions, t, format, options);
  }

  const groupedSubscriptions = addressOrder.flatMap(
    (key) => subscriptionsByAddress.get(key) ?? [],
  );
  const items = transformCustomerSubscriptions(groupedSubscriptions, t, format, options);

  return annotateSubscriptionsWithShippingAddressGroups(groupedSubscriptions, items);
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

function normalizeProductNameForMatch(name: string): string {
  return name.trim().toLowerCase();
}

type ShipmentItemImageSource = Pick<
  ShipmentChargedItem,
  'subscriptionId' | 'productName' | 'productEntityId'
>;

interface PastShipmentImageLookup {
  bySubscriptionId: Map<string, { src: string; alt: string }>;
  byProductName: Map<string, { src: string; alt: string }>;
  byProductEntityId: Map<number, { src: string; alt: string }>;
}

function buildPastShipmentImageLookup(
  subscriptions: CustomerSubscription[],
): PastShipmentImageLookup {
  const bySubscriptionId = new Map<string, { src: string; alt: string }>();
  const byProductName = new Map<string, { src: string; alt: string }>();
  const byProductEntityId = new Map<number, { src: string; alt: string }>();

  for (const subscription of subscriptions) {
    if (!subscription.image) {
      continue;
    }

    bySubscriptionId.set(subscription.id, subscription.image);
    byProductName.set(normalizeProductNameForMatch(subscription.productName), subscription.image);

    if (subscription.productEntityId != null) {
      byProductEntityId.set(subscription.productEntityId, subscription.image);
    }
  }

  return { bySubscriptionId, byProductName, byProductEntityId };
}

function resolvePastShipmentItemImage(
  item: ShipmentItemImageSource,
  imageLookup: PastShipmentImageLookup,
  productImagesByEntityId?: Map<number, { src: string; alt: string }>,
): { src: string; alt: string } | undefined {
  const fromSubscriptionId = imageLookup.bySubscriptionId.get(item.subscriptionId);

  if (fromSubscriptionId) {
    return fromSubscriptionId;
  }

  if (item.productEntityId != null) {
    const fromCatalog = productImagesByEntityId?.get(item.productEntityId);
    const fromSubscriptionCatalog = imageLookup.byProductEntityId.get(item.productEntityId);

    if (fromCatalog) {
      return fromCatalog;
    }

    if (fromSubscriptionCatalog) {
      return fromSubscriptionCatalog;
    }
  }

  return imageLookup.byProductName.get(normalizeProductNameForMatch(item.productName)) ?? findFuzzyProductNameImage(
    item.productName,
    imageLookup.byProductName,
  );
}

function findFuzzyProductNameImage(
  productName: string,
  byProductName: Map<string, { src: string; alt: string }>,
): { src: string; alt: string } | undefined {
  const recordName = normalizeProductNameForMatch(productName);

  for (const [subscriptionName, image] of byProductName) {
    if (
      subscriptionName.startsWith(recordName) ||
      recordName.startsWith(subscriptionName.slice(0, Math.max(recordName.length, 8)))
    ) {
      return image;
    }
  }

  return undefined;
}

function mapPastShipmentItemToListItem(
  item: ShipmentChargedItem | ShipmentSkippedItem,
  imageLookup: PastShipmentImageLookup,
  productImagesByEntityId: Map<number, { src: string; alt: string }> | undefined,
  base: Omit<SubscriptionListItem, 'id' | 'productName' | 'quantity' | 'image'>,
): SubscriptionListItem {
  const image = resolvePastShipmentItemImage(item, imageLookup, productImagesByEntityId);

  return {
    id: item.subscriptionId,
    productName: item.productName,
    quantity: item.quantity,
    ...(image ? { image } : {}),
    ...base,
  };
}

function buildPastShipmentDeliveryGroups(
  records: FinalizedShipmentRecord[],
  t: SubscriptionsT,
  imageLookup: PastShipmentImageLookup,
  productImagesByEntityId?: Map<number, { src: string; alt: string }>,
): SubscriptionDeliveryGroup[] {
  return records.map((record) => {
    const chargedItems: SubscriptionListItem[] = record.chargedItems.map((item) =>
      mapPastShipmentItemToListItem(item, imageLookup, productImagesByEntityId, {
        intervalLabel: '',
        paymentMethodLabel: '',
        statusLabel: t('pastShipment.statusCharged'),
        statusKey: 'active',
      }),
    );

    const skippedItems: SubscriptionListItem[] = record.skippedItems.map((item) =>
      mapPastShipmentItemToListItem(item, imageLookup, productImagesByEntityId, {
        intervalLabel: '',
        paymentMethodLabel: '',
        statusLabel: t('pastShipment.statusSkipped'),
        statusKey: 'skipped',
        skippedReasonLabel: formatPastShipmentSkipReasonLabel(item.reason, t),
      }),
    );

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
  imageLookup: PastShipmentImageLookup,
  productImagesByEntityId?: Map<number, { src: string; alt: string }>,
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
      const deliveries = buildPastShipmentDeliveryGroups(
        dayRecords,
        t,
        imageLookup,
        productImagesByEntityId,
      );

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

function recordIncludesSubscription(
  record: FinalizedShipmentRecord,
  subscription: CustomerSubscription,
): boolean {
  const items = [...record.chargedItems, ...record.skippedItems];

  if (items.some((item) => item.subscriptionId === subscription.id)) {
    return true;
  }

  const subscriptionName = normalizeProductNameForMatch(subscription.productName);

  return items.some((item) => {
    if (item.subscriptionId && item.subscriptionId !== subscription.id) {
      return false;
    }

    const recordName = normalizeProductNameForMatch(item.productName);

    return (
      subscriptionName.startsWith(recordName) ||
      recordName.startsWith(subscriptionName.slice(0, Math.max(recordName.length, 8)))
    );
  });
}

function isChargePeriodShipmentFinalized(
  subscription: CustomerSubscription,
  finalizedShipments: FinalizedShipmentRecord[],
): boolean {
  const chargeDayKey = getShipmentCalendarDayKey(getCurrentShipmentTimestamp(subscription));

  return finalizedShipments.some(
    (record) =>
      record.shippingAddressKey === subscription.shippingAddressKey &&
      record.dayKey === chargeDayKey &&
      recordIncludesSubscription(record, subscription),
  );
}

export function getUpcomingPortalShipmentTimestamp(
  subscription: CustomerSubscription,
  finalizedShipments: FinalizedShipmentRecord[],
): number {
  const portalTimestamp = getPortalUpcomingShipmentTimestamp(subscription);
  const periodEnd = subscription.currentPeriodEnd ?? portalTimestamp;

  return resolveUpcomingPortalShipmentTimestamp({
    portalTimestamp,
    periodEnd,
    chargeDayTimestamp: getCurrentShipmentTimestamp(subscription),
    isCurrentChargePeriodFinalized: isChargePeriodShipmentFinalized(
      subscription,
      finalizedShipments,
    ),
  });
}

function filterSubscriptionsForUpcomingShipments(
  subscriptions: CustomerSubscription[],
  finalizedShipments: FinalizedShipmentRecord[],
): CustomerSubscription[] {
  const todayKey = getShipmentCalendarDayKey(Math.floor(Date.now() / 1000));

  return subscriptions.filter((subscription) => {
    const shipmentTimestamp = getUpcomingPortalShipmentTimestamp(subscription, finalizedShipments);
    const dayKey = getShipmentCalendarDayKey(shipmentTimestamp);

    return dayKey >= todayKey;
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
  options?: {
    customerId: number;
    batchesByStorageKey: Map<string, SubscriptionOrderBatch>;
    finalizedShipments?: FinalizedShipmentRecord[];
  },
): SubscriptionDateGroup[] {
  const finalizedShipments = options?.finalizedShipments ?? [];
  const getTimestamp =
    finalizedShipments.length > 0
      ? (subscription: CustomerSubscription) =>
          getUpcomingPortalShipmentTimestamp(subscription, finalizedShipments)
      : getPortalUpcomingShipmentTimestamp;

  return groupSubscriptionsByDate(
    subscriptions,
    getTimestamp,
    (timestamp) =>
      t('shipmentOn', {
        date: format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
      }),
    'shipment',
    t,
    format,
    options
      ? {
          customerId: options.customerId,
          batchesByStorageKey: options.batchesByStorageKey,
        }
      : undefined,
  );
}

export async function groupSubscriptionsForPortal(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  options: {
    customerId: number;
    finalizedShipments?: FinalizedShipmentRecord[];
    productImagesByEntityId?: Map<number, { src: string; alt: string }>;
  },
): Promise<SubscriptionPortalSections> {
  const activeSubscriptions = subscriptions.filter((subscription) => !isCanceledSubscription(subscription));
  const canceledSubscriptions = subscriptions.filter(isCanceledSubscription);
  const finalizedShipments = options.finalizedShipments ?? [];
  const pastShipmentImageLookup = buildPastShipmentImageLookup(subscriptions);
  const batchesByStorageKey = await getSubscriptionOrderBatchesForCustomer(options.customerId);
  const upcomingSubscriptions = filterSubscriptionsForUpcomingShipments(
    activeSubscriptions,
    finalizedShipments,
  );

  return {
    upcomingShipments: groupSubscriptionsByShipmentDate(upcomingSubscriptions, t, format, {
      customerId: options.customerId,
      batchesByStorageKey,
      finalizedShipments,
    }),
    pastShipments: buildPastShipmentGroups(
      finalizedShipments,
      t,
      format,
      pastShipmentImageLookup,
      options.productImagesByEntityId,
    ),
    active: transformCustomerSubscriptionsGroupedByShippingAddress(
      activeSubscriptions,
      t,
      format,
    ),
    canceled: transformCustomerSubscriptionsGroupedByShippingAddress(
      canceledSubscriptions,
      t,
      format,
      {
        hidePricing: true,
      },
    ),
  };
}
