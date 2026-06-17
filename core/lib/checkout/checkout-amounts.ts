import type { CheckoutAmountsSnapshot, CheckoutLineItemSnapshot } from './types';

export function getLineSubtotal(
  line: Pick<CheckoutLineItemSnapshot, 'unitAmount' | 'quantity'>,
): number {
  return (line.unitAmount * line.quantity) / 100;
}

export function calculateCheckoutAmounts({
  lineItems,
  cartSubtotal,
  cartTax,
  shipping = 0,
}: {
  lineItems: CheckoutLineItemSnapshot[];
  cartSubtotal: number;
  cartTax: number;
  shipping?: number;
}): CheckoutAmountsSnapshot {
  const subtotal =
    lineItems.length > 0
      ? lineItems.reduce((sum, line) => sum + getLineSubtotal(line), 0)
      : cartSubtotal;

  return {
    subtotal,
    shipping,
    tax: cartTax,
    grandTotal: subtotal + shipping + cartTax,
  };
}
