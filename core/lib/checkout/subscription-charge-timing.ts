import type { CheckoutLineItemSnapshot, CheckoutSectionAmounts } from './types';

import { allocateAmountBySubtotal } from './tax-allocation';

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
  fullTaxableBase: number;
  immediateSubtotal: number;
  immediateShipping: number;
  immediateTax: number;
  immediateGrandTotal: number;
  deferredSubtotal: number;
  deferredTax: number;
  deferredSections: CheckoutSectionAmounts[];
  hasDeferredSubscriptions: boolean;
  hasImmediateCharges: boolean;
}

function buildCheckoutAmountSections({
  lineItems,
  sectionShippingCosts,
}: {
  lineItems: CheckoutLineItemSnapshot[];
  sectionShippingCosts: Record<string, number>;
}): Array<{
  sectionId: string;
  billingCycleAnchor?: number;
  subtotal: number;
  shipping: number;
}> {
  const sections: Array<{
    sectionId: string;
    billingCycleAnchor?: number;
    subtotal: number;
    shipping: number;
  }> = [];

  const immediateLines = lineItems.filter((line) => !isDeferredSubscriptionLine(line));

  if (immediateLines.length > 0) {
    sections.push({
      sectionId: 'due-today',
      subtotal: immediateLines.reduce((sum, line) => sum + getLineSubtotal(line), 0),
      shipping: sectionShippingCosts['due-today'] ?? 0,
    });
  }

  for (const group of groupDeferredSubscriptionLines(lineItems)) {
    sections.push({
      sectionId: `deferred-${group.billingCycleAnchor}`,
      billingCycleAnchor: group.billingCycleAnchor,
      subtotal: group.lines.reduce((sum, line) => sum + getLineSubtotal(line), 0),
      shipping: 0,
    });
  }

  return sections;
}

/**
 * BigCommerce checkout.taxTotal covers all line items plus only the due-today
 * consignment shipping. Deferred section shipping lives in KV and is not taxed by BC.
 */
function getBigCommerceTaxAllocationBase(section: {
  sectionId: string;
  subtotal: number;
  shipping: number;
}): number {
  if (section.sectionId === 'due-today') {
    return section.subtotal + section.shipping;
  }

  return section.subtotal;
}

function deriveShippingTaxRate({
  dueTodayTax,
  dueTodaySubtotal,
  dueTodayShipping,
  cartTax,
  totalProductSubtotal,
}: {
  dueTodayTax: number;
  dueTodaySubtotal: number;
  dueTodayShipping: number;
  cartTax: number;
  totalProductSubtotal: number;
}): number {
  if (dueTodayShipping > 0 && dueTodayTax > 0) {
    const [, shippingTax] = allocateAmountBySubtotal(
      [dueTodaySubtotal, dueTodayShipping],
      dueTodayTax,
    );

    return shippingTax / dueTodayShipping;
  }

  if (totalProductSubtotal > 0 && cartTax > 0) {
    return cartTax / totalProductSubtotal;
  }

  return 0;
}

export function calculateCheckoutAmounts({
  lineItems,
  cartTax,
  sectionShippingCosts = {},
}: {
  lineItems: CheckoutLineItemSnapshot[];
  cartSubtotal: number;
  cartTax: number;
  sectionShippingCosts?: Record<string, number>;
}): CheckoutAmounts {
  const deferredLines = lineItems.filter((line) => isDeferredSubscriptionLine(line));
  const deferredSubtotal = deferredLines.reduce((sum, line) => sum + getLineSubtotal(line), 0);

  const sections = buildCheckoutAmountSections({ lineItems, sectionShippingCosts });
  const bcTaxBases = sections.map(getBigCommerceTaxAllocationBase);
  const fullTaxableBase = bcTaxBases.reduce((sum, base) => sum + base, 0);
  const sectionProductTaxes = allocateAmountBySubtotal(bcTaxBases, cartTax);

  const dueTodaySection = sections.find((section) => section.sectionId === 'due-today');
  const dueTodayProductTax =
    sectionProductTaxes[sections.findIndex((section) => section.sectionId === 'due-today')] ?? 0;

  const shippingTaxRate = deriveShippingTaxRate({
    dueTodayTax: dueTodayProductTax,
    dueTodaySubtotal: dueTodaySection?.subtotal ?? 0,
    dueTodayShipping: dueTodaySection?.shipping ?? 0,
    cartTax,
    totalProductSubtotal: sections.reduce((sum, section) => sum + section.subtotal, 0),
  });

  const sectionAmounts: CheckoutSectionAmounts[] = sections.map((section, index) => {
    const productTax = sectionProductTaxes[index] ?? 0;
    const isDeferred = section.sectionId !== 'due-today';
    const estimatedShippingTax =
      isDeferred && section.shipping > 0 ? section.shipping * shippingTaxRate : 0;
    const tax = productTax + estimatedShippingTax;

    return {
      sectionId: section.sectionId,
      billingCycleAnchor: section.billingCycleAnchor,
      subtotal: section.subtotal,
      shipping: section.shipping,
      tax,
      grandTotal: section.subtotal + section.shipping + tax,
    };
  });

  const dueToday = sectionAmounts.find((section) => section.sectionId === 'due-today');
  const deferredSections = sectionAmounts.filter((section) => section.sectionId !== 'due-today');
  const deferredTax = deferredSections.reduce((sum, section) => sum + section.tax, 0);

  const immediateSubtotal = dueToday?.subtotal ?? 0;
  const immediateShipping = dueToday?.shipping ?? 0;
  const immediateTax = dueToday?.tax ?? 0;
  const immediateGrandTotal = dueToday?.grandTotal ?? 0;

  return {
    fullTaxableBase,
    immediateSubtotal,
    immediateShipping,
    immediateTax,
    immediateGrandTotal,
    deferredSubtotal,
    deferredTax,
    deferredSections,
    hasDeferredSubscriptions: deferredLines.length > 0,
    hasImmediateCharges: immediateGrandTotal > 0,
  };
}

export function getDeferredSectionAmounts(
  amounts: CheckoutAmounts,
  billingCycleAnchor: number,
): CheckoutSectionAmounts | undefined {
  return amounts.deferredSections.find(
    (section) => section.billingCycleAnchor === billingCycleAnchor,
  );
}
