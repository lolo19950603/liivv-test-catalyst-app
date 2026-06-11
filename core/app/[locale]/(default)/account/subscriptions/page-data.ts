import 'server-only';

import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import {
  getCustomerSubscriptions,
  isStripeConfigured,
  resolveStripeCustomerId,
  type CustomerSubscription,
} from '~/lib/stripe';

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

  const stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  if (!stripeCustomerId) {
    return [];
  }

  return getCustomerSubscriptions(stripeCustomerId);
});
