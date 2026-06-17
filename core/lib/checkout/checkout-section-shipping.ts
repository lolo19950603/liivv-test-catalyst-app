import type { CheckoutLineItemSnapshot } from './types';

export interface CheckoutPhysicalLineItem {
  lineItemEntityId: string;
  quantity: number;
}

export interface CheckoutShippingSection {
  id: string;
  requiresShipping: boolean;
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
  const physicalLineItems = aggregatePhysicalLineItems(lines);

  if (lines.length === 0) {
    return [];
  }

  return [
    {
      id: 'due-today',
      requiresShipping: physicalLineItems.length > 0,
      physicalLineItems,
    },
  ];
}

export function getSectionShippingCost(
  sectionShipping: Record<string, number> | undefined,
  sectionId: string,
): number {
  return sectionShipping?.[sectionId] ?? 0;
}
