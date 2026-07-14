import type Stripe from 'stripe';

import {
  getPortalUpcomingShipmentTimestamp,
  getShipmentCalendarDayKey,
} from './subscription-shipment-grouping';

export const PENDING_SKIP_DAYS_METADATA_KEY = 'pending_skip_days';
export const MAX_SKIPPABLE_DELIVERY_OPTIONS = 6;

type Interval = Stripe.Price.Recurring.Interval;

export function addBillingInterval(
  fromTimestamp: number,
  interval: Interval,
  intervalCount: number,
): number {
  const date = new Date(fromTimestamp * 1000);

  switch (interval) {
    case 'day':
      date.setUTCDate(date.getUTCDate() + intervalCount);
      break;
    case 'week':
      date.setUTCDate(date.getUTCDate() + 7 * intervalCount);
      break;
    case 'month':
      date.setUTCMonth(date.getUTCMonth() + intervalCount);
      break;
    case 'year':
      date.setUTCFullYear(date.getUTCFullYear() + intervalCount);
      break;
  }

  return Math.floor(date.getTime() / 1000);
}

export function parsePendingSkipDays(metadata: Stripe.Metadata | Record<string, string> | undefined): string[] {
  const raw = metadata?.[PENDING_SKIP_DAYS_METADATA_KEY]?.trim();

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return [
      ...new Set(
        parsed.filter((value): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)),
      ),
    ].sort();
  } catch {
    return raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
      .sort();
  }
}

export function serializePendingSkipDays(dayKeys: string[]): string {
  return JSON.stringify([...new Set(dayKeys)].sort());
}

export interface SkippableDeliveryOption {
  dayKey: string;
  timestamp: number;
  isNext: boolean;
  isPending: boolean;
}

export function projectSkippableDeliveries({
  interval,
  intervalCount,
  trialEnd,
  billingCycleAnchor,
  currentPeriodStart,
  currentPeriodEnd,
  metadata,
  count = MAX_SKIPPABLE_DELIVERY_OPTIONS,
  now = Math.floor(Date.now() / 1000),
}: {
  interval: Interval;
  intervalCount: number;
  trialEnd: number | null;
  billingCycleAnchor: number | null;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  metadata?: Stripe.Metadata | Record<string, string>;
  count?: number;
  now?: number;
}): SkippableDeliveryOption[] {
  const pendingDays = new Set(parsePendingSkipDays(metadata));
  const firstTimestamp = getPortalUpcomingShipmentTimestamp(
    {
      trialEnd,
      billingCycleAnchor,
      currentPeriodStart,
      currentPeriodEnd,
    },
    now,
  );

  const options: SkippableDeliveryOption[] = [];
  let cursor = firstTimestamp;

  for (let index = 0; index < count; index += 1) {
    const dayKey = getShipmentCalendarDayKey(cursor);

    if (!options.some((option) => option.dayKey === dayKey)) {
      options.push({
        dayKey,
        timestamp: cursor,
        isNext: index === 0,
        isPending: pendingDays.has(dayKey),
      });
    }

    cursor = addBillingInterval(cursor, interval, intervalCount);
  }

  return options;
}
