import { describe, expect, it } from 'vitest';

import { checkoutSnapshotKey } from './subscription-line-key';
import type { CheckoutLineItemSnapshot } from './types';

describe('checkoutSnapshotKey', () => {
  it('keeps subscription and one-time rows on the same cart line distinct', () => {
    const base = {
      lineItemEntityId: 'cart-line-1',
      productEntityId: 99,
      name: 'Widget',
      quantity: 1,
      unitAmount: 1000,
      currency: 'CAD',
      productOptions: [],
      isPhysical: true,
    } satisfies Partial<CheckoutLineItemSnapshot>;

    const oneTime: CheckoutLineItemSnapshot = {
      ...base,
      isSubscription: false,
    };

    const subscription: CheckoutLineItemSnapshot = {
      ...base,
      isSubscription: true,
      billingCycleAnchor: 1_900_000_000,
    };

    expect(checkoutSnapshotKey(oneTime)).not.toBe(checkoutSnapshotKey(subscription));
  });
});
