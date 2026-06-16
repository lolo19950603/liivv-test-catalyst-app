'use server';

import { getLocale } from 'next-intl/server';

import { getShippingCountries } from '~/app/[locale]/(default)/cart/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { initializeCheckoutPayment, syncCheckoutBillingForStripeSession } from '~/lib/checkout/payment';
import { resolveStateOrProvinceCode } from '~/lib/checkout/resolve-state-or-province';
import type { CheckoutAddressSnapshot } from '~/lib/checkout/types';
import { getCartId } from '~/lib/cart';
import { isStripeConfigured } from '~/lib/stripe/client';

const CheckoutCustomerQuery = graphql(`
  query CheckoutCustomerQuery {
    customer {
      entityId
      email
      firstName
      lastName
    }
  }
`);

async function buildStatesByCountry() {
  const shippingCountries = await getShippingCountries();
  const blacklistedUSStates = new Set([
    'Armed Forces Africa',
    'Armed Forces Canada',
    'Armed Forces Middle East',
  ]);

  return shippingCountries.map((country) => ({
    country: country.code,
    states: country.statesOrProvinces
      .filter((state) => country.code !== 'US' || !blacklistedUSStates.has(state.name))
      .map((state) => ({
        value: state.abbreviation,
        label: state.name,
      })),
  }));
}

function buildBillingAddressSnapshot(
  input: {
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
  },
  statesByCountry: Array<{ country: string; states: Array<{ value: string; label: string }> }>,
): CheckoutAddressSnapshot {
  const resolvedState = resolveStateOrProvinceCode(
    input.countryCode,
    input.stateOrProvince,
    statesByCountry,
  );

  return {
    ...input,
    stateOrProvince: resolvedState.stateOrProvince ?? input.stateOrProvince,
    stateOrProvinceCode: resolvedState.stateOrProvinceCode,
  };
}

async function initializeFromBillingAddress(billingAddress: CheckoutAddressSnapshot) {
  const { cartId, customer } = await getCheckoutCustomerContext();

  return initializeCheckoutPayment({
    cartId,
    bigcommerceCustomerId: customer.entityId,
    email: billingAddress.email,
    name: [billingAddress.firstName, billingAddress.lastName].filter(Boolean).join(' '),
    billingAddress,
  });
}

async function parseBillingAddressFromFormData(formData: FormData) {
  const statesByCountry = await buildStatesByCountry();

  return buildBillingAddressSnapshot(
    {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      email: String(formData.get('email') ?? ''),
      company: String(formData.get('company') ?? '') || undefined,
      address1: String(formData.get('address1') ?? ''),
      address2: String(formData.get('address2') ?? '') || undefined,
      city: String(formData.get('city') ?? ''),
      stateOrProvince: String(formData.get('stateOrProvince') ?? '') || undefined,
      countryCode: String(formData.get('countryCode') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      phone: String(formData.get('phone') ?? '') || undefined,
    },
    statesByCountry,
  );
}

async function getCheckoutCustomerContext() {
  const locale = await getLocale();

  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: '/login?redirectTo=/checkout/', locale });
  }

  const cartId = await getCartId();

  if (!cartId) {
    redirect({ href: '/cart/', locale });
  }

  const customerResponse = await client.fetch({
    document: CheckoutCustomerQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const customer = customerResponse.data.customer;

  if (!customer) {
    throw new Error('Customer not found');
  }

  return { cartId, customer };
}

export async function initializePayment(formData: FormData) {
  const billingAddress = await parseBillingAddressFromFormData(formData);

  return initializeFromBillingAddress(billingAddress);
}

export async function prepareOrderConfirmation(formData: FormData, stripeSessionId: string) {
  const billingAddress = await parseBillingAddressFromFormData(formData);
  const { cartId, customer } = await getCheckoutCustomerContext();

  return syncCheckoutBillingForStripeSession({
    cartId,
    bigcommerceCustomerId: customer.entityId,
    billingAddress,
    stripeSessionId,
  });
}

export async function prepareCheckoutPayment(billingDefaults: {
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
}) {
  const statesByCountry = await buildStatesByCountry();
  const billingAddress = buildBillingAddressSnapshot(billingDefaults, statesByCountry);

  return initializeFromBillingAddress(billingAddress);
}
