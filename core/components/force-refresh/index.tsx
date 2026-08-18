'use client';

import { useEffect } from 'react';

import { useRouter } from '~/i18n/routing';
import { FORCE_REFRESH_COOKIE, deleteCookie, getCookieValue } from '~/lib/client-cookies';

export const ForceRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    const forceRefresh = getCookieValue(FORCE_REFRESH_COOKIE);

    if (forceRefresh === 'true') {
      deleteCookie(FORCE_REFRESH_COOKIE);
      router.refresh();

      return;
    }

    if (forceRefresh === 'false') {
      deleteCookie(FORCE_REFRESH_COOKIE);
    }
  }, [router]);

  return null;
};
