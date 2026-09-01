'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, ChevronDown, GiftIcon, Minus, Plus, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import {
  ComponentPropsWithoutRef,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
} from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { SubscriptionLineSummary } from '@/vibes/soul/primitives/subscription-line-summary';
import { toast } from '@/vibes/soul/primitives/toaster';
import {
  GiftCertificateCodeForm,
  GiftCertificateCodeFormState,
} from '@/vibes/soul/sections/cart/gift-certificate-code-form';
import { useEvents } from '~/components/analytics/events';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { useRouter } from '~/i18n/routing';
import { applyKitRecipeDelta, kitUnitQuantityOf, scaleKitLineQuantities } from '~/lib/kit/scale-kit-line-quantities';

import { CouponCodeForm, CouponCodeFormState } from './coupon-code-form';
import { cartLineItemActionFormDataSchema } from './schema';
import type { ShippingFormState } from './shipping-form';

import { CartShippingEstimate } from '~/components/cart/cart-shipping-estimate';
import { CartEmptyState } from '.';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface CartLineIteminventoryMessages {
  outOfStockMessage?: string;
  quantityReadyToShipMessage?: string;
  quantityBackorderedMessage?: string;
  quantityOutOfStockMessage?: string;
  backorderMessage?: string;
}

export interface CartLineItem {
  typename: string;
  id: string;
  title: string;
  image?: { alt: string; src: string };
  subtitle: string;
  quantity: number;
  price: string;
  salePrice?: string;
  href?: string;
  inventoryMessages?: CartLineIteminventoryMessages;
  subscriptionBadge?: string;
  subscriptionDetails?: string[];
  lineItemEntityId?: string;
  purchaseType?: 'subscription' | 'one-time';
  subscriptionLineKey?: string;
  /** Curated kit membership when this line was added as part of a kit. */
  kitId?: string;
  kitName?: string;
  /** Number of complete kits to ship. */
  kitQuantity?: number;
  /** Per-kit recipe quantity. Kit quantity multiplies this for the cart line. */
  kitUnitQuantity?: number;
  kitHref?: string;
  kitImage?: { src: string; alt: string };
  priceAmount?: number;
  salePriceAmount?: number;
  currencyCode?: string;
}

type CartListEntry =
  | { type: 'item'; item: CartLineItem }
  | {
      type: 'kit';
      kitId: string;
      kitName?: string;
      kitQuantity: number;
      kitHref?: string;
      kitImage?: { src: string; alt: string };
      items: CartLineItem[];
    };

function kitUnitPriceTotals(items: CartLineItem[]): {
  list: number;
  current: number;
  currencyCode: string;
} {
  return items.reduce(
    (totals, item) => {
      const quantity = item.kitUnitQuantity ?? 1;
      const listUnit = item.priceAmount ?? 0;
      const currentUnit =
        item.salePriceAmount != null && item.salePriceAmount !== item.priceAmount
          ? item.salePriceAmount
          : listUnit;

      return {
        list: totals.list + listUnit * quantity,
        current: totals.current + currentUnit * quantity,
        currencyCode: item.currencyCode ?? totals.currencyCode,
      };
    },
    { list: 0, current: 0, currencyCode: 'CAD' },
  );
}

function groupCartLineItems(items: CartLineItem[]): CartListEntry[] {
  const entries: CartListEntry[] = [];
  const kitIndexById = new Map<string, number>();

  for (const item of items) {
    if (!item.kitId) {
      entries.push({ type: 'item', item });
      continue;
    }

    const existingIndex = kitIndexById.get(item.kitId);

    if (existingIndex != null) {
      const entry = entries[existingIndex];

      if (entry?.type === 'kit') {
        entry.items.push(item);

        if (!entry.kitName && item.kitName) {
          entry.kitName = item.kitName;
        }

        if (item.kitQuantity && item.kitQuantity > entry.kitQuantity) {
          entry.kitQuantity = item.kitQuantity;
        }

        if (!entry.kitHref && item.kitHref) {
          entry.kitHref = item.kitHref;
        }

        if (!entry.kitImage && item.kitImage) {
          entry.kitImage = item.kitImage;
        }
      }

      continue;
    }

    kitIndexById.set(item.kitId, entries.length);
    entries.push({
      type: 'kit',
      kitId: item.kitId,
      kitName: item.kitName,
      kitQuantity: item.kitQuantity ?? 1,
      kitHref: item.kitHref,
      kitImage: item.kitImage,
      items: [item],
    });
  }

  return entries;
}

