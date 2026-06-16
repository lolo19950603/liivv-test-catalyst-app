'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { clsx } from 'clsx';
import { ArrowRight, GiftIcon, Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ComponentPropsWithoutRef,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
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
import { useRouter } from '~/i18n/routing';

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
  lineItemActionPendingLabel?: string;
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
 *   --cart-icon: hsl(var(--contrast-300));
 *   --cart-icon-hover: hsl(var(--foreground));
 *   --cart-border: hsl(var(--contrast-100));
 *   --cart-image-background: hsl(var(--contrast-100));
 *   --cart-button-background: hsl(var(--contrast-100));
 *   --cart-counter-icon: hsl(var(--contrast-300));
 *   --cart-counter-icon-hover: hsl(var(--foreground));
 *   --cart-counter-background: hsl(var(--background));
 *   --cart-counter-background-hover: hsl(var(--contast-100) / 50%);
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
  lineItemActionPendingLabel = 'You have a cart update in progress. Are you sure you want to leave this page? Your changes may be lost.',
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

  const [form] = useForm({ lastResult: state.lastResult });

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  // Prevent page unload when line item action is pending
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLineItemActionPending) {
        event.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        event.returnValue = ''; // Chrome requires returnValue to be set

        return ''; // For older browsers
      }
    };

    if (isLineItemActionPending) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLineItemActionPending]);

  // Prevent client-side navigation when line item action is pending
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isLineItemActionPending && event.target instanceof HTMLElement) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isLineItemActionPending &&
        (event.key === 'Enter' || event.key === ' ') &&
        event.target instanceof HTMLElement
      ) {
        const link = event.target.closest('a[href]');

        if (
          link instanceof HTMLAnchorElement &&
          link.href &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:')
        ) {
          // eslint-disable-next-line no-alert
          const shouldNavigate = window.confirm(lineItemActionPendingLabel);

          if (!shouldNavigate) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    };

    if (isLineItemActionPending) {
      document.addEventListener('click', handleClick, true);
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isLineItemActionPending, lineItemActionPendingLabel]);

  const [optimisticLineItems, setOptimisticLineItems] = useOptimistic<CartLineItem[], FormData>(
    state.lineItems,
    (prevState, formData) => {
      const submission = parseWithZod(formData, { schema: cartLineItemActionFormDataSchema });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'increment': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }

        case 'decrement': {
          const { id } = submission.value;

          return prevState.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          );
        }

        case 'delete': {
          const { id } = submission.value;

          return prevState.filter((item) => item.id !== id);
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

  if (optimisticQuantity === 0) {
    return <CartEmptyState {...emptyState} />;
  }

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
              {isLineItemActionPending ? (
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
          {isLineItemActionPending ? (
            <Skeleton.Text characterCount={8} className="animate-pulse rounded-md" />
          ) : (
            <dd>{cart.total}</dd>
          )}
        </div>
      </dl>
      <CheckoutButton
        action={checkoutAction}
        className="mt-4 w-fit"
        isCartUpdatePending={isLineItemActionPending}
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
        'group/cart w-full font-[family-name:var(--cart-font-family,var(--font-family-body))] text-[var(--cart-text,hsl(var(--foreground)))]',
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
            <ul className="flex flex-col gap-5">
              {optimisticLineItems.map((lineItem) => (
                <li
                  className="flex flex-col items-start gap-x-5 gap-y-4 @container @sm:flex-row"
                  key={lineItem.id}
                >
              <div className="relative aspect-square w-full max-w-24 overflow-hidden rounded-xl bg-[var(--cart-image-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4">
                {lineItem.typename === 'CartGiftCertificate' ? (
                  <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                    <GiftIcon className="h-full w-full text-[var(--cart-icon,hsl(var(--contrast-300)))]" />
                  </div>
                ) : (
                  lineItem.image != null && (
                    <Image
                      alt={lineItem.image.alt}
                      className="object-cover"
                      fill
                      sizes="(min-width: 28rem) 9rem, (min-width: 24rem) 6rem, 100vw"
                      src={lineItem.image.src}
                    />
                  )
                )}
              </div>
              <div className="flex min-w-0 grow flex-col gap-y-3 @xl:flex-row @xl:items-start @xl:justify-between">
                <div className="flex min-w-0 flex-1 flex-col @xl:pr-6">
                  <span className="font-medium">{lineItem.title}</span>
                  <span className="text-[var(--cart-subtext-text,hsl(var(--contrast-400)))] contrast-more:text-[var(--cart-subtitle-text,hsl(var(--contrast-500)))]">
                    {lineItem.subtitle}
                  </span>
                  {lineItem.subscriptionBadge ? (
                    <SubscriptionLineSummary
                      badge={lineItem.subscriptionBadge}
                      className="mt-2"
                      details={lineItem.subscriptionDetails}
                    />
                  ) : null}
                </div>
                <div className="w-full shrink-0 @xl:w-[min(100%,16rem)]">
                <CounterForm
                  action={formAction}
                  decrementLabel={decrementLineItemLabel}
                  deleteLabel={deleteLineItemLabel}
                  incrementLabel={incrementLineItemLabel}
                  lineItem={lineItem}
                  onSubmit={(formData) => {
                    startTransition(() => {
                      formAction(formData);
                      setOptimisticLineItems(formData);
                      router.refresh();

                      const intent = formData.get('intent');

                      if (intent === 'increment') {
                        formData.set('quantity', '1');

                        events.onAddToCart?.(formData);
                      }

                      if (intent === 'decrement') {
                        formData.set('quantity', '1');

                        events.onRemoveFromCart?.(formData);
                      }

                      if (intent === 'delete') {
                        formData.set('quantity', lineItem.quantity.toString());

                        events.onRemoveFromCart?.(formData);
                      }
                    });
                  }}
                />
                </div>
              </div>
            </li>
          ))}
            </ul>
          </div>
          <aside className="min-w-0 @lg:sticky @lg:top-10">{summary}</aside>
        </div>
      </div>
    </section>
  );
}

function CounterForm({
  lineItem,
  action,
  onSubmit,
  incrementLabel = 'Increase count',
  decrementLabel = 'Decrease count',
  deleteLabel = 'Remove item',
}: {
  lineItem: CartLineItem;
  incrementLabel?: string;
  decrementLabel?: string;
  deleteLabel?: string;
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
      <form {...getFormProps(form)} action={action}>
        <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
        <div className={cartLineItemControlsGridClassName}>
          <span className="justify-self-end font-medium tabular-nums">{lineItem.price}</span>

          <span className="flex w-[7.25rem] select-none justify-center rounded-lg border border-[var(--cart-counter-border,hsl(var(--contrast-100)))] px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
            {lineItem.quantity}
          </span>

          <button
            aria-label={deleteLabel}
            className="group flex h-8 w-8 shrink-0 items-center justify-center justify-self-end rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
            name="intent"
            type="submit"
            value="delete"
          >
            <Trash2
              className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
              size={20}
              strokeWidth={1}
            />
          </button>
        </div>
      </form>
    );
  }

  return (
    <form {...getFormProps(form)} action={action}>
      <input {...getInputProps(fields.id, { type: 'hidden' })} key={fields.id.id} />
      <div className="flex w-full flex-col gap-y-2">
        <div className={cartLineItemControlsGridClassName}>
          {lineItem.salePrice && lineItem.salePrice !== lineItem.price ? (
            <span className="justify-self-end text-right font-medium tabular-nums">
              <span className="sr-only">{t('originalPrice', { price: lineItem.price })}</span>
              <span aria-hidden="true" className="line-through">
                {lineItem.price}
              </span>{' '}
              <span className="sr-only">{t('currentPrice', { price: lineItem.salePrice })}</span>
              <span aria-hidden="true">{lineItem.salePrice}</span>
            </span>
          ) : (
            <span className="justify-self-end font-medium tabular-nums">{lineItem.price}</span>
          )}
          <CartLineItemCounter
            decrementLabel={decrementLabel}
            incrementLabel={incrementLabel}
            lineItem={lineItem}
          />
          <button
            aria-label={deleteLabel}
            className="group flex h-8 w-8 shrink-0 items-center justify-center justify-self-end rounded-full transition-colors duration-300 hover:bg-[var(--cart-button-background,hsl(var(--contrast-100)))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] focus-visible:ring-offset-4"
            name="intent"
            type="submit"
            value="delete"
          >
            <Trash2
              className="text-[var(--cart-icon,hsl(var(--contrast-300)))] group-hover:text-[var(--cart-icon-hover,hsl(var(--foreground)))]"
              size={20}
              strokeWidth={1}
            />
          </button>
        </div>
        <CartLineItemInventoryMessages lineItem={lineItem} />
      </div>
    </form>
  );
}

