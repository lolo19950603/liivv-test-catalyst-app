import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

import { routing } from '~/i18n/routing';
import {
  CARE_NAV_COOKIE,
  CARE_NAV_HEADER,
  careNavSectionForPath,
  parseCareNavCookie,
  shouldClearCareNav,
} from '~/lib/makeswift/site-header/inject-liivv-health-nav';

import { type ProxyFactory } from './compose-proxies';

export const withIntl: ProxyFactory = (next) => {
  return async (request, event) => {
    const disableLocaleDetection = request.headers.get('x-bc-disable-locale-detection') === 'true';

    const intlMiddleware = createMiddleware({
      ...routing,
      ...(disableLocaleDetection ? { localeDetection: false } : {}),
    });

    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);
    request.headers.set('x-pathname', request.nextUrl.pathname);

    // Continue the proxy chain
    const response = await next(request, event);

    // Copy headers from intlResponse to response, excluding 'x-middleware-rewrite'
    intlResponse.headers.forEach((v, k) => {
      if (k !== 'x-middleware-rewrite') {
        response?.headers.set(k, v);
      }
    });

    if (response instanceof NextResponse) {
      const section =
        careNavSectionForPath(request.nextUrl.pathname) ??
        parseCareNavCookie(request.headers.get(CARE_NAV_HEADER));

      if (section) {
        response.cookies.set(CARE_NAV_COOKIE, section, { path: '/', sameSite: 'lax' });
      } else if (shouldClearCareNav(request.nextUrl.pathname)) {
        response.cookies.set(CARE_NAV_COOKIE, '', { path: '/', maxAge: 0 });
      }
    }

    return response;
  };
};
