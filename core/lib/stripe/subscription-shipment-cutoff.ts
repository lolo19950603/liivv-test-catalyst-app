import 'server-only';

function getShipmentCutoffHour(): number {
  const configured = Number(process.env.SUBSCRIPTION_SHIPMENT_CUTOFF_HOUR ?? '13');

  return Number.isFinite(configured) && configured >= 0 && configured <= 23 ? configured : 13;
}

function getShipmentTimezone(): string {
  return process.env.SUBSCRIPTION_SHIPMENT_TIMEZONE?.trim() || 'America/Toronto';
}

/** UTC calendar day key (YYYY-MM-DD) for 1pm cutoff in store timezone on that day. */
export function getShipmentCutoffTimestamp(dayKey: string): number {
  const [year, month, day] = dayKey.split('-').map(Number);

  if (!year || !month || !day) {
    return Math.floor(Date.now() / 1000);
  }

  const timeZone = getShipmentTimezone();
  const hour = getShipmentCutoffHour();

  // Walk UTC instants on that calendar day until local hour matches cutoff.
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

export function isPastShipmentCutoff(dayKey: string, now = Math.floor(Date.now() / 1000)): boolean {
  return now >= getShipmentCutoffTimestamp(dayKey);
}
