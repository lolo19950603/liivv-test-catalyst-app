import { describe, expect, it } from 'vitest';

import { getSectionShippingQuoteSubtotal } from './checkout-section-shipping';
import type { CheckoutLineItemSnapshot } from './types';

function line(
  overrides: Partial<CheckoutLineItemSnapshot> & Pick<CheckoutLineItemSnapshot, 'unitAmount' | 'quantity'>,
): CheckoutLineItemSnapshot {
  return {
    lineItemEntityId: 'line-1',
    productEntityId: 1,
    name: 'Product',
    currency: 'CAD',
    productOptions: [],
    isPhysical: true,
    isSubscription: false,
    ...overrides,
  };
}

describe('getSectionShippingQuoteSubtotal', () => {
  it('uses due-today line subtotal only, not the full cart', () => {
    const snapshots = [
      line({ lineItemEntityId: 'today', unitAmount: 2218, quantity: 1 }),
      line({
        lineItemEntityId: 'deferred',
        unitAmount: 22500,
        quantity: 1,
        isSubscription: true,
        billingCycleAnchor: 1_900_000_000,
      }),
    ];

    expect(getSectionShippingQuoteSubtotal('due-today', snapshots)).toBeCloseTo(22.18, 2);
    expect(getSectionShippingQuoteSubtotal('deferred-1900000000', snapshots)).toBeCloseTo(225, 2);
  });
});
