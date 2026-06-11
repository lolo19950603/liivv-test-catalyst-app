import { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';

import { SubscriptionPlans } from '@/vibes/soul/sections/subscription-plans';
import { Streamable } from '@/vibes/soul/lib/streamable';
import { isLoggedIn } from '~/auth';
import { getSubscriptionPlans, isStripeConfigured } from '~/lib/stripe';
import {
  getDefaultSubscriptionStartDateValue,
  getMaxSubscriptionStartDateValue,
  getMinSubscriptionStartDateValue,
} from '~/lib/stripe/subscription-start-date';

import { startSubscriptionCheckout } from './_actions/start-checkout';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Subscribe' });

  return {
    title: t('title'),
  };
}

function formatIntervalLabel(
  interval: string,
  intervalCount: number,
  t: Awaited<ReturnType<typeof getTranslations<'Subscribe'>>>,
): string {
  if (intervalCount === 1) {
    return t(`intervals.${interval}` as 'intervals.month');
  }

  return t(`intervals.${interval}Plural` as 'intervals.monthPlural', { count: intervalCount });
}

export default async function SubscribePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Subscribe');
  const format = await getFormatter();
  const loggedIn = await isLoggedIn();

  const streamablePlans = Streamable.from(async () => {
    if (!isStripeConfigured()) {
      return [];
    }

    const plans = await getSubscriptionPlans();

    return plans.map((plan) => ({
      id: plan.id,
      productName: plan.productName,
      description: plan.description,
      priceLabel:
        plan.unitAmount != null
          ? format.number(plan.unitAmount / 100, {
              style: 'currency',
              currency: plan.currency.toUpperCase(),
            })
          : t('customPricing'),
      intervalLabel: formatIntervalLabel(plan.interval, plan.intervalCount, t),
    }));
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 @container">
      <SubscriptionPlans
        description={t('description')}
        emptyDescription={t('empty.description')}
        emptyTitle={t('empty.title')}
        isLoggedIn={loggedIn}
        loginHref="/login?redirectTo=/subscribe/"
        loginLabel={t('loginToSubscribe')}
        plans={streamablePlans}
        defaultStartDate={getDefaultSubscriptionStartDateValue()}
        startCheckoutAction={startSubscriptionCheckout}
        startDateHint={t('startDateHint')}
        startDateLabel={t('startDate')}
        startDateMax={getMaxSubscriptionStartDateValue()}
        startDateMin={getMinSubscriptionStartDateValue()}
        subscribeLabel={t('subscribe')}
        title={t('title')}
      />
    </div>
  );
}
