import type {
  CustomCheckoutLineItem,
  CustomCheckoutSummaryItem,
  CustomCheckoutSummarySection,
} from '@/vibes/soul/sections/custom-checkout';

import type { CheckoutLineItemSnapshot } from './types';
import {
  calculateCheckoutAmounts,
  getDeferredSectionAmounts,
  getLineSubtotal,
  groupDeferredSubscriptionLines,
  isDeferredSubscriptionLine,
} from './subscription-charge-timing';
import { getSectionShippingCost } from './checkout-section-shipping';

export interface CheckoutDisplayLineInput {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
  isPhysical: boolean;
  isSubscription: boolean;
  billingCycleAnchor?: number;
  badge?: string;
  subscriptionDetails?: string[];
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
  formatDeferredDate,
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
    dueTodayTitle: string;
    formatBilledOnTitle: (date: string) => string;
    subtotal: string;
    shipping: string;
    tax: string;
    dueTodayTotal: string;
    billedLaterTotal: string;
    billedLaterNote: string;
  };
  formatDeferredDate: (timestamp: number) => string;
}): CustomCheckoutSummarySection[] {
  const snapshotLines = lines.map((line) => line.snapshot);
  const amounts = calculateCheckoutAmounts({
    lineItems: snapshotLines,
    cartSubtotal,
    cartTax,
    sectionShippingCosts,
  });

  const immediateLines = lines.filter((line) => !isDeferredSubscriptionLine(line.snapshot));
  const sections: CustomCheckoutSummarySection[] = [];

  if (immediateLines.length > 0) {
    const sectionId = 'due-today';
    const shippingUi = sectionShippingUi?.[sectionId];

    sections.push({
      id: sectionId,
      title: labels.dueTodayTitle,
      lineItems: immediateLines.map((line) => line.display),
      summaryItems: toSummaryItems({
        subtotal: amounts.immediateSubtotal,
        shipping: amounts.immediateShipping,
        tax: amounts.immediateTax,
        labels,
        formatMoney,
        includeShipping: shippingUi?.requiresShipping ?? false,
      }),
      total: formatMoney(amounts.immediateGrandTotal),
      totalLabel: labels.dueTodayTotal,
      requiresShipping: shippingUi?.requiresShipping,
      shippingOptions: shippingUi?.shippingOptions,
      selectedShippingOption: shippingUi?.selectedShippingOption,
    });
  }

  for (const group of groupDeferredSubscriptionLines(snapshotLines)) {
    const sectionId = `deferred-${group.billingCycleAnchor}`;
    const sectionLines = lines.filter(
      (line) =>
        isDeferredSubscriptionLine(line.snapshot) &&
        line.snapshot.billingCycleAnchor === group.billingCycleAnchor,
    );
    const sectionAmounts = getDeferredSectionAmounts(amounts, group.billingCycleAnchor);
    const groupSubtotal = sectionAmounts?.subtotal ?? group.lines.reduce(
      (sum, line) => sum + getLineSubtotal(line),
      0,
    );
    const sectionShipping = sectionAmounts?.shipping ?? getSectionShippingCost(sectionShippingCosts, sectionId);
    const sectionTax = sectionAmounts?.tax ?? 0;
    const sectionTotal =
      sectionAmounts?.grandTotal ?? groupSubtotal + sectionShipping + sectionTax;
    const formattedDate = formatDeferredDate(group.billingCycleAnchor);
    const shippingUi = sectionShippingUi?.[sectionId];

    sections.push({
      id: sectionId,
      title: labels.formatBilledOnTitle(formattedDate),
      description: labels.billedLaterNote,
      lineItems: sectionLines.map((line) => line.display),
      summaryItems: toSummaryItems({
        subtotal: groupSubtotal,
        shipping: sectionShipping,
        tax: sectionTax,
        labels,
        formatMoney,
        includeShipping: shippingUi?.requiresShipping ?? false,
      }),
      total: formatMoney(sectionTotal),
      totalLabel: labels.billedLaterTotal,
      requiresShipping: shippingUi?.requiresShipping,
      shippingOptions: shippingUi?.shippingOptions,
      selectedShippingOption: shippingUi?.selectedShippingOption,
    });
  }

  return sections;
}
