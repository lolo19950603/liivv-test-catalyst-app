import { describe, expect, it } from 'vitest';

import { getStripeSubscriptionBillingSchedule } from './subscription-pricing';

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
