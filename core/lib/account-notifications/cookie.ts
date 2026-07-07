import 'server-only';

import { cookies } from 'next/headers';

/** Cookie marking when the customer last acknowledged account notifications (panel or chat). */
export const ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE = 'account_notifications_last_seen';

const MAX_AGE_SEC = 60 * 60 * 24 * 365;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function getAccountNotificationsLastSeen(): Promise<Date | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE)?.value;

  if (!raw?.trim()) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(raw.trim());
    const date = new Date(decoded);

    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export function getAccountNotificationsLastSeenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SEC,
  };
}

/** "New" if created after lastSeen, or (if never seen) within the last 7 days. */
export function isAccountNotificationUnread(createdAt: string, lastSeen: Date | null): boolean {
  const timestamp = new Date(createdAt).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  if (lastSeen) {
    return timestamp > lastSeen.getTime();
  }

  return Date.now() - timestamp <= SEVEN_DAYS_MS;
}
