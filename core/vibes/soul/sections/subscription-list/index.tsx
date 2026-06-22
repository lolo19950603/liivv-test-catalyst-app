'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import type { ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';
import { Image } from '~/components/image';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  quantity: number;
  image?: { src: string; alt: string };
  price?: string;
  priceNote?: string;
  intervalLabel: string;
  paymentMethodLabel: string;
  statusLabel: string;
  statusKey?: string;
  scheduleDetail?: string;
}

export interface SubscriptionDeliveryGroup {
  id: string;
  shippingAddressLabel: string;
  shippingMethodLabel?: string;
  shipmentHeading?: string;
  subtotalExTax?: string;
  tax?: string;
  totalIncTax?: string;
  totalsPending?: boolean;
  items: SubscriptionListItem[];
}

export interface SubscriptionDateGroup {
  id: string;
  title: string;
  deliveries: SubscriptionDeliveryGroup[];
}

export interface SubscriptionPortalSections {
  deliveries: SubscriptionDateGroup[];
  active: SubscriptionListItem[];
  canceled: SubscriptionListItem[];
}

export type SubscriptionPortalTab = 'deliveries' | 'active' | 'canceled';

export interface SubscriptionListProps {
  className?: string;
  title?: string;
  portalSections?: SubscriptionPortalSections;
  dateGroups?: SubscriptionDateGroup[];
  subscriptions?: SubscriptionListItem[];
  deliveriesSectionTitle?: string;
  activeSectionTitle?: string;
  canceledSectionTitle?: string;
  emptyDeliveriesTitle?: string;
  emptyActiveTitle?: string;
  emptyCanceledTitle?: string;
  manageBillingLabel?: string;
  manageBillingAction?: () => Promise<void>;
  manageItemLabel?: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  shipToLabel?: string;
  deliveryOptionLabel?: string;
  subtotalLabel?: string;
  taxLabel?: string;
  totalLabel?: string;
  totalsPendingLabel?: string;
  quantityLabel?: string;
  paymentLabel?: string;
  frequencyLabel?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateActionLabel?: string;
  emptyStateActionHref?: string;
  message?: string;
  storeLogoFallback?: ProductImageFallbackLogo | null;
}

function SubscriptionSectionToggle({
  deliveriesLabel,
  activeLabel,
  canceledLabel,
  selected,
  onSelect,
}: {
  deliveriesLabel: string;
  activeLabel: string;
  canceledLabel: string;
  selected: SubscriptionPortalTab;
  onSelect: (value: SubscriptionPortalTab) => void;
}) {
  const tabs: Array<{ value: SubscriptionPortalTab; label: string }> = [
    { value: 'deliveries', label: deliveriesLabel },
    { value: 'active', label: activeLabel },
    { value: 'canceled', label: canceledLabel },
  ];

  return (
    <div className="subscription-portal-toggle" role="tablist">
      {tabs.map(({ value, label }) => {
        const isSelected = selected === value;

        return (
          <button
            aria-selected={isSelected}
            className="subscription-portal-toggle__option"
            data-selected={isSelected ? 'true' : 'false'}
            key={value}
            onClick={() => onSelect(value)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SubscriptionTabEmptyState({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--contrast-100))] bg-[hsl(var(--background))] p-8 text-center">
      <p className="text-sm text-[hsl(var(--contrast-500))]">{title}</p>
    </div>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[hsl(var(--contrast-100))] px-3 py-1 text-xs font-medium text-[hsl(var(--contrast-500))]">
      {status}
    </span>
  );
}

function SubscriptionPortalSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} loading={pending} size="medium" type="submit" variant="secondary">
      {label}
    </Button>
  );
}

function SubscriptionEditAction({
  subscriptionId,
  manageItemAction,
  manageItemLabel,
  className,
}: {
  subscriptionId: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  className?: string;
}) {
  if (!manageItemAction || !manageItemLabel) {
    return null;
  }

  return (
    <form action={manageItemAction.bind(null, subscriptionId)} className={className}>
      <SubscriptionPortalSubmitButton label={manageItemLabel} />
    </form>
  );
}

function SubscriptionProductImage({
  subscription,
  quantityLabel,
  size = 'large',
  fallbackLogo,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  size?: 'large' | 'medium' | 'compact';
  fallbackLogo?: ProductImageFallbackLogo | null;
}) {
  const dimension = size === 'large' ? 96 : size === 'medium' ? 80 : 56;
  const hasLogoImage = Boolean(fallbackLogo?.src?.trim());
  const hasLogoText = Boolean(fallbackLogo?.text?.trim());

  return (
    <div
      className={clsx(
        'relative shrink-0',
        size === 'large' && 'mx-auto size-24',
        size === 'medium' && 'mx-auto size-20',
        size === 'compact' && 'size-14',
      )}
    >
      <div className="size-full overflow-hidden rounded-[10px] bg-[var(--contrast-100,hsl(var(--contrast-100)))]">
        {subscription.image ? (
          <Image
            alt={subscription.image.alt}
            className="size-full border-0 object-cover outline-none ring-0"
            height={dimension}
            sizes={`${dimension}px`}
            src={subscription.image.src}
            width={dimension}
          />
        ) : hasLogoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={fallbackLogo?.alt ?? subscription.productName}
            className="size-full object-contain object-center p-2"
            src={fallbackLogo?.src}
          />
        ) : hasLogoText ? (
          <span className="flex size-full items-center justify-center px-2 text-center text-[10px] font-semibold uppercase leading-tight text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {fallbackLogo?.text}
          </span>
        ) : (
          <span className="flex size-full items-center justify-center text-xs text-[var(--contrast-400,hsl(var(--contrast-400)))]">
            —
          </span>
        )}
      </div>

      {subscription.quantity >= 1 ? (
        <span
          aria-label={`${quantityLabel} ${subscription.quantity}`}
          className="absolute right-0 top-0 z-10 flex h-5 min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded bg-[#2b2b2b] px-1 text-[11px] font-medium leading-none text-white"
        >
          {subscription.quantity}
        </span>
      ) : null}
    </div>
  );
}

