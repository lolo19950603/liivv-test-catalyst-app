import 'server-only';

import { cookies } from 'next/headers';

/** When the customer last viewed the live chat widget (for unread staff message badge). */
export const LIVE_CHAT_LAST_SEEN_COOKIE = 'live_chat_last_seen';

const MAX_AGE_SEC = 60 * 60 * 24 * 365;

export async function getLiveChatLastSeen(): Promise<Date | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LIVE_CHAT_LAST_SEEN_COOKIE)?.value;

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

export function getLiveChatLastSeenCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE_SEC,
  };
}
