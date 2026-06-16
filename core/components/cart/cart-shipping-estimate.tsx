'use client';

import { clsx } from 'clsx';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import type { ShippingFormState } from '@/vibes/soul/sections/cart/shipping-form';
import { useRouter } from '~/i18n/routing';

const inputClassName =
  'w-full rounded-lg border border-[var(--contrast-200,hsl(var(--contrast-200)))] bg-[var(--background,hsl(var(--background)))] px-3 py-2.5 text-sm';

interface CountryOption {
  label: string;
  value: string;
}

interface StateOption {
  country: string;
  states: Array<{ label: string; value: string }>;
}

interface ShippingOption {
  label: string;
  value: string;
  price: string;
}

interface ShipToAddress {
  country: string;
  state?: string;
  postalCode?: string;
}

interface CartShippingEstimateProps {
  action: (prevState: ShippingFormState, formData: FormData) => Promise<ShippingFormState>;
  countries: CountryOption[];
  states: StateOption[];
  address?: ShipToAddress;
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

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} size="small" type="submit" variant="secondary">
      {children}
    </Button>
  );
}

export function CartShippingEstimate({
  action,
  countries,
  states,
  address,
  shippingOption,
  labels,
}: CartShippingEstimateProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [countryCode, setCountryCode] = useState(address?.country ?? countries[0]?.value ?? '');

  const wrappedAction = async (prevState: ShippingFormState, formData: FormData) => {
    const result = await action(prevState, formData);

    if (result.lastResult?.status === 'success') {
      setShowForm(false);
      router.refresh();
    }

    return result;
  };

  const [state, formAction] = useActionState(wrappedAction, {
    lastResult: null,
    address: address ?? null,
    shippingOptions: null,
    shippingOption: shippingOption ?? null,
    form: null,
  });

  const errors = state.lastResult?.error?.[''] ?? [];
  const stateOptions = states.find((entry) => entry.country === countryCode)?.states ?? [];
  const resolvedShippingOption = state.shippingOption ?? shippingOption;

  return (
    <div className="py-4">
      <div className="flex justify-between">
        <span>{labels.shipping}</span>
        {resolvedShippingOption ? <span>{resolvedShippingOption.price}</span> : null}
      </div>

      {resolvedShippingOption ? (
        <div className="flex gap-1.5 text-xs">
          <span className="font-medium text-[var(--contrast-500,hsl(var(--contrast-500)))]">
            {resolvedShippingOption.label}
          </span>
          {!showForm ? (
            <button
              className="font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
              onClick={() => setShowForm(true)}
              type="button"
            >
              {labels.change}
            </button>
          ) : null}
        </div>
      ) : !showForm ? (
        <button
          className="text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
          onClick={() => setShowForm(true)}
          type="button"
        >
          {labels.estimate}
        </button>
      ) : null}

      <div className={clsx('mt-4 space-y-3', { hidden: !showForm })}>
        <form action={formAction} className="space-y-3">
          <input name="intent" type="hidden" value="estimate-shipping" />

          <label className="grid gap-1.5 text-sm">
            <span>{labels.country}</span>
            <select
              className={inputClassName}
              defaultValue={address?.country ?? countryCode}
              name="country"
              onChange={(event) => setCountryCode(event.target.value)}
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
            <span>{labels.state}</span>
            {stateOptions.length > 0 ? (
              <select
                className={inputClassName}
                defaultValue={address?.state}
                name="state"
              >
                <option value="">—</option>
                {stateOptions.map((province) => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClassName}
                defaultValue={address?.state}
                name="state"
              />
            )}
          </label>

          <label className="grid gap-1.5 text-sm">
            <span>{labels.postalCode}</span>
            <input
              className={inputClassName}
              defaultValue={address?.postalCode}
              name="postalCode"
            />
          </label>

          {errors.length > 0 ? (
            <p className="text-sm text-[var(--error,hsl(var(--error)))]">{errors.join(' ')}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-start gap-1.5">
            <SubmitButton>{labels.estimate}</SubmitButton>
            <Button
              className="shrink-0"
              onClick={() => setShowForm(false)}
              size="small"
              type="button"
              variant="tertiary"
            >
              {labels.cancel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
