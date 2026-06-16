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

    return subscriptions.map((subscription) => {
      const scheduledChargeAt =
        subscription.status === 'trialing'
          ? subscription.trialEnd ?? subscription.billingCycleAnchor
          : null;
      const nextDate = format.dateTime(
        new Date(
          (scheduledChargeAt ?? subscription.currentPeriodEnd) * 1000,
        ),
        { dateStyle: 'medium' },
      );

      return {
        id: subscription.id,
        productName: subscription.productName,
        priceLabel:
          subscription.unitAmount != null
            ? `${format.number(subscription.unitAmount / 100, {
                style: 'currency',
                currency: subscription.currency.toUpperCase(),
              })} ${t('includingTax')}`
            : t('customPricing'),
        intervalLabel: formatIntervalLabel(
          subscription.interval,
          subscription.intervalCount,
          t,
        ),
        statusLabel: subscription.cancelAtPeriodEnd
          ? t('status.cancelling')
          : scheduledChargeAt
            ? t('status.scheduled')
            : t(`status.${subscription.status}` as 'status.active'),
        renewalLabel: subscription.cancelAtPeriodEnd
          ? t('endsOn', { date: nextDate })
          : scheduledChargeAt
            ? t('firstChargeOn', { date: nextDate })
            : t('renewsOn', { date: nextDate }),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      };
    });
  });

  return (
    <SubscriptionList
      browsePlansHref="/"
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
