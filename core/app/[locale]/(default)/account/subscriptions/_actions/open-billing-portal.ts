'use server';

import { getLocale, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { redirect } from '~/i18n/routing';
import {
  buildAppUrl,
  createBillingPortalSession,
  isStripeConfigured,
  resolveStripeCustomerId,
} from '~/lib/stripe';

import { getSubscriptionsCustomer } from '../page-data';

export async function openBillingPortal() {
  const locale = await getLocale();
  const t = await getTranslations('Account.Subscriptions');

  if (!isStripeConfigured()) {
    throw new Error(t('errors.notConfigured'));
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    redirect({ href: '/login?redirectTo=/account/subscriptions/', locale });
  }

  const customer = await getSubscriptionsCustomer();

  if (!customer) {
    throw new Error(t('errors.customerNotFound'));
  }

  const stripeCustomerId = await resolveStripeCustomerId(customer.entityId);

  if (!stripeCustomerId) {
    throw new Error(t('errors.noStripeCustomer'));
  }

  const portalUrl = await createBillingPortalSession({
    stripeCustomerId,
    returnUrl: buildAppUrl('/account/subscriptions/', locale),
  });

  redirect({ href: portalUrl, locale });
}
