'use client';

import { clsx } from 'clsx';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import type { ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';
import { SubscriptionManageModal, type SubscriptionManageDetails } from '~/components/subscriptions/subscription-manage-modal';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import type { SavedPaymentMethod } from '~/lib/stripe/payment-methods';
import type { SavedShippingAddress } from '~/lib/account/saved-shipping-addresses';
import type { SaveCheckoutAddressInput } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';
import type { SubscriptionAddressFormLabels } from '~/components/subscriptions/subscription-address-form';

export interface SubscriptionListItem {
  id: string;
  productName: string;
  variantSubtitle?: string;
  quantity: number;
  image?: { src: string; alt: string };
  price?: string;
  priceNote?: string;
  intervalLabel: string;
  paymentMethodLabel: string;
  statusLabel: string;
  statusKey?: string;
  scheduleDetail?: string;
  paymentFailed?: boolean;
  skippedReasonLabel?: string;
  shippingAddressLabel?: string;
  shippingAddressGroupNumber?: number;
  shippingAddressKey?: string;
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
  totalsNote?: string;
  shipmentPaused?: boolean;
  fulfillmentNote?: string;
  isPast?: boolean;
  bigcommerceOrderId?: number;
  bigcommerceOrderHref?: string;
  bigcommerceOrderLabel?: string;
  outcomeNote?: string;
  items: SubscriptionListItem[];
}

export interface SubscriptionDateGroup {
  id: string;
  title: string;
  deliveries: SubscriptionDeliveryGroup[];
}

export interface SubscriptionPortalSections {
  upcomingShipments: SubscriptionDateGroup[];
  pastShipments: SubscriptionDateGroup[];
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
  manageItemOptions?: {
    modalTitle: string;
    cancelLabel: string;
    cancelFormTitle: string;
    cancellationReasonLabel: string;
    cancellationReasonPlaceholder: string;
    cancellationReasons: Array<{ value: string; label: string }>;
    editPaymentLabel: string;
    paymentPickerTitle: string;
    paymentPickerDescription: string;
    updatePaymentLabel: string;
    addPaymentMethodLabel: string;
    goBackLabel: string;
    cancellingLabel: string;
    updatingPaymentLabel: string;
    savingPaymentMethodLabel: string;
    updatingAddressLabel: string;
    defaultBadgeLabel: string;
    cancelAction: (
      subscriptionId: string,
      cancellationReason: string,
    ) => Promise<{ success: boolean; error?: string }>;
    updatePaymentMethodAction: (
      subscriptionId: string,
      paymentMethodId: string,
    ) => Promise<{ success: boolean; error?: string }>;
    createSetupIntentAction: () => Promise<{ clientSecret: string } | { error: string }>;
    savePaymentMethodLabel: string;
    addPaymentMethodSecureNote?: string;
    savedPaymentMethods: SavedPaymentMethod[];
    editAddressLabel: string;
    addressPickerTitle: string;
    addressPickerDescription: string;
    updateAddressLabel: string;
    addAddressLabel: string;
    saveAddressLabel: string;
    updateShippingAddressAction: (
      subscriptionId: string,
      addressId: string,
    ) => Promise<{ success: boolean; error?: string }>;
    saveAndApplyAddressAction: (
      subscriptionId: string,
      input: SaveCheckoutAddressInput,
    ) => Promise<{ success: boolean; addressId?: string; error?: string }>;
    savedShippingAddresses: SavedShippingAddress[];
    addressFormCountries: Array<{ value: string; label: string }>;
    addressFormStates: Array<{ country: string; states: Array<{ label: string; value: string }> }>;
    defaultCountryCode: string;
    addressFormLabels: SubscriptionAddressFormLabels;
  };
  updatePaymentLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  skipDeliveryItemLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  shipmentPausedMessage?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
  upcomingShipmentsTitle?: string;
  pastShipmentsTitle?: string;
  emptyUpcomingShipmentsTitle?: string;
  emptyPastShipmentsTitle?: string;
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

const SubscriptionManageClickContext = createContext<((subscriptionId: string) => void) | null>(null);

function useSubscriptionManageClick() {
  return useContext(SubscriptionManageClickContext);
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

function SubscriptionShipmentsViewToggle({
  upcomingLabel,
  pastLabel,
  selected,
  onSelect,
}: {
  upcomingLabel: string;
  pastLabel: string;
  selected: 'upcoming' | 'past';
  onSelect: (value: 'upcoming' | 'past') => void;
}) {
  const tabs: Array<{ value: 'upcoming' | 'past'; label: string }> = [
    { value: 'upcoming', label: upcomingLabel },
    { value: 'past', label: pastLabel },
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

function SubscriptionPortalSubmitButton({
  label,
  variant = 'secondary',
  size = 'medium',
  className,
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={clsx('subscription-portal-action-button', className)}
      disabled={pending}
      loading={pending}
      size={size}
      type="submit"
      variant={variant}
    >
      {label}
    </Button>
  );
}

function SubscriptionShipmentPausedBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-5 py-4 @md:px-6">
      <p className="text-sm leading-relaxed text-amber-950">{message}</p>
    </div>
  );
}

function SubscriptionFulfillmentBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-sky-200/80 bg-sky-50 px-5 py-4 @md:px-6">
      <p className="text-sm leading-relaxed text-sky-950">{message}</p>
    </div>
  );
}

function SubscriptionPortalTextSubmit({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={clsx(
        'text-sm font-medium text-[var(--foreground,hsl(var(--foreground)))] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      disabled={pending}
      type="submit"
    >
      {pending ? '…' : label}
    </button>
  );
}

function SubscriptionEditLinkAction({
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
  const onManageClick = useSubscriptionManageClick();

  if (!manageItemLabel) {
    return null;
  }

  if (onManageClick) {
    return (
      <button
        className={clsx(
          'text-sm font-medium text-[var(--foreground,hsl(var(--foreground)))] underline-offset-4 transition hover:underline',
          className,
        )}
        onClick={() => onManageClick(subscriptionId)}
        type="button"
      >
        {manageItemLabel}
      </button>
    );
  }

  if (!manageItemAction) {
    return null;
  }

  return (
    <form
      action={manageItemAction.bind(null, subscriptionId)}
      className={clsx('subscription-edit-link inline', className)}
    >
      <SubscriptionPortalTextSubmit label={manageItemLabel} />
    </form>
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
  const onManageClick = useSubscriptionManageClick();

  if (!manageItemLabel) {
    return null;
  }

  if (onManageClick) {
    return (
      <Button
        className={clsx('subscription-edit-action w-full', className)}
        onClick={() => onManageClick(subscriptionId)}
        size="small"
        type="button"
        variant="tertiary"
      >
        {manageItemLabel}
      </Button>
    );
  }

  if (!manageItemAction) {
    return null;
  }

  return (
    <form
      action={manageItemAction.bind(null, subscriptionId)}
      className={clsx('subscription-edit-action flex w-full min-w-0 justify-center', className)}
    >
      <SubscriptionPortalSubmitButton
        className="w-full"
        label={manageItemLabel}
        size="small"
        variant="tertiary"
      />
    </form>
  );
}

function SubscriptionPaymentRecoveryStrip({
  subscriptionId,
  retryPaymentAction,
  retryPaymentLabel,
  updatePaymentAction,
  updatePaymentLabel,
  skipDeliveryItemAction,
  skipDeliveryItemLabel,
  paymentIssueLabel = 'Payment issue',
  fixPaymentLabel = 'Fix payment',
}: {
  subscriptionId: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  updatePaymentLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  skipDeliveryItemLabel?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
}) {
  const hasActions =
    (retryPaymentAction && retryPaymentLabel) ||
    (updatePaymentAction && updatePaymentLabel) ||
    (skipDeliveryItemAction && skipDeliveryItemLabel);

  if (!hasActions) {
    return null;
  }

  return (
    <div className="subscription-payment-strip mt-3 rounded-lg border border-amber-200/70 bg-amber-50/60 px-3 py-3 @sm:flex @sm:items-center @sm:justify-between @sm:gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-amber-950">{fixPaymentLabel}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-900/85">{paymentIssueLabel}</p>
      </div>
      <div className="subscription-payment-strip__actions mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 @sm:mt-0 @sm:shrink-0">
        {retryPaymentAction && retryPaymentLabel ? (
          <form action={retryPaymentAction.bind(null, subscriptionId)} className="inline">
            <SubscriptionPortalTextSubmit
              className="text-xs font-semibold text-amber-950"
              label={retryPaymentLabel}
            />
          </form>
        ) : null}
        {updatePaymentAction && updatePaymentLabel ? (
          <form action={updatePaymentAction} className="inline">
            <SubscriptionPortalTextSubmit className="text-xs text-amber-950/90" label={updatePaymentLabel} />
          </form>
        ) : null}
        {skipDeliveryItemAction && skipDeliveryItemLabel ? (
          <form action={skipDeliveryItemAction.bind(null, subscriptionId)} className="inline">
            <SubscriptionPortalTextSubmit
              className="text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]"
              label={skipDeliveryItemLabel}
            />
          </form>
        ) : null}
      </div>
    </div>
  );
}

function SubscriptionProductImage({
  subscription,
  quantityLabel,
  size = 'large',
  fallbackLogo,
  showQuantityBadge = true,
  shipToLabel = 'Ship to',
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  size?: 'large' | 'medium' | 'compact';
  fallbackLogo?: ProductImageFallbackLogo | null;
  showQuantityBadge?: boolean;
  shipToLabel?: string;
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

      {subscription.shippingAddressGroupNumber != null ? (
        <span
          aria-label={`${shipToLabel} ${subscription.shippingAddressGroupNumber}${
            subscription.shippingAddressLabel ? `: ${subscription.shippingAddressLabel}` : ''
          }`}
          className="absolute right-0 top-0 z-10 flex h-5 min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded bg-[#2b2b2b] px-1 text-[11px] font-medium leading-none text-white"
          title={subscription.shippingAddressLabel}
        >
          {subscription.shippingAddressGroupNumber}
        </span>
      ) : showQuantityBadge && subscription.quantity >= 1 ? (
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
      {subscription.variantSubtitle ? (
        <p
          className={clsx(
            'mt-1 text-xs leading-relaxed text-[var(--contrast-500,hsl(var(--contrast-500)))]',
            align === 'center' && 'text-center',
          )}
        >
          {subscription.variantSubtitle}
        </p>
      ) : null}
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
        {subscription.skippedReasonLabel ? (
          <p className="mt-1 text-xs text-amber-900">{subscription.skippedReasonLabel}</p>
        ) : null}
      </div>
    </>
  );
}

function SubscriptionItemPrice({
  subscription,
  align = 'end',
  priceClassName,
}: {
  subscription: SubscriptionListItem;
  align?: 'center' | 'end';
  priceClassName?: string;
}) {
  return (
    <>
      {subscription.price ? (
        <p
          className={clsx(
            priceClassName ??
              'text-sm font-semibold tabular-nums text-[var(--foreground,hsl(var(--foreground)))]',
            align === 'center' && 'text-center',
            align === 'end' && 'text-right',
          )}
        >
          {subscription.price}
        </p>
      ) : null}
      {subscription.priceNote ? (
        <p
          className={clsx(
            'text-xs leading-tight text-[var(--contrast-500,hsl(var(--contrast-500)))]',
            subscription.price && 'mt-1',
            align === 'end' && 'max-w-[8rem] text-right',
            align === 'center' && 'text-center',
          )}
        >
          {subscription.priceNote}
        </p>
      ) : null}
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
      <div className={clsx(showStatus && 'min-h-[2.75rem]')}>
        <SubscriptionItemPrice
          align={align}
          priceClassName="text-sm font-medium text-[var(--foreground,hsl(var(--foreground)))]"
          subscription={subscription}
        />
      </div>
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
  shipToLabel,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  variant?: 'standalone' | 'embedded';
  fallbackLogo?: ProductImageFallbackLogo | null;
  shipToLabel?: string;
}) {
  if (variant === 'embedded') {
    return (
      <li className="subscription-product-card subscription-delivery-product flex h-full w-full min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 bg-[var(--background,hsl(var(--background)))] p-3">
        <SubscriptionProductImage
          fallbackLogo={fallbackLogo}
          quantityLabel={quantityLabel}
          shipToLabel={shipToLabel}
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
          className="mt-4 shrink-0"
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
        shipToLabel={shipToLabel}
        subscription={subscription}
      />

      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <SubscriptionProductDetails
          align="center"
          frequencyLabel={frequencyLabel}
          paymentLabel={paymentLabel}
          subscription={subscription}
        />

        <div className="mt-auto pt-3">
          <SubscriptionProductPricing align="center" subscription={subscription} />
        </div>
      </div>

      <SubscriptionEditAction
        className="mt-4 shrink-0"
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
  updatePaymentAction,
  updatePaymentLabel,
  retryPaymentAction,
  retryPaymentLabel,
  skipDeliveryItemAction,
  skipDeliveryItemLabel,
  paymentIssueLabel,
  fixPaymentLabel,
  readOnly = false,
  fallbackLogo,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  updatePaymentLabel?: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  skipDeliveryItemLabel?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
  readOnly?: boolean;
  fallbackLogo?: ProductImageFallbackLogo | null;
}) {
  const metaParts = [
    subscription.intervalLabel,
    subscription.paymentMethodLabel,
    subscription.scheduleDetail,
  ].filter(Boolean);

  const showStatus =
    readOnly ||
    subscription.paymentFailed ||
    subscription.statusKey === 'skipped' ||
    subscription.statusKey === 'charged';

  const isPaymentFailed = subscription.paymentFailed && !readOnly;

  return (
    <li
      className={clsx(
        'subscription-delivery-line px-5 py-4 @md:px-6',
        isPaymentFailed && 'subscription-delivery-line--payment-failed',
      )}
    >
      <div className="flex gap-3 @md:gap-4">
        <div
          className={clsx(
            'subscription-delivery-line__media shrink-0',
            isPaymentFailed && 'opacity-60',
          )}
        >
          <SubscriptionProductImage
            fallbackLogo={fallbackLogo}
            quantityLabel={quantityLabel}
            size="compact"
            subscription={subscription}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={clsx(
                    'text-sm font-medium leading-snug',
                    isPaymentFailed
                      ? 'text-[var(--contrast-500,hsl(var(--contrast-500)))]'
                      : 'text-[var(--foreground,hsl(var(--foreground)))]',
                  )}
                >
                  {subscription.productName}
                </p>
                {showStatus ? <SubscriptionStatusBadge status={subscription.statusLabel} /> : null}
              </div>

              {subscription.variantSubtitle ? (
                <p
                  className={clsx(
                    'mt-1 text-xs leading-relaxed',
                    isPaymentFailed
                      ? 'text-[var(--contrast-400,hsl(var(--contrast-400)))]'
                      : 'text-[var(--contrast-500,hsl(var(--contrast-500)))]',
                  )}
                >
                  {subscription.variantSubtitle}
                </p>
              ) : null}

              <p
                className={clsx(
                  'mt-1 text-xs leading-relaxed',
                  isPaymentFailed
                    ? 'text-[var(--contrast-400,hsl(var(--contrast-400)))]'
                    : 'text-[var(--contrast-500,hsl(var(--contrast-500)))]',
                )}
              >
                {metaParts.join(' · ')}
              </p>

              {subscription.skippedReasonLabel ? (
                <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
                  {subscription.skippedReasonLabel}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
              <SubscriptionItemPrice
                priceClassName={clsx(
                  'text-sm font-semibold tabular-nums',
                  isPaymentFailed
                    ? 'text-[var(--contrast-500,hsl(var(--contrast-500)))]'
                    : 'text-[var(--foreground,hsl(var(--foreground)))]',
                )}
                subscription={subscription}
              />

              {!readOnly ? (
                <SubscriptionEditLinkAction
                  manageItemAction={manageItemAction}
                  manageItemLabel={manageItemLabel}
                  subscriptionId={subscription.id}
                />
              ) : null}
            </div>
          </div>

          {isPaymentFailed ? (
            <SubscriptionPaymentRecoveryStrip
              fixPaymentLabel={fixPaymentLabel}
              paymentIssueLabel={paymentIssueLabel}
              retryPaymentAction={retryPaymentAction}
              retryPaymentLabel={retryPaymentLabel}
              skipDeliveryItemAction={skipDeliveryItemAction}
              skipDeliveryItemLabel={skipDeliveryItemLabel}
              subscriptionId={subscription.id}
              updatePaymentAction={updatePaymentAction}
              updatePaymentLabel={updatePaymentLabel}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

function SubscriptionDeliveryCard({
  delivery,
  manageItemAction,
  manageItemLabel,
  updatePaymentAction,
  updatePaymentLabel,
  retryPaymentAction,
  retryPaymentLabel,
  skipDeliveryItemAction,
  skipDeliveryItemLabel,
  paymentIssueLabel,
  fixPaymentLabel,
  shipmentPausedMessage,
  labels,
  fallbackLogo,
}: {
  delivery: SubscriptionDeliveryGroup;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  updatePaymentLabel?: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  skipDeliveryItemLabel?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
  shipmentPausedMessage?: string;
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
    <li className="subscription-delivery-card flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] shadow-[0_1px_2px_rgba(49,47,47,0.04)]">
      {delivery.shipmentHeading ||
      (delivery.isPast && delivery.bigcommerceOrderHref) ||
      (delivery.isPast && delivery.outcomeNote) ? (
        <div className="border-b border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 px-5 py-3 @md:px-6">
          {delivery.shipmentHeading || (delivery.isPast && delivery.bigcommerceOrderHref) ? (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              {delivery.shipmentHeading ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground,hsl(var(--foreground)))]">
                  {delivery.shipmentHeading}
                </p>
              ) : (
                <span />
              )}
              {delivery.isPast && delivery.bigcommerceOrderHref && delivery.bigcommerceOrderLabel ? (
                <Link
                  className="subscription-order-link shrink-0 text-sm font-medium text-[var(--foreground,hsl(var(--foreground)))] underline-offset-4 hover:underline"
                  href={delivery.bigcommerceOrderHref}
                >
                  {delivery.bigcommerceOrderLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
          {delivery.isPast && delivery.outcomeNote ? (
            <p
              className={clsx(
                'text-xs leading-relaxed text-[var(--contrast-600,hsl(var(--contrast-600)))]',
                (delivery.shipmentHeading ||
                  (delivery.isPast && delivery.bigcommerceOrderHref && delivery.bigcommerceOrderLabel)) &&
                  'mt-1.5',
              )}
            >
              {delivery.outcomeNote}
            </p>
          ) : null}
        </div>
      ) : null}
      {delivery.shipmentPaused && shipmentPausedMessage ? (
        <SubscriptionShipmentPausedBanner message={shipmentPausedMessage} />
      ) : null}
      {delivery.fulfillmentNote ? (
        <SubscriptionFulfillmentBanner message={delivery.fulfillmentNote} />
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

      <ul className="subscription-delivery-lines divide-y divide-[var(--contrast-100,hsl(var(--contrast-100)))]/60 border-t border-[var(--contrast-100,hsl(var(--contrast-100)))]/60">
        {delivery.items.map((subscription) => (
          <SubscriptionLineItemRow
            fallbackLogo={fallbackLogo}
            fixPaymentLabel={fixPaymentLabel}
            frequencyLabel={labels.frequencyLabel}
            key={subscription.id}
            manageItemAction={manageItemAction}
            manageItemLabel={manageItemLabel}
            paymentIssueLabel={paymentIssueLabel}
            paymentLabel={labels.paymentLabel}
            quantityLabel={labels.quantityLabel}
            readOnly={delivery.isPast}
            retryPaymentAction={retryPaymentAction}
            retryPaymentLabel={retryPaymentLabel}
            skipDeliveryItemAction={skipDeliveryItemAction}
            skipDeliveryItemLabel={skipDeliveryItemLabel}
            subscription={subscription}
            updatePaymentAction={updatePaymentAction}
            updatePaymentLabel={updatePaymentLabel}
          />
        ))}
      </ul>

      <div className="mt-auto border-t border-[var(--contrast-100,hsl(var(--contrast-100)))]/60 px-5 py-4 @md:px-6">
        {delivery.totalsPending && !delivery.isPast ? (
          <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {labels.totalsPendingLabel}
          </p>
        ) : !delivery.totalsPending && delivery.subtotalExTax ? (
          <>
            <div className="flex justify-end">
              <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-sm">
                <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {labels.subtotalLabel}
                </dt>
                <dd className="text-right font-medium tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                  {delivery.subtotalExTax}
                </dd>
                <dt className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">{labels.taxLabel}</dt>
                <dd className="text-right font-medium tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                  {delivery.tax}
                </dd>
                <dt className="pt-1.5 font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                  {labels.totalLabel}
                </dt>
                <dd className="pt-1.5 text-right font-semibold tabular-nums text-[var(--foreground,hsl(var(--foreground)))]">
                  {delivery.totalIncTax}
                </dd>
              </dl>
            </div>
            {delivery.totalsNote ? (
              <p className="pt-1 text-right text-xs leading-tight text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {delivery.totalsNote}
              </p>
            ) : null}
          </>
        ) : null}
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
  shipToLabel,
}: {
  subscription: SubscriptionListItem;
  quantityLabel: string;
  paymentLabel: string;
  frequencyLabel: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  shipToLabel?: string;
}) {
  return (
    <SubscriptionProductCard
      fallbackLogo={fallbackLogo}
      frequencyLabel={frequencyLabel}
      manageItemAction={manageItemAction}
      manageItemLabel={manageItemLabel}
      paymentLabel={paymentLabel}
      quantityLabel={quantityLabel}
      shipToLabel={shipToLabel}
      subscription={subscription}
      variant="standalone"
    />
  );
}

function buildShippingAddressGroups(items: SubscriptionListItem[]) {
  const groups = new Map<
    number,
    { shippingAddressLabel: string; items: SubscriptionListItem[] }
  >();

  for (const item of items) {
    const groupNumber = item.shippingAddressGroupNumber;

    if (!groupNumber) {
      continue;
    }

    const existing = groups.get(groupNumber);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(groupNumber, {
      shippingAddressLabel: item.shippingAddressLabel ?? '',
      items: [item],
    });
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([groupNumber, group]) => ({
      groupNumber,
      ...group,
    }));
}

function SubscriptionFlatItemsGrid({
  items,
  manageItemAction,
  manageItemLabel,
  labels,
  fallbackLogo,
  shipToLabel,
}: {
  items: SubscriptionListItem[];
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  shipToLabel?: string;
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
          shipToLabel={shipToLabel}
          subscription={subscription}
        />
      ))}
    </ul>
  );
}

function SubscriptionFlatItemsSection({
  items,
  manageItemAction,
  manageItemLabel,
  labels,
  fallbackLogo,
  shipToLabel = 'Ship to',
}: {
  items: SubscriptionListItem[];
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  fallbackLogo?: ProductImageFallbackLogo | null;
  shipToLabel?: string;
  labels: {
    quantityLabel: string;
    paymentLabel: string;
    frequencyLabel: string;
  };
}) {
  const addressGroups = buildShippingAddressGroups(items);
  const gridProps = {
    fallbackLogo,
    labels,
    manageItemAction,
    manageItemLabel,
    shipToLabel,
  };

  if (addressGroups.length <= 1) {
    return <SubscriptionFlatItemsGrid items={items} {...gridProps} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {addressGroups.map((group) => (
        <section key={group.groupNumber}>
          <h3 className="subscription-date-heading mb-4 border-b border-[var(--contrast-100,hsl(var(--contrast-100)))]/80 pb-3 text-base font-semibold leading-snug text-[var(--foreground,hsl(var(--foreground)))] @md:mb-5 @md:text-lg">
            {shipToLabel}: {group.shippingAddressLabel}
          </h3>
          <SubscriptionFlatItemsGrid items={group.items} {...gridProps} />
        </section>
      ))}
    </div>
  );
}

function SubscriptionDateSections({
  groups,
  manageItemAction,
  manageItemLabel,
  updatePaymentAction,
  updatePaymentLabel,
  retryPaymentAction,
  retryPaymentLabel,
  skipDeliveryItemAction,
  skipDeliveryItemLabel,
  paymentIssueLabel,
  fixPaymentLabel,
  shipmentPausedMessage,
  labels,
  fallbackLogo,
}: {
  groups: SubscriptionDateGroup[];
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  updatePaymentLabel?: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  skipDeliveryItemLabel?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
  shipmentPausedMessage?: string;
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
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.id}>
          {group.title ? (
            <h3 className="subscription-date-heading mb-4 border-b border-[var(--contrast-100,hsl(var(--contrast-100)))]/80 pb-3 text-base font-semibold leading-snug text-[var(--foreground,hsl(var(--foreground)))] @md:mb-5 @md:text-lg">
              {group.title}
            </h3>
          ) : null}

          <ul className="subscription-delivery-grid flex flex-col gap-5">
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
                fixPaymentLabel={fixPaymentLabel}
                paymentIssueLabel={paymentIssueLabel}
                retryPaymentAction={retryPaymentAction}
                retryPaymentLabel={retryPaymentLabel}
                shipmentPausedMessage={shipmentPausedMessage}
                skipDeliveryItemAction={skipDeliveryItemAction}
                skipDeliveryItemLabel={skipDeliveryItemLabel}
                updatePaymentAction={updatePaymentAction}
                updatePaymentLabel={updatePaymentLabel}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function SubscriptionShipmentsTabContent({
  upcomingGroups,
  pastGroups,
  upcomingTitle,
  pastTitle,
  emptyUpcomingTitle,
  emptyPastTitle,
  shipmentPausedMessage,
  manageItemAction,
  manageItemLabel,
  updatePaymentAction,
  updatePaymentLabel,
  retryPaymentAction,
  retryPaymentLabel,
  skipDeliveryItemAction,
  skipDeliveryItemLabel,
  paymentIssueLabel,
  fixPaymentLabel,
  labels,
  fallbackLogo,
}: {
  upcomingGroups: SubscriptionDateGroup[];
  pastGroups: SubscriptionDateGroup[];
  upcomingTitle: string;
  pastTitle: string;
  emptyUpcomingTitle: string;
  emptyPastTitle: string;
  shipmentPausedMessage?: string;
  manageItemAction?: (subscriptionId: string) => Promise<void>;
  manageItemLabel?: string;
  updatePaymentAction?: () => Promise<void>;
  updatePaymentLabel?: string;
  retryPaymentAction?: (subscriptionId: string) => Promise<void>;
  retryPaymentLabel?: string;
  skipDeliveryItemAction?: (subscriptionId: string) => Promise<void>;
  skipDeliveryItemLabel?: string;
  paymentIssueLabel?: string;
  fixPaymentLabel?: string;
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
  const hasUpcoming = upcomingGroups.some((group) => group.deliveries.some((delivery) => delivery.items.length > 0));
  const hasPast = pastGroups.some((group) => group.deliveries.some((delivery) => delivery.items.length > 0));
  const [selectedView, setSelectedView] = useState<'upcoming' | 'past'>(() => {
    if (hasUpcoming) {
      return 'upcoming';
    }

    if (hasPast) {
      return 'past';
    }

    return 'upcoming';
  });
  const sectionProps = {
    manageItemAction,
    manageItemLabel,
    updatePaymentAction,
    updatePaymentLabel,
    retryPaymentAction,
    retryPaymentLabel,
    skipDeliveryItemAction,
    skipDeliveryItemLabel,
    paymentIssueLabel,
    fixPaymentLabel,
    shipmentPausedMessage,
    labels,
    fallbackLogo,
  };

  return (
    <div className="flex flex-col gap-6">
      <SubscriptionShipmentsViewToggle
        onSelect={setSelectedView}
        pastLabel={pastTitle}
        selected={selectedView}
        upcomingLabel={upcomingTitle}
      />

      {selectedView === 'upcoming' ? (
        hasUpcoming ? (
          <SubscriptionDateSections groups={upcomingGroups} {...sectionProps} />
        ) : (
          <SubscriptionTabEmptyState title={emptyUpcomingTitle} />
        )
      ) : hasPast ? (
        <SubscriptionDateSections groups={pastGroups} {...sectionProps} />
      ) : (
        <SubscriptionTabEmptyState title={emptyPastTitle} />
      )}
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
  manageItemOptions,
  updatePaymentLabel = 'Update payment card and retry',
  updatePaymentAction,
  retryPaymentLabel = 'Retry',
  retryPaymentAction,
  skipDeliveryItemLabel = 'Skip',
  skipDeliveryItemAction,
  shipmentPausedMessage = 'Shipment paused due to unsuccessful payment on one or more items in this shipment.',
  paymentIssueLabel = 'Payment issue',
  fixPaymentLabel = 'Fix payment',
  upcomingShipmentsTitle = 'Upcoming shipments',
  pastShipmentsTitle = 'Past shipments',
  emptyUpcomingShipmentsTitle = 'You do not have any upcoming shipments.',
  emptyPastShipmentsTitle = 'You do not have any past shipments.',
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
  const upcomingGroups = portalSections?.upcomingShipments ?? legacyGroups;
  const pastGroups = portalSections?.pastShipments ?? [];
  const activeItems = portalSections?.active ?? [];
  const canceledItems = portalSections?.canceled ?? [];
  const hasUpcomingShipments = upcomingGroups.some((group) =>
    group.deliveries.some((delivery) => delivery.items.length > 0),
  );
  const hasPastShipments = pastGroups.some((group) =>
    group.deliveries.some((delivery) => delivery.items.length > 0),
  );
  const hasDeliveryGroups = hasUpcomingShipments || hasPastShipments;
  const hasActiveItems = activeItems.length > 0;
  const hasCanceledItems = canceledItems.length > 0;
  const hasSubscriptions = hasDeliveryGroups || hasActiveItems || hasCanceledItems;
  const showSectionToggle = Boolean(portalSections);
  const [selectedSection, setSelectedSection] = useState<SubscriptionPortalTab>(() => {
    if (hasUpcomingShipments) {
      return 'deliveries';
    }

    if (hasPastShipments) {
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
  const [managedSubscription, setManagedSubscription] = useState<SubscriptionManageDetails | null>(null);
  const allManageableItems = useMemo(
    () => [
      ...activeItems,
      ...canceledItems,
      ...upcomingGroups.flatMap((group) => group.deliveries.flatMap((delivery) => delivery.items)),
      ...pastGroups.flatMap((group) => group.deliveries.flatMap((delivery) => delivery.items)),
    ],
    [activeItems, canceledItems, pastGroups, upcomingGroups],
  );
  const openManageModal = useCallback(
    (subscriptionId: string) => {
      const item = allManageableItems.find((entry) => entry.id === subscriptionId);
      const shippingAddressFromDelivery = [...upcomingGroups, ...pastGroups]
        .flatMap((group) => group.deliveries)
        .find((delivery) => delivery.items.some((entry) => entry.id === subscriptionId))
        ?.shippingAddressLabel;

      if (!item) {
        setManagedSubscription({ id: subscriptionId, productName: '' });

        return;
      }

      setManagedSubscription({
        id: item.id,
        productName: item.productName,
        variantSubtitle: item.variantSubtitle,
        price: item.price,
        intervalLabel: item.intervalLabel,
        paymentMethodLabel: item.paymentMethodLabel,
        scheduleDetail: item.scheduleDetail,
        shippingAddressLabel: item.shippingAddressLabel ?? shippingAddressFromDelivery,
        shippingAddressKey: item.shippingAddressKey,
      });
    },
    [allManageableItems, pastGroups, upcomingGroups],
  );
  const manageClickValue = manageItemOptions ? openManageModal : null;

  return (
    <SubscriptionManageClickContext.Provider value={manageClickValue}>
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
            <SubscriptionShipmentsTabContent
              emptyPastTitle={emptyPastShipmentsTitle}
              emptyUpcomingTitle={emptyUpcomingShipmentsTitle}
              fallbackLogo={storeLogoFallback}
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
              pastGroups={pastGroups}
              pastTitle={pastShipmentsTitle}
              fixPaymentLabel={fixPaymentLabel}
              paymentIssueLabel={paymentIssueLabel}
              retryPaymentAction={retryPaymentAction}
              retryPaymentLabel={retryPaymentLabel}
              shipmentPausedMessage={shipmentPausedMessage}
              skipDeliveryItemAction={skipDeliveryItemAction}
              skipDeliveryItemLabel={skipDeliveryItemLabel}
              upcomingGroups={upcomingGroups}
              upcomingTitle={upcomingShipmentsTitle}
              updatePaymentAction={updatePaymentAction}
              updatePaymentLabel={updatePaymentLabel}
            />
          ) : (
            <SubscriptionFlatItemsSection
              fallbackLogo={storeLogoFallback}
              items={selectedSection === 'active' ? activeItems : canceledItems}
              labels={itemLabels}
              manageItemAction={manageItemAction}
              manageItemLabel={manageItemLabel}
              shipToLabel={shipToLabel}
            />
          )}
        </div>
      ) : null}

      <SubscriptionManageModal
        addAddressLabel={manageItemOptions?.addAddressLabel ?? 'Add new address'}
        addPaymentMethodLabel={manageItemOptions?.addPaymentMethodLabel ?? 'Add payment method'}
        addPaymentMethodSecureNote={manageItemOptions?.addPaymentMethodSecureNote}
        addressFormCountries={manageItemOptions?.addressFormCountries ?? []}
        addressFormLabels={manageItemOptions?.addressFormLabels}
        addressFormStates={manageItemOptions?.addressFormStates ?? []}
        addressPickerDescription={
          manageItemOptions?.addressPickerDescription ?? 'Choose a shipping address for your'
        }
        addressPickerTitle={manageItemOptions?.addressPickerTitle ?? 'Select a shipping address'}
        cancelAction={manageItemOptions?.cancelAction}
        cancelFormTitle={manageItemOptions?.cancelFormTitle ?? 'Cancel your subscription'}
        cancelLabel={manageItemOptions?.cancelLabel ?? 'Cancel subscription'}
        cancellationReasonLabel={manageItemOptions?.cancellationReasonLabel ?? 'Reason'}
        cancellationReasonPlaceholder={
          manageItemOptions?.cancellationReasonPlaceholder ?? 'Choose an option'
        }
        cancellationReasons={manageItemOptions?.cancellationReasons ?? []}
        cancellingLabel={manageItemOptions?.cancellingLabel ?? 'Cancelling subscription…'}
        createSetupIntentAction={manageItemOptions?.createSetupIntentAction}
        savingPaymentMethodLabel={
          manageItemOptions?.savingPaymentMethodLabel ?? 'Saving payment method…'
        }
        updatingAddressLabel={
          manageItemOptions?.updatingAddressLabel ?? 'Updating shipping address…'
        }
        updatingPaymentLabel={
          manageItemOptions?.updatingPaymentLabel ?? 'Updating payment method…'
        }
        defaultBadgeLabel={manageItemOptions?.defaultBadgeLabel ?? 'Default'}
        defaultCountryCode={manageItemOptions?.defaultCountryCode ?? 'US'}
        editAddressLabel={manageItemOptions?.editAddressLabel ?? 'Edit address'}
        editPaymentLabel={manageItemOptions?.editPaymentLabel ?? 'Edit payment card'}
        goBackLabel={manageItemOptions?.goBackLabel ?? 'Go back'}
        isOpen={managedSubscription != null}
        onClose={() => setManagedSubscription(null)}
        paymentLabel={paymentLabel}
        paymentPickerDescription={
          manageItemOptions?.paymentPickerDescription ?? 'Choose a saved card for your'
        }
        paymentPickerTitle={manageItemOptions?.paymentPickerTitle ?? 'Select a payment method'}
        saveAddressLabel={manageItemOptions?.saveAddressLabel ?? 'Save address'}
        saveAndApplyAddressAction={manageItemOptions?.saveAndApplyAddressAction}
        savePaymentMethodLabel={manageItemOptions?.savePaymentMethodLabel ?? 'Save card'}
        savedPaymentMethods={manageItemOptions?.savedPaymentMethods ?? []}
        savedShippingAddresses={manageItemOptions?.savedShippingAddresses ?? []}
        shipToLabel={shipToLabel}
        subscription={managedSubscription ?? undefined}
        title={manageItemOptions?.modalTitle ?? 'Manage subscription'}
        updateAddressLabel={manageItemOptions?.updateAddressLabel ?? 'Update'}
        updatePaymentLabel={manageItemOptions?.updatePaymentLabel ?? 'Update'}
        updatePaymentMethodAction={manageItemOptions?.updatePaymentMethodAction}
        updateShippingAddressAction={manageItemOptions?.updateShippingAddressAction}
      />
    </section>
    </SubscriptionManageClickContext.Provider>
  );
}
