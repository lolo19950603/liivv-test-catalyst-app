import { type NextProxy, NextRequest, NextResponse } from 'next/server';

import { auth } from '~/auth';

import {
  consumeIpRateLimit,
  API_RATE_LIMIT_MAX,
  API_RATE_LIMIT_WINDOW_SEC,
  DPD_RATE_LIMIT_MAX,
  DPD_RATE_LIMIT_WINDOW_SEC,
  MAKESWIFT_RATE_LIMIT_MAX,
  MAKESWIFT_RATE_LIMIT_WINDOW_SEC,
} from './ip-rate-limit';
import { API_GATEWAY_HEADER, matchApiGatewayRule } from './policies';

type ProxyEvent = Parameters<NextProxy>[1];

function passThrough(request: NextRequest, policy: string): NextResponse {
  const headers = new Headers(request.headers);

  headers.set(API_GATEWAY_HEADER, policy);

  return NextResponse.next({
    request: { headers },
  });
}

function jsonError(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}

async function rateLimitResponse(
  request: NextRequest,
  prefix: string,
  maxRequests: number,
  windowSec: number,
): Promise<NextResponse | null> {
  const result = await consumeIpRateLimit(request, prefix, maxRequests, windowSec);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: 'rate_limited' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSec),
        'X-RateLimit-Limit': String(maxRequests),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}

export async function handleApiGateway(
  request: NextRequest,
  event: ProxyEvent,
): Promise<Response> {
  const pathname = request.nextUrl.pathname;
  const matched = matchApiGatewayRule(pathname, request.method);

  if (!matched) {
    return jsonError(404, 'Not found');
  }

  if (!matched.methodAllowed) {
    return jsonError(405, 'Method not allowed');
  }

  const { policy } = matched;

  /*
   * Makeswift is settled before the shared budget is touched, on its own
   * counter: builder traffic must not be able to exhaust the storefront's
   * 120/min, and the storefront must not be able to exhaust the builder's.
   */
  if (policy === 'makeswift') {
    const makeswiftLimited = await rateLimitResponse(
      request,
      'rl:makeswift',
      MAKESWIFT_RATE_LIMIT_MAX,
      MAKESWIFT_RATE_LIMIT_WINDOW_SEC,
    );

    return makeswiftLimited ?? passThrough(request, policy);
  }

  const limited = await rateLimitResponse(
    request,
    'rl:api',
    API_RATE_LIMIT_MAX,
    API_RATE_LIMIT_WINDOW_SEC,
  );

  if (limited) {
    return limited;
  }

  if (policy === 'webhook-stripe' && !request.headers.get('stripe-signature')) {
    return jsonError(401, 'Unauthorized');
  }

  if (policy === 'webhook-bigcommerce') {
    const secret = process.env.BIGCOMMERCE_WEBHOOK_SECRET?.trim();

    if (!secret) {
      return jsonError(503, 'Webhook not configured');
    }

    if (request.headers.get('authorization') !== `Bearer ${secret}`) {
      return jsonError(401, 'Unauthorized');
    }
  }

  if (policy === 'dpd-public') {
    const dpdLimited = await rateLimitResponse(
      request,
      'rl:medications',
      DPD_RATE_LIMIT_MAX,
      DPD_RATE_LIMIT_WINDOW_SEC,
    );

    if (dpdLimited) {
      return dpdLimited;
    }
  }

  if (policy === 'customer-session') {
    const response = await auth(async (req) => {
      const customerAccessToken = req.auth?.user?.customerAccessToken;

      if (!customerAccessToken) {
        return jsonError(401, 'Unauthorized');
      }

      return passThrough(req as NextRequest, policy);
    })(request, event as never);

    return response ?? jsonError(401, 'Unauthorized');
  }

  return passThrough(request, policy);
}
