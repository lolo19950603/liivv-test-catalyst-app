import { describe, expect, it } from 'vitest';

import {
  filterShippingOptionsBySubtotal,
  FREE_SHIPPING_MIN_SUBTOTAL,
  qualifiesForFreeShipping,
} from './shipping-rules';

describe('qualifiesForFreeShipping', () => {
  it('requires at least the store threshold', () => {
    expect(qualifiesForFreeShipping(FREE_SHIPPING_MIN_SUBTOTAL)).toBe(true);
    expect(qualifiesForFreeShipping(FREE_SHIPPING_MIN_SUBTOTAL - 0.01)).toBe(false);
  });
});

describe('filterShippingOptionsBySubtotal', () => {
  const options = [
    { entityId: 'free', description: 'Free Shipping', cost: 0 },
    { entityId: 'flat', description: 'Flat rate', cost: 16 },
  ];

  it('keeps free shipping when the section qualifies', () => {
    expect(filterShippingOptionsBySubtotal(options, 200)).toEqual(options);
  });

  it('removes free shipping when the section is below threshold', () => {
    expect(filterShippingOptionsBySubtotal(options, 22.18)).toEqual([options[1]]);
  });
});