const cartLineItemControlsGridClassName =
  'grid w-full grid-cols-[minmax(0,1fr)_7.25rem_2rem] items-center gap-x-4';

function CartLineItemCounter({
  lineItem,
  decrementLabel,
  incrementLabel,
}: {
  lineItem: CartLineItem;
  decrementLabel: string;
  incrementLabel: string;
}) {
  return (
    <div
      className={clsx(
        'flex w-[7.25rem] items-center rounded-lg border border-[var(--cart-counter-border,hsl(var(--contrast-100)))]',
        (lineItem.inventoryMessages?.outOfStockMessage != null ||
          lineItem.inventoryMessages?.quantityOutOfStockMessage != null) &&
          'border-red-500',
      )}
    >
      <button
        aria-label={decrementLabel}
        className={clsx(
          'group rounded-l-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed',
          lineItem.quantity === 1
            ? 'opacity-50'
            : 'hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))]',
        )}
        disabled={lineItem.quantity === 1}
        name="intent"
        type="submit"
        value="decrement"
      >
        <Minus
          className={clsx(
            'text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300',
            lineItem.quantity !== 1 &&
              'group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]',
          )}
          size={18}
          strokeWidth={1.5}
        />
      </button>
      <span className="flex w-8 flex-1 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))]">
        {lineItem.quantity}
      </span>
      <button
        aria-label={incrementLabel}
        className="group rounded-r-lg bg-[var(--cart-counter-background,hsl(var(--background)))] p-3 transition-colors duration-300 hover:bg-[var(--cart-counter-background-hover,hsl(var(--contrast-100)/50%))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cart-focus,hsl(var(--primary)))] disabled:cursor-not-allowed"
        name="intent"
        type="submit"
        value="increment"
      >
        <Plus
          className="text-[var(--cart-counter-icon,hsl(var(--contrast-300)))] transition-colors duration-300 group-hover:text-[var(--cart-counter-icon-hover,hsl(var(--foreground)))]"
          size={18}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}

function CartLineItemInventoryMessages({ lineItem }: { lineItem: CartLineItem }) {
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
    <div className="flex flex-col gap-y-1">
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
