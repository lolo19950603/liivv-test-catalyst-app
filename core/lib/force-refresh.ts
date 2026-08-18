import { cookies } from 'next/headers';

import { FORCE_REFRESH_COOKIE } from './client-cookies';

export async function setForceRefreshCookie() {
  const cookieStore = await cookies();

  cookieStore.set(FORCE_REFRESH_COOKIE, 'true', {
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
  });
}
