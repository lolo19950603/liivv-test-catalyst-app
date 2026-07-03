'use server';

import { revalidateTag } from 'next/cache';

import { TAGS } from '~/client/tags';
import { cancelCustomerSubscription } from '~/lib/stripe/subscriptions';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function cancelSubscriptionAction(
  subscriptionId: string,
  cancellationReason: string,
): Promise<{ success: boolean; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId || !cancellationReason.trim()) {
    return { success: false, error: 'Unable to cancel subscription' };
  }

  try {
    await cancelCustomerSubscription({
      stripeCustomerId,
      subscriptionId,
      cancellationReason: cancellationReason.trim(),
    });
    revalidateTag(TAGS.customer);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to cancel subscription',
    };
  }
}
