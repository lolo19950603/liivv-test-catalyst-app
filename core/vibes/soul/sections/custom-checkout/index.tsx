import { clsx } from 'clsx';

import { ReactNode } from 'react';

import { CheckoutSummaryPanel } from '~/components/checkout/checkout-summary-panel';

export interface CustomCheckoutLineItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  quantity?: number;
  price?: string;
  badge?: string;
  subscriptionDetails?: string[];
  chargeTiming?: 'due-today' | 'billed-later';
  chargeLabel?: string;
  chargeNote?: string;
  hidePrice?: boolean;
}

export interface CustomCheckoutSummaryItem {
  label: string;
  value: string;
}

export interface CustomCheckoutSummarySection {
  id: string;
  title: string;
  description?: string;
  lineItems: CustomCheckoutLineItem[];
  summaryItems: CustomCheckoutSummaryItem[];
  total: string;
  totalLabel: string;
  requiresShipping?: boolean;
  /** KV section id used when persisting shipping selection (e.g. `due-today`). */
  shippingSectionId?: string;
  shippingOptions?: Array<{ value: string; label: string; price: string }>;
  selectedShippingOption?: { value: string; label: string; price: string };
}

export interface CustomCheckoutProps {
  className?: string;
  fulfillmentSection: ReactNode;
  summarySections: CustomCheckoutSummarySection[];
  currencyCode?: string;
  summaryLabels: {
    shippingTitle: string;
    shippingEmpty: string;
    shippingSelect: string;
    shippingNoOptions: string;
    shippingUpdating: string;
  };
}

export function CustomCheckout({
  className,
  fulfillmentSection,
  summarySections,
  currencyCode,
  summaryLabels,
}: CustomCheckoutProps) {
  return (
    <div className={clsx('min-h-screen bg-[var(--contrast-50,hsl(var(--contrast-50)))] @container', className)}>
      <div className="mx-auto grid min-h-screen w-full max-w-[68rem] grid-cols-1 @lg:grid-cols-2">
        <div className="border-b border-[var(--contrast-200,hsl(var(--contrast-200)))] bg-[var(--background,hsl(var(--background)))] @lg:border-b-0 @lg:border-r">
          <div className="mx-auto w-full max-w-lg px-5 py-8 @md:px-10 @lg:py-12 @lg:pl-12 @lg:pr-10">
            {fulfillmentSection}
          </div>
        </div>

        <aside className="bg-[var(--contrast-50,hsl(var(--contrast-50)))]">
          <div className="sticky top-0 mx-auto w-full max-w-md px-5 py-8 @md:px-10 @lg:py-12 @lg:pl-10 @lg:pr-12">
            <CheckoutSummaryPanel
              currencyCode={currencyCode}
              labels={summaryLabels}
              summarySections={summarySections}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
