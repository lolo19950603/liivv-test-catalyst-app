import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { Streamable } from '@/vibes/soul/lib/streamable';
import { SubscriptionList } from '@/vibes/soul/sections/subscription-list';

import { openBillingPortal } from './_actions/open-billing-portal';
import { getAccountSubscriptions } from './page-data';

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

function formatIntervalLabel(
  interval: string,
  intervalCount: number,
  t: Awaited<ReturnType<typeof getTranslations<'Account.Subscriptions'>>>,
): string {
  if (intervalCount === 1) {
    return t(`intervals.${interval}` as 'intervals.month');
  }

  return t(`intervals.${interval}Plural` as 'intervals.monthPlural', { count: intervalCount });
}

export default async function SubscriptionsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Account.Subscriptions');
  const format = await getFormatter();

  const streamableSubscriptions = Streamable.from(async () => {
    const subscriptions = await getAccountSubscriptions();

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      productName: subscription.productName,
      priceLabel:
        subscription.unitAmount != null
          ? format.number(subscription.unitAmount / 100, {
              style: 'currency',
              currency: subscription.currency.toUpperCase(),
            })
          : t('customPricing'),
      intervalLabel: formatIntervalLabel(
        subscription.interval,
        subscription.intervalCount,
        t,
      ),
      statusLabel: t(`status.${subscription.status}` as 'status.active'),
      renewalLabel: t('renewsOn', {
        date: format.dateTime(new Date(subscription.currentPeriodEnd * 1000), {
          dateStyle: 'medium',
        }),
      }),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    }));
  });

  return (
    <SubscriptionList
      browsePlansHref="/subscribe/"
      browsePlansLabel={t('browsePlans')}
      cancelAtPeriodEndLabel={t('cancelAtPeriodEnd')}
      emptyDescription={t('empty.description')}
      emptyTitle={t('empty.title')}
      manageLabel={t('manage')}
      openBillingPortalAction={openBillingPortal}
      subscriptions={streamableSubscriptions}
      title={t('title')}
    />
  );
}
