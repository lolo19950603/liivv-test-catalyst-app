import 'server-only';

/** Local calendar day key (YYYY-MM-DD) in the subscription billing timezone. */
export function getSubscriptionBillingDayKey(timestamp: number): string {
  const timeZone = getSubscriptionBillingTimezone();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp * 1000));

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return getUtcCalendarDayKey(timestamp);
  }

  return `${year}-${month}-${day}`;
}

export function getSubscriptionBillingTimezone(): string {
  return (
    process.env.SUBSCRIPTION_BILLING_TIMEZONE?.trim() ||
    process.env.SUBSCRIPTION_SHIPMENT_TIMEZONE?.trim() ||
    'America/New_York'
  );
}

export function getSubscriptionBillingHour(): number {
  const configured = Number(process.env.SUBSCRIPTION_BILLING_HOUR ?? '6');

  return Number.isFinite(configured) && configured >= 0 && configured <= 23 ? configured : 6;
}

/** Unix timestamp for a given local hour on a YYYY-MM-DD calendar day in the given timezone. */
export function getTimestampForLocalHourOnCalendarDay(
  dayKey: string,
  hour: number,
  timeZone: string,
): number {
  const [year, month, day] = dayKey.split('-').map(Number);

  if (!year || !month || !day) {
    return Math.floor(Date.now() / 1000);
  }

  for (let utcHour = 0; utcHour < 24; utcHour += 1) {
    const candidate = new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0));
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(candidate);

    const localYear = Number(parts.find((part) => part.type === 'year')?.value);
    const localMonth = Number(parts.find((part) => part.type === 'month')?.value);
    const localDay = Number(parts.find((part) => part.type === 'day')?.value);
    const localHour = Number(parts.find((part) => part.type === 'hour')?.value);

    if (localYear === year && localMonth === month && localDay === day && localHour === hour) {
      return Math.floor(candidate.getTime() / 1000);
    }
  }

  return Math.floor(Date.UTC(year, month - 1, day, hour + 5, 0, 0) / 1000);
}

/** Snap a timestamp to the configured billing hour on its billing-timezone calendar day. */
export function snapToSubscriptionBillingTime(timestamp: number): number {
  const dayKey = getSubscriptionBillingDayKey(timestamp);

  return getTimestampForLocalHourOnCalendarDay(
    dayKey,
    getSubscriptionBillingHour(),
    getSubscriptionBillingTimezone(),
  );
}

/** Billing anchor for Stripe: billing hour on the target day, never in the past. */
export function resolveSubscriptionBillingCycleAnchor(
  timestamp: number,
  now = Math.floor(Date.now() / 1000),
): number {
  return Math.max(snapToSubscriptionBillingTime(timestamp), now + 60);
}

/** Billing anchor for a customer-selected start date (YYYY-MM-DD). */
export function getSubscriptionBillingAnchorForStartDate(dayKey: string): number {
  return getTimestampForLocalHourOnCalendarDay(
    dayKey,
    getSubscriptionBillingHour(),
    getSubscriptionBillingTimezone(),
  );
}

function getUtcCalendarDayKey(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}
