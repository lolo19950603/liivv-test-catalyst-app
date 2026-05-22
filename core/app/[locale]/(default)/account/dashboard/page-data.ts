import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

const DashboardCustomerQuery = graphql(`
  query DashboardCustomerQuery {
    customer {
      firstName
      lastName
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
