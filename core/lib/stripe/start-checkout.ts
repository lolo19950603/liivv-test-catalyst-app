import 'server-only';

import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { redirect } from '~/i18n/routing';

import { isStripeConfigured } from './client';
import { buildAppUrl } from './config';
import { getOrCreateStripeCustomer } from './customers';
import { parseSubscriptionStartDateInput } from './subscription-start-date';
import { createSubscriptionCheckoutSession } from './subscriptions';

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

const schema = z.object({
  priceId: z.string().min(1),
});

export async function getCheckoutCustomer() {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return null;
  }

  const response = await client.fetch({
    document: CheckoutCustomerQuery,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
  });

  return response.data.customer;
}

export async function startSubscriptionCheckoutFromForm(
  formData: FormData,
  {
    loginRedirectTo,
    successPath,
    cancelPath,
  }: {
    loginRedirectTo: string;
    successPath: string;
    cancelPath: string;
  },
) {
  const locale = await getLocale();
  const t = await getTranslations('Subscribe');

  if (!isStripeConfigured()) {
    throw new Error(t('errors.notConfigured'));
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: `/login?redirectTo=${encodeURIComponent(loginRedirectTo)}`, locale });
  }

  const parsed = schema.safeParse({
    priceId: formData.get('priceId'),
  });

  if (!parsed.success) {
    throw new Error(t('errors.invalidPlan'));
  }

  const customer = await getCheckoutCustomer();

  if (!customer) {
    throw new Error(t('errors.customerNotFound'));
  }

  const stripeCustomerId = await getOrCreateStripeCustomer({
    bigcommerceCustomerId: customer.entityId,
    email: customer.email,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(' '),
  });

  const billingCycleAnchor = parseSubscriptionStartDateInput(
    formData.get('subscriptionStartDate'),
  );

  const checkoutUrl = await createSubscriptionCheckoutSession({
    stripeCustomerId,
    priceId: parsed.data.priceId,
    bigcommerceCustomerId: customer.entityId,
    successUrl: `${buildAppUrl(successPath, locale)}?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: buildAppUrl(cancelPath, locale),
    billingCycleAnchor,
  });

  redirect({ href: checkoutUrl, locale });
}
