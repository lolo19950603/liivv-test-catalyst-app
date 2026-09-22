import { kv } from '~/lib/kv';
import { kvKey } from '~/lib/kv/keys';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __liivvApiGatewayRateLimit?: Map<string, { count: number; resetAt: number }>;
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const fromForwarded = forwarded?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();

  return fromForwarded || realIp || 'unknown';
}

function consumeMemoryIpRateLimit(
  ip: string,
  prefix: string,
  maxRequests: number,
  windowSec: number,
): RateLimitResult {
  if (!globalForRateLimit.__liivvApiGatewayRateLimit) {
    globalForRateLimit.__liivvApiGatewayRateLimit = new Map();
  }

  const windowId = Math.floor(Date.now() / (windowSec * 1000));
  const key = `${prefix}:${ip}:${windowId}`;
  const now = Date.now();
  const store = globalForRateLimit.__liivvApiGatewayRateLimit;
  let bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowSec * 1000 };
    store.set(key, bucket);
  }

  bucket.count += 1;

  return {
    allowed: bucket.count <= maxRequests,
    remaining: Math.max(0, maxRequests - bucket.count),
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function resultFromCount(
  count: number,
  maxRequests: number,
  windowId: number,
  windowSec: number,
): RateLimitResult {
  const windowEnd = (windowId + 1) * windowSec * 1000;

  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    retryAfterSec: Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000)),
  };
}

export async function consumeIpRateLimit(
  request: Request,
  prefix: string,
  maxRequests: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const windowId = Math.floor(Date.now() / (windowSec * 1000));
  const key = kvKey(`rl:${prefix}:${ip}:${windowId}`);

  try {
    const count = await kv.increment(key, { ex: windowSec + 5 });

    return resultFromCount(count, maxRequests, windowId, windowSec);
  } catch {
    return consumeMemoryIpRateLimit(ip, prefix, maxRequests, windowSec);
  }
}

export const API_RATE_LIMIT_MAX = 120;
export const API_RATE_LIMIT_WINDOW_SEC = 60;

export const DPD_RATE_LIMIT_MAX = 60;
export const DPD_RATE_LIMIT_WINDOW_SEC = 60;

/*
 * The Makeswift runtime handler gets its own budget instead of sharing the
 * storefront's. An open builder session legitimately bursts well past 120
 * requests a minute (manifest, fonts, translatable data, element trees), and
 * spending the storefront budget on it would take the CMS offline to shed
 * shop load — or the other way round. Still limited, because the handler is
 * reachable without a session: it checks MAKESWIFT_SITE_API_KEY itself.
 */
export const MAKESWIFT_RATE_LIMIT_MAX = 600;
export const MAKESWIFT_RATE_LIMIT_WINDOW_SEC = 60;
