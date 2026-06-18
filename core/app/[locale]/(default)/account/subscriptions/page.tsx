import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { SubscriptionList } from '@/vibes/soul/sections/subscription-list';
import { transformCustomerSubscriptions } from '~/lib/stripe/transform-customer-subscriptions';

import { openBillingPortal } from './_actions/open-billing-portal';
import { getSubscriptionsPageData } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account.Subscriptions' });

  return {
    title: t('title'),
  };
}

export default async function SubscriptionsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Subscriptions');
  const format = await getFormatter();
  const data = await getSubscriptionsPageData();

  if (data.kind === 'not-configured') {
    return (
      <SubscriptionList message={t('errors.notConfigured')} subscriptions={[]} title={t('title')} />
    );
  }

  if (data.kind === 'customer-not-found') {
    return (
      <SubscriptionList
        message={t('errors.customerNotFound')}
        subscriptions={[]}
        title={t('title')}
      />
    );
  }

  if (data.kind === 'no-stripe-customer') {
    return (
      <SubscriptionList
        emptyStateActionHref="/"
        emptyStateActionLabel={t('browsePlans')}
        emptyStateDescription={t('errors.noStripeCustomer')}
        emptyStateTitle={t('empty.title')}
        subscriptions={[]}
        title={t('title')}
      />
    );
  }

  const subscriptions = transformCustomerSubscriptions(data.subscriptions, t, format);

  return (
    <SubscriptionList
      emptyStateActionHref="/"
      emptyStateActionLabel={t('browsePlans')}
      emptyStateDescription={t('empty.description')}
      emptyStateTitle={t('empty.title')}
      manageBillingAction={openBillingPortal}
      manageBillingLabel={t('manage')}
      subscriptions={subscriptions}
      title={t('title')}
    />
  );
}
