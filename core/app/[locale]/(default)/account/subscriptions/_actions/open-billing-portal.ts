'use server';

import { getLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { createBillingPortalSession } from '~/lib/stripe/subscriptions';
import { buildAppUrl } from '~/lib/stripe/config';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function openBillingPortal(): Promise<void> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId) {
    return;
  }

  const locale = await getLocale();
  const returnUrl = buildAppUrl('/account/subscriptions/', locale);
  const portalUrl = await createBillingPortalSession({
    stripeCustomerId,
    returnUrl,
  });

  redirect(portalUrl);
}
