import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const SessionCustomerQuery = graphql(`
  query SessionCustomerQuery {
    customer {
      entityId
      firstName
      lastName
      email
    }
  }
`);

export type OnboardingCustomer = {
  entityId: number;
  firstName: string;
  lastName: string;
  email: string;
};

export const getOnboardingCustomer = cache(async (): Promise<OnboardingCustomer | null> => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return null;
  }

  const response = await client.fetch({
    document: SessionCustomerQuery,
    customerAccessToken,
    fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
  });

  const customer = response.data.customer;

  if (!customer) {
    return null;
  }

  return {
    entityId: customer.entityId,
    firstName: customer.firstName?.trim() ?? '',
    lastName: customer.lastName?.trim() ?? '',
    email: customer.email?.trim() ?? '',
  };
});
