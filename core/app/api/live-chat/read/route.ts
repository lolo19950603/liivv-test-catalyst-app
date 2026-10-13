import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import {
  getLiveChatLastSeenCookieOptions,
  LIVE_CHAT_LAST_SEEN_COOKIE,
} from '~/lib/chat/cookie';

/**
 * Mark the open chat as read without a Server Action.
 * See `/api/live-chat/session` — a Server Action here would refresh the page
 * the customer is signing in on and hold that redirect.
 */
export async function POST() {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return NextResponse.json({ ok: true as const });
  }

  const cookieStore = await cookies();

  cookieStore.set(
    LIVE_CHAT_LAST_SEEN_COOKIE,
    encodeURIComponent(new Date().toISOString()),
    getLiveChatLastSeenCookieOptions(),
  );

  return NextResponse.json({ ok: true as const });
}
