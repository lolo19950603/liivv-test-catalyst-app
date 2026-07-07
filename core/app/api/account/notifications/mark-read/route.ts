import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE,
  getAccountNotificationsLastSeenCookieOptions,
} from '~/lib/account-notifications/cookie';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set(
    ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE,
    encodeURIComponent(new Date().toISOString()),
    getAccountNotificationsLastSeenCookieOptions(),
  );

  return NextResponse.json({ ok: true as const });
}
