import 'server-only';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { signIn } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { getCartId } from '~/lib/cart';
import { applyPendingGuestHealthProfile } from '~/lib/onboarding/apply-pending-guest-health-profile';
import { clearPendingGuestHealthProfile } from '~/lib/onboarding/pending-guest-health-profile';

const RegisterCustomerMutation = graphql(`
  mutation RegisterCustomerMutation(
    $input: RegisterCustomerInput!
    $reCaptchaV2: ReCaptchaV2Input
  ) {
    customer {
      registerCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
        customer {
          firstName
          lastName
        }
        errors {
          ... on EmailAlreadyInUseError {
            message
          }
          ... on AccountCreationDisabledError {
            message
          }
          ... on CustomerRegistrationError {
            message
          }
          ... on ValidationError {
            message
          }
        }
      }
    }
  }
`);

export interface CreateCustomerAccountInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  recaptchaToken?: string;
}

export async function createCustomerAccount(
  credentials: CreateCustomerAccountInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const t = await getTranslations('Auth.Register');
    const cartId = await getCartId();

    try {
      const response = await client.fetch({
        document: RegisterCustomerMutation,
        variables: {
          input: {
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            email: credentials.email,
            password: credentials.password,
          },
          reCaptchaV2:
            credentials.recaptchaToken != null && credentials.recaptchaToken !== ''
              ? { token: credentials.recaptchaToken }
              : undefined,
        },
        fetchOptions: { cache: 'no-store' },
      });

      const result = response.data.customer.registerCustomer;

      if (result.errors.length > 0) {
        return {
          ok: false,
          error: result.errors.map((error) => error.message).join(' ') || t('somethingWentWrong'),
        };
      }

      await signIn('password', {
        email: credentials.email,
        password: credentials.password,
        cartId,
        redirect: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      if (error instanceof BigCommerceGQLError) {
        return {
          ok: false,
          error: error.errors.map(({ message }) => message).join(' ') || t('somethingWentWrong'),
        };
      }

      if (error instanceof Error) {
        return { ok: false, error: error.message };
      }

      return { ok: false, error: t('somethingWentWrong') };
    }

    const customer = await getOnboardingCustomer();

    if (customer) {
      await applyPendingGuestHealthProfile(customer);
    }

    return { ok: true };
  } finally {
    await clearPendingGuestHealthProfile();
  }
}
