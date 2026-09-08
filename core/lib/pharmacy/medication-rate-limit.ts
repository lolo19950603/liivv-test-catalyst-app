import 'server-only';

import { NextResponse } from 'next/server';

import {
  consumeIpRateLimit,
  DPD_RATE_LIMIT_MAX,
  DPD_RATE_LIMIT_WINDOW_SEC,
} from '~/lib/api-gateway/ip-rate-limit';
import { API_GATEWAY_HEADER } from '~/lib/api-gateway/policies';

export async function medicationRateLimitResponse(request: Request): Promise<NextResponse | null> {
  if (request.headers.get(API_GATEWAY_HEADER)) {
    return null;
  }

  const result = await consumeIpRateLimit(
    request,
    'rl:medications',
    DPD_RATE_LIMIT_MAX,
    DPD_RATE_LIMIT_WINDOW_SEC,
  );

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: 'rate_limited' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSec),
        'X-RateLimit-Limit': String(DPD_RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
