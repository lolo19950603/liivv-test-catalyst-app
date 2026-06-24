import 'server-only';

import {
  getSubscriptionBillingAnchorForStartDate,
  getSubscriptionBillingDayKey,
} from './subscription-schedule-time';

const MAX_START_DATE_DAYS = 365;

export function parseSubscriptionStartDateInput(
  value: FormDataEntryValue | null,
): number | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const dayKey = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
    return undefined;
  }

  const anchor = getSubscriptionBillingAnchorForStartDate(dayKey);
  const todayKey = getSubscriptionBillingDayKey(Math.floor(Date.now() / 1000));

  if (dayKey <= todayKey) {
    return undefined;
  }

  const maxDate = new Date();

  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_START_DATE_DAYS);
  const maxDayKey = getSubscriptionBillingDayKey(Math.floor(maxDate.getTime() / 1000));

  if (dayKey > maxDayKey) {
    return undefined;
  }

  return anchor;
}

export function getMinSubscriptionStartDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultSubscriptionStartDateValue(): string {
  return getMinSubscriptionStartDateValue();
}

export function getMaxSubscriptionStartDateValue(): string {
  const maxDate = new Date();

  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_START_DATE_DAYS);

  return maxDate.toISOString().slice(0, 10);
}
