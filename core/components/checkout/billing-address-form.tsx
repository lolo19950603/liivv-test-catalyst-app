'use client';

interface BillingAddressFormProps {
  id: string;
  defaultValues: {
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
  labels: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    stateOrProvince: string;
    countryCode: string;
    postalCode: string;
    phone: string;
  };
}

const inputClassName =
  'w-full rounded-xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] px-4 py-3 text-sm';

export function BillingAddressForm({ id, defaultValues, labels }: BillingAddressFormProps) {
  return (
    <form className="grid gap-4 @md:grid-cols-2" id={id}>
      <label className="grid gap-2 text-sm">
        <span>{labels.firstName}</span>
        <input className={inputClassName} defaultValue={defaultValues.firstName} name="firstName" required />
      </label>
      <label className="grid gap-2 text-sm">
        <span>{labels.lastName}</span>
        <input className={inputClassName} defaultValue={defaultValues.lastName} name="lastName" required />
      </label>
      <label className="grid gap-2 text-sm @md:col-span-2">
        <span>{labels.email}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.email}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2 text-sm @md:col-span-2">
        <span>{labels.company}</span>
        <input className={inputClassName} defaultValue={defaultValues.company} name="company" />
      </label>
      <label className="grid gap-2 text-sm @md:col-span-2">
        <span>{labels.address1}</span>
        <input className={inputClassName} defaultValue={defaultValues.address1} name="address1" required />
      </label>
      <label className="grid gap-2 text-sm @md:col-span-2">
        <span>{labels.address2}</span>
        <input className={inputClassName} defaultValue={defaultValues.address2} name="address2" />
      </label>
      <label className="grid gap-2 text-sm">
        <span>{labels.city}</span>
        <input className={inputClassName} defaultValue={defaultValues.city} name="city" required />
      </label>
      <label className="grid gap-2 text-sm">
        <span>{labels.stateOrProvince}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.stateOrProvince}
          name="stateOrProvince"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span>{labels.countryCode}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.countryCode}
          name="countryCode"
          required
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span>{labels.postalCode}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.postalCode}
          name="postalCode"
          required
        />
      </label>
      <label className="grid gap-2 text-sm @md:col-span-2">
        <span>{labels.phone}</span>
        <input className={inputClassName} defaultValue={defaultValues.phone} name="phone" type="tel" />
      </label>
    </form>
  );
}
