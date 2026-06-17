import type {
  CustomCheckoutLineItem,
  CustomCheckoutSummaryItem,
  CustomCheckoutSummarySection,
} from '@/vibes/soul/sections/custom-checkout';

import { calculateCheckoutAmounts } from './checkout-amounts';
import type { CheckoutLineItemSnapshot } from './types';

export interface CheckoutDisplayLineInput {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
  isPhysical: boolean;
  snapshot: CheckoutLineItemSnapshot;
  display: CustomCheckoutLineItem;
}

function toSummaryItems({
  subtotal,
  shipping,
  tax,
  labels,
  formatMoney,
  includeShipping,
}: {
  subtotal: number;
  shipping: number;
  tax: number;
  labels: {
    subtotal: string;
    shipping: string;
    tax: string;
  };
  formatMoney: (value: number) => string;
  includeShipping: boolean;
}): CustomCheckoutSummaryItem[] {
  const items: CustomCheckoutSummaryItem[] = [
    {
      label: labels.subtotal,
      value: formatMoney(subtotal),
    },
  ];

  if (includeShipping && shipping > 0) {
    items.push({
      label: labels.shipping,
      value: formatMoney(shipping),
    });
  }

  if (tax > 0) {
    items.push({
      label: labels.tax,
      value: formatMoney(tax),
    });
  }

  return items;
}

export function buildCheckoutSummarySections({
  lines,
  cartSubtotal,
  cartTax,
  sectionShippingCosts,
  sectionShippingUi,
  formatMoney,
  labels,
}: {
  lines: CheckoutDisplayLineInput[];
  cartSubtotal: number;
  cartTax: number;
  sectionShippingCosts: Record<string, number>;
  sectionShippingUi?: Record<
    string,
    {
      requiresShipping: boolean;
      shippingOptions: Array<{ value: string; label: string; price: string }>;
      selectedShippingOption?: { value: string; label: string; price: string };
    }
  >;
  formatMoney: (value: number) => string;
  labels: {
    sectionTitle: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
  };
}): CustomCheckoutSummarySection[] {
  const snapshotLines = lines.map((line) => line.snapshot);
  const shipping = sectionShippingCosts['due-today'] ?? 0;
  const amounts = calculateCheckoutAmounts({
    lineItems: snapshotLines,
    cartSubtotal,
    cartTax,
    shipping,
  });

  const sectionId = 'due-today';
  const shippingUi = sectionShippingUi?.[sectionId];
  const displayLines = lines.map((line) => line.display);

  return [
    {
      id: sectionId,
      title: labels.sectionTitle,
      lineItems: displayLines,
      summaryItems: toSummaryItems({
        subtotal: amounts.subtotal,
        shipping: amounts.shipping,
        tax: amounts.tax,
        labels,
        formatMoney,
        includeShipping: shippingUi?.requiresShipping ?? false,
      }),
      total: formatMoney(amounts.grandTotal),
      totalLabel: labels.total,
      requiresShipping: shippingUi?.requiresShipping,
      shippingOptions: shippingUi?.shippingOptions,
      selectedShippingOption: shippingUi?.selectedShippingOption,
    },
  ];
}
