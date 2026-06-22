import type { CustomerSubscription } from './subscriptions';
import { getShipmentCalendarDayKey } from './subscription-shipment-grouping';

export { getShipmentCalendarDayKey } from './subscription-shipment-grouping';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  quantity: number;
  image?: { src: string; alt: string };
  price?: string;
  priceNote?: string;
  intervalLabel: string;
  paymentMethodLabel: string;
  statusLabel: string;
  statusKey: string;
  scheduleDetail?: string;
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
  deliveries: SubscriptionDateGroup[];
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

export function getNextShipmentTimestamp(subscription: CustomerSubscription): number {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.trialEnd && subscription.trialEnd > now) {
    return subscription.trialEnd;
  }

  if (subscription.billingCycleAnchor && subscription.billingCycleAnchor > now) {
    return subscription.billingCycleAnchor;
  }

  return subscription.currentPeriodEnd;
}

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
    if (subscription.priceConfirmedAtBilling) {
      priceNote = t('priceAtBilling');
    } else if (subscription.subtotalExTaxCents != null) {
      price = formatMoney(format, subscription.subtotalExTaxCents, subscription.currency);
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
    quantity: subscription.quantity,
    image: subscription.image,
    price,
    priceNote,
    intervalLabel: formatIntervalLabel(subscription, t),
    paymentMethodLabel: subscription.paymentMethodLabel,
    statusLabel: t(`status.${statusKey}`),
    statusKey,
    scheduleDetail: getScheduleDetail(subscription, t, format),
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
): Pick<SubscriptionDeliveryGroup, 'subtotalExTax' | 'tax' | 'totalIncTax' | 'totalsPending'> {
  const hasPendingPricing = subscriptions.some((subscription) => subscription.priceConfirmedAtBilling);

  if (hasPendingPricing) {
    return { totalsPending: true };
  }

  const currency = subscriptions[0]?.currency ?? 'usd';
  const subtotalExTaxCents = subscriptions.reduce(
    (sum, subscription) => sum + (subscription.subtotalExTaxCents ?? 0),
    0,
  );
  const taxCents = subscriptions.reduce(
    (sum, subscription) => sum + (subscription.taxCents ?? 0),
    0,
  );
  const totalIncTaxCents = subscriptions.reduce(
    (sum, subscription) => sum + (subscription.totalIncTaxCents ?? subscription.subtotalExTaxCents ?? 0),
    0,
  );

  return {
    subtotalExTax: formatMoney(format, subtotalExTaxCents, currency),
    tax: formatMoney(format, taxCents, currency),
    totalIncTax: formatMoney(format, totalIncTaxCents, currency),
    totalsPending: false,
  };
}

function groupSubscriptionsIntoDeliveries(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
  idPrefix: string,
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

    return {
      id: `${idPrefix}-${addressKey}`,
      shippingAddressLabel: delivery.shippingAddressLabel,
      shippingMethodLabel: t('delivery.freeShipping'),
      items: delivery.subscriptions.map((subscription) =>
        transformCustomerSubscription(subscription, t, format),
      ),
      ...totals,
    };
  });
}

function groupSubscriptionsByDate(
  subscriptions: CustomerSubscription[],
  getTimestamp: (subscription: CustomerSubscription) => number,
  formatTitle: (timestamp: number) => string,
  idPrefix: string,
  t: SubscriptionsT,
  format: Format,
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
): SubscriptionDateGroup[] {
  return groupSubscriptionsByDate(
    subscriptions,
    getNextShipmentTimestamp,
    (timestamp) =>
      t('shipmentOn', {
        date: format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' }),
      }),
    'shipment',
    t,
    format,
  );
}

export function groupSubscriptionsForPortal(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
): SubscriptionPortalSections {
  const activeSubscriptions = subscriptions.filter((subscription) => !isCanceledSubscription(subscription));
  const canceledSubscriptions = subscriptions.filter(isCanceledSubscription);

  return {
    deliveries: groupSubscriptionsByShipmentDate(activeSubscriptions, t, format),
    active: transformCustomerSubscriptions(activeSubscriptions, t, format),
    canceled: transformCustomerSubscriptions(canceledSubscriptions, t, format, {
      hidePricing: true,
    }),
  };
}
