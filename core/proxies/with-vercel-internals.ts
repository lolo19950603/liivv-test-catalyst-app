import { NextResponse } from 'next/server';

import { type ProxyFactory } from './compose-proxies';

export const withVercelInternals: ProxyFactory = (next) => {
  return async (request, event) => {
    if (request.nextUrl.pathname.startsWith('/_vercel/')) {
      return new NextResponse(null, { status: 404 });
    }

    return next(request, event);
  };
};
