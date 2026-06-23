'use server';

import { revalidatePath } from 'next/cache';
import { getLocale } from 'next-intl/server';

import { retrySubscriptionPayment } from '~/lib/stripe/subscription-delivery-payment';

import { resolveStripeCustomerIdForAccount, syncSubscriptionShipmentsForAccount } from '../page-data';

export async function retrySubscriptionPaymentItem(
  subscriptionId: string,
): Promise<void> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return;
  }

  const result = await retrySubscriptionPayment({
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
