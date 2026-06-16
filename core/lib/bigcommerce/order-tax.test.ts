import { describe, expect, it } from 'vitest';

import {
  allocateAmountBySubtotal,
  buildLinePricesWithTax,
  formatOrderAmount,
} from './order-tax';

describe('allocateAmountBySubtotal', () => {
  it('allocates tax proportionally with exact total', () => {
    const allocations = allocateAmountBySubtotal([100, 50], 15);

    expect(allocations[0]).toBe(10);
    expect(allocations[1]).toBe(5);
    expect(allocations.reduce((sum, value) => sum + value, 0)).toBe(15);
  });

  it('puts remainder on the last line', () => {
    const allocations = allocateAmountBySubtotal([10, 10, 10], 1);

    expect(allocations.reduce((sum, value) => sum + value, 0)).toBe(1);
  });
});

describe('buildLinePricesWithTax', () => {
  it('splits line tax across units', () => {
    const prices = buildLinePricesWithTax({ unitAmount: 1000, quantity: 2 }, 2.5);

    expect(prices.priceExTax).toBe(10);
    expect(prices.priceIncTax).toBe(formatOrderAmount(11.25));
  });
});
