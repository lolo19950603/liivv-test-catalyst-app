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

type ShipmentSubscription = Pick<
  import('./subscriptions').CustomerSubscription,
  'trialEnd' | 'billingCycleAnchor' | 'currentPeriodStart' | 'currentPeriodEnd'
>;

function getDeferredShipmentTimestamp(subscription: ShipmentSubscription, now: number): number | null {
  if (subscription.trialEnd && subscription.trialEnd > now) {
    return subscription.trialEnd;
  }

  if (subscription.billingCycleAnchor && subscription.billingCycleAnchor > now) {
    return subscription.billingCycleAnchor;
  }

  return null;
}

/**
 * Shipment day for the current billing period (charge day) — used for batching and finalize groups.
 */
export function getCurrentShipmentTimestamp(subscription: ShipmentSubscription): number {
  const now = Math.floor(Date.now() / 1000);
  const deferred = getDeferredShipmentTimestamp(subscription, now);

  if (deferred != null) {
    return deferred;
  }

  return subscription.currentPeriodStart ?? subscription.currentPeriodEnd;
}

/** Next shipment shown in the portal — advances to the next charge once the current period
 * charge day has passed.
 */
export function getPortalUpcomingShipmentTimestamp(
  subscription: ShipmentSubscription,
  now = Math.floor(Date.now() / 1000),
): number {
  const deferred = getDeferredShipmentTimestamp(subscription, now);

  if (deferred != null) {
    return deferred;
  }

  const periodStart = subscription.currentPeriodStart ?? subscription.currentPeriodEnd;
  const todayKey = getShipmentCalendarDayKey(now);

  if (getShipmentCalendarDayKey(periodStart) >= todayKey) {
    return periodStart;
  }

  return subscription.currentPeriodEnd;
}

/**
 * After the current period's charge-day shipment is finalized, advance to the next charge
 * (period end) without skipping an extra billing period.
 */
export function resolveUpcomingPortalShipmentTimestamp({
  portalTimestamp,
  periodEnd,
  chargeDayTimestamp,
  isCurrentChargePeriodFinalized,
}: {
  portalTimestamp: number;
  periodEnd: number;
  chargeDayTimestamp: number;
  isCurrentChargePeriodFinalized: boolean;
}): number {
  if (!isCurrentChargePeriodFinalized) {
    return portalTimestamp;
  }

  if (getShipmentCalendarDayKey(portalTimestamp) === getShipmentCalendarDayKey(chargeDayTimestamp)) {
    return periodEnd;
  }

  return portalTimestamp;
}

/** @deprecated Use getCurrentShipmentTimestamp or getPortalUpcomingShipmentTimestamp */
export function getNextShipmentTimestamp(subscription: ShipmentSubscription): number {
  return getCurrentShipmentTimestamp(subscription);
}

function getStripeSubscriptionPeriodStart(
  subscription: Pick<
    Stripe.Subscription,
    'trial_end' | 'billing_cycle_anchor' | 'current_period_end' | 'items'
  >,
): number | undefined {
  return subscription.items?.data[0]?.current_period_start;
}

/** Same shipment timestamp logic as the portal, using Stripe subscription fields. */
export function getNextShipmentTimestampFromStripeSubscription(
  subscription: Pick<
    Stripe.Subscription,
    'trial_end' | 'billing_cycle_anchor' | 'current_period_end' | 'items'
  >,
): number {
  const now = Math.floor(Date.now() / 1000);

  if (subscription.trial_end && subscription.trial_end > now) {
    return subscription.trial_end;
  }

  if (subscription.billing_cycle_anchor && subscription.billing_cycle_anchor > now) {
    return subscription.billing_cycle_anchor;
  }

  return getStripeSubscriptionPeriodStart(subscription) ?? subscription.current_period_end;
}

/** Shipment timestamp for a paid invoice — uses period start (charge day), not period end. */
export function getSubscriptionInvoiceShipmentTimestamp(
  invoice: Stripe.Invoice,
  subscription: Pick<
    Stripe.Subscription,
    'trial_end' | 'billing_cycle_anchor' | 'current_period_end' | 'items'
  >,
): number {
  const subscriptionLine = (invoice.lines?.data ?? []).find(
    (line) => line.parent?.type === 'subscription_item_details',
  );

  if (subscriptionLine?.period?.start) {
    return subscriptionLine.period.start;
  }

  const paidAt =
    invoice.status_transitions?.paid_at ??
    invoice.effective_at ??
    invoice.created;

  if (paidAt) {
    return paidAt;
  }

  return getNextShipmentTimestampFromStripeSubscription(subscription);
}
