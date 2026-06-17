'use server';

import { BigCommerceAPIError, BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { resolveShippingStateOrProvince } from '~/lib/checkout/resolve-shipping-state';

const AddCustomerAddressMutation = graphql(`
  mutation CheckoutSaveAddressMutation($input: AddCustomerAddressInput!) {
    customer {
      addCustomerAddress(input: $input) {
        errors {
          ... on CustomerAddressCreationError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
          ... on ValidationError {
            message
          }
        }
        address {
          entityId
          firstName
          lastName
          address1
          address2
          city
          stateOrProvince
          countryCode
          postalCode
          phone
          company
        }
      }
    }
  }
`);

const saveCheckoutAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().optional(),
  city: z.string().min(1),
  company: z.string().optional(),
  countryCode: z.string().min(1),
  stateOrProvince: z.string().optional(),
  phone: z.string().optional(),
  postalCode: z.string().optional(),
});

export type SaveCheckoutAddressInput = z.infer<typeof saveCheckoutAddressSchema>;

export type SaveCheckoutAddressResult =
  | {
      success: true;
      address: {
        id: string;
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        stateOrProvince?: string;
        countryCode: string;
        postalCode?: string;
        phone?: string;
        company?: string;
      };
    }
  | { success: false; error: string };

export async function saveCheckoutAddress(
  input: SaveCheckoutAddressInput,
): Promise<SaveCheckoutAddressResult> {
  const t = await getTranslations('Checkout.address');
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { success: false, error: t('notLoggedIn') };
  }

  const parsed = saveCheckoutAddressSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: t('invalid') };
  }

  try {
    const stateOrProvince = await resolveShippingStateOrProvince(
      parsed.data.countryCode,
      parsed.data.stateOrProvince,
    );

    const response = await client.fetch({
      document: AddCustomerAddressMutation,
      customerAccessToken,
      fetchOptions: { cache: 'no-store' },
      variables: {
        input: {
          ...parsed.data,
          stateOrProvince,
          formFields: {
            checkboxes: [],
            multipleChoices: [],
            numbers: [],
            dates: [],
            passwords: [],
            multilineTexts: [],
            texts: [],
          },
        },
      },
    });

    const result = response.data.customer.addCustomerAddress;

    if (result.errors.length > 0) {
      return { success: false, error: result.errors.map((error) => error.message).join(' ') };
    }

    const address = result.address;

    if (!address) {
      return { success: false, error: t('saveFailed') };
    }

    revalidateTag(TAGS.customer, { expire: 0 });

    return {
      success: true,
      address: {
        id: String(address.entityId),
        firstName: address.firstName,
        lastName: address.lastName,
        address1: address.address1,
        address2: address.address2 ?? undefined,
        city: address.city,
        stateOrProvince: address.stateOrProvince ?? undefined,
        countryCode: address.countryCode,
        postalCode: address.postalCode ?? undefined,
        phone: address.phone ?? undefined,
        company: address.company ?? undefined,
      },
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return { success: false, error: error.errors.map(({ message }) => message).join(' ') };
    }

    if (error instanceof BigCommerceAPIError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: t('saveFailed') };
  }
}
