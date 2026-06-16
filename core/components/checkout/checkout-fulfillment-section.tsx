'use client';

import { clsx } from 'clsx';
import {
  type ReactNode,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { Badge } from '@/vibes/soul/primitives/badge';
import type { ShippingFormState } from '@/vibes/soul/sections/cart/shipping-form';
import { saveCheckoutAddress } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';
import { formatAddressInline, formatAddressMultiline } from '~/lib/checkout/format-address';
import { useRouter } from '~/i18n/routing';

import { CheckoutAddressModal } from './checkout-address-modal';
import { CheckoutCompleteOrderButton, CheckoutCompleteOrderButtonPlaceholder } from './checkout-complete-order-button';
import {
  CheckoutPaymentElement,
  CheckoutPaymentElements,
} from './checkout-payment-element';
import { CheckoutPaymentProvider, useCheckoutPayment } from './checkout-payment-provider';

const inputClassName =
  'w-full rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] bg-[var(--background,hsl(var(--background)))] px-3 py-2.5 text-sm';

const fieldButtonClassName =
  'flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--contrast-50,hsl(var(--contrast-50)))]';

interface CountryOption {
  label: string;
  value: string;
}

interface StateOption {
  country: string;
  states: Array<{ label: string; value: string }>;
}

interface ShipToAddress {
  country: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface CheckoutSavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  stateOrProvince?: string;
  countryCode: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface CheckoutFulfillmentLabels {
  shipToTitle: string;
  shippingMethodTitle: string;
  shippingMethodEmpty: string;
  shippingMethodSelect: string;
  shippingMethodNoOptions: string;
  shippingMethodUpdating: string;
  billingAddressTitle: string;
  sameAsShipping: string;
  differentBilling: string;
  useDifferentAddress: string;
  addAddress: string;
  defaultBadge: string;
  paymentSecure: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  stateOrProvince: string;
  country: string;
  postalCode: string;
  phone: string;
  addressModalTitle: string;
  addressModalCancel: string;
  addressModalSave: string;
}

interface CheckoutFulfillmentSectionProps {
  billingFormId: string;
  customerEmail: string;
  requiresShipping: boolean;
  action: (prevState: ShippingFormState, formData: FormData) => Promise<ShippingFormState>;
  countries: CountryOption[];
  states: StateOption[];
  savedAddresses: CheckoutSavedAddress[];
  address?: ShipToAddress;
  billingDefaults: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    stateOrProvince?: string;
    countryCode: string;
    postalCode: string;
    phone?: string;
  };
  labels: CheckoutFulfillmentLabels;
  paymentTitle: string;
  submitLabel: string;
  initializePaymentAction: (
    formData: FormData,
  ) => Promise<{ clientSecret: string; snapshotId: string }>;
  prepareOrderConfirmationAction: (
    formData: FormData,
    stripeSessionId: string,
  ) => Promise<{ snapshotId: string }>;
  returnUrl: string;
  shippingReady: boolean;
  shippingRequiredMessage?: string;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={clsx('h-4 w-4 shrink-0 text-[var(--contrast-500,hsl(var(--contrast-500)))] transition-transform', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapsibleField({
  label,
  summary,
  open,
  onToggle,
  children,
  disabled = false,
}: {
  label: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={clsx(disabled && 'opacity-60')}>
      <button
        className={fieldButtonClassName}
        disabled={disabled}
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0 flex-1">
          <span className="mb-0.5 block text-xs text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {label}
          </span>
          <span className="block truncate font-medium text-[var(--foreground,hsl(var(--foreground)))]">
            {summary}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      {open ? <div className="mt-2 rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] p-3">{children}</div> : null}
    </div>
  );
}

function setBillingField(form: HTMLFormElement, name: string, value: string) {
  const input = form.elements.namedItem(name);

  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.value = value;
  }
}

function addressMatchesConsignment(
  address: CheckoutSavedAddress,
  consignment?: ShipToAddress,
): boolean {
  if (!consignment?.country) {
    return false;
  }

  return (
    address.countryCode === consignment.country &&
    (address.city ?? '') === (consignment.city ?? '') &&
    (address.stateOrProvince ?? '') === (consignment.state ?? '') &&
    (address.postalCode ?? '') === (consignment.postalCode ?? '')
  );
}

export function CheckoutFulfillmentSection({
  billingFormId,
  customerEmail,
  requiresShipping,
  action,
  countries,
  states,
  savedAddresses: initialSavedAddresses,
  address,
  billingDefaults,
  labels,
  paymentTitle,
  submitLabel,
  initializePaymentAction,
  prepareOrderConfirmationAction,
  returnUrl,
  shippingReady,
  shippingRequiredMessage,
}: CheckoutFulfillmentSectionProps) {
  const router = useRouter();
  const billingRef = useRef<HTMLFormElement>(null);
  const hasAutoApplied = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState(initialSavedAddresses);
  const [billingMode, setBillingMode] = useState<'same' | 'different'>('same');
  const [shipToOpen, setShipToOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isApplyingAddress, startApplyingAddress] = useTransition();

  const initialSelectedAddress =
    initialSavedAddresses.find((entry) => addressMatchesConsignment(entry, address)) ??
    initialSavedAddresses.find((entry) => entry.isDefault) ??
    initialSavedAddresses[0];

  const [selectedAddress, setSelectedAddress] = useState<CheckoutSavedAddress | null>(
    initialSelectedAddress ?? null,
  );

  const wrappedAction = useCallback(
    async (prevState: ShippingFormState, formData: FormData) => {
      const result = await action(prevState, formData);

      if (result.lastResult?.status === 'success') {
        router.refresh();
      }

      return result;
    },
    [action, router],
  );

  const [shippingState, shippingAction] = useActionState(wrappedAction, {
    lastResult: null,
    address: address ?? null,
    shippingOptions: null,
    shippingOption: null,
    form: null,
  });

  const resolvedAddress = shippingState.address ?? address;
  const hasShippingAddress = Boolean(resolvedAddress?.country);
  const shippingErrors = shippingState.lastResult?.error?.[''] ?? [];

  const applyAddressToCheckout = useCallback(
    (shipAddress: CheckoutSavedAddress) => {
      const formData = new FormData();

      formData.set('intent', 'add-address');
      formData.set('country', shipAddress.countryCode);
      formData.set('city', shipAddress.city);
      formData.set('state', shipAddress.stateOrProvince ?? '');
      formData.set('postalCode', shipAddress.postalCode ?? '');

      startApplyingAddress(() => {
        void shippingAction(formData);
      });
    },
    [shippingAction],
  );

  const syncBillingFromShipping = useCallback(() => {
    if (billingMode !== 'same' || !billingRef.current) {
      return;
    }

    const source = selectedAddress;

    if (!source && !requiresShipping) {
      return;
    }

    const billingForm = billingRef.current;

    if (source) {
      setBillingField(billingForm, 'firstName', source.firstName);
      setBillingField(billingForm, 'lastName', source.lastName);
      setBillingField(billingForm, 'company', source.company ?? '');
      setBillingField(billingForm, 'address1', source.address1);
      setBillingField(billingForm, 'address2', source.address2 ?? '');
      setBillingField(billingForm, 'city', source.city);
      setBillingField(billingForm, 'stateOrProvince', source.stateOrProvince ?? '');
      setBillingField(billingForm, 'countryCode', source.countryCode);
      setBillingField(billingForm, 'postalCode', source.postalCode ?? '');
      setBillingField(billingForm, 'phone', source.phone ?? '');
    }
  }, [billingMode, requiresShipping, selectedAddress]);

  useEffect(() => {
    syncBillingFromShipping();
  }, [syncBillingFromShipping, selectedAddress, billingMode, shippingState.address]);

  useEffect(() => {
    if (!requiresShipping || hasAutoApplied.current) {
      return;
    }

    const defaultAddress =
      savedAddresses.find((entry) => entry.isDefault) ?? savedAddresses[0];

    if (!defaultAddress) {
      return;
    }

    const matchesConsignment = addressMatchesConsignment(defaultAddress, resolvedAddress);

    if (matchesConsignment) {
      hasAutoApplied.current = true;

      if (!selectedAddress) {
        setSelectedAddress(defaultAddress);
      }

      return;
    }

    hasAutoApplied.current = true;
    setSelectedAddress(defaultAddress);
    applyAddressToCheckout(defaultAddress);
  }, [
    applyAddressToCheckout,
    requiresShipping,
    resolvedAddress,
    savedAddresses,
    selectedAddress,
  ]);

  useEffect(() => {
    setSavedAddresses(initialSavedAddresses);
  }, [initialSavedAddresses]);

  const handleSelectAddress = (shipAddress: CheckoutSavedAddress) => {
    setSelectedAddress(shipAddress);
    setShipToOpen(false);
    applyAddressToCheckout(shipAddress);
  };

  const handleSaveAddress = async (input: Parameters<typeof saveCheckoutAddress>[0]) => {
    const result = await saveCheckoutAddress(input);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const newAddress: CheckoutSavedAddress = {
      ...result.address,
      isDefault: savedAddresses.length === 0,
    };

    setSavedAddresses((prev) => [...prev, newAddress]);
    setSelectedAddress(newAddress);
    setShipToOpen(false);
    applyAddressToCheckout(newAddress);
    router.refresh();

    return { success: true };
  };

  const shipToSummary = selectedAddress
    ? formatAddressInline(selectedAddress)
    : hasShippingAddress
      ? [resolvedAddress?.city, resolvedAddress?.state, resolvedAddress?.postalCode, resolvedAddress?.country]
          .filter(Boolean)
          .join(', ')
      : labels.shippingMethodEmpty;

  return (
    <CheckoutPaymentProvider
      billingFormId={billingFormId}
      initializePaymentAction={initializePaymentAction}
      prepareOrderConfirmationAction={prepareOrderConfirmationAction}
      returnUrl={returnUrl}
      shippingReady={shippingReady}
    >
      <CheckoutFulfillmentContent
        action={action}
        address={address}
        billingDefaults={billingDefaults}
        billingFormId={billingFormId}
        billingMode={billingMode}
        billingRef={billingRef}
        countries={countries}
        customerEmail={customerEmail}
        handleSaveAddress={handleSaveAddress}
        handleSelectAddress={handleSelectAddress}
        hasShippingAddress={hasShippingAddress}
        isApplyingAddress={isApplyingAddress}
        labels={labels}
        paymentTitle={paymentTitle}
        requiresShipping={requiresShipping}
        savedAddresses={savedAddresses}
        selectedAddress={selectedAddress}
        setAddressModalOpen={setAddressModalOpen}
        setBillingMode={setBillingMode}
        setShipToOpen={setShipToOpen}
        shipToOpen={shipToOpen}
        shipToSummary={shipToSummary}
        shippingErrors={shippingErrors}
        shippingReady={shippingReady}
        shippingRequiredMessage={shippingRequiredMessage}
        states={states}
        submitLabel={submitLabel}
        syncBillingFromShipping={syncBillingFromShipping}
        addressModalOpen={addressModalOpen}
      />
    </CheckoutPaymentProvider>
  );
}

function CheckoutFulfillmentContent({
  action,
  address,
  billingDefaults,
  billingFormId,
  billingMode,
  billingRef,
  countries,
  customerEmail,
  handleSaveAddress,
  handleSelectAddress,
  hasShippingAddress,
  isApplyingAddress,
  labels,
  paymentTitle,
  requiresShipping,
  savedAddresses,
  selectedAddress,
  setAddressModalOpen,
  setBillingMode,
  setShipToOpen,
  shipToOpen,
  shipToSummary,
  shippingErrors,
  shippingReady,
  shippingRequiredMessage,
  states,
  submitLabel,
  syncBillingFromShipping,
  addressModalOpen,
}: {
  action: CheckoutFulfillmentSectionProps['action'];
  address?: ShipToAddress;
  billingDefaults: CheckoutFulfillmentSectionProps['billingDefaults'];
  billingFormId: string;
  billingMode: 'same' | 'different';
  billingRef: React.RefObject<HTMLFormElement | null>;
  countries: CountryOption[];
  customerEmail: string;
  handleSaveAddress: (
    input: Parameters<typeof saveCheckoutAddress>[0],
  ) => Promise<{ success: boolean; error?: string }>;
  handleSelectAddress: (shipAddress: CheckoutSavedAddress) => void;
  hasShippingAddress: boolean;
  isApplyingAddress: boolean;
  labels: CheckoutFulfillmentLabels;
  paymentTitle: string;
  requiresShipping: boolean;
  savedAddresses: CheckoutSavedAddress[];
  selectedAddress: CheckoutSavedAddress | null;
  setAddressModalOpen: (open: boolean) => void;
  setBillingMode: (mode: 'same' | 'different') => void;
  setShipToOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  shipToOpen: boolean;
  shipToSummary: string;
  shippingErrors: string[];
  shippingReady: boolean;
  shippingRequiredMessage?: string;
  states: StateOption[];
  submitLabel: string;
  syncBillingFromShipping: () => void;
  addressModalOpen: boolean;
}) {
  const { clientSecret, errorMessage, isInitializing } = useCheckoutPayment();
  const customerInitial = customerEmail.charAt(0).toUpperCase();

  return (
    <div className="checkout-fulfillment space-y-5">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--contrast-200,hsl(var(--contrast-200)))] text-sm font-semibold uppercase">
            {customerInitial}
          </span>
          <span className="truncate text-sm">{customerEmail}</span>
        </div>
      </div>

      {requiresShipping ? (
        <>
          <CollapsibleField
            label={labels.shipToTitle}
            onToggle={() => setShipToOpen((open) => !open)}
            open={shipToOpen}
            summary={shipToSummary}
          >
            <div className="space-y-1">
              {savedAddresses.map((shipAddress) => {
                const isSelected = selectedAddress?.id === shipAddress.id;

                return (
                  <label
                    className={clsx(
                      'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors',
                      isSelected
                        ? 'border-[var(--primary,hsl(var(--primary)))] bg-[var(--primary,hsl(var(--primary)))]/5'
                        : 'border-transparent hover:bg-[var(--contrast-50,hsl(var(--contrast-50)))]',
                    )}
                    key={shipAddress.id}
                  >
                    <input
                      checked={isSelected}
                      className="mt-1"
                      name="ship-to-address"
                      onChange={() => handleSelectAddress(shipAddress)}
                      type="radio"
                    />
                    <span className="min-w-0 flex-1 text-sm">
                      {formatAddressMultiline(shipAddress).map((line) => (
                        <span className="block" key={line}>
                          {line}
                        </span>
                      ))}
                      {shipAddress.isDefault ? (
                        <Badge className="mt-2">{labels.defaultBadge}</Badge>
                      ) : null}
                    </span>
                  </label>
                );
              })}

              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--primary,hsl(var(--primary)))] hover:bg-[var(--contrast-50,hsl(var(--contrast-50)))]"
                onClick={() => {
                  setShipToOpen(false);
                  setAddressModalOpen(true);
                }}
                type="button"
              >
                <span aria-hidden className="text-lg leading-none">
                  +
                </span>
                {labels.useDifferentAddress}
              </button>

              {shippingErrors.length > 0 ? (
                <p className="px-3 pt-2 text-sm text-[var(--error,hsl(var(--error)))]">
                  {shippingErrors.join(' ')}
                </p>
              ) : null}

              {isApplyingAddress ? (
                <p className="px-3 pt-2 text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {labels.shippingMethodUpdating}
                </p>
              ) : null}
            </div>
          </CollapsibleField>
        </>
      ) : null}

      {clientSecret ? (
        <CheckoutPaymentElements>
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">{paymentTitle}</h2>
              <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {labels.paymentSecure}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] p-4">
              {errorMessage ? (
                <p className="mb-3 text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p>
              ) : null}
              <CheckoutPaymentElement />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">{labels.billingAddressTitle}</h2>
            <div className="overflow-hidden rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))]">
              {requiresShipping ? (
                <>
                  <label
                    className={clsx(
                      'flex cursor-pointer items-center gap-3 border-b px-4 py-3 text-sm',
                      billingMode === 'same' && 'bg-[var(--primary,hsl(var(--primary)))]/5',
                    )}
                  >
                    <input
                      checked={billingMode === 'same'}
                      name="billing-mode"
                      onChange={() => setBillingMode('same')}
                      type="radio"
                    />
                    <span>{labels.sameAsShipping}</span>
                  </label>
                  <label
                    className={clsx(
                      'flex cursor-pointer items-center gap-3 px-4 py-3 text-sm',
                      billingMode === 'different' && 'bg-[var(--primary,hsl(var(--primary)))]/5',
                    )}
                  >
                    <input
                      checked={billingMode === 'different'}
                      name="billing-mode"
                      onChange={() => setBillingMode('different')}
                      type="radio"
                    />
                    <span>{labels.differentBilling}</span>
                  </label>
                </>
              ) : null}
            </div>

            <form
              className={clsx(
                'grid gap-3 @md:grid-cols-2',
                billingMode === 'same' && requiresShipping && 'hidden',
              )}
              id={billingFormId}
              ref={billingRef}
            >
              <label className="grid gap-1.5 text-sm">
                <span>{labels.firstName}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.firstName}
                  name="firstName"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.lastName}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.lastName}
                  name="lastName"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.email}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.email}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.company}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.company}
                  name="company"
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.address1}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.address1}
                  name="address1"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.address2}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.address2}
                  name="address2"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.city}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.city}
                  name="city"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.stateOrProvince}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.stateOrProvince}
                  name="stateOrProvince"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.country}</span>
                <select
                  className={inputClassName}
                  defaultValue={billingDefaults.countryCode}
                  name="countryCode"
                  required
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.postalCode}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.postalCode}
                  name="postalCode"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.phone}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.phone}
                  name="phone"
                  type="tel"
                />
              </label>
            </form>

            <CheckoutCompleteOrderButton
              disabled={!shippingReady}
              disabledMessage={shippingRequiredMessage}
              onBeforeConfirm={syncBillingFromShipping}
              submitLabel={submitLabel}
            />
          </section>
        </CheckoutPaymentElements>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">{paymentTitle}</h2>
              <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                {labels.paymentSecure}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] p-4">
              {!shippingReady ? (
                <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {shippingRequiredMessage}
                </p>
              ) : (
                <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {isInitializing ? labels.shippingMethodUpdating : labels.shippingMethodEmpty}
                </p>
              )}
              {errorMessage ? (
                <p className="mt-3 text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">{labels.billingAddressTitle}</h2>
            <div className="overflow-hidden rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))]">
              {requiresShipping ? (
                <>
                  <label
                    className={clsx(
                      'flex cursor-pointer items-center gap-3 border-b px-4 py-3 text-sm',
                      billingMode === 'same' && 'bg-[var(--primary,hsl(var(--primary)))]/5',
                    )}
                  >
                    <input
                      checked={billingMode === 'same'}
                      name="billing-mode"
                      onChange={() => setBillingMode('same')}
                      type="radio"
                    />
                    <span>{labels.sameAsShipping}</span>
                  </label>
                  <label
                    className={clsx(
                      'flex cursor-pointer items-center gap-3 px-4 py-3 text-sm',
                      billingMode === 'different' && 'bg-[var(--primary,hsl(var(--primary)))]/5',
                    )}
                  >
                    <input
                      checked={billingMode === 'different'}
                      name="billing-mode"
                      onChange={() => setBillingMode('different')}
                      type="radio"
                    />
                    <span>{labels.differentBilling}</span>
                  </label>
                </>
              ) : null}
            </div>

            <form
              className={clsx(
                'grid gap-3 @md:grid-cols-2',
                billingMode === 'same' && requiresShipping && 'hidden',
              )}
              id={billingFormId}
              ref={billingRef}
            >
              <label className="grid gap-1.5 text-sm">
                <span>{labels.firstName}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.firstName}
                  name="firstName"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.lastName}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.lastName}
                  name="lastName"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.email}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.email}
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.company}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.company}
                  name="company"
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.address1}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.address1}
                  name="address1"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.address2}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.address2}
                  name="address2"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.city}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.city}
                  name="city"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.stateOrProvince}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.stateOrProvince}
                  name="stateOrProvince"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.country}</span>
                <select
                  className={inputClassName}
                  defaultValue={billingDefaults.countryCode}
                  name="countryCode"
                  required
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span>{labels.postalCode}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.postalCode}
                  name="postalCode"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-sm @md:col-span-2">
                <span>{labels.phone}</span>
                <input
                  className={inputClassName}
                  defaultValue={billingDefaults.phone}
                  name="phone"
                  type="tel"
                />
              </label>
            </form>

            <CheckoutCompleteOrderButtonPlaceholder
              disabledMessage={shippingRequiredMessage}
              submitLabel={submitLabel}
            />
          </section>
        </>
      )}

      <CheckoutAddressModal
        countries={countries}
        defaultCountryCode={billingDefaults.countryCode}
        labels={{
          title: labels.addressModalTitle,
          cancel: labels.addressModalCancel,
          save: labels.addressModalSave,
          firstName: labels.firstName,
          lastName: labels.lastName,
          company: labels.company,
          address1: labels.address1,
          address2: labels.address2,
          city: labels.city,
          stateOrProvince: labels.stateOrProvince,
          country: labels.country,
          postalCode: labels.postalCode,
          phone: labels.phone,
        }}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        open={addressModalOpen}
        states={states}
      />
    </div>
  );
}