function SubscriptionProductDetails({
  subscription,
  paymentLabel,
  frequencyLabel,
  align = 'center',
}: {
  subscription: SubscriptionListItem;
  paymentLabel: string;
  frequencyLabel: string;
  align?: 'center' | 'start';
}) {
  return (
    <>
      <p
        className={clsx(
          'line-clamp-2 text-sm font-medium leading-snug text-[var(--foreground,hsl(var(--foreground)))]',
          align === 'center' && 'text-center',
        )}
      >
        {subscription.productName}
      </p>
      <div className={clsx('mt-1', align === 'center' && 'text-center')}>
        <p className="text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]">
          {frequencyLabel}: {subscription.intervalLabel}
        </p>
        <p className="mt-0.5 text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]">
          {paymentLabel}: {subscription.paymentMethodLabel}
        </p>
        {subscription.scheduleDetail ? (
          <p className="mt-1 text-xs text-[var(--contrast-600,hsl(var(--contrast-600)))]">
            {subscription.scheduleDetail}
          </p>
        ) : null}
      </div>
    </>
  );
}

function SubscriptionProductPricing({
  subscription,
  align = 'center',
  showStatus = true,
}: {
  subscription: SubscriptionListItem;
  align?: 'center' | 'end';
  showStatus?: boolean;
}) {
  return (
    <div className={clsx(align === 'end' && 'shrink-0 text-right', align === 'center' && 'text-center')}>
      {subscription.price ? (
        <p className="text-sm font-medium text-[var(--foreground,hsl(var(--foreground)))]">
          {subscription.price}
        </p>
      ) : subscription.priceNote ? (
        <p
          className={clsx(
            'text-xs leading-tight text-[var(--contrast-500,hsl(var(--contrast-500)))]',
            align === 'end' && 'max-w-[7rem]',
          )}
        >
          {subscription.priceNote}
        </p>
      ) : null}
      {showStatus ? (
        <div className={clsx('mt-2 flex', align === 'end' ? 'justify-end' : 'justify-center')}>
          <SubscriptionStatusBadge status={subscription.statusLabel} />
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionProductCard({
  subscription,
  quantityLabel,
  paymentLabel,
  frequencyLabel,
  manageItemAction,
  manageItemLabel,
  variant = 'standalone',
  fallbackLogo,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  variant?: 'standalone' | 'embedded';
  fallbackLogo?: ProductImageFallbackLogo | null;
}) {
  if (variant === 'embedded') {
    return (
      <li className="subscription-product-card subscription-delivery-product flex h-full w-[13.5rem] shrink-0 flex-col rounded-xl border border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 bg-[var(--background,hsl(var(--background)))] p-3">
        <SubscriptionProductImage
          fallbackLogo={fallbackLogo}
          quantityLabel={quantityLabel}
          size="medium"
          subscription={subscription}
        />

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <SubscriptionProductDetails
            align="center"
            frequencyLabel={frequencyLabel}
            paymentLabel={paymentLabel}
            subscription={subscription}
          />

          <div className="mt-2">
            <SubscriptionProductPricing align="center" showStatus={false} subscription={subscription} />
          </div>
        </div>

        <SubscriptionEditAction
          className="mt-4 flex w-full shrink-0 justify-center"
          manageItemAction={manageItemAction}
          manageItemLabel={manageItemLabel}
          subscriptionId={subscription.id}
        />
      </li>
    );
  }

  return (
    <li
      className={clsx(
        'subscription-product-card flex h-full flex-col',
        'subscription-flat-item w-[16rem] shrink-0 rounded-2xl bg-[var(--contrast-50,hsl(var(--contrast-50)))] p-4 @md:w-auto @md:shrink',
      )}
    >
      <SubscriptionProductImage
        fallbackLogo={fallbackLogo}
        quantityLabel={quantityLabel}
        subscription={subscription}
      />

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <SubscriptionProductDetails
          align="center"
          frequencyLabel={frequencyLabel}
          paymentLabel={paymentLabel}
          subscription={subscription}
        />

        <div className="mt-3">
          <SubscriptionProductPricing align="center" subscription={subscription} />
        </div>
      </div>

      <SubscriptionEditAction
        className="mt-4 flex w-full shrink-0 justify-center"
        manageItemAction={manageItemAction}
        manageItemLabel={manageItemLabel}
        subscriptionId={subscription.id}
      />
    </li>
  );
}

function SubscriptionLineItemRow({
  subscription,
  quantityLabel,
  paymentLabel,
  frequencyLabel,
  manageItemAction,
  manageItemLabel,
  fallbackLogo,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
}) {
  return (
    <SubscriptionProductCard
      fallbackLogo={fallbackLogo}
      frequencyLabel={frequencyLabel}
      manageItemAction={manageItemAction}
      manageItemLabel={manageItemLabel}
      paymentLabel={paymentLabel}
      quantityLabel={quantityLabel}
      subscription={subscription}
      variant="embedded"
    />
  );
}

function SubscriptionDeliveryCard({
  delivery,
  manageItemAction,
  manageItemLabel,
  labels,
  fallbackLogo,
}: {
  delivery: SubscriptionDeliveryGroup;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  labels: {
    shipToLabel: string;
    deliveryOptionLabel: string;
    subtotalLabel: string;
    taxLabel: string;
    totalLabel: string;
    totalsPendingLabel: string;
    quantityLabel: string;
    paymentLabel: string;
    frequencyLabel: string;
  };
}) {
  return (
    <li className="subscription-delivery-card flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-[var(--contrast-50,hsl(var(--contrast-50)))]">
      {delivery.shipmentHeading ? (
        <div className="border-b border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 px-5 py-3 @md:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground,hsl(var(--foreground)))]">
            {delivery.shipmentHeading}
          </p>
        </div>
      ) : null}
      <div className="px-5 py-4 @md:px-6">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
          <div className="min-w-[12rem] flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {labels.shipToLabel}
            </p>
            <p className="mt-0.5 text-sm font-medium leading-snug text-[var(--foreground,hsl(var(--foreground)))]">
              {delivery.shippingAddressLabel}
            </p>
          </div>

          <div className="min-w-[10rem]">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {labels.deliveryOptionLabel}
            </p>
            <p className="mt-0.5 text-sm leading-snug text-[var(--foreground,hsl(var(--foreground)))]">
              {delivery.shippingMethodLabel}
            </p>
          </div>
        </div>
      </div>

      <ul className="subscription-delivery-products flex items-stretch gap-3 overflow-x-auto border-t border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 px-5 py-4 @md:px-6">
        {delivery.items.map((subscription) => (
          <SubscriptionLineItemRow
            fallbackLogo={fallbackLogo}
            frequencyLabel={labels.frequencyLabel}
            key={subscription.id}
            manageItemAction={manageItemAction}
            manageItemLabel={manageItemLabel}
            paymentLabel={labels.paymentLabel}
            quantityLabel={labels.quantityLabel}
            subscription={subscription}
          />
        ))}
      </ul>

      <div className="mt-auto border-t border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 px-5 py-4 @md:px-6">
        {delivery.totalsPending ? (
          <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {labels.totalsPendingLabel}
          </p>
        ) : (
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {labels.subtotalLabel}
              </dt>
              <dd className="font-medium tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                {delivery.subtotalExTax}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">{labels.taxLabel}</dt>
              <dd className="font-medium tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                {delivery.tax}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-1.5">
              <dt className="font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                {labels.totalLabel}
              </dt>
              <dd className="font-semibold tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                {delivery.totalIncTax}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </li>
  );
}

function SubscriptionFlatItemCard({
  subscription,
  quantityLabel,
  paymentLabel,
  frequencyLabel,
  manageItemAction,
  manageItemLabel,
  fallbackLogo,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
}) {
  return (
    <SubscriptionProductCard
      fallbackLogo={fallbackLogo}
      frequencyLabel={frequencyLabel}
      manageItemAction={manageItemAction}
      manageItemLabel={manageItemLabel}
      paymentLabel={paymentLabel}
      quantityLabel={quantityLabel}
      subscription={subscription}
      variant="standalone"
    />
  );
}

function SubscriptionFlatItemsSection({
  items,
  manageItemAction,
  manageItemLabel,
  labels,
  fallbackLogo,
}: {
  items: SubscriptionListItem[];
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  labels: {
    quantityLabel: string;
    paymentLabel: string;
    frequencyLabel: string;
  };
}) {
  return (
    <ul className="subscription-flat-grid -mx-1 flex items-stretch gap-4 overflow-x-auto px-1 pb-1 @md:mx-0 @md:grid @md:items-stretch @md:overflow-visible @md:px-0 [grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr))]">
      {items.map((subscription) => (
        <SubscriptionFlatItemCard
          fallbackLogo={fallbackLogo}
          frequencyLabel={labels.frequencyLabel}
          key={subscription.id}
          manageItemAction={manageItemAction}
          manageItemLabel={manageItemLabel}
          paymentLabel={labels.paymentLabel}
          quantityLabel={labels.quantityLabel}
          subscription={subscription}
        />
      ))}
    </ul>
  );
}

function SubscriptionDateSections({
  groups,
  manageItemAction,
  manageItemLabel,
  labels,
  fallbackLogo,
}: {
  groups: SubscriptionDateGroup[];
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  labels: {
    shipToLabel: string;
    deliveryOptionLabel: string;
    subtotalLabel: string;
    taxLabel: string;
    totalLabel: string;
    totalsPendingLabel: string;
    quantityLabel: string;
    paymentLabel: string;
    frequencyLabel: string;
  };
}) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.id}>
          {group.title ? (
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {group.title}
            </h3>
          ) : null}

          <ul className="subscription-delivery-grid flex flex-col gap-4">
            {group.deliveries.map((delivery) => (
              <SubscriptionDeliveryCard
                delivery={delivery}
                fallbackLogo={fallbackLogo}
                key={delivery.id}
                labels={{
                  shipToLabel: labels.shipToLabel ?? 'Ship to',
                  deliveryOptionLabel: labels.deliveryOptionLabel ?? 'Delivery',
                  subtotalLabel: labels.subtotalLabel ?? 'Subtotal',
                  taxLabel: labels.taxLabel ?? 'Tax',
                  totalLabel: labels.totalLabel ?? 'Total',
                  totalsPendingLabel: labels.totalsPendingLabel ?? 'Totals confirmed at billing',
                  quantityLabel: labels.quantityLabel ?? 'Quantity',
                  paymentLabel: labels.paymentLabel ?? 'Payment',
                  frequencyLabel: labels.frequencyLabel ?? 'Frequency',
                }}
                manageItemAction={manageItemAction}
                manageItemLabel={manageItemLabel}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function SubscriptionList({
  className,
  title = 'Subscriptions',
  portalSections,
  dateGroups = [],
  subscriptions = [],
  deliveriesSectionTitle = 'Deliveries',
  activeSectionTitle = 'Active',
  canceledSectionTitle = 'Canceled',
  emptyDeliveriesTitle = 'You do not have any upcoming deliveries.',
  emptyActiveTitle = 'You do not have any active subscriptions.',
  emptyCanceledTitle = 'You do not have any canceled subscriptions.',
  manageBillingLabel = 'Manage billing',
  manageBillingAction,
  manageItemLabel = 'Edit',
  manageItemAction,
  shipToLabel = 'Ship to',
  deliveryOptionLabel = 'Delivery',
  subtotalLabel = 'Subtotal',
  taxLabel = 'Tax',
  totalLabel = 'Total',
  totalsPendingLabel = 'Totals confirmed at billing',
  quantityLabel = 'Quantity',
  paymentLabel = 'Payment',
  frequencyLabel = 'Frequency',
  emptyStateTitle = "You don't have any subscriptions",
  emptyStateDescription,
  emptyStateActionLabel = 'Shop products',
  emptyStateActionHref = '/',
  message,
  storeLogoFallback,
}: SubscriptionListProps) {
  const legacyGroups: SubscriptionDateGroup[] =
    dateGroups.length > 0
      ? dateGroups
      : subscriptions.length > 0
        ? [
            {
              id: 'all',
              title: '',
              deliveries: [
                {
                  id: 'all-default',
                  shippingAddressLabel: shipToLabel,
                  items: subscriptions,
                },
              ],
            },
          ]
        : [];
  const deliveryGroups = portalSections?.deliveries ?? legacyGroups;
  const activeItems = portalSections?.active ?? [];
  const canceledItems = portalSections?.canceled ?? [];
  const hasDeliveryGroups = deliveryGroups.some((group) =>
    group.deliveries.some((delivery) => delivery.items.length > 0),
  );
  const hasActiveItems = activeItems.length > 0;
  const hasCanceledItems = canceledItems.length > 0;
  const hasSubscriptions = hasDeliveryGroups || hasActiveItems || hasCanceledItems;
  const showSectionToggle = Boolean(portalSections);
  const [selectedSection, setSelectedSection] = useState<SubscriptionPortalTab>(() => {
    if (hasDeliveryGroups) {
      return 'deliveries';
    }

    if (hasActiveItems) {
      return 'active';
    }

    return 'canceled';
  });

  const visibleSectionEmpty =
    showSectionToggle &&
    (selectedSection === 'deliveries'
      ? !hasDeliveryGroups
      : selectedSection === 'active'
        ? !hasActiveItems
        : !hasCanceledItems);
  const visibleEmptyTitle =
    selectedSection === 'deliveries'
      ? emptyDeliveriesTitle
      : selectedSection === 'active'
        ? emptyActiveTitle
        : emptyCanceledTitle;
  const itemLabels = {
    quantityLabel,
    paymentLabel,
    frequencyLabel,
  };

  return (
    <section className={clsx('w-full @container', className)}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-medium leading-none tracking-tight text-[var(--foreground,hsl(var(--foreground)))]">
          {title}
        </h1>

        {manageBillingAction ? (
          <form action={manageBillingAction}>
            <SubscriptionPortalSubmitButton label={manageBillingLabel} />
          </form>
        ) : null}
      </header>

      {message ? (
        <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center">
          <p className="text-[var(--contrast-600,hsl(var(--contrast-600)))]">{message}</p>
        </div>
      ) : null}

      {!message && !hasSubscriptions ? (
        <div className="rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground,hsl(var(--foreground)))]">
            {emptyStateTitle}
          </h2>
          {emptyStateDescription ? (
            <p className="mt-2 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
              {emptyStateDescription}
            </p>
          ) : null}
          <ButtonLink className="mt-6 w-fit" href={emptyStateActionHref} size="medium" variant="primary">
            {emptyStateActionLabel}
          </ButtonLink>
        </div>
      ) : null}

      {!message && hasSubscriptions ? (
        <div className="flex flex-col gap-6">
          {showSectionToggle ? (
            <SubscriptionSectionToggle
              activeLabel={activeSectionTitle}
              canceledLabel={canceledSectionTitle}
              deliveriesLabel={deliveriesSectionTitle}
              onSelect={setSelectedSection}
              selected={selectedSection}
            />
          ) : null}

          {visibleSectionEmpty ? (
            <SubscriptionTabEmptyState title={visibleEmptyTitle} />
          ) : selectedSection === 'deliveries' ? (
            <SubscriptionDateSections
              fallbackLogo={storeLogoFallback}
              groups={deliveryGroups}
              labels={{
                shipToLabel,
                deliveryOptionLabel,
                subtotalLabel,
                taxLabel,
                totalLabel,
                totalsPendingLabel,
                quantityLabel,
                paymentLabel,
                frequencyLabel,
              }}
              manageItemAction={manageItemAction}
              manageItemLabel={manageItemLabel}
            />
          ) : (
            <SubscriptionFlatItemsSection
              fallbackLogo={storeLogoFallback}
              items={selectedSection === 'active' ? activeItems : canceledItems}
              labels={itemLabels}
              manageItemAction={manageItemAction}
              manageItemLabel={manageItemLabel}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
