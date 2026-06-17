import 'server-only';

const MAX_START_DATE_DAYS = 365;

export function parseSubscriptionStartDateInput(
  value: FormDataEntryValue | null,
): number | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(`${value.trim()}T12:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const today = new Date();

  today.setUTCHours(0, 0, 0, 0);

  const startDay = new Date(parsed);

  startDay.setUTCHours(0, 0, 0, 0);

  if (startDay <= today) {
    return undefined;
  }

  const maxDate = new Date(today);

  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_START_DATE_DAYS);

  if (startDay > maxDate) {
    return undefined;
  }

  return Math.floor(parsed.getTime() / 1000);
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
