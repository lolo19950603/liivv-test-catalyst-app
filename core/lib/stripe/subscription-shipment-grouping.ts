import type Stripe from 'stripe';

import { getShipmentDayKey } from './subscription-schedule-time';

/** Calendar day key (YYYY-MM-DD) in SUBSCRIPTION_SHIPMENT_TIMEZONE for portal grouping and order batches. */
export function getShipmentCalendarDayKey(timestamp: number): string {
  return getShipmentDayKey(timestamp);
}

export function buildSubscriptionOrderBatchStorageKey({
  customerId,
  dayKey,
  shippingAddressKey,
}: {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
}): string {
  return `${customerId}:${dayKey}:${shippingAddressKey}`;
}

export function getNextShipmentTimestamp(
  subscription: Pick<
    import('./subscriptions').CustomerSubscription,
    'trialEnd' | 'billingCycleAnchor' | 'currentPeriodEnd'
  >,
): number {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.trialEnd && subscription.trialEnd > now) {
    return subscription.trialEnd;
  }

  if (subscription.billingCycleAnchor && subscription.billingCycleAnchor > now) {
    return subscription.billingCycleAnchor;
  }

  return subscription.currentPeriodEnd;
}

/** Same shipment timestamp logic as the portal, using Stripe subscription fields. */
export function getNextShipmentTimestampFromStripeSubscription(
  subscription: Pick<
    Stripe.Subscription,
    'trial_end' | 'billing_cycle_anchor' | 'current_period_end'
  >,
): number {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.trial_end && subscription.trial_end > now) {
    return subscription.trial_end;
  }

  if (subscription.billing_cycle_anchor && subscription.billing_cycle_anchor > now) {
    return subscription.billing_cycle_anchor;
  }

  return subscription.current_period_end;
}

/** Shipment timestamp for a paid invoice — aligns batch keys with portal shipment groups. */
export function getSubscriptionInvoiceShipmentTimestamp(
  invoice: Stripe.Invoice,
  subscription: Pick<
    Stripe.Subscription,
    'trial_end' | 'billing_cycle_anchor' | 'current_period_end'
  >,
): number {
  const subscriptionLine = (invoice.lines?.data ?? []).find(
    (line) => line.parent?.type === 'subscription_item_details',
  );

  if (subscriptionLine?.period?.end) {
    return subscriptionLine.period.end;
  }

  return getNextShipmentTimestampFromStripeSubscription(subscription);
}
