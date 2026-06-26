import { describe, expect, it } from 'vitest';

import {
  findCartLineForNewSubscription,
  reconcileSubscriptionLinesToCartItems,
} from './reconcile-subscription-cart-lines';
import type { SubscriptionLineMeta } from './types';

const weeklyBilling = { interval: 'week' as const, intervalCount: 1 };

function buildLine({
  productEntityId,
  cartLineItemEntityId,
  billingCycleAnchor,
}: {
  productEntityId: number;
  cartLineItemEntityId?: string;
  billingCycleAnchor?: number;
}): SubscriptionLineMeta {
  return {
    productEntityId,
    sku: 'sku',
    productName: 'Product',
    productOptions: [{ optionEntityId: 1, valueEntityId: 10 }],
    billingInterval: weeklyBilling,
    billingCycleAnchor,
    unitAmount: 0,
    currency: 'CAD',
    quantity: 1,
    cartLineItemEntityId,
  };
}

describe('reconcileSubscriptionLinesToCartItems', () => {
  it('maps each duplicate-product subscription to its own cart line when possible', () => {
    const subscriptionLines = [
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'line-a', billingCycleAnchor: 1_900_000_000 }),
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'line-b' }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
      {
        entityId: 'line-b',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const reconciled = reconcileSubscriptionLinesToCartItems(
      subscriptionLines,
      cartLineItems,
    );

    expect(reconciled.map((line) => line.cartLineItemEntityId).sort()).toEqual([
      'line-a',
      'line-b',
    ]);
  });

  it('reassigns stale cart line ids without collapsing every duplicate onto the first line', () => {
    const subscriptionLines = [
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'stale-line', billingCycleAnchor: 1_900_000_000 }),
      buildLine({ productEntityId: 99, billingCycleAnchor: undefined }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
      {
        entityId: 'line-b',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const reconciled = reconcileSubscriptionLinesToCartItems(
      subscriptionLines,
      cartLineItems,
    );

    expect(new Set(reconciled.map((line) => line.cartLineItemEntityId))).toEqual(
      new Set(['line-a', 'line-b']),
    );
  });

  it('maps every subscription identity to a single merged cart line', () => {
    const subscriptionLines = [
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'line-a', billingCycleAnchor: 1_900_000_000 }),
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'line-b' }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];

    const reconciled = reconcileSubscriptionLinesToCartItems(
      subscriptionLines,
      cartLineItems,
    );

    expect(reconciled.every((line) => line.cartLineItemEntityId === 'line-a')).toBe(true);
  });
});

describe('findCartLineForNewSubscription', () => {
  it('prefers an unclaimed duplicate cart line for a new subscription identity', () => {
    const subscriptionLines = [
      buildLine({ productEntityId: 99, cartLineItemEntityId: 'line-a', billingCycleAnchor: 1_900_000_000 }),
    ];
    const cartLineItems = [
      {
        entityId: 'line-a',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
      {
        entityId: 'line-b',
        productEntityId: 99,
        selectedOptions: [{ entityId: 1, valueEntityId: 10 }],
      },
    ];
    const nextLine = buildLine({ productEntityId: 99 });

    const matched = findCartLineForNewSubscription({
      cartLineItems,
      productEntityId: 99,
      productOptions: nextLine.productOptions,
      subscriptionLines,
      subscriptionLineIdentity: '99~1:10~week-1-today',
    });

    expect(matched?.entityId).toBe('line-b');
  });
});
