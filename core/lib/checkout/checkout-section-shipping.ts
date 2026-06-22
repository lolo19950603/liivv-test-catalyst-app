import type { CheckoutLineItemSnapshot } from './types';
import {
  getLineSubtotal,
  groupDeferredSubscriptionLines,
  isDeferredSubscriptionLine,
} from './subscription-charge-timing';

export function getSectionLineSnapshots(
  sectionId: string,
  lineSnapshots: CheckoutLineItemSnapshot[],
): CheckoutLineItemSnapshot[] {
  if (sectionId === 'due-today') {
    return lineSnapshots.filter((line) => line.isPhysical && !isDeferredSubscriptionLine(line));
  }

  const anchor = Number(sectionId.replace('deferred-', ''));

  return lineSnapshots.filter(
    (line) =>
      line.isPhysical &&
      isDeferredSubscriptionLine(line) &&
      line.billingCycleAnchor === anchor,
  );
}

/** Subtotal used for free-shipping eligibility on this checkout section. */
export function getSectionShippingQuoteSubtotal(
  sectionId: string,
  lineSnapshots: CheckoutLineItemSnapshot[],
): number {
  return getSectionLineSnapshots(sectionId, lineSnapshots).reduce(
    (sum, line) => sum + getLineSubtotal(line),
    0,
  );
}

export interface CheckoutPhysicalLineItem {
  lineItemEntityId: string;
  quantity: number;
}

export interface CheckoutShippingSection {
  id: string;
  /** Physical items in this section need a ship-to address at checkout. */
  requiresShippingAddress: boolean;
  /** Customer must select a shipping rate for this section before paying. */
  requiresShippingMethod: boolean;
  physicalLineItems: CheckoutPhysicalLineItem[];
}

export function aggregatePhysicalLineItems(
  lines: Array<Pick<CheckoutLineItemSnapshot, 'lineItemEntityId' | 'quantity' | 'isPhysical'>>,
): CheckoutPhysicalLineItem[] {
  const quantities = new Map<string, number>();

  for (const line of lines) {
    if (!line.isPhysical) {
      continue;
    }

    quantities.set(
      line.lineItemEntityId,
      (quantities.get(line.lineItemEntityId) ?? 0) + line.quantity,
    );
  }

  return Array.from(quantities.entries()).map(([lineItemEntityId, quantity]) => ({
    lineItemEntityId,
    quantity,
  }));
}

export function buildCheckoutShippingSections(
  lines: CheckoutLineItemSnapshot[],
): CheckoutShippingSection[] {
  const sections: CheckoutShippingSection[] = [];
  const immediateLines = lines.filter((line) => !isDeferredSubscriptionLine(line));

  if (immediateLines.length > 0) {
    const physicalLineItems = aggregatePhysicalLineItems(immediateLines);

    sections.push({
      id: 'due-today',
      requiresShippingAddress: physicalLineItems.length > 0,
      requiresShippingMethod: physicalLineItems.length > 0,
      physicalLineItems,
    });
  }

  for (const group of groupDeferredSubscriptionLines(lines)) {
    const physicalLineItems = aggregatePhysicalLineItems(group.lines);

    sections.push({
      id: `deferred-${group.billingCycleAnchor}`,
      requiresShippingAddress: physicalLineItems.length > 0,
      requiresShippingMethod: false,
      physicalLineItems,
    });
  }

  return sections;
}

export function getSectionShippingCost(
  sectionShipping: Record<string, number> | undefined,
  sectionId: string,
): number {
  return sectionShipping?.[sectionId] ?? 0;
}
