'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getLocale } from 'next-intl/server';

import { TAGS } from '~/client/tags';
import { updateSubscriptionFrequency } from '~/lib/stripe/subscriptions';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function updateSubscriptionFrequencyAction(
  subscriptionId: string,
  intervalKey: string,
): Promise<{ success: boolean; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId || !intervalKey) {
    return { success: false, error: 'Unable to update frequency' };
  }

  try {
    await updateSubscriptionFrequency({
      stripeCustomerId,
      subscriptionId,
      intervalKey,
    });
    revalidateTag(TAGS.customer);

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/subscriptions`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update frequency',
    };
  }
}
