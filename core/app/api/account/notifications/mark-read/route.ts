import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import {
  ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE,
  getAccountNotificationsLastSeenCookieOptions,
} from '~/lib/account-notifications/cookie';

export async function POST() {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return NextResponse.json({ ok: false as const }, { status: 401 });
  }

  const cookieStore = await cookies();

  cookieStore.set(
    ACCOUNT_NOTIFICATIONS_LAST_SEEN_COOKIE,
    encodeURIComponent(new Date().toISOString()),
    getAccountNotificationsLastSeenCookieOptions(),
  );

  return NextResponse.json({ ok: true as const });
}
