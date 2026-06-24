import 'server-only';

import { getTimestampForLocalHourOnCalendarDay } from './subscription-schedule-time';

function getShipmentCutoffHour(): number {
  const configured = Number(process.env.SUBSCRIPTION_SHIPMENT_CUTOFF_HOUR ?? '13');

  return Number.isFinite(configured) && configured >= 0 && configured <= 23 ? configured : 13;
}

function getShipmentTimezone(): string {
  return process.env.SUBSCRIPTION_SHIPMENT_TIMEZONE?.trim() || 'America/Toronto';
}

/** UTC calendar day key (YYYY-MM-DD) for cutoff hour in store timezone on that day. */
export function getShipmentCutoffTimestamp(dayKey: string): number {
  return getTimestampForLocalHourOnCalendarDay(dayKey, getShipmentCutoffHour(), getShipmentTimezone());
}

export function isPastShipmentCutoff(dayKey: string, now = Math.floor(Date.now() / 1000)): boolean {
  return now >= getShipmentCutoffTimestamp(dayKey);
}
