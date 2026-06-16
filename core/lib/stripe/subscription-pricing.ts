import { getLineSubtotal, isDeferredSubscriptionLine } from '../checkout/subscription-charge-timing';
import type { CheckoutLineItemSnapshot, CheckoutSnapshot } from '../checkout/types';

function getLineTaxCents(
  line: CheckoutLineItemSnapshot,
  snapshot: CheckoutSnapshot,
): number {
  const ratioBase =
    snapshot.lineItems.reduce((sum, entry) => sum + getLineSubtotal(entry), 0) || snapshot.subtotal;

  if (ratioBase <= 0 || snapshot.tax <= 0) {
    return 0;
  }

  const lineSubtotal = getLineSubtotal(line);
  const lineTaxDollars = (snapshot.tax * lineSubtotal) / ratioBase;

  return Math.round(lineTaxDollars * 100);
}

/** Stripe recurring unit amount in cents, including this line's share of checkout tax. */
export function getSubscriptionUnitAmountIncTax(
  line: CheckoutLineItemSnapshot,
  snapshot: CheckoutSnapshot,
): number {
  const lineTaxCents = getLineTaxCents(line, snapshot);
  const taxPerUnitCents =
    line.quantity > 0 ? Math.round(lineTaxCents / line.quantity) : 0;

  return line.unitAmount + taxPerUnitCents;
}

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
