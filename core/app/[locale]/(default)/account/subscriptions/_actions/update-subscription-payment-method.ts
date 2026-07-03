'use server';

import { revalidateTag } from 'next/cache';

import { TAGS } from '~/client/tags';
import { updateSubscriptionPaymentMethod } from '~/lib/stripe/subscriptions';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function updateSubscriptionPaymentMethodAction(
  subscriptionId: string,
  paymentMethodId: string,
): Promise<{ success: boolean; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId || !paymentMethodId) {
    return { success: false, error: 'Unable to update payment method' };
  }

  try {
    await updateSubscriptionPaymentMethod({
      stripeCustomerId,
      subscriptionId,
      paymentMethodId,
    });
    revalidateTag(TAGS.customer);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update payment method',
    };
  }
}
