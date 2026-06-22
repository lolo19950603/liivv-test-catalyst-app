import { describe, expect, it } from 'vitest';

import {
  buildCheckoutShippingSections,
  getSectionShippingQuoteSubtotal,
} from './checkout-section-shipping';
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

describe('buildCheckoutShippingSections', () => {
  it('requires ship-to address but not a shipping method for deferred physical subscriptions', () => {
    const snapshots = [
      line({
        lineItemEntityId: 'deferred',
        unitAmount: 855,
        quantity: 1,
        isSubscription: true,
        billingCycleAnchor: 1_783_080_000,
      }),
    ];

    const sections = buildCheckoutShippingSections(snapshots);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.id).toBe('deferred-1783080000');
    expect(sections[0]?.requiresShippingAddress).toBe(true);
    expect(sections[0]?.requiresShippingMethod).toBe(false);
    expect(sections[0]?.physicalLineItems).toEqual([
      { lineItemEntityId: 'deferred', quantity: 1 },
    ]);
  });
});
