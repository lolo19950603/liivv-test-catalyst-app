import 'server-only';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';

const UpdateCustomerMutation = graphql(`
  mutation OnboardingUpdateCustomerMutation($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          firstName
          lastName
        }
        errors {
          __typename
          ... on UnexpectedUpdateCustomerError {
            message
          }
          ... on ValidationError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

const AddCustomerAddressMutation = graphql(`
  mutation OnboardingAddCustomerAddressMutation($input: AddCustomerAddressInput!) {
    customer {
      addCustomerAddress(input: $input) {
        errors {
          __typename
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
        }
      }
    }
  }
`);

const UpdateCustomerAddressMutation = graphql(`
  mutation OnboardingUpdateCustomerAddressMutation($input: UpdateCustomerAddressInput!) {
    customer {
      updateCustomerAddress(input: $input) {
        errors {
          __typename
          ... on AddressDoesNotExistError {
            message
          }
          ... on CustomerAddressUpdateError {
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
        }
      }
    }
  }
`);

export type OnboardingProfileInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  stateOrProvince?: string;
  countryCode?: string;
};

export async function syncOnboardingProfileToBigCommerce(
  input: OnboardingProfileInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { ok: false, message: 'Please sign in to continue.' };
  }

  const updateResponse = await client.fetch({
    document: UpdateCustomerMutation,
    customerAccessToken,
    variables: {
      input: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
    },
    fetchOptions: { cache: 'no-store' },
  });

  const updateErrors = updateResponse.data.customer.updateCustomer.errors;

  if (updateErrors.length > 0) {
    const firstError = updateErrors[0];

    return {
      ok: false,
      message:
        firstError && 'message' in firstError && firstError.message
          ? firstError.message
          : 'Could not update your name.',
    };
  }

  const addressData = await getCustomerAddresses({ limit: 1 });
  const existingAddress = addressData?.addresses[0];
  const countryCode = input.countryCode?.trim() || existingAddress?.countryCode || 'CA';
  const stateOrProvince =
    input.stateOrProvince?.trim() || existingAddress?.stateOrProvince || 'ON';

  const addressPayload = {
    firstName: input.firstName,
    lastName: input.lastName,
    address1: input.address1,
    address2: input.address2 || '',
    city: input.city,
    postalCode: input.postalCode,
    stateOrProvince,
    countryCode,
    phone: input.phone || existingAddress?.phone || '',
    formFields: { checkboxes: [], dates: [], multilineTexts: [], numbers: [], passwords: [], texts: [], multipleChoices: [] },
  };

  if (existingAddress?.entityId) {
    const response = await client.fetch({
      document: UpdateCustomerAddressMutation,
      customerAccessToken,
      variables: {
        input: {
          addressEntityId: existingAddress.entityId,
          data: addressPayload,
        },
      },
      fetchOptions: { cache: 'no-store' },
    });

    const errors = response.data.customer.updateCustomerAddress.errors;

    if (errors.length > 0) {
      return { ok: false, message: errors[0]?.message ?? 'Could not update your address.' };
    }
  } else {
    const response = await client.fetch({
      document: AddCustomerAddressMutation,
      customerAccessToken,
      variables: {
        input: addressPayload,
      },
      fetchOptions: { cache: 'no-store' },
    });

    const errors = response.data.customer.addCustomerAddress.errors;

    if (errors.length > 0) {
      return { ok: false, message: errors[0]?.message ?? 'Could not save your address.' };
    }
  }

  const { revalidateTag } = await import('next/cache');

  revalidateTag(TAGS.customer, { expire: 0 });

  return { ok: true };
}
