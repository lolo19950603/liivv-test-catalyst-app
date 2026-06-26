import {
  getDeferredSectionAmounts,
  getLineSubtotal,
  isDeferredSubscriptionLine,
} from '../checkout/subscription-charge-timing';
import { allocateAmountBySubtotal } from '../checkout/tax-allocation';
import type { CheckoutLineItemSnapshot, CheckoutSnapshot } from '../checkout/types';

import { resolveSubscriptionBillingCycleAnchor } from './subscription-schedule-time';

function getCheckoutSectionLines(
  snapshot: CheckoutSnapshot,
  line: CheckoutLineItemSnapshot,
): CheckoutLineItemSnapshot[] {
  if (isDeferredSubscriptionLine(line) && line.billingCycleAnchor != null) {
    return snapshot.lineItems.filter(
      (candidate) =>
        isDeferredSubscriptionLine(candidate) &&
        candidate.billingCycleAnchor === line.billingCycleAnchor,
    );
  }

  return snapshot.lineItems.filter(
    (candidate) => candidate.isSubscription && !isDeferredSubscriptionLine(candidate),
  );
}

function getCheckoutSectionTaxDollars(
  snapshot: CheckoutSnapshot,
  line: CheckoutLineItemSnapshot,
): number {
  if (isDeferredSubscriptionLine(line) && line.billingCycleAnchor != null) {
    return getDeferredSectionAmounts(snapshot.amounts, line.billingCycleAnchor)?.tax ?? 0;
  }

  const dueTodayLines = snapshot.lineItems.filter(
    (candidate) => !isDeferredSubscriptionLine(candidate),
  );
  const subscriptionLines = dueTodayLines.filter((candidate) => candidate.isSubscription);

  if (subscriptionLines.length === 0) {
    return 0;
  }

  const dueTodayTax = snapshot.amounts.immediateTax;

  if (dueTodayTax <= 0) {
    return 0;
  }

  if (subscriptionLines.length === dueTodayLines.length) {
    return dueTodayTax;
  }

  const allocatedTaxes = allocateAmountBySubtotal(
    dueTodayLines.map(getLineSubtotal),
    dueTodayTax,
  );

  return subscriptionLines.reduce((sum, subscriptionLine) => {
    const index = dueTodayLines.indexOf(subscriptionLine);

    return sum + (allocatedTaxes[index] ?? 0);
  }, 0);
}

/** Lock subscription billing amounts to checkout-time catalog pricing and tax. */
export function resolveSubscriptionLineBillingAmounts(
  snapshot: CheckoutSnapshot,
  line: CheckoutLineItemSnapshot,
): {
  unitAmountExTaxPerUnit: number;
  unitAmountExTax: number;
  taxAmount: number;
  unitAmountIncTax: number;
} {
  const unitAmountExTaxPerUnit = line.unitAmount;
  const unitAmountExTax = line.unitAmount * line.quantity;
  const sectionLines = getCheckoutSectionLines(snapshot, line);
  const sectionTaxDollars = getCheckoutSectionTaxDollars(snapshot, line);
  const allocatedTaxes = allocateAmountBySubtotal(
    sectionLines.map(getLineSubtotal),
    sectionTaxDollars,
  );
  const lineIndex = sectionLines.findIndex(
    (candidate) =>
      candidate.lineItemEntityId === line.lineItemEntityId &&
      candidate.productEntityId === line.productEntityId &&
      candidate.quantity === line.quantity &&
      candidate.billingCycleAnchor === line.billingCycleAnchor,
  );
  const taxAmount = Math.round((allocatedTaxes[lineIndex] ?? 0) * 100);
  const unitAmountIncTax = unitAmountExTax + taxAmount;

  return {
    unitAmountExTaxPerUnit,
    unitAmountExTax,
    taxAmount,
    unitAmountIncTax,
  };
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
    return {
      billing_cycle_anchor: resolveSubscriptionBillingCycleAnchor(line.billingCycleAnchor, now),
    };
  }

  // Already paid on checkout — push Stripe's first invoice to the end of period one.
  if (!isDeferredSubscriptionLine(line)) {
    const periodEnd = getFirstBillingPeriodEnd(line);

    if (periodEnd > now) {
      return {
        billing_cycle_anchor: resolveSubscriptionBillingCycleAnchor(periodEnd, now),
      };
    }
  }

  return {};
}
