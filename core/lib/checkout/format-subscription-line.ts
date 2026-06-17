import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import type { SubscriptionLineMeta } from './types';

export function getSubscriptionLineDetails(
  subscription: SubscriptionLineMeta,
  {
    billingLabel,
    startsLabel,
    startsTodayLabel,
    formatInterval,
    formatStartsDate,
  }: {
    billingLabel: string;
    startsLabel: string;
    startsTodayLabel: string;
    formatInterval: (interval: SubscriptionBillingInterval) => string;
    formatStartsDate: (timestamp: number) => string;
  },
): string[] {
  const details = [`${billingLabel}: ${formatInterval(subscription.billingInterval)}`];

  if (subscription.billingCycleAnchor) {
    details.push(`${startsLabel}: ${formatStartsDate(subscription.billingCycleAnchor)}`);
  } else {
    details.push(startsTodayLabel);
  }

  return details;
}