export interface CartGiftCertificateLineItem extends CartLineItem {
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  message?: string;
}

export interface CartSummaryItem {
  label: string;
  value: string;
}

export interface CartState<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  lastResult: SubmissionResult | null;
}

export interface Cart<LineItem extends CartLineItem> {
  lineItems: LineItem[];
  summaryItems: CartSummaryItem[];
  total: string;
  totalLabel?: string;
}

interface CouponCode {
  action: Action<CouponCodeFormState, FormData>;
  couponCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

interface GiftCertificate {
  action: Action<GiftCertificateCodeFormState, FormData>;
  giftCertificateCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
}

interface ShippingOption {
  label: string;
  value: string;
  price: string;
}

interface Country {
  label: string;
  value: string;
}

interface States {
  country: string;
  states: Array<{
    label: string;
    value: string;
  }>;
}

interface Address {
  country: string;
  state?: string;
  postalCode?: string;
}

interface Shipping {
  action: Action<ShippingFormState, FormData>;
  countries: Country[];
  states: States[];
  address?: Address;
  shippingOption?: ShippingOption;
  labels: {
    shipping: string;
    change: string;
    estimate: string;
    country: string;
    state: string;
    postalCode: string;
    cancel: string;
    noShippingOptions: string;
  };
}

export interface CartProps<LineItem extends CartLineItem> {
  title?: string;
  summaryTitle?: string;
  emptyState?: CartEmptyState;
  lineItemAction: Action<CartState<LineItem>, FormData>;
  checkoutAction: Action<SubmissionResult | null, FormData> | string;
  checkoutLabel?: string;
  deleteLineItemLabel?: string;
  decrementLineItemLabel?: string;
  incrementLineItemLabel?: string;
  cart: Cart<LineItem>;
  couponCode?: CouponCode;
  giftCertificate?: GiftCertificate;
  shipping?: Shipping;
}

const defaultEmptyState = {
  title: 'Your cart is empty',
  subtitle: 'Add some products to get started.',
  cta: { label: 'Continue shopping', href: '#' },
};

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --cart-focus: hsl(var(--primary));
 *   --cart-font-family: var(--font-family-body);
 *   --cart-title-font-family: var(--font-family-heading);
 *   --cart-text: hsl(var(--foreground));
 *   --cart-subtitle-text: hsl(var(--contrast-500));
 *   --cart-subtext-text: hsl(var(--contrast-300));
 *   --cart-icon: hsl(var(--contrast-400));
 *   --cart-icon-hover: hsl(var(--foreground));
 *   --cart-border: hsl(var(--contrast-100));
 *   --cart-image-background: hsl(var(--contrast-100));
 *   --cart-button-background: hsl(var(--contrast-100));
 *   --cart-counter-icon: hsl(var(--contrast-500));
 *   --cart-counter-icon-hover: hsl(var(--foreground));
 *   --cart-counter-background: hsl(var(--background));
 *   --cart-counter-background-hover: hsl(var(--contrast-100) / 50%);
 * }
 * ```
 */
export function CartClient<LineItem extends CartLineItem>({
  title,
  cart,
  couponCode,
  giftCertificate,
  decrementLineItemLabel,
  incrementLineItemLabel,
  deleteLineItemLabel,
  lineItemAction,
  checkoutAction,
  checkoutLabel = 'Checkout',
  emptyState = defaultEmptyState,
  summaryTitle,
  shipping,
}: CartProps<LineItem>) {
  const events = useEvents();
  const router = useRouter();
  const [state, formAction, isLineItemActionPending] = useActionState(lineItemAction, {
    lineItems: cart.lineItems,
    lastResult: null,
  });
  const wasLineItemActionPendingRef = useRef(false);
  const [isSummaryRefreshing, setIsSummaryRefreshing] = useState(false);

  const [form] = useForm({ lastResult: state.lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  // Refresh cart summary once after the queued line-item actions settle, instead of
  // reloading the page on every click (which made multi-delete feel stuck).
  useEffect(() => {
    if (wasLineItemActionPendingRef.current && !isLineItemActionPending) {
      setIsSummaryRefreshing(true);
      router.refresh();
    }

    wasLineItemActionPendingRef.current = isLineItemActionPending;
  }, [isLineItemActionPending, router]);

  useEffect(() => {
    setIsSummaryRefreshing(false);
  }, [cart.total, cart.summaryItems]);

  const isCartUpdatePending = isLineItemActionPending || isSummaryRefreshing;

  const [optimisticLineItems, setOptimisticLineItems] = useOptimistic<CartLineItem[], FormData>(
    state.lineItems,
    (prevState, formData) => {
      const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'increment': {
          const { id } = submission.value;

          return prevState.map((item) => (item.id === id ? applyKitRecipeDelta(item, 1) : item));
        }

        case 'decrement': {
          const { id } = submission.value;

          return prevState.map((item) => (item.id === id ? applyKitRecipeDelta(item, -1) : item));
        }

        case 'delete': {
          const { id } = submission.value;

          return prevState.filter((item) => item.id !== id);
        }

        case 'increment-kit': {
          const { kitId } = submission.value;
          const currentKitQty =
            prevState.find((item) => item.kitId === kitId)?.kitQuantity ?? 1;

          return scaleKitLineQuantities(prevState, kitId, currentKitQty + 1);
        }

        case 'decrement-kit': {
          const { kitId } = submission.value;
          const currentKitQty =
            prevState.find((item) => item.kitId === kitId)?.kitQuantity ?? 1;

          return scaleKitLineQuantities(prevState, kitId, currentKitQty - 1);
        }

        case 'delete-kit': {
          const { kitId } = submission.value;

          return prevState.filter((item) => item.kitId !== kitId);
        }

        default:
          return prevState;
      }
    },
  );

  const optimisticQuantity = useMemo(
    () => optimisticLineItems.reduce((total, item) => total + item.quantity, 0),
    [optimisticLineItems],
  );

  const cartEntries = useMemo(
    () => groupCartLineItems(optimisticLineItems),
    [optimisticLineItems],
  );

  if (optimisticQuantity === 0) {
    return <CartEmptyState {...emptyState} />;
  }

  const handleLineItemSubmit = (lineItem: CartLineItem, formData: FormData) => {
    startTransition(() => {
      formAction(formData);
      setOptimisticLineItems(formData);

      const intent = formData.get('intent');

      if (intent === 'increment') {
        formData.set('quantity', lineItem.kitId ? String(lineItem.kitQuantity ?? 1) : '1');

        events.onAddToCart?.(formData);
      }

      if (intent === 'decrement') {
        formData.set('quantity', lineItem.kitId ? String(lineItem.kitQuantity ?? 1) : '1');

        events.onRemoveFromCart?.(formData);
      }

      if (intent === 'delete') {
        formData.set('quantity', lineItem.quantity.toString());

        events.onRemoveFromCart?.(formData);
      }
    });
  };

  const handleKitSubmit = (formData: FormData) => {
    startTransition(() => {
      formAction(formData);
      setOptimisticLineItems(formData);
    });
  };

  const summary = (
    <div>
      <h2 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
        {summaryTitle}
      </h2>
      <dl aria-label="Receipt Summary" className="w-full">
        <div className="divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))]">
          {cart.summaryItems.map((summaryItem, index) => (
            <div className="flex justify-between py-4" key={index}>
              <dt>{summaryItem.label}</dt>
              {isCartUpdatePending ? (
                <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
              ) : (
                <dd>{summaryItem.value}</dd>
              )}
            </div>
          ))}

          {shipping && <CartShippingEstimate {...shipping} />}
        </div>
        {couponCode && (
          <CouponCodeForm
            action={couponCode.action}
            couponCodes={couponCode.couponCodes}
            ctaLabel={couponCode.ctaLabel}
            disabled={couponCode.disabled}
            label={couponCode.label}
            placeholder={couponCode.placeholder}
            removeLabel={couponCode.removeLabel}
          />
        )}
        {giftCertificate && (
          <GiftCertificateCodeForm
            action={giftCertificate.action}
            ctaLabel={giftCertificate.ctaLabel}
            disabled={giftCertificate.disabled}
            giftCertificateCodes={giftCertificate.giftCertificateCodes}
            label={giftCertificate.label}
            placeholder={giftCertificate.placeholder}
            removeLabel={giftCertificate.removeLabel}
          />
        )}
        <div className="flex justify-between border-t border-[var(--cart-border,hsl(var(--contrast-100)))] py-6 text-xl font-bold">
          <dt>{cart.totalLabel ?? 'Total'}</dt>
          {isCartUpdatePending ? (
            <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
          ) : (
            <dd>{cart.total}</dd>
          )}
        </div>
      </dl>
      <CheckoutButton
        action={checkoutAction}
        className="mt-4 w-fit"
        isCartUpdatePending={isCartUpdatePending}
      >
        <span className="inline-flex items-center gap-2">
          {checkoutLabel}
          <ArrowRight size={20} strokeWidth={1} />
        </span>
      </CheckoutButton>
    </div>
  );

  return (
    <section
      className={clsx(
        'group/cart w-full font-[family-name:var(--cart-font-family,var(--font-family-body))] text-[var(--cart-text,hsl(var(--foreground)))] @container',
      )}
    >
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-8 @xl:py-14">
        <div className="grid w-full items-start gap-10 @lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] @lg:gap-16">
          <div className="min-w-0">
            <h1 className="mb-10 font-[family-name:var(--cart-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none @xl:text-5xl">
              {title}
              <span className="ml-4 text-[var(--cart-subtext-text,hsl(var(--contrast-300)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                {optimisticQuantity}
              </span>
            </h1>
            <ul className="flex flex-col gap-3">
              {cartEntries.map((entry) => {
                if (entry.type === 'kit') {
                  return (
                    <li key={entry.kitId}>
                      <CartKitSection
                        decrementLineItemLabel={decrementLineItemLabel}
                        deleteLineItemLabel={deleteLineItemLabel}
                        incrementLineItemLabel={incrementLineItemLabel}
                        kitHref={entry.kitHref}
                        kitId={entry.kitId}
                        kitImage={entry.kitImage}
                        kitName={entry.kitName}
                        kitQuantity={entry.kitQuantity}
                        lineItemAction={formAction}
                        lineItems={entry.items}
                        onKitSubmit={handleKitSubmit}
                        onLineItemSubmit={handleLineItemSubmit}
                      />
                    </li>
                  );
                }

                return (
                  <li key={entry.item.id}>
                    <CartLineItemRow
                      decrementLineItemLabel={decrementLineItemLabel}
                      deleteLineItemLabel={deleteLineItemLabel}
                      incrementLineItemLabel={incrementLineItemLabel}
                      lineItem={entry.item}
                      lineItemAction={formAction}
                      onLineItemSubmit={handleLineItemSubmit}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
          <aside className="min-w-0 @lg:sticky @lg:top-10">{summary}</aside>
        </div>
      </div>
    </section>
  );
}

function CartKitSection({
  kitId,
  kitName,
  kitQuantity,
  kitHref,
  kitImage,
  lineItems,
  lineItemAction,
  onKitSubmit,
  onLineItemSubmit,
  incrementLineItemLabel,
  decrementLineItemLabel,
  deleteLineItemLabel,
}: {
  kitId: string;
  kitName?: string;
  kitQuantity: number;
  kitHref?: string;
  kitImage?: { src: string; alt: string };
  lineItems: CartLineItem[];
  lineItemAction: (payload: FormData) => void;
  onKitSubmit: (formData: FormData) => void;
  onLineItemSubmit: (lineItem: CartLineItem, formData: FormData) => void;
  incrementLineItemLabel?: string;
  decrementLineItemLabel?: string;
  deleteLineItemLabel?: string;
}) {
  const t = useTranslations('Cart');
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const itemCount = lineItems.reduce(
    (total, item) => total + (item.kitUnitQuantity ?? item.quantity),
    0,
  );
  const title = kitName?.trim() || t('kitSection.fallbackName', { kitId });
  const titleClassName =
    'text-[0.9375rem] font-medium leading-snug text-[var(--cart-text,hsl(var(--foreground)))]';
  const kitPrice = kitUnitPriceTotals(lineItems);
  const formattedListPrice = format.number(kitPrice.list, {
    style: 'currency',
    currency: kitPrice.currencyCode,
  });
  const formattedCurrentPrice = format.number(kitPrice.current, {
    style: 'currency',
    currency: kitPrice.currencyCode,
  });
  const hasSale = kitPrice.current !== kitPrice.list;

  return (
    <div className="@container overflow-hidden rounded-2xl border border-[var(--cart-border,hsl(var(--contrast-100)))] bg-white shadow-[0_1px_2px_rgba(49,47,47,0.04)]">
      <div
        className="flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-[hsl(var(--contrast-100)/35%)] sm:p-5"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--cart-image-background,hsl(var(--contrast-100)))] @sm:size-24">
          {kitImage ? (
            <Image
              alt={kitImage.alt}
              className="object-cover"
              fill
              sizes="(min-width: 24rem) 96px, 80px"
              src={kitImage.src}
            />
          ) : null}
        </div>

        <div className={cartLineItemBodyClassName}>
          <div className="min-w-0">
            {kitHref ? (
              <Link
                className={clsx(
                  titleClassName,
                  'inline cursor-pointer transition-colors hover:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2',
                )}
                href={kitHref}
                onClick={(event) => event.stopPropagation()}
              >
                {title}
              </Link>
            ) : (
              <p className={titleClassName}>{title}</p>
            )}
            <p className="mt-1 font-[family-name:var(--font-family-mono)] text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
              {t('kitSection.eyebrow')} · {kitId}
            </p>
            <p className="mt-1 text-sm text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
              {t('kitSection.itemCount', { count: itemCount })}
            </p>
          </div>

          <KitQuantityForm
            action={lineItemAction}
            decrementLabel={t('kitSection.decrement')}
            deleteLabel={t('kitSection.remove')}
            incrementLabel={t('kitSection.increment')}
            kitId={kitId}
            onSubmit={onKitSubmit}
            price={formattedListPrice}
            quantity={kitQuantity}
            salePrice={hasSale ? formattedCurrentPrice : undefined}
          />
        </div>

        <button
          aria-controls={`cart-kit-${kitId}`}
          aria-expanded={open}
          className="relative z-10 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--cart-icon,hsl(var(--contrast-400)))] transition-colors hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          type="button"
        >
          <ChevronDown
            aria-hidden
            className={clsx('transition-transform duration-200', open && 'rotate-180')}
            size={20}
            strokeWidth={1.5}
          />
          <span className="sr-only">
            {open ? t('kitSection.collapse') : t('kitSection.expand')}
          </span>
        </button>
      </div>

      {open ? (
        <ul
          className="divide-y divide-[var(--cart-border,hsl(var(--contrast-100)))] border-t border-[var(--cart-border,hsl(var(--contrast-100)))] px-4 py-1 sm:px-5"
          id={`cart-kit-${kitId}`}
        >
          {lineItems.map((lineItem) => (
            <li className="py-4" key={lineItem.id}>
              <CartLineItemRow
                compact
                decrementLineItemLabel={decrementLineItemLabel}
                deleteLineItemLabel={deleteLineItemLabel}
                incrementLineItemLabel={incrementLineItemLabel}
                lineItem={lineItem}
                lineItemAction={lineItemAction}
                onLineItemSubmit={onLineItemSubmit}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CartLineItemRow({
  lineItem,
  lineItemAction,
  onLineItemSubmit,
  incrementLineItemLabel,
  decrementLineItemLabel,
  deleteLineItemLabel,
  compact = false,
  lockQuantity = false,
}: {
  lineItem: CartLineItem;
  lineItemAction: (payload: FormData) => void;
  onLineItemSubmit: (lineItem: CartLineItem, formData: FormData) => void;
  incrementLineItemLabel?: string;
  decrementLineItemLabel?: string;
  deleteLineItemLabel?: string;
  compact?: boolean;
  lockQuantity?: boolean;
}) {
  const titleClassName =
    'block text-[0.9375rem] font-medium leading-snug text-[var(--cart-text,hsl(var(--foreground)))]';

  return (
    <div
      className={clsx(
        '@container',
        !compact &&
          'rounded-2xl border border-[var(--cart-border,hsl(var(--contrast-100)))] bg-white p-4 shadow-[0_1px_2px_rgba(49,47,47,0.04)] sm:p-5',
      )}
    >
      <div className={clsx('flex items-start', compact ? 'gap-3.5' : 'gap-4')}>
        <div
          className={clsx(
            'relative shrink-0 overflow-hidden rounded-xl bg-[var(--cart-image-background,hsl(var(--contrast-100)))]',
            compact ? 'size-16' : 'size-20 @sm:size-24',
          )}
        >
          {lineItem.typename === 'CartGiftCertificate' ? (
            <div className="flex h-full w-full items-center justify-center p-3">
              <GiftIcon className="size-8 text-[var(--cart-icon,hsl(var(--contrast-400)))]" />
            </div>
          ) : (
            lineItem.image != null && (
              <Image
                alt={lineItem.image.alt}
                className="object-cover"
                fill
                sizes={compact ? '64px' : '(min-width: 24rem) 96px, 80px'}
                src={lineItem.image.src}
              />
            )
          )}
        </div>

        <div className={cartLineItemBodyClassName}>
          <div className="min-w-0">
            {lineItem.href ? (
              <Link
                className={clsx(
                  titleClassName,
                  'transition-colors hover:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2',
                )}
                href={lineItem.href}
              >
                {lineItem.title}
              </Link>
            ) : (
              <span className={titleClassName}>{lineItem.title}</span>
            )}
            {lineItem.subtitle ? (
              <p className="mt-0.5 text-sm leading-snug text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                {lineItem.subtitle}
              </p>
            ) : null}
            {lineItem.subscriptionBadge ? (
              <SubscriptionLineSummary
                badge={lineItem.subscriptionBadge}
                className="mt-2.5 max-w-xs"
                details={lineItem.subscriptionDetails}
              />
            ) : null}
            <CartLineItemInventoryMessages className="mt-2" lineItem={lineItem} />
          </div>

          <CounterForm
            action={lineItemAction}
            decrementLabel={decrementLineItemLabel}
            deleteLabel={deleteLineItemLabel}
            incrementLabel={incrementLineItemLabel}
            lineItem={lineItem}
            lockQuantity={lockQuantity}
            onSubmit={(formData) => {
              onLineItemSubmit(lineItem, formData);
            }}
          />
        </div>
      </div>
    </div>
  );
}

const cartLineItemBodyClassName = 'flex min-w-0 flex-1 flex-col gap-3';

const cartLineItemControlsClassName = 'flex flex-col items-start gap-2';

const cartLineItemPriceClassName =
  'whitespace-nowrap text-[0.9375rem] font-medium tabular-nums tracking-tight leading-snug';

function CounterForm({
  lineItem,
  action,
  onSubmit,
  incrementLabel = 'Increase count',
  decrementLabel = 'Decrease count',
  deleteLabel = 'Remove item',
  lockQuantity = false,
}: {
  lineItem: CartLineItem;
  incrementLabel?: string;
  decrementLabel?: string;
  deleteLabel?: string;
  lockQuantity?: boolean;
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useTranslations('Cart');

  const [form, fields] = useForm({
    defaultValue: { id: lineItem.id },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      onSubmit(formData);
    },
  });

  if (lineItem.typename === 'CartGiftCertificate') {
    return (
      <form {...getFormProps(form)} action={action} className="shrink-0">
        <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
        <div className={cartLineItemControlsClassName}>
          <span className={cartLineItemPriceClassName}>{lineItem.price}</span>

          <div className="flex items-center gap-1.5">
            <span className="flex h-9 min-w-[2.5rem] select-none items-center justify-center rounded-full border border-[var(--cart-counter-border,hsl(var(--contrast-200)))] px-3 text-sm font-medium tabular-nums">
              {lineItem.quantity}
            </span>

            <CartLineItemDeleteButton label={deleteLabel} />
          </div>
        </div>
      </form>
    );
  }

  return (
      <form
        {...getFormProps(form)}
        action={action}
        className="shrink-0"
        onClick={(event) => event.stopPropagation()}
      >
        <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
        <div className={cartLineItemControlsClassName}>
          {lineItem.salePrice && lineItem.salePrice !== lineItem.price ? (
            <span className={cartLineItemPriceClassName}>
              <span className="sr-only">{t('originalPrice', { price: lineItem.price })}</span>
              <span
                aria-hidden="true"
                className="mr-1.5 text-sm font-normal text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] line-through"
              >
                {lineItem.price}
              </span>{' '}
              <span className="sr-only">{t('currentPrice', { price: lineItem.salePrice })}</span>
              <span aria-hidden="true">{lineItem.salePrice}</span>
            </span>
          ) : (
            <span className={cartLineItemPriceClassName}>{lineItem.price}</span>
          )}
          <div className="flex items-center gap-1.5">
            {lockQuantity ? (
              <span className="flex h-9 min-w-[2.5rem] select-none items-center justify-center rounded-full border border-[var(--cart-counter-border,hsl(var(--contrast-200)))] px-3 text-sm font-medium tabular-nums">
                {lineItem.kitUnitQuantity ?? lineItem.quantity}
              </span>
            ) : (
              <CartLineItemCounter
                decrementLabel={decrementLabel}
                incrementLabel={incrementLabel}
                lineItem={lineItem}
              />
            )}
            <CartLineItemDeleteButton label={deleteLabel} />
          </div>
        </div>
      </form>
  );
}

function CartLineItemDeleteButton({ label }: { label: string }) {
  return (
    <button
      aria-label={label}
      className="group flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
      name="intent"
      type="submit"
      value="delete"
    >
      <Trash2
        className="text-[var(--cart-icon,hsl(var(--contrast-400)))] transition-colors duration-200 group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
        size={16}
        strokeWidth={1.5}
      />
    </button>
  );
}

function KitQuantityForm({
  kitId,
  quantity,
  price,
  salePrice,
  action,
  onSubmit,
  incrementLabel,
  decrementLabel,
  deleteLabel,
}: {
  kitId: string;
  quantity: number;
  price: string;
  salePrice?: string;
  incrementLabel: string;
  decrementLabel: string;
  deleteLabel: string;
  action: (payload: FormData) => void;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useTranslations('Cart');
  const [form] = useForm({
    defaultValue: { kitId },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      onSubmit(formData);
    },
  });

  return (
    <form
      {...getFormProps(form)}
      action={action}
      className="shrink-0 cursor-auto"
      onClick={(event) => event.stopPropagation()}
    >
      <input name="kitId" type="hidden" value={kitId} />
      <div className={cartLineItemControlsClassName}>
        {salePrice && salePrice !== price ? (
          <span className={cartLineItemPriceClassName}>
            <span className="sr-only">{t('originalPrice', { price })}</span>
            <span
              aria-hidden="true"
              className="mr-1.5 text-sm font-normal text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] line-through"
            >
              {price}
            </span>{' '}
            <span className="sr-only">{t('currentPrice', { price: salePrice })}</span>
            <span aria-hidden="true">{salePrice}</span>
          </span>
        ) : (
          <span className={cartLineItemPriceClassName}>{price}</span>
        )}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex h-9 items-center rounded-full border border-[var(--cart-counter-border,hsl(var(--contrast-200)))]">
            <button
              aria-label={decrementLabel}
              className={clsx(
                'group flex size-9 items-center justify-center rounded-l-full bg-[var(--cart-counter-background,hsl(var(--background)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
                quantity === 1
                  ? 'opacity-40'
                  : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
              )}
              disabled={quantity === 1}
              name="intent"
              type="submit"
              value="decrement-kit"
            >
              <Minus
                className={clsx(
                  'text-[var(--cart-counter-icon,hsl(var(--contrast-500)))] transition-colors duration-200',
                  quantity !== 1 &&
                    'group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]',
                )}
                size={14}
                strokeWidth={2}
              />
            </button>
            <span className="min-w-[1.25rem] select-none text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              aria-label={incrementLabel}
              className="group flex size-9 items-center justify-center rounded-r-full bg-[var(--cart-counter-background,hsl(var(--background)))] transition-colors duration-200 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]"
              name="intent"
              type="submit"
              value="increment-kit"
            >
              <Plus
                className="text-[var(--cart-counter-icon,hsl(var(--contrast-500)))] transition-colors duration-200 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
                size={14}
                strokeWidth={2}
              />
            </button>
          </div>
          <button
            aria-label={deleteLabel}
            className="group flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
            name="intent"
            type="submit"
            value="delete-kit"
          >
            <Trash2
              className="text-[var(--cart-icon,hsl(var(--contrast-400)))] transition-colors duration-200 group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
              size={16}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </form>
  );
}

function CartLineItemCounter({
  lineItem,
  decrementLabel,
  incrementLabel,
}: {
  lineItem: CartLineItem;
  decrementLabel: string;
  incrementLabel: string;
}) {
  const displayQuantity = lineItem.kitId ? kitUnitQuantityOf(lineItem) : lineItem.quantity;

  return (
    <div
      className={clsx(
        'inline-flex h-9 items-center rounded-full border border-[var(--cart-counter-border,hsl(var(--contrast-200)))]',
        (lineItem.inventoryMessages?.outOfStockMessage != null ||
          lineItem.inventoryMessages?.quantityOutOfStockMessage != null) &&
          'border-red-500',
      )}
    >
      <button
        aria-label={decrementLabel}
        className={clsx(
          'group flex size-9 items-center justify-center rounded-l-full bg-[var(--cart-counter-background,hsl(var(--background)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
          displayQuantity === 1
            ? 'opacity-40'
            : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
        )}
        disabled={displayQuantity === 1}
        name="intent"
        type="submit"
        value="decrement"
      >
        <Minus
          className={clsx(
            'text-[var(--cart-counter-icon,hsl(var(--contrast-500)))] transition-colors duration-200',
            displayQuantity !== 1 &&
              'group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]',
          )}
          size={14}
          strokeWidth={2}
        />
      </button>
      <span className="min-w-[1.25rem] select-none text-center text-sm font-medium tabular-nums">
        {displayQuantity}
      </span>
      <button
        aria-label={incrementLabel}
        className="group flex size-9 items-center justify-center rounded-r-full bg-[var(--cart-counter-background,hsl(var(--background)))] transition-colors duration-200 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed"
        name="intent"
        type="submit"
        value="increment"
      >
        <Plus
          className="text-[var(--cart-counter-icon,hsl(var(--contrast-500)))] transition-colors duration-200 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
          size={14}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}

function CartLineItemInventoryMessages({
  lineItem,
  className,
}: {
  lineItem: CartLineItem;
  className?: string;
}) {
  if (
    lineItem.inventoryMessages?.outOfStockMessage == null &&
    lineItem.inventoryMessages?.quantityOutOfStockMessage == null &&
    lineItem.inventoryMessages?.quantityReadyToShipMessage == null &&
    lineItem.inventoryMessages?.quantityBackorderedMessage == null &&
    lineItem.inventoryMessages?.backorderMessage == null
  ) {
    return null;
  }

  return (
    <div className={clsx('flex flex-col gap-y-1', className)}>
      {lineItem.inventoryMessages?.outOfStockMessage != null && (
        <span className="text-xs/5 font-light text-red-500">
          {lineItem.inventoryMessages.outOfStockMessage}
        </span>
      )}
      {lineItem.inventoryMessages?.quantityOutOfStockMessage != null && (
        <span className="text-xs/5 font-light text-red-500">
          {lineItem.inventoryMessages.quantityOutOfStockMessage}
        </span>
      )}
      {lineItem.inventoryMessages?.quantityReadyToShipMessage != null && (
        <span className="text-xs/5 font-light">
          {lineItem.inventoryMessages.quantityReadyToShipMessage}
        </span>
      )}
      {lineItem.inventoryMessages?.quantityBackorderedMessage != null && (
        <span className="text-xs/5 font-light">
          {lineItem.inventoryMessages.quantityBackorderedMessage}
        </span>
      )}
      {lineItem.inventoryMessages?.backorderMessage != null && (
        <span className="text-xs/5 font-light">{lineItem.inventoryMessages.backorderMessage}</span>
      )}
    </div>
  );
}

function CheckoutButton({
  action,
  isCartUpdatePending,
  ...props
}: {
  action: Action<SubmissionResult | null, FormData> | string;
  isCartUpdatePending: boolean;
} & ComponentPropsWithoutRef<typeof Button>) {
  const [lastResult, formAction] = useActionState(
    async (state: SubmissionResult | null, formData: FormData) => {
      if (typeof action === 'string') {
        await new Promise<void>(() => {
          window.location.assign(action);
        });

        return null;
      }

      return action(state, formData);
    },
    null,
  );

  const [form] = useForm({ lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  return (
    <form action={formAction}>
      <SubmitButton {...props} isCartUpdatePending={isCartUpdatePending} />
    </form>
  );
}

function SubmitButton({
  isCartUpdatePending,
  ...props
}: { isCartUpdatePending: boolean } & ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      disabled={pending || isCartUpdatePending}
      loading={pending || isCartUpdatePending}
      type="submit"
    />
  );
}
