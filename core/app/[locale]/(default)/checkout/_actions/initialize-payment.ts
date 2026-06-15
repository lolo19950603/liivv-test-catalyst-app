'use server';

import { getLocale } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { redirect } from '~/i18n/routing';
import { initializeCheckoutPayment } from '~/lib/checkout/payment';
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

export async function initializePayment(formData: FormData) {
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

  const billingAddress: CheckoutAddressSnapshot = {
    firstName: String(formData.get('firstName') ?? customer.firstName ?? ''),
    lastName: String(formData.get('lastName') ?? customer.lastName ?? ''),
    email: String(formData.get('email') ?? customer.email ?? ''),
    company: String(formData.get('company') ?? '') || undefined,
    address1: String(formData.get('address1') ?? ''),
    address2: String(formData.get('address2') ?? '') || undefined,
    city: String(formData.get('city') ?? ''),
    stateOrProvince: String(formData.get('stateOrProvince') ?? '') || undefined,
    stateOrProvinceCode: String(formData.get('stateOrProvince') ?? '') || undefined,
    countryCode: String(formData.get('countryCode') ?? ''),
    postalCode: String(formData.get('postalCode') ?? ''),
    phone: String(formData.get('phone') ?? '') || undefined,
  };

  return initializeCheckoutPayment({
    cartId,
    bigcommerceCustomerId: customer.entityId,
    email: billingAddress.email,
    name: [billingAddress.firstName, billingAddress.lastName].filter(Boolean).join(' '),
    billingAddress,
  });
}
