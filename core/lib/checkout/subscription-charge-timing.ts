import type { CheckoutLineItemSnapshot } from './types';

export function isDeferredSubscriptionLine(
  line: Pick<CheckoutLineItemSnapshot, 'isSubscription' | 'billingCycleAnchor'>,
): boolean {
  return line.isSubscription && line.billingCycleAnchor != null;
}

export function getLineSubtotal(line: Pick<CheckoutLineItemSnapshot, 'unitAmount' | 'quantity'>): number {
  return (line.unitAmount * line.quantity) / 100;
}

export interface DeferredSubscriptionGroup<
  T extends Pick<CheckoutLineItemSnapshot, 'isSubscription' | 'billingCycleAnchor'>,
> {
  billingCycleAnchor: number;
  lines: T[];
}

export function groupDeferredSubscriptionLines<
  T extends Pick<CheckoutLineItemSnapshot, 'isSubscription' | 'billingCycleAnchor'>,
>(lines: T[]): DeferredSubscriptionGroup<T>[] {
  const groups = new Map<number, T[]>();

  for (const line of lines) {
    if (!isDeferredSubscriptionLine(line) || line.billingCycleAnchor == null) {
      continue;
    }

    const existing = groups.get(line.billingCycleAnchor) ?? [];

    existing.push(line);
    groups.set(line.billingCycleAnchor, existing);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left - right)
    .map(([billingCycleAnchor, groupLines]) => ({
      billingCycleAnchor,
      lines: groupLines,
    }));
}

export interface CheckoutAmounts {
  immediateSubtotal: number;
  immediateShipping: number;
  immediateTax: number;
  immediateGrandTotal: number;
  deferredSubtotal: number;
  hasDeferredSubscriptions: boolean;
  hasImmediateCharges: boolean;
}

export function calculateCheckoutAmounts({
  lineItems,
  cartSubtotal,
  cartTax,
  sectionShippingCosts = {},
}: {
  lineItems: CheckoutLineItemSnapshot[];
  cartSubtotal: number;
  cartTax: number;
  sectionShippingCosts?: Record<string, number>;
}): CheckoutAmounts {
  const immediateLines = lineItems.filter((line) => !isDeferredSubscriptionLine(line));
  const deferredLines = lineItems.filter((line) => isDeferredSubscriptionLine(line));

  const immediateSubtotal = immediateLines.reduce((sum, line) => sum + getLineSubtotal(line), 0);
  const deferredSubtotal = deferredLines.reduce((sum, line) => sum + getLineSubtotal(line), 0);
  const fullLineSubtotal = lineItems.reduce((sum, line) => sum + getLineSubtotal(line), 0);

  const ratioBase = fullLineSubtotal > 0 ? fullLineSubtotal : cartSubtotal;
  const taxRatio = ratioBase > 0 ? immediateSubtotal / ratioBase : 1;
  const immediateShipping = sectionShippingCosts['due-today'] ?? 0;
  const immediateTax = cartTax * taxRatio;
  const immediateGrandTotal = immediateSubtotal + immediateShipping + immediateTax;

  return {
    immediateSubtotal,
    immediateShipping,
    immediateTax,
    immediateGrandTotal,
    deferredSubtotal,
    hasDeferredSubscriptions: deferredLines.length > 0,
    hasImmediateCharges: immediateGrandTotal > 0,
  };
}
