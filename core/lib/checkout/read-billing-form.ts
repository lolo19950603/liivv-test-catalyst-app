import type { PaymentMethodCreateParams } from '@stripe/stripe-js';

export type StripeConfirmBillingDetails = NonNullable<
  PaymentMethodCreateParams['billing_details']
>;

export function readBillingDetailsFromForm(
  billingFormId: string,
): StripeConfirmBillingDetails | null {
  const form = document.getElementById(billingFormId) as HTMLFormElement | null;

  if (!form) {
    return null;
  }

  const formData = new FormData(form);
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');

  const address = {
    line1: String(formData.get('address1') ?? '').trim() || undefined,
    line2: String(formData.get('address2') ?? '').trim() || undefined,
    city: String(formData.get('city') ?? '').trim() || undefined,
    state: String(formData.get('stateOrProvince') ?? '').trim() || undefined,
    postal_code: String(formData.get('postalCode') ?? '').trim() || undefined,
    country: String(formData.get('countryCode') ?? '').trim() || undefined,
  };

  const hasAddress = Object.values(address).some(Boolean);

  return {
    name: name || undefined,
    email: String(formData.get('email') ?? '').trim() || undefined,
    phone: String(formData.get('phone') ?? '').trim() || undefined,
    address: hasAddress ? address : undefined,
  };
}
