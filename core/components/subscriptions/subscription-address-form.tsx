'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import type { SaveCheckoutAddressInput } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';

const fieldClassName = 'subscription-manage-modal__address-input';

interface CountryOption {
  label: string;
  value: string;
}

interface StateOption {
  country: string;
  states: Array<{ label: string; value: string }>;
}

export interface SubscriptionAddressFormLabels {
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
  saveLabel: string;
}

interface SubscriptionAddressFormProps {
  countries: CountryOption[];
  states: StateOption[];
  labels: SubscriptionAddressFormLabels;
  defaultCountryCode: string;
  onSave: (input: SaveCheckoutAddressInput) => Promise<{ success: boolean; error?: string }>;
}

export function SubscriptionAddressForm({
  countries,
  states,
  labels,
  defaultCountryCode,
  onSave,
}: SubscriptionAddressFormProps) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stateOptions = states.find((entry) => entry.country === countryCode)?.states ?? [];

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

      if (!result.success) {
        setError(result.error ?? 'Unable to save address');
      }
    });
  };

  return (
    <form className="subscription-manage-modal__address-form" onSubmit={handleSubmit}>
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

      <div className="subscription-manage-modal__address-grid">
        <input className={fieldClassName} name="firstName" placeholder={labels.firstName} required />
        <input className={fieldClassName} name="lastName" placeholder={labels.lastName} required />
      </div>

      <input
        className={fieldClassName}
        name="company"
        placeholder={`${labels.company} (optional)`}
      />

      <input className={fieldClassName} name="address1" placeholder={labels.address1} required />

      <input
        className={fieldClassName}
        name="address2"
        placeholder={`${labels.address2} (optional)`}
      />

      <div className="subscription-manage-modal__address-grid subscription-manage-modal__address-grid--three">
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
        <input className={fieldClassName} name="postalCode" placeholder={labels.postalCode} />
      </div>

      <input className={fieldClassName} name="phone" placeholder={labels.phone} type="tel" />

      {error ? <p className="subscription-manage-modal__error">{error}</p> : null}

      <Button className="w-full justify-center" loading={isPending} size="medium" type="submit" variant="primary">
        {labels.saveLabel}
      </Button>
    </form>
  );
}
