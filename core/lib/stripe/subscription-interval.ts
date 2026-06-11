import 'server-only';

import type Stripe from 'stripe';

export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year';

export const DEFAULT_STRIPE_SUBSCRIPTION_INTERVAL_OPTIONS =
  'week:1,month:1,day:14,day:30';

export interface SubscriptionBillingInterval {
  interval: SubscriptionInterval;
  intervalCount: number;
}

const INTERVAL_ALIASES: Record<string, SubscriptionInterval> = {
  day: 'day',
  days: 'day',
  daily: 'day',
  week: 'week',
  weeks: 'week',
  weekly: 'week',
  month: 'month',
  months: 'month',
  monthly: 'month',
  year: 'year',
  years: 'year',
  yearly: 'year',
  annually: 'year',
  annual: 'year',
};

function parseIntervalName(value: string): SubscriptionInterval | null {
  return INTERVAL_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function formatSubscriptionIntervalKey(
  interval: SubscriptionBillingInterval,
): string {
  return `${interval.interval}:${interval.intervalCount}`;
}

export function parseSubscriptionIntervalKey(
  value: string,
): SubscriptionBillingInterval | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const colonMatch = /^([a-z]+):(\d+)$/i.exec(trimmed);

  if (colonMatch) {
    const interval = parseIntervalName(colonMatch[1]);
    const intervalCount = Number(colonMatch[2]);

    if (interval && Number.isFinite(intervalCount) && intervalCount > 0) {
      return { interval, intervalCount };
    }
  }

  return parseSubscriptionIntervalSpec(trimmed);
}

export function parseSubscriptionIntervalSpec(
  input: string,
): SubscriptionBillingInterval | null {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const colonMatch = /^([a-z]+):(\d+)$/.exec(trimmed);

  if (colonMatch) {
    const interval = parseIntervalName(colonMatch[1]);
    const intervalCount = Number(colonMatch[2]);

    if (interval && Number.isFinite(intervalCount) && intervalCount > 0) {
      return { interval, intervalCount };
    }
  }

  const everyMatch = /^(?:every\s+)?(\d+)\s+([a-z]+)s?$/.exec(trimmed);

  if (everyMatch) {
    const intervalCount = Number(everyMatch[1]);
    const interval = parseIntervalName(everyMatch[2]);

    if (interval && Number.isFinite(intervalCount) && intervalCount > 0) {
      return { interval, intervalCount };
    }
  }

  const singleAlias = parseIntervalName(trimmed);

  if (singleAlias) {
    return { interval: singleAlias, intervalCount: 1 };
  }

  return null;
}

function dedupeIntervals(
  intervals: SubscriptionBillingInterval[],
): SubscriptionBillingInterval[] {
  const seen = new Set<string>();

  return intervals.filter((interval) => {
    const key = formatSubscriptionIntervalKey(interval);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function parseIntervalList(value: string): SubscriptionBillingInterval[] {
  return dedupeIntervals(
    value
      .split(/[,;\n]/)
      .map((entry) => parseSubscriptionIntervalSpec(entry.trim()))
      .filter((interval): interval is SubscriptionBillingInterval => interval !== null),
  );
}

export function getDefaultSubscriptionBillingInterval(): SubscriptionBillingInterval {
  const interval = parseIntervalName(process.env.STRIPE_SUBSCRIPTION_INTERVAL ?? 'month') ?? 'month';
  const intervalCount = Number(process.env.STRIPE_SUBSCRIPTION_INTERVAL_COUNT ?? '1');

  return {
    interval,
    intervalCount: Number.isFinite(intervalCount) && intervalCount > 0 ? intervalCount : 1,
  };
}

/** Store-wide billing intervals from env (all subscribe-enabled products use these). */
export function getSubscriptionBillingIntervals(): SubscriptionBillingInterval[] {
  const optionsEnv =
    process.env.STRIPE_SUBSCRIPTION_INTERVAL_OPTIONS?.trim() ||
    DEFAULT_STRIPE_SUBSCRIPTION_INTERVAL_OPTIONS;

  const parsed = parseIntervalList(optionsEnv);

  if (parsed.length > 0) {
    return parsed;
  }

  return [getDefaultSubscriptionBillingInterval()];
}

export function intervalsMatch(
  left: SubscriptionBillingInterval,
  right: SubscriptionBillingInterval,
): boolean {
  return left.interval === right.interval && left.intervalCount === right.intervalCount;
}

export function resolveSelectedSubscriptionBillingInterval(
  selectedValue: FormDataEntryValue | null,
  allowedIntervals: SubscriptionBillingInterval[],
): SubscriptionBillingInterval {
  if (allowedIntervals.length === 0) {
    return getDefaultSubscriptionBillingInterval();
  }

  if (typeof selectedValue === 'string') {
    const parsed = parseSubscriptionIntervalKey(selectedValue);

    if (parsed && allowedIntervals.some((interval) => intervalsMatch(interval, parsed))) {
      return parsed;
    }
  }

  return allowedIntervals[0];
}

export function toStripeRecurring(
  interval: SubscriptionBillingInterval,
): Stripe.Price.Recurring {
  return {
    interval: interval.interval,
    interval_count: interval.intervalCount,
  };
}
