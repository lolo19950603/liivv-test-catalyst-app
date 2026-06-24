import { describe, expect, it } from 'vitest';

import {
  getSubscriptionBillingAnchorForStartDate,
  getSubscriptionBillingDayKey,
  getTimestampForLocalHourOnCalendarDay,
  snapToSubscriptionBillingTime,
} from './subscription-schedule-time';

describe('subscription-schedule-time', () => {
  it('resolves 6am Eastern on a calendar day', () => {
    const timestamp = getTimestampForLocalHourOnCalendarDay(
      '2026-06-30',
      6,
      'America/New_York',
    );

    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false,
      month: 'short',
      day: 'numeric',
    }).format(new Date(timestamp * 1000));

    expect(formatted).toContain('Jun 30');
    expect(formatted).toContain('6');
  });

  it('uses the billing timezone calendar day when snapping', () => {
    process.env.SUBSCRIPTION_BILLING_TIMEZONE = 'America/New_York';
    process.env.SUBSCRIPTION_BILLING_HOUR = '6';

    const eveningUtc = Math.floor(Date.parse('2026-01-15T23:30:00.000Z') / 1000);
    const dayKey = getSubscriptionBillingDayKey(eveningUtc);

    expect(dayKey).toBe('2026-01-15');

    const snapped = snapToSubscriptionBillingTime(eveningUtc);
    const easternHour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      }).format(new Date(snapped * 1000)),
    );

    expect(easternHour).toBe(6);
  });

  it('anchors deferred start dates at the billing hour', () => {
    process.env.SUBSCRIPTION_BILLING_TIMEZONE = 'America/New_York';
    process.env.SUBSCRIPTION_BILLING_HOUR = '6';

    const anchor = getSubscriptionBillingAnchorForStartDate('2026-07-04');
    const eastern = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: false,
    }).format(new Date(anchor * 1000));

    expect(eastern).toContain('Jul 4');
    expect(eastern).toContain('6');
  });
});
