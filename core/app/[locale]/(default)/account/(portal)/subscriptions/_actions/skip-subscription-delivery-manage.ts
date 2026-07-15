'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getLocale } from 'next-intl/server';

import { TAGS } from '~/client/tags';
import { skipSubscriptionDelivery } from '~/lib/stripe/subscription-delivery-payment';

import { resolveStripeCustomerIdForAccount, syncSubscriptionShipmentsForAccount } from '../page-data';

export async function skipSubscriptionDeliveryManageAction(
  subscriptionId: string,
): Promise<{ success: boolean; error?: string; mode?: 'skipped' }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return { success: false, error: 'Unable to skip delivery' };
  }

  const result = await skipSubscriptionDelivery({
    subscriptionId,
    stripeCustomerId,
  });

  if (!result.ok) {
    return {
      success: false,
      error:
        result.reason === 'not_found'
          ? 'Subscription not found'
          : 'Unable to skip delivery for this subscription',
    };
  }

  await syncSubscriptionShipmentsForAccount();
  revalidateTag(TAGS.customer);

  const locale = await getLocale();
  revalidatePath(`/${locale}/account/subscriptions`);

  return { success: true, mode: 'skipped' };
}
