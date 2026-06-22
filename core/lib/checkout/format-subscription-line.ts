import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import type { SubscriptionLineMeta } from './types';

export function getSubscriptionLineDetails(
  subscription: SubscriptionLineMeta,
  {
    billingLabel,
    startsTodayLabel,
    billedOnLabel,
    formatInterval,
    formatStartsDate,
  }: {
    billingLabel: string;
    startsTodayLabel: string;
    billedOnLabel: string;
    formatInterval: (interval: SubscriptionBillingInterval) => string;
    formatStartsDate: (timestamp: number) => string;
  },
): string[] {
  const details = [`${billingLabel}: ${formatInterval(subscription.billingInterval)}`];
  const now = Math.floor(Date.now() / 1000);

  if (subscription.billingCycleAnchor) {
    if (subscription.billingCycleAnchor > now) {
      details.push(`${billedOnLabel}: ${formatStartsDate(subscription.billingCycleAnchor)}`);
    } else {
      details.push(startsTodayLabel);
    }
  } else {
    details.push(startsTodayLabel);
  }

  return details;
}
