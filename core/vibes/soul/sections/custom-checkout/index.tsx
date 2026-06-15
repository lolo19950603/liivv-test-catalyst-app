import { clsx } from 'clsx';
import { ReactNode } from 'react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

export interface CustomCheckoutLineItem {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  badge?: string;
}

export interface CustomCheckoutSummaryItem {
  label: string;
  value: string;
}

export interface CustomCheckoutProps {
  className?: string;
  title: string;
  lineItems: CustomCheckoutLineItem[];
  summaryItems: CustomCheckoutSummaryItem[];
  total: string;
  totalLabel: string;
  billingTitle: string;
  paymentTitle: string;
  shippingWarning?: string;
  shippingWarningCta?: string;
  billingForm: ReactNode;
  paymentSection: ReactNode;
}

export function CustomCheckout({
  className,
  title,
  lineItems,
  summaryItems,
  total,
  totalLabel,
  billingTitle,
  paymentTitle,
  shippingWarning,
  shippingWarningCta,
  billingForm,
  paymentSection,
}: CustomCheckoutProps) {
  return (
    <div className={clsx('@container', className)}>
      <h1 className="mb-8 font-[family-name:var(--font-family-heading)] text-4xl font-medium">{title}</h1>

      {shippingWarning ? (
        <div className="mb-6 rounded-2xl border border-[var(--warning,hsl(var(--warning)))] bg-[color-mix(in_oklab,hsl(var(--warning))_12%,transparent)] p-4">
          <p className="text-sm">{shippingWarning}</p>
          {shippingWarningCta ? (
            <ButtonLink className="mt-3" href="/cart/" size="small" variant="secondary">
              {shippingWarningCta}
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-10 @2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-6">
            <h2 className="mb-4 text-xl font-medium">{billingTitle}</h2>
            {billingForm}
          </section>

          <section className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-6">
            <h2 className="mb-4 text-xl font-medium">{paymentTitle}</h2>
            {paymentSection}
          </section>
        </div>

        <aside className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] p-6">
          <ul className="space-y-4">
            {lineItems.map((item) => (
              <li className="border-b border-[var(--contrast-100,hsl(var(--contrast-100)))] pb-4" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.subtitle ? (
                      <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                        {item.subtitle}
                      </p>
                    ) : null}
                    {item.badge ? (
                      <p className="mt-1 text-xs uppercase tracking-wide text-[var(--primary,hsl(var(--primary)))]">
                        {item.badge}
                      </p>
                    ) : null}
                  </div>
                  <p className="font-medium">{item.price}</p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-[var(--contrast-100,hsl(var(--contrast-100)))] pt-4">
            {summaryItems.map((item) => (
              <div className="flex justify-between text-sm" key={item.label}>
                <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-[var(--contrast-100,hsl(var(--contrast-100)))] pt-4 text-lg font-semibold">
              <dt>{totalLabel}</dt>
              <dd>{total}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
