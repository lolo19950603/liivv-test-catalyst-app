import 'server-only';

import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { isStripeConfigured } from '~/lib/stripe/client';
import {
  findStripeCustomerIdByEmail,
  resolveStripeCustomerId,
} from '~/lib/stripe/customers';
import { getCustomerSubscriptions } from '~/lib/stripe/subscriptions';

const SubscriptionsCustomerQuery = graphql(`
  query SubscriptionsCustomerQuery {
    customer {
      entityId
      email
    }
  }
`);

export type SubscriptionsPageResult =
  | {
      kind: 'ready';
      stripeCustomerId: string;
      subscriptions: Awaited<ReturnType<typeof getCustomerSubscriptions>>;
    }
  | { kind: 'not-configured' }
  | { kind: 'customer-not-found' }
  | { kind: 'no-stripe-customer' };

export const getSubscriptionsPageData = cache(async (): Promise<SubscriptionsPageResult> => {
  if (!isStripeConfigured()) {
    return { kind: 'not-configured' };
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { kind: 'customer-not-found' };
  }

  const response = await client.fetch({
    document: SubscriptionsCustomerQuery,
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: { tags: [TAGS.customer] },
    },
  });

  const customer = response.data.customer;

  if (!customer) {
    return { kind: 'customer-not-found' };
  }

  let stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  if (!stripeCustomerId) {
    stripeCustomerId = await findStripeCustomerIdByEmail(customer.email);
  }

  if (!stripeCustomerId) {
    return { kind: 'no-stripe-customer' };
  }

  const subscriptions = await getCustomerSubscriptions(stripeCustomerId);

  return {
    kind: 'ready',
    stripeCustomerId,
    subscriptions,
  };
});

export async function resolveStripeCustomerIdForAccount(): Promise<string | null> {
  const data = await getSubscriptionsPageData();

  if (data.kind !== 'ready') {
    return null;
  }

  return data.stripeCustomerId;
}
