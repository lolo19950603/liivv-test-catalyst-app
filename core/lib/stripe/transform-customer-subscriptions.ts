import type { CustomerSubscription } from './subscriptions';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  price: string;
  intervalLabel: string;
  statusLabel: string;
  scheduleDetail?: string;
}

type Format = {
  number: (
    value: number,
    options?: { style?: 'currency'; currency?: string },
  ) => string;
  dateTime: (value: Date, options?: { dateStyle?: 'medium' }) => string;
};

type SubscriptionsT = (key: string, values?: Record<string, string | number | Date>) => string;

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

  if (
    subscription.cancelAtPeriodEnd &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  ) {
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

  if (subscription.status in { active: 1, past_due: 1, canceled: 1, unpaid: 1, paused: 1 }) {
    return subscription.status as 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
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
  const formatDate = (timestamp: number) =>
    format.dateTime(new Date(timestamp * 1000), { dateStyle: 'medium' });

  if (subscription.cancelAtPeriodEnd) {
    return t('endsOn', { date: formatDate(subscription.currentPeriodEnd) });
  }

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

export function transformCustomerSubscription(
  subscription: CustomerSubscription,
  t: SubscriptionsT,
  format: Format,
): SubscriptionListItem {
  const price =
    subscription.unitAmount == null
      ? t('customPricing')
      : format.number(subscription.unitAmount / 100, {
          style: 'currency',
          currency: subscription.currency.toUpperCase(),
        });

  const statusKey = getStatusKey(subscription);

  return {
    id: subscription.id,
    productName: subscription.productName,
    price,
    intervalLabel: formatIntervalLabel(subscription, t),
    statusLabel: t(`status.${statusKey}`),
    scheduleDetail: getScheduleDetail(subscription, t, format),
  };
}

export function transformCustomerSubscriptions(
  subscriptions: CustomerSubscription[],
  t: SubscriptionsT,
  format: Format,
): SubscriptionListItem[] {
  return subscriptions.map((subscription) => transformCustomerSubscription(subscription, t, format));
}
