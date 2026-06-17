import { isDeferredSubscriptionLine } from '../checkout/subscription-charge-timing';
import type { CheckoutLineItemSnapshot } from '../checkout/types';

function getFirstBillingPeriodEnd(line: CheckoutLineItemSnapshot): number {
  if (!line.billingInterval) {
    return Math.floor(Date.now() / 1000);
  }

  const date = new Date();
  const { interval, intervalCount } = line.billingInterval;

  switch (interval) {
    case 'day':
      date.setUTCDate(date.getUTCDate() + intervalCount);
      break;
    case 'week':
      date.setUTCDate(date.getUTCDate() + 7 * intervalCount);
      break;
    case 'month':
      date.setUTCMonth(date.getUTCMonth() + intervalCount);
      break;
    case 'year':
      date.setUTCFullYear(date.getUTCFullYear() + intervalCount);
      break;
  }

  return Math.floor(date.getTime() / 1000);
}

/**
 * Schedule the first Stripe invoice without using trial_end (which the customer portal
 * labels as a "free trial"). Future billing uses billing_cycle_anchor instead.
 */
export function getStripeSubscriptionBillingSchedule(
  line: CheckoutLineItemSnapshot,
  now = Math.floor(Date.now() / 1000),
): { billing_cycle_anchor?: number } {
  if (line.billingCycleAnchor != null && line.billingCycleAnchor > now) {
    return { billing_cycle_anchor: line.billingCycleAnchor };
  }

  // Already paid on checkout — push Stripe's first invoice to the end of period one.
  if (!isDeferredSubscriptionLine(line)) {
    const periodEnd = getFirstBillingPeriodEnd(line);

    if (periodEnd > now) {
      return { billing_cycle_anchor: periodEnd };
    }
  }

  return {};
}
