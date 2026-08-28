import 'server-only';

import { NextResponse } from 'next/server';

const WINDOW_SEC = 60;
const MAX_REQUESTS = 60;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __medicationRateLimit?: Map<string, { count: number; resetAt: number }>;
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const fromForwarded = forwarded?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();

  return fromForwarded || realIp || 'unknown';
}

function memoryConsume(key: string): RateLimitResult {
  if (!globalForRateLimit.__medicationRateLimit) {
    globalForRateLimit.__medicationRateLimit = new Map();
  }

  const now = Date.now();
  const store = globalForRateLimit.__medicationRateLimit;
  let bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_SEC * 1000 };
    store.set(key, bucket);
  }

  bucket.count += 1;

  return {
    allowed: bucket.count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - bucket.count),
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

async function redisConsume(key: string): Promise<RateLimitResult | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const { Redis } = await import('@upstash/redis');
  const redis = Redis.fromEnv();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, WINDOW_SEC);
  }

  const ttl = await redis.ttl(key);

  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    retryAfterSec: ttl > 0 ? ttl : WINDOW_SEC,
  };
}

export async function medicationRateLimitResponse(request: Request): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const windowId = Math.floor(Date.now() / (WINDOW_SEC * 1000));
  const key = `rl:medications:${ip}:${windowId}`;

  let result: RateLimitResult;

  try {
    result = (await redisConsume(key)) ?? memoryConsume(key);
  } catch {
    result = memoryConsume(key);
  }

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: 'rate_limited' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSec),
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
