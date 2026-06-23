'use client';

import { clsx } from 'clsx';
import { useRouter } from '~/i18n/routing';
import { useTransition } from 'react';

import {
  CustomCheckoutLineItem,
  CustomCheckoutSummarySection,
} from '@/vibes/soul/sections/custom-checkout';
import { selectCheckoutSectionShipping } from '~/app/[locale]/(default)/checkout/_actions/section-shipping';
import { Image } from '~/components/image';
import { SubscriptionLineSummary } from '@/vibes/soul/primitives/subscription-line-summary';

interface CheckoutSummaryPanelLabels {
  shippingTitle: string;
  shippingEmpty: string;
  shippingSelect: string;
  shippingNoOptions: string;
  shippingUpdating: string;
}

interface CheckoutSummaryPanelProps {
  summarySections: CustomCheckoutSummarySection[];
  currencyCode?: string;
  labels: CheckoutSummaryPanelLabels;
}

function BilledLaterIcon() {
  return (
    <svg aria-hidden className="size-3.5 shrink-0" fill="none" viewBox="0 0 16 16">
      <path
        d="M5 2v2M11 2v2M3 6.5h10M4 4h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckoutLineItemRow({ item }: { item: CustomCheckoutLineItem }) {
  const isBilledLater = item.chargeTiming === 'billed-later';

  if (!isBilledLater) {
    return (
      <li className="flex items-center gap-3">
        <div className="relative size-16 shrink-0">
          <div className="size-full overflow-hidden rounded-[10px]">
            {item.imageUrl ? (
              <Image
                alt={item.title}
                className="size-full border-0 object-cover outline-none ring-0"
                height={64}
                sizes="64px"
                src={item.imageUrl}
                width={64}
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-[var(--background,hsl(var(--background)))] text-xs text-[var(--contrast-400,hsl(var(--contrast-400)))]">
                —
              </span>
            )}
          </div>

          {item.quantity != null && item.quantity >= 1 ? (
            <span
              aria-label={`Quantity ${item.quantity}`}
              className="absolute right-0 top-0 z-10 flex h-[22px] min-w-[22px] translate-x-1/4 -translate-y-1/4 items-center justify-center rounded bg-[#2b2b2b] px-1 text-[12px] font-medium leading-none text-white"
            >
              {item.quantity}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-snug text-[var(--foreground,hsl(var(--foreground)))]">
                {item.title}
              </p>

              {item.subtitle ? (
                <p className="mt-0.5 text-[13px] leading-snug text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {item.subtitle}
                </p>
              ) : null}

              {item.chargeNote ? (
                <p className="mt-1 text-[11px] leading-tight text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {item.chargeNote}
                </p>
              ) : null}
            </div>

            {!item.hidePrice && item.price ? (
              <p className="shrink-0 text-[15px] leading-snug text-[var(--foreground,hsl(var(--foreground)))]">
                {item.price}
              </p>
            ) : null}
          </div>

          {item.badge ? (
            <SubscriptionLineSummary
              badge={item.badge}
              className="mt-1"
              details={item.subscriptionDetails}
            />
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className="checkout-summary-line checkout-summary-line--later overflow-hidden rounded-2xl border">
      {item.chargeLabel ? (
        <div className="checkout-summary-line__badge checkout-summary-line__badge--later">
          <BilledLaterIcon />
          <span>{item.chargeLabel}</span>
        </div>
      ) : null}

      <div className="checkout-summary-line__body flex gap-3 p-3">
        <div className="relative size-16 shrink-0">
          <div className="size-full overflow-hidden rounded-[10px]">
            {item.imageUrl ? (
              <Image
                alt={item.title}
                className="size-full border-0 object-cover opacity-80 outline-none ring-0"
                height={64}
                sizes="64px"
                src={item.imageUrl}
                width={64}
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-[hsl(var(--contrast-100))] text-xs text-[hsl(var(--contrast-400))]">
                —
              </span>
            )}
          </div>

          {item.quantity != null && item.quantity >= 1 ? (
            <span
              aria-label={`Quantity ${item.quantity}`}
              className="absolute right-0 top-0 z-10 flex h-[22px] min-w-[22px] translate-x-1/4 -translate-y-1/4 items-center justify-center rounded bg-[#2b2b2b] px-1 text-[12px] font-medium leading-none text-white"
            >
              {item.quantity}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium leading-snug text-[hsl(var(--foreground))]">
                {item.title}
              </p>

              {item.subtitle ? (
                <p className="mt-0.5 text-[13px] leading-snug text-[hsl(var(--contrast-500))]">
                  {item.subtitle}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              {item.price ? (
                <p className="text-[15px] font-medium leading-snug text-[hsl(var(--foreground))]">
                  {item.price}
                </p>
              ) : null}
              {item.chargeNote ? (
                <p className="mt-1 max-w-[9rem] text-[11px] leading-tight text-[hsl(var(--contrast-500))]">
                  {item.chargeNote}
                </p>
              ) : null}
            </div>
          </div>

          {item.badge ? (
            <SubscriptionLineSummary
              badge={item.badge}
              className="mt-2"
              details={item.subscriptionDetails}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function SectionShippingOptions({
  section,
  labels,
}: {
  section: CustomCheckoutSummarySection;
  labels: CheckoutSummaryPanelLabels;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!section.requiresShipping) {
    return null;
  }

  const handleSelect = (value: string) => {
    const shippingSectionId = section.shippingSectionId ?? section.id;

    startTransition(async () => {
      const result = await selectCheckoutSectionShipping(shippingSectionId, value);

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-5 border-t border-[var(--contrast-200,hsl(var(--contrast-200)))] pt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--contrast-500,hsl(var(--contrast-500)))]">
        {labels.shippingTitle}
      </p>

      {section.shippingOptions && section.shippingOptions.length > 0 ? (
        <div className="space-y-1">
          {section.shippingOptions.map((option) => {
            const isSelected = section.selectedShippingOption?.value === option.value;

            return (
              <label
                className={clsx(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-3 text-sm transition-colors',
                  isSelected
                    ? 'border-[var(--primary,hsl(var(--primary)))] bg-[var(--primary,hsl(var(--primary)))]/5'
                    : 'border-[var(--contrast-200,hsl(var(--contrast-200)))] hover:bg-[var(--contrast-100,hsl(var(--contrast-100)))]',
                  isPending && 'pointer-events-none opacity-60',
                )}
                key={option.value}
              >
                <span className="flex items-center gap-3">
                  <input
                    checked={isSelected}
                    name={`shipping-option-${section.id}`}
                    onChange={() => handleSelect(option.value)}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </span>
                <span className="font-medium">{option.price}</span>
              </label>
            );
          })}
          {isPending ? (
            <p className="px-1 pt-1 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {labels.shippingUpdating}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
          {isPending
            ? labels.shippingUpdating
            : section.shippingOptions && section.shippingOptions.length === 0
              ? labels.shippingNoOptions
              : labels.shippingEmpty}
        </p>
      )}
    </div>
  );
}

export function CheckoutSummaryPanel({
  summarySections,
  currencyCode,
  labels,
}: CheckoutSummaryPanelProps) {
  return (
    <div className="space-y-8">
      {summarySections.map((section, index) => (
        <section
          className={clsx(
            index > 0 && 'border-t border-[var(--contrast-200,hsl(var(--contrast-200)))] pt-8',
          )}
          key={section.id}
        >
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[var(--foreground,hsl(var(--foreground)))]">
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-1 text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {section.description}
              </p>
            ) : null}
          </div>

          <ul className="checkout-summary space-y-3">
            {section.lineItems.map((item, lineIndex) => (
              <CheckoutLineItemRow
                item={item}
                key={`${section.id}:${item.id}:${item.quantity ?? 0}:${lineIndex}`}
              />
            ))}
          </ul>

          <SectionShippingOptions labels={labels} section={section} />

          <dl className="mt-6 space-y-3 border-t border-[var(--contrast-200,hsl(var(--contrast-200)))] pt-4">
            {section.summaryItems.map((item) => (
              <div className="flex justify-between text-sm" key={`${section.id}:${item.label}`}>
                <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
            <div className="flex items-end justify-between border-t border-[var(--contrast-200,hsl(var(--contrast-200)))] pt-4">
              <dt className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {section.totalLabel}
              </dt>
              <dd className="text-right">
                {currencyCode ? (
                  <span className="mr-2 text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                    {currencyCode}
                  </span>
                ) : null}
                <span className="text-xl font-semibold">{section.total}</span>
              </dd>
            </div>
          </dl>
        </section>
      ))}
    </div>
  );
}
