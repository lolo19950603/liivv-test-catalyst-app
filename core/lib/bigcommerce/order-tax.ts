import { allocateAmountBySubtotal } from '../checkout/tax-allocation';
import { getLineSubtotal, isDeferredSubscriptionLine } from '../checkout/subscription-charge-timing';
import type { CheckoutLineItemSnapshot, CheckoutSnapshot } from '../checkout/types';

export function formatOrderAmount(amount: number): number {
  return Number(amount.toFixed(2));
}

export function formatOrderAmountString(amount: number): string {
  return amount.toFixed(2);
}

export { allocateAmountBySubtotal } from '../checkout/tax-allocation';

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

export function splitImmediateTaxByTaxableBase({
  immediateTax,
  immediateSubtotal,
  immediateShipping,
}: {
  immediateTax: number;
  immediateSubtotal: number;
  immediateShipping: number;
}): { productTax: number; shippingTax: number } {
  const taxableBase = immediateSubtotal + immediateShipping;

  if (immediateTax <= 0 || taxableBase <= 0) {
    return { productTax: 0, shippingTax: 0 };
  }

  const [productTax, shippingTax] = allocateAmountBySubtotal(
    [immediateSubtotal, immediateShipping],
    immediateTax,
  );

  return { productTax, shippingTax };
}

export function buildImmediateOrderLineTaxes(snapshot: CheckoutSnapshot): number[] {
  const lines = snapshot.lineItems.filter((line) => !isDeferredSubscriptionLine(line));
  const lineSubtotals = lines.map((line) => getLineSubtotal(line));
  const { productTax } = splitImmediateTaxByTaxableBase(snapshot.amounts);

  return allocateAmountBySubtotal(lineSubtotals, productTax);
}

export function buildImmediateOrderTaxTotals(snapshot: CheckoutSnapshot) {
  const { immediateSubtotal, immediateShipping, immediateGrandTotal } = snapshot.amounts;
  const { productTax, shippingTax } = splitImmediateTaxByTaxableBase(snapshot.amounts);

  return {
    subtotal_ex_tax: formatOrderAmountString(immediateSubtotal),
    subtotal_inc_tax: formatOrderAmountString(immediateSubtotal + productTax),
    shipping_cost_ex_tax: formatOrderAmount(immediateShipping),
    shipping_cost_inc_tax: formatOrderAmount(immediateShipping + shippingTax),
    total_ex_tax: formatOrderAmountString(immediateSubtotal + immediateShipping),
    total_inc_tax: formatOrderAmountString(immediateGrandTotal),
  };
}
