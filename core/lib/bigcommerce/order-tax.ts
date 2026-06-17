import { getLineSubtotal, isDeferredSubscriptionLine } from '../checkout/subscription-charge-timing';
import type { CheckoutLineItemSnapshot, CheckoutSnapshot } from '../checkout/types';

export function formatOrderAmount(amount: number): number {
  return Number(amount.toFixed(2));
}

export function formatOrderAmountString(amount: number): string {
  return amount.toFixed(2);
}

/** Split a dollar amount across lines proportionally; last line absorbs rounding remainder. */
export function allocateAmountBySubtotal(lineSubtotals: number[], totalAmount: number): number[] {
  if (lineSubtotals.length === 0 || totalAmount <= 0) {
    return lineSubtotals.map(() => 0);
  }

  const subtotalSum = lineSubtotals.reduce((sum, value) => sum + value, 0);

  if (subtotalSum <= 0) {
    return lineSubtotals.map(() => 0);
  }

  const totalCents = Math.round(totalAmount * 100);
  let allocatedCents = 0;

  return lineSubtotals.map((lineSubtotal, index) => {
    if (index === lineSubtotals.length - 1) {
      return (totalCents - allocatedCents) / 100;
    }

    const shareCents = Math.round((lineSubtotal / subtotalSum) * totalCents);

    allocatedCents += shareCents;

    return shareCents / 100;
  });
}

export interface OrderLinePrices {
  priceExTax: number;
  priceIncTax: number;
}

export function buildLinePricesWithTax(
  line: Pick<CheckoutLineItemSnapshot, 'unitAmount' | 'quantity'>,
  lineTax: number,
): OrderLinePrices {
  const priceExTax = line.unitAmount / 100;
  const priceIncTax = priceExTax + lineTax / line.quantity;

  return {
    priceExTax: formatOrderAmount(priceExTax),
    priceIncTax: formatOrderAmount(priceIncTax),
  };
}

export function buildLinePricesFromTotals(
  quantity: number,
  exTaxTotal: number,
  incTaxTotal: number,
): OrderLinePrices {
  const safeQuantity = quantity > 0 ? quantity : 1;

  return {
    priceExTax: formatOrderAmount(exTaxTotal / safeQuantity),
    priceIncTax: formatOrderAmount(incTaxTotal / safeQuantity),
  };
}

export function buildImmediateOrderLineTaxes(snapshot: CheckoutSnapshot): number[] {
  const lines = snapshot.lineItems.filter((line) => !isDeferredSubscriptionLine(line));
  const lineSubtotals = lines.map((line) => getLineSubtotal(line));

  return allocateAmountBySubtotal(lineSubtotals, snapshot.amounts.immediateTax);
}

export function buildImmediateOrderTaxTotals(snapshot: CheckoutSnapshot) {
  const { immediateSubtotal, immediateShipping, immediateTax, immediateGrandTotal } =
    snapshot.amounts;

  return {
    subtotal_ex_tax: formatOrderAmountString(immediateSubtotal),
    subtotal_inc_tax: formatOrderAmountString(immediateSubtotal + immediateTax),
    shipping_cost_ex_tax: formatOrderAmount(immediateShipping),
    shipping_cost_inc_tax: formatOrderAmount(immediateShipping),
    total_ex_tax: formatOrderAmountString(immediateSubtotal + immediateShipping),
    total_inc_tax: formatOrderAmountString(immediateGrandTotal),
  };
}
