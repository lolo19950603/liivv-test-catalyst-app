import 'server-only';

import { cookies } from 'next/headers';

import type { BcAppUser } from '~/lib/bigcommerce/app-oauth';

const COOKIE_NAME = 'liivv_bc_app';
const COOKIE_PATH = '/bc-app';
const SESSION_MS = 12 * 60 * 60 * 1000;

export type BcAppSession = {
  storeHash: string;
  user: BcAppUser;
  expMs: number;
};

function getSecret(): string | null {
  return process.env.BIGCOMMERCE_APP_CLIENT_SECRET?.trim() || null;
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));

  return Buffer.from(sig).toString('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let out = 0;

  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return out === 0;
}

async function buildToken(secret: string, session: BcAppSession): Promise<string> {
  const payload = JSON.stringify(session);
  const sig = await hmacSign(secret, payload);

  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<BcAppSession | null> {
  const dot = token.indexOf('.');

  if (dot < 1) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(token.slice(0, dot), 'base64url').toString('utf8');
    const sig = token.slice(dot + 1);
    const expected = await hmacSign(secret, payloadJson);

    if (!timingSafeEqual(sig, expected)) {
      return null;
    }

    const session = JSON.parse(payloadJson) as BcAppSession;

    if (!session.storeHash || !session.user?.id || !session.user.email || !session.expMs) {
      return null;
    }

    if (Date.now() > session.expMs) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function cookieOptions(maxAgeSec: number) {
  return {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: 'none' as const,
    secure: true,
    maxAge: maxAgeSec,
  };
}

export async function getBcAppSession(): Promise<BcAppSession | null> {
  const secret = getSecret();

  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  return verifyToken(secret, decodeURIComponent(raw));
}

export async function createBcAppSessionCookie(input: {
  storeHash: string;
  user: BcAppUser;
}): Promise<void> {
  const secret = getSecret();

  if (!secret) {
    throw new Error('BIGCOMMERCE_APP_CLIENT_SECRET is not set.');
  }

  const expMs = Date.now() + SESSION_MS;
  const session: BcAppSession = {
    storeHash: input.storeHash,
    user: input.user,
    expMs,
  };
  const token = await buildToken(secret, session);
  const cookieStore = await cookies();
  const maxAgeSec = Math.floor(SESSION_MS / 1000);

  cookieStore.set(COOKIE_NAME, encodeURIComponent(token), cookieOptions(maxAgeSec));
}

export async function clearBcAppSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    ...cookieOptions(0),
    maxAge: 0,
  });
}
