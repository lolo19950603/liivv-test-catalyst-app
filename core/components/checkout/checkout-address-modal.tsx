'use client';

import { useState, useTransition } from 'react';

import { Modal } from '@/vibes/soul/primitives/modal';
import { Button } from '@/vibes/soul/primitives/button';
import type { SaveCheckoutAddressInput } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';

const fieldClassName =
  'w-full rounded-md border border-[var(--contrast-200,hsl(var(--contrast-200)))] bg-[var(--background,hsl(var(--background)))] px-3 py-2.5 text-sm text-[var(--foreground,hsl(var(--foreground)))] outline-none placeholder:text-[var(--contrast-400,hsl(var(--contrast-400)))] focus:border-[var(--primary,hsl(var(--primary)))] focus:ring-1 focus:ring-[var(--primary,hsl(var(--primary)))]';

interface CountryOption {
  label: string;
  value: string;
}

interface StateOption {
  country: string;
  states: Array<{ label: string; value: string }>;
}

export interface CheckoutAddressModalLabels {
  title: string;
  cancel: string;
  save: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  stateOrProvince: string;
  country: string;
  postalCode: string;
  phone: string;
}

interface CheckoutAddressModalProps {
  open: boolean;
  countries: CountryOption[];
  states: StateOption[];
  labels: CheckoutAddressModalLabels;
  defaultCountryCode: string;
  onClose: () => void;
  onSave: (input: SaveCheckoutAddressInput) => Promise<{ success: boolean; error?: string }>;
}

export function CheckoutAddressModal({
  open,
  countries,
  states,
  labels,
  defaultCountryCode,
  onClose,
  onSave,
}: CheckoutAddressModalProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  const stateOptions = states.find((entry) => entry.country === countryCode)?.states ?? [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
      return;
    }

    setError(null);
    setCountryCode(defaultCountryCode);
    setFormKey((current) => current + 1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const input: SaveCheckoutAddressInput = {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      company: String(formData.get('company') ?? '') || undefined,
      address1: String(formData.get('address1') ?? ''),
      address2: String(formData.get('address2') ?? '') || undefined,
      city: String(formData.get('city') ?? ''),
      stateOrProvince: String(formData.get('stateOrProvince') ?? '') || undefined,
      countryCode: String(formData.get('countryCode') ?? ''),
      postalCode: String(formData.get('postalCode') ?? '') || undefined,
      phone: String(formData.get('phone') ?? '') || undefined,
    };

    startTransition(async () => {
      const result = await onSave(input);

      if (result.success) {
        onClose();
        return;
      }

      setError(result.error ?? 'Unable to save address');
    });
  };

  return (
    <Modal
      isOpen={open}
      scrollable={false}
      setOpen={handleOpenChange}
      title={labels.title}
    >
      <form className="flex flex-col gap-3" key={formKey} onSubmit={handleSubmit}>
        <select
          aria-label={labels.country}
          className={fieldClassName}
          defaultValue={defaultCountryCode}
          name="countryCode"
          onChange={(event) => setCountryCode(event.target.value)}
          required
        >
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            className={fieldClassName}
            name="firstName"
            placeholder={labels.firstName}
            required
          />
          <input
            className={fieldClassName}
            name="lastName"
            placeholder={labels.lastName}
            required
          />
        </div>

        <input
          className={fieldClassName}
          name="company"
          placeholder={`${labels.company} (optional)`}
        />

        <input
          className={fieldClassName}
          name="address1"
          placeholder={labels.address1}
          required
        />

        <input
          className={fieldClassName}
          name="address2"
          placeholder={`${labels.address2} (optional)`}
        />

        <div className="grid grid-cols-3 gap-2 sm:gap-3 [&_input]:min-w-0 [&_select]:min-w-0">
          <input className={fieldClassName} name="city" placeholder={labels.city} required />
          {stateOptions.length > 0 ? (
            <select
              aria-label={labels.stateOrProvince}
              className={fieldClassName}
              defaultValue=""
              name="stateOrProvince"
              required
            >
              <option disabled value="">
                {labels.stateOrProvince}
              </option>
              {stateOptions.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={fieldClassName}
              name="stateOrProvince"
              placeholder={labels.stateOrProvince}
            />
          )}
          <input
            className={fieldClassName}
            name="postalCode"
            placeholder={labels.postalCode}
          />
        </div>

        <input className={fieldClassName} name="phone" placeholder={labels.phone} type="tel" />

        {error ? <p className="text-sm text-[var(--error,hsl(var(--error)))]">{error}</p> : null}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button onClick={onClose} size="medium" type="button" variant="secondary">
            {labels.cancel}
          </Button>
          <Button loading={isPending} size="medium" type="submit" variant="primary">
            {labels.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
