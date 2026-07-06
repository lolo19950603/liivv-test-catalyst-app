import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { findStripeCustomerIdByEmail, resolveStripeCustomerId } from '~/lib/stripe/customers';
import { isStripeConfigured } from '~/lib/stripe/client';
import { getCustomerSubscriptions } from '~/lib/stripe/subscriptions';

const DashboardCustomerQuery = graphql(`
  query DashboardCustomerQuery {
    customer {
      entityId
      firstName
      lastName
      email
    }
  }
`);

export const getDashboardCustomer = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return null;
  }

  const response = await client.fetch({
    document: DashboardCustomerQuery,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
    customerAccessToken,
  });

  return response.data.customer;
});

function formatSubscriptionDate(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp * 1000));
}

export const getDashboardNextSubscriptionDate = cache(
  async (locale: string): Promise<string | null> => {
    if (!isStripeConfigured()) {
      return null;
    }

    const customerAccessToken = await getSessionCustomerAccessToken();

    if (!customerAccessToken) {
      return null;
    }

    const response = await client.fetch({
      document: DashboardCustomerQuery,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
      customerAccessToken,
    });

    const customer = response.data.customer;

    if (!customer) {
      return null;
    }

    let stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

    if (!stripeCustomerId) {
      stripeCustomerId = await findStripeCustomerIdByEmail(customer.email);
    }

    if (!stripeCustomerId) {
      return null;
    }

    const subscriptions = await getCustomerSubscriptions(stripeCustomerId);
    const now = Math.floor(Date.now() / 1000);
    const upcoming = subscriptions
      .filter(
        (subscription) =>
          (subscription.status === 'active' || subscription.status === 'trialing') &&
          subscription.currentPeriodEnd > now,
      )
      .map((subscription) => subscription.currentPeriodEnd)
      .sort((left, right) => left - right);

    const nextTimestamp = upcoming[0];

    if (nextTimestamp == null) {
      return null;
    }

    return formatSubscriptionDate(nextTimestamp, locale);
  },
);
