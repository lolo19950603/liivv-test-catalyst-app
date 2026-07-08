'use server';

import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { createSubscriptionBillingPortalSession } from '~/lib/stripe/subscriptions';
import { buildAppUrl } from '~/lib/stripe/config';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function openSubscriptionPortal(subscriptionId: string): Promise<void> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return;
  }

  const locale = await getLocale();
  const returnUrl = buildAppUrl('/account/subscriptions/', locale);
  const portalUrl = await createSubscriptionBillingPortalSession({
    stripeCustomerId,
    subscriptionId,
    returnUrl,
  });

  redirect(portalUrl);
}
