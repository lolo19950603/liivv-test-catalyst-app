import { describe, expect, it } from 'vitest';

import {
  filterCustomerVisibleShippingOptions,
  isSubscriptionOnlyShippingOption,
  pickCustomerDefaultShippingOption,
  pickSubscriptionShippingOption,
} from './shipping-option-filters';

const options = [
  { entityId: 'free', description: 'Free Shipping', cost: 0 },
  { entityId: 'sub', description: 'Subscription free shipping', cost: 0 },
  { entityId: 'flat', description: 'Flat rate', cost: 16, isRecommended: true },
];

describe('isSubscriptionOnlyShippingOption', () => {
  it('matches the default subscription shipping name case-insensitively', () => {
    expect(isSubscriptionOnlyShippingOption('Subscription free shipping')).toBe(true);
    expect(isSubscriptionOnlyShippingOption('SUBSCRIPTION FREE SHIPPING')).toBe(true);
    expect(isSubscriptionOnlyShippingOption('Free Shipping')).toBe(false);
  });
});

describe('filterCustomerVisibleShippingOptions', () => {
  it('removes subscription-only shipping methods', () => {
    expect(filterCustomerVisibleShippingOptions(options)).toEqual([options[0], options[2]]);
  });
});

describe('pickSubscriptionShippingOption', () => {
  it('prefers the subscription-only method when present', () => {
    expect(pickSubscriptionShippingOption(options)?.entityId).toBe('sub');
  });
});

describe('pickCustomerDefaultShippingOption', () => {
  it('never selects the subscription-only method', () => {
    expect(pickCustomerDefaultShippingOption(options)?.entityId).toBe('free');
  });

  it('ignores a stale subscription-only selection', () => {
    expect(pickCustomerDefaultShippingOption(options, 'sub')?.entityId).toBe('free');
  });
});
