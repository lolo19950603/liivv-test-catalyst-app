'use client';

interface BillingAddressFormProps {
  id: string;
  customerEmail: string;
  defaultValues: {
    firstName: string;
    lastName: string;
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
  'checkout-field__input w-full rounded-xl border border-[var(--contrast-100,hsl(var(--contrast-100)))] bg-[var(--background,hsl(var(--background)))] px-4 py-3 text-sm';

export function BillingAddressForm({
  id,
  customerEmail,
  defaultValues,
  labels,
}: BillingAddressFormProps) {
  return (
    <form className="checkout-billing-form grid items-start gap-4 @md:grid-cols-2" id={id}>
      <input name="email" type="hidden" value={customerEmail} />
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.firstName}</span>
        <input className={inputClassName} defaultValue={defaultValues.firstName} name="firstName" required />
      </div>
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.lastName}</span>
        <input className={inputClassName} defaultValue={defaultValues.lastName} name="lastName" required />
      </div>
      <div className="checkout-field grid gap-2 text-sm @md:col-span-2">
        <span className="checkout-field__label">{labels.company}</span>
        <input className={inputClassName} defaultValue={defaultValues.company} name="company" />
      </div>
      <div className="checkout-field grid gap-2 text-sm @md:col-span-2">
        <span className="checkout-field__label">{labels.address1}</span>
        <input className={inputClassName} defaultValue={defaultValues.address1} name="address1" required />
      </div>
      <div className="checkout-field grid gap-2 text-sm @md:col-span-2">
        <span className="checkout-field__label">{labels.address2}</span>
        <input className={inputClassName} defaultValue={defaultValues.address2} name="address2" />
      </div>
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.city}</span>
        <input className={inputClassName} defaultValue={defaultValues.city} name="city" required />
      </div>
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.stateOrProvince}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.stateOrProvince}
          name="stateOrProvince"
        />
      </div>
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.countryCode}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.countryCode}
          name="countryCode"
          required
        />
      </div>
      <div className="checkout-field grid gap-2 text-sm">
        <span className="checkout-field__label">{labels.postalCode}</span>
        <input
          className={inputClassName}
          defaultValue={defaultValues.postalCode}
          name="postalCode"
          required
        />
      </div>
      <div className="checkout-field grid gap-2 text-sm @md:col-span-2">
        <span className="checkout-field__label">{labels.phone}</span>
        <input className={inputClassName} defaultValue={defaultValues.phone} name="phone" type="tel" />
      </div>
    </form>
  );
}
