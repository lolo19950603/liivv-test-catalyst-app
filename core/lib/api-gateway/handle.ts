import { type NextProxy, NextRequest, NextResponse } from 'next/server';

import { auth } from '~/auth';

import {
  consumeIpRateLimit,
  API_RATE_LIMIT_MAX,
  API_RATE_LIMIT_WINDOW_SEC,
  DPD_RATE_LIMIT_MAX,
  DPD_RATE_LIMIT_WINDOW_SEC,
  GRAPH_WEBHOOK_RATE_LIMIT_MAX,
  GRAPH_WEBHOOK_RATE_LIMIT_WINDOW_SEC,
  MAKESWIFT_RATE_LIMIT_MAX,
  MAKESWIFT_RATE_LIMIT_WINDOW_SEC,
} from './ip-rate-limit';
import { API_GATEWAY_HEADER, type ApiGatewayPolicy, matchApiGatewayRule } from './policies';

type ProxyEvent = Parameters<NextProxy>[1];

interface RateLimitBudget {
  prefix: string;
  max: number;
  windowSec: number;
}

/*
 * Policies settled on their own counter, BEFORE the shared budget is touched:
 * builder traffic (Makeswift) and Microsoft Graph notifications must not be
 * able to exhaust the storefront's 120/min, and the storefront must not be
 * able to exhaust theirs.
 */
const DEDICATED_BUDGETS: Partial<Record<ApiGatewayPolicy, RateLimitBudget>> = {
  makeswift: {
    prefix: 'rl:makeswift',
    max: MAKESWIFT_RATE_LIMIT_MAX,
    windowSec: MAKESWIFT_RATE_LIMIT_WINDOW_SEC,
  },
  'webhook-graph': {
    prefix: 'rl:graph',
    max: GRAPH_WEBHOOK_RATE_LIMIT_MAX,
    windowSec: GRAPH_WEBHOOK_RATE_LIMIT_WINDOW_SEC,
  },
};

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

/* Compares two strings in time that depends only on their lengths. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < a.length; index += 1) {
    difference += a.charCodeAt(index) === b.charCodeAt(index) ? 0 : 1;
  }

  return difference === 0;
}

/* A shared-secret Bearer check: 503 while the secret is unset, 401 when it doesn't match. */
function bearerCheck(request: NextRequest, secret: string | undefined, label: string): NextResponse | null {
  const expected = secret?.trim();

  if (!expected) {
    return jsonError(503, `${label} not configured`);
  }

  const authorization = request.headers.get('authorization') ?? '';

  return constantTimeEqual(authorization, `Bearer ${expected}`) ? null : jsonError(401, 'Unauthorized');
}

/* The per-policy checks that need no session: webhook signatures and shared secrets. */
function sharedSecretCheck(policy: ApiGatewayPolicy, request: NextRequest): NextResponse | null {
  if (policy === 'webhook-stripe') {
    return request.headers.get('stripe-signature') ? null : jsonError(401, 'Unauthorized');
  }

  if (policy === 'webhook-bigcommerce') {
    return bearerCheck(request, process.env.BIGCOMMERCE_WEBHOOK_SECRET, 'Webhook');
  }

  if (policy === 'cron') {
    return bearerCheck(request, process.env.CRON_SECRET, 'Cron');
  }

  return null;
}

async function customerSessionResponse(
  request: NextRequest,
  event: ProxyEvent,
  policy: ApiGatewayPolicy,
): Promise<Response> {
  const response = await auth(async (req) => {
    const customerAccessToken = req.auth?.user?.customerAccessToken;

    if (!customerAccessToken) {
      return jsonError(401, 'Unauthorized');
    }

    return passThrough(req as NextRequest, policy);
  })(request, event as never);

  return response ?? jsonError(401, 'Unauthorized');
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
  const dedicated = DEDICATED_BUDGETS[policy];

  if (dedicated) {
    const dedicatedLimited = await rateLimitResponse(
      request,
      dedicated.prefix,
      dedicated.max,
      dedicated.windowSec,
    );

    return dedicatedLimited ?? passThrough(request, policy);
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

  const refused = sharedSecretCheck(policy, request);

  if (refused) {
    return refused;
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
    return customerSessionResponse(request, event, policy);
  }

  return passThrough(request, policy);
}
