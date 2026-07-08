'use server';

import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';

import { skipSubscriptionDelivery } from '~/lib/stripe/subscription-delivery-payment';

import { resolveStripeCustomerIdForAccount, syncSubscriptionShipmentsForAccount } from '../page-data';

export async function skipSubscriptionDeliveryItem(
  subscriptionId: string,
): Promise<void> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return;
  }

  const result = await skipSubscriptionDelivery({
    subscriptionId,
    stripeCustomerId,
  });

  if (!result.ok) {
    return;
  }

  await syncSubscriptionShipmentsForAccount();

  const locale = await getLocale();
  revalidatePath(`/${locale}/account/subscriptions`);
}
