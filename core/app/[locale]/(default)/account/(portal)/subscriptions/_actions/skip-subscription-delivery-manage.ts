'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getLocale } from 'next-intl/server';

import { TAGS } from '~/client/tags';
import { scheduleOrSkipSubscriptionDelivery } from '~/lib/stripe/subscription-delivery-payment';

import { resolveStripeCustomerIdForAccount, syncSubscriptionShipmentsForAccount } from '../page-data';

export async function skipSubscriptionDeliveryManageAction(
  subscriptionId: string,
  shipmentDayKey?: string,
): Promise<{ success: boolean; error?: string; mode?: 'skipped' | 'scheduled' | 'already_scheduled' }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return { success: false, error: 'Unable to skip delivery' };
  }

  if (!shipmentDayKey) {
    return { success: false, error: 'Choose a delivery date to skip' };
  }

  const result = await scheduleOrSkipSubscriptionDelivery({
    subscriptionId,
    stripeCustomerId,
    shipmentDayKey,
  });

  if (!result.ok) {
    return {
      success: false,
      error:
        result.reason === 'not_found'
          ? 'Subscription not found'
          : result.reason === 'unknown_date'
            ? 'That delivery date is not available to skip'
            : 'Unable to skip delivery for this subscription',
    };
  }

  await syncSubscriptionShipmentsForAccount();
  revalidateTag(TAGS.customer);

  const locale = await getLocale();
  revalidatePath(`/${locale}/account/subscriptions`);

  return { success: true, mode: result.mode };
}
