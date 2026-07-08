'use server';

import { createCustomerSetupIntent } from '~/lib/stripe/payment-methods';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function createAddPaymentMethodSetupIntentAction(): Promise<
  { clientSecret: string } | { error: string }
> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId) {
    return { error: 'Unable to add payment method' };
  }

  try {
    const clientSecret = await createCustomerSetupIntent(stripeCustomerId);

    return { clientSecret };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to add payment method',
    };
  }
}
