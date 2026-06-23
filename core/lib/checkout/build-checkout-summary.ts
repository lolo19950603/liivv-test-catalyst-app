import type {
  CustomCheckoutLineItem,
  CustomCheckoutSummaryItem,
  CustomCheckoutSummarySection,
} from '@/vibes/soul/sections/custom-checkout';

import type { CheckoutLineItemSnapshot } from './types';
import {
  calculateCheckoutAmounts,
  isDeferredSubscriptionLine,
} from './subscription-charge-timing';

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

function enrichCheckoutLineDisplay(
  line: CheckoutDisplayLineInput,
  {
    formatBilledOnLineLabel,
    notInTotalNote,
    billedOnDetailPrefix,
    subjectToChangeAtBillingNote,
  }: {
    formatBilledOnLineLabel: (date: string) => string;
    notInTotalNote: string;
    billedOnDetailPrefix: string;
    subjectToChangeAtBillingNote: string;
  },
  formatDeferredDate: (timestamp: number) => string,
): CustomCheckoutLineItem {
  if (
    line.snapshot.isSubscription &&
    isDeferredSubscriptionLine(line.snapshot) &&
    line.snapshot.billingCycleAnchor
  ) {
    const billedOnDate = formatDeferredDate(line.snapshot.billingCycleAnchor);
    const subscriptionDetails = line.display.subscriptionDetails?.filter(
      (detail) => !detail.startsWith(billedOnDetailPrefix),
    );

    return {
      ...line.display,
      subscriptionDetails,
      chargeTiming: 'billed-later',
      chargeLabel: formatBilledOnLineLabel(billedOnDate),
      chargeNote: subjectToChangeAtBillingNote,
    };
  }

  if (line.snapshot.isSubscription) {
    return {
      ...line.display,
      chargeTiming: 'due-today',
    };
  }

  return {
    ...line.display,
    chargeTiming: 'due-today',
  };
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
    orderSummaryTitle: string;
    formatBilledOnLineLabel: (date: string) => string;
    notInTotalNote: string;
    billedOnDetailPrefix: string;
    subjectToChangeAtBillingNote: string;
    subtotal: string;
    shipping: string;
    tax: string;
    dueTodayTotal: string;
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

  const shippingUi = sectionShippingUi?.['due-today'];
  const lineItems = lines
    .map((line, index) => ({
      index,
      item: enrichCheckoutLineDisplay(line, labels, formatDeferredDate),
    }))
    .sort((left, right) => {
      const leftIsDueToday = left.item.chargeTiming !== 'billed-later';
      const rightIsDueToday = right.item.chargeTiming !== 'billed-later';

      if (leftIsDueToday !== rightIsDueToday) {
        return leftIsDueToday ? -1 : 1;
      }

      return left.index - right.index;
    })
    .map(({ item }) => item);

  return [
    {
      id: 'checkout-summary',
      title: labels.orderSummaryTitle,
      lineItems,
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
      shippingSectionId: 'due-today',
      shippingOptions: shippingUi?.shippingOptions,
      selectedShippingOption: shippingUi?.selectedShippingOption,
    },
  ];
}
