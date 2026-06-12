import 'server-only';

import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import {
  findStripeCustomerIdByEmail,
  getCustomerSubscriptions,
  isStripeConfigured,
  resolveStripeCustomerId,
  type CustomerSubscription,
} from '~/lib/stripe';
import { storeStripeCustomerId } from '~/lib/stripe/storage';

const SubscriptionsCustomerQuery = graphql(`
  query SubscriptionsCustomerQuery {
    customer {
      entityId
      email
      firstName
      lastName
    }
  }
`);

export const getSubscriptionsCustomer = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return null;
  }

  const response = await client.fetch({
    document: SubscriptionsCustomerQuery,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
  });

  return response.data.customer;
});

export const getAccountSubscriptions = cache(async (): Promise<CustomerSubscription[]> => {
  if (!isStripeConfigured()) {
    return [];
  }

  const customer = await getSubscriptionsCustomer();

  if (!customer) {
    return [];
  }

  let stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  try {
    if (!stripeCustomerId) {
      stripeCustomerId = await findStripeCustomerIdByEmail(customer.email);

      if (stripeCustomerId) {
        await storeStripeCustomerId(customer.entityId, stripeCustomerId);
      }
    }

    if (!stripeCustomerId) {
      return [];
    }

    return await getCustomerSubscriptions(stripeCustomerId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load Stripe subscriptions:', error);

    return [];
  }
});
