import { describe, expect, it } from 'vitest';

import { calculateCheckoutAmounts } from './subscription-charge-timing';
import type { CheckoutLineItemSnapshot } from './types';

function line(
  overrides: Partial<CheckoutLineItemSnapshot> & Pick<CheckoutLineItemSnapshot, 'unitAmount' | 'quantity'>,
): CheckoutLineItemSnapshot {
  return {
    lineItemEntityId: '1',
    productEntityId: 1,
    name: 'Product',
    currency: 'CAD',
    productOptions: [],
    isPhysical: true,
    isSubscription: false,
    ...overrides,
  };
}

describe('calculateCheckoutAmounts', () => {
  it('allocates BC tax using due-today shipping but not deferred shipping in the proration base', () => {
    const lineItems = [
      line({ unitAmount: 10_000, quantity: 1, isSubscription: false }),
      line({
        unitAmount: 10_000,
        quantity: 1,
        isSubscription: true,
        billingCycleAnchor: 1_900_000_000,
      }),
    ];

    const amounts = calculateCheckoutAmounts({
      lineItems,
      cartSubtotal: 200,
      cartTax: 28.6,
      sectionShippingCosts: { 'due-today': 20 },
    });

    expect(amounts.immediateSubtotal).toBe(100);
    expect(amounts.immediateShipping).toBe(20);
    expect(amounts.immediateTax).toBe(15.6);
    expect(amounts.immediateGrandTotal).toBe(135.6);
    expect(amounts.deferredTax).toBe(13);
  });

  it('uses the full cart tax when everything is due today', () => {
    const lineItems = [line({ unitAmount: 10_000, quantity: 1 })];

    const amounts = calculateCheckoutAmounts({
      lineItems,
      cartSubtotal: 100,
      cartTax: 15.6,
      sectionShippingCosts: { 'due-today': 20 },
    });

    expect(amounts.immediateTax).toBe(15.6);
    expect(amounts.immediateGrandTotal).toBe(135.6);
    expect(amounts.deferredTax).toBe(0);
  });

  it('estimates deferred shipping tax separately from the BC tax pool', () => {
    const anchor = 1_900_000_000;
    const lineItems = [
      line({ unitAmount: 10_000, quantity: 1 }),
      line({
        unitAmount: 10_000,
        quantity: 1,
        isSubscription: true,
        billingCycleAnchor: anchor,
      }),
    ];

    const amounts = calculateCheckoutAmounts({
      lineItems,
      cartSubtotal: 200,
      cartTax: 28.6,
      sectionShippingCosts: {
        'due-today': 20,
        [`deferred-${anchor}`]: 8,
      },
    });

    const deferred = amounts.deferredSections[0];

    expect(deferred?.subtotal).toBe(100);
    expect(deferred?.shipping).toBe(8);
    expect(deferred?.tax).toBe(14.04);
    expect(deferred?.grandTotal).toBe(122.04);
    expect(amounts.immediateTax).toBe(15.6);
    expect(amounts.immediateTax + amounts.deferredTax).toBe(29.64);
  });

  it('does not inflate deferred tax when deferred shipping is selected', () => {
    const anchor = 1_900_000_000;
    const lineItems = [
      line({
        unitAmount: 22_500,
        quantity: 1,
        isSubscription: true,
        billingCycleAnchor: anchor,
      }),
    ];

    const amounts = calculateCheckoutAmounts({
      lineItems,
      cartSubtotal: 225,
      cartTax: 28.3,
      sectionShippingCosts: {
        [`deferred-${anchor}`]: 16,
      },
    });

    const deferred = amounts.deferredSections[0];

    expect(deferred?.tax).toBeCloseTo(30.31, 2);
    expect(deferred?.grandTotal).toBeCloseTo(271.31, 2);
  });
});
