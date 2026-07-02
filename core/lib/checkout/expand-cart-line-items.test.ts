import { describe, expect, it } from 'vitest';

import { expandGroupedCartLineItems } from './expand-cart-line-items';
import { subscriptionLineIdentityKey } from './subscription-line-key';
import type { SubscriptionLineMeta } from './types';

const weeklyBilling = { interval: 'week' as const, intervalCount: 1 };
const monthlyBilling = { interval: 'month' as const, intervalCount: 1 };

function buildSubscriptionLine({
  cartLineItemEntityId,
  billingInterval,
  billingCycleAnchor,
  quantity = 1,
}: {
  cartLineItemEntityId?: string;
  billingInterval: SubscriptionLineMeta['billingInterval'];
  billingCycleAnchor?: number;
  quantity?: number;
}): SubscriptionLineMeta {
  return {
    productEntityId: 99,
    sku: 'sku',
    productName: 'Product',
    productOptions: [{ optionEntityId: 1, valueEntityId: 10 }],
    billingInterval,
    billingCycleAnchor,
    unitAmount: 0,
    currency: 'CAD',
    quantity,
    cartLineItemEntityId,
  };
}

describe('expandGroupedCartLineItems', () => {
  it('keeps different subscription identities separate for duplicate cart lines', () => {
    const subscriptionLines = [
      buildSubscriptionLine({
        cartLineItemEntityId: 'line-a',
        billingInterval: weeklyBilling,
        billingCycleAnchor: 1_900_000_000,
      }),
      buildSubscriptionLine({
        cartLineItemEntityId: 'line-b',
        billingInterval: monthlyBilling,
      }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        quantity: 1,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
      {
        entityId: 'line-b',
        productEntityId: 99,
        quantity: 1,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const expanded = expandGroupedCartLineItems({
      cartLineItems,
      subscriptionLines,
      buildBaseItem: (item, totalQuantity, lineItemEntityId) => ({
        id: lineItemEntityId,
        quantity: totalQuantity,
        title: 'Product',
      }),
      applySubscription: () => ({}),
    });

    expect(expanded).toHaveLength(2);
    expect(expanded.map((line) => line.subscriptionLineKey).sort()).toEqual(
      [
        subscriptionLineIdentityKey(subscriptionLines[0]!),
        subscriptionLineIdentityKey(subscriptionLines[1]!),
      ].sort(),
    );
    expect(expanded.every((line) => line.quantity === 1)).toBe(true);
  });

  it('does not duplicate subscription rows when expanding per cart line', () => {
    const subscriptionLines = [
      buildSubscriptionLine({
        billingInterval: weeklyBilling,
      }),
      buildSubscriptionLine({
        billingInterval: monthlyBilling,
      }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        quantity: 1,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
      {
        entityId: 'line-b',
        productEntityId: 99,
        quantity: 1,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const expanded = expandGroupedCartLineItems({
      cartLineItems,
      subscriptionLines,
      buildBaseItem: (item, totalQuantity, lineItemEntityId) => ({
        id: lineItemEntityId,
        quantity: totalQuantity,
        title: 'Product',
      }),
      applySubscription: () => ({}),
    });

    expect(expanded).toHaveLength(2);
    expect(expanded.reduce((sum, line) => sum + line.quantity, 0)).toBe(2);
  });

  it('adds a one-time row when cart quantity exceeds subscription quantity', () => {
    const subscriptionLines = [
      buildSubscriptionLine({
        billingInterval: weeklyBilling,
        quantity: 1,
      }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        quantity: 2,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const expanded = expandGroupedCartLineItems({
      cartLineItems,
      subscriptionLines,
      buildBaseItem: (item, totalQuantity, lineItemEntityId) => ({
        id: lineItemEntityId,
        quantity: totalQuantity,
        title: 'Product',
      }),
      applySubscription: () => ({}),
    });

    expect(expanded).toHaveLength(2);
    expect(expanded.find((line) => line.purchaseType === 'subscription')?.quantity).toBe(1);
    expect(expanded.find((line) => line.purchaseType === 'one-time')?.quantity).toBe(1);
  });
});
