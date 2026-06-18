import { describe, expect, it } from 'vitest';

import {
  allocateAmountBySubtotal,
  buildImmediateOrderTaxTotals,
  buildLinePricesWithTax,
  formatOrderAmount,
  splitImmediateTaxByTaxableBase,
} from './order-tax';
import type { CheckoutSnapshot } from '../checkout/types';

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

describe('splitImmediateTaxByTaxableBase', () => {
  it('splits immediate tax between products and shipping', () => {
    const { productTax, shippingTax } = splitImmediateTaxByTaxableBase({
      immediateTax: 15.6,
      immediateSubtotal: 100,
      immediateShipping: 20,
    });

    expect(productTax).toBe(13);
    expect(shippingTax).toBe(2.6);
    expect(productTax + shippingTax).toBe(15.6);
  });
});

describe('buildImmediateOrderTaxTotals', () => {
  it('writes shipping tax on the shipping line', () => {
    const snapshot = {
      amounts: {
        immediateSubtotal: 100,
        immediateShipping: 20,
        immediateTax: 15.6,
        immediateGrandTotal: 135.6,
      },
    } as CheckoutSnapshot;

    const totals = buildImmediateOrderTaxTotals(snapshot);

    expect(totals.subtotal_inc_tax).toBe('113.00');
    expect(totals.shipping_cost_inc_tax).toBe(22.6);
    expect(totals.total_inc_tax).toBe('135.60');
  });
});
