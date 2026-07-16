'use server';

import { revalidateTag } from 'next/cache';

import { TAGS } from '~/client/tags';
import { pauseCustomerSubscription } from '~/lib/stripe/subscriptions';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function pauseSubscriptionAction(
  subscriptionId: string,
): Promise<{ success: boolean; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return { success: false, error: 'Unable to pause subscription' };
  }

  try {
    await pauseCustomerSubscription({
      stripeCustomerId,
      subscriptionId,
    });
    revalidateTag(TAGS.customer);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to pause subscription',
    };
  }
}
