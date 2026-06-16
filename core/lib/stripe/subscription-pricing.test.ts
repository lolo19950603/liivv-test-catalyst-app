import { describe, expect, it } from 'vitest';

import type { CheckoutLineItemSnapshot, CheckoutSnapshot } from '../checkout/types';

import {
  getStripeSubscriptionBillingSchedule,
  getSubscriptionUnitAmountIncTax,
} from './subscription-pricing';

function makeSnapshot(
  lines: CheckoutLineItemSnapshot[],
  tax: number,
): CheckoutSnapshot {
  return {
    id: 'snap',
    cartId: 'cart',
    bigcommerceCustomerId: 1,
    currency: 'CAD',
    subtotal: 100,
    tax,
    shipping: 0,
    grandTotal: 100 + tax,
    amounts: {
      immediateSubtotal: 100,
      immediateShipping: 0,
      immediateTax: tax,
      immediateGrandTotal: 100 + tax,
      deferredSubtotal: 0,
      hasDeferredSubscriptions: false,
      hasImmediateCharges: true,
    },
    lineItems: lines,
    billingAddress: {
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      address1: '1',
      city: 'C',
      countryCode: 'CA',
      postalCode: 'H0H0H0',
    },
  };
}

describe('getSubscriptionUnitAmountIncTax', () => {
  it('adds proportional tax to the unit amount', () => {
    const line: CheckoutLineItemSnapshot = {
      lineItemEntityId: '1',
      productEntityId: 1,
      name: 'Test',
      quantity: 1,
      unitAmount: 855,
      currency: 'CAD',
      productOptions: [],
      isPhysical: true,
      isSubscription: true,
    };

    const snapshot = makeSnapshot([line], 10);

    expect(getSubscriptionUnitAmountIncTax(line, snapshot)).toBe(955);
  });
});

describe('getStripeSubscriptionBillingSchedule', () => {
  it('uses billing_cycle_anchor for deferred subscriptions', () => {
    const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;

    const schedule = getStripeSubscriptionBillingSchedule({
      lineItemEntityId: '1',
      productEntityId: 1,
      name: 'Test',
      quantity: 1,
      unitAmount: 855,
      currency: 'CAD',
      productOptions: [],
      isPhysical: true,
      isSubscription: true,
      billingCycleAnchor: future,
      billingInterval: { interval: 'week', intervalCount: 1 },
    });

    expect(schedule).toEqual({ billing_cycle_anchor: future });
  });
});
