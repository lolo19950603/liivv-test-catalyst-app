import 'server-only';

import { revalidateTag } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';

import type { CheckoutAddressSnapshot } from './types';

const AddCheckoutBillingAddressMutation = graphql(`
  mutation AddCheckoutBillingAddressMutation($input: AddCheckoutBillingAddressInput!) {
    checkout {
      addCheckoutBillingAddress(input: $input) {
        checkout {
          entityId
          billingAddress {
            firstName
            lastName
            email
            company
            address1
            address2
            city
            stateOrProvince
            stateOrProvinceCode
            countryCode
            postalCode
            phone
          }
        }
      }
    }
  }
`);

export async function addCheckoutBillingAddress({
  checkoutEntityId,
  address,
}: {
  checkoutEntityId: string;
  address: CheckoutAddressSnapshot;
}) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const response = await client.fetch({
    document: AddCheckoutBillingAddressMutation,
    variables: {
      input: {
        checkoutEntityId,
        data: {
          address: {
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            company: address.company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            stateOrProvince: address.stateOrProvince,
            stateOrProvinceCode:
              address.stateOrProvinceCode ??
              (address.stateOrProvince && address.stateOrProvince.length <= 3
                ? address.stateOrProvince
                : undefined),
            countryCode: address.countryCode,
            postalCode: address.postalCode,
            phone: address.phone,
            shouldSaveAddress: false,
          },
        },
      },
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  revalidateTag(TAGS.checkout, { expire: 0 });

  return response.data.checkout.addCheckoutBillingAddress?.checkout;
}
