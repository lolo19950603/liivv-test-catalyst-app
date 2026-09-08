import 'server-only';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'liivv_pharmacist';
/** Must match the BC iframe app path so the cookie is sent inside the control panel. */
const COOKIE_PATH = '/pharmacy-admin';
const SESSION_MS = 12 * 60 * 60 * 1000;

export const PHARMACIST_PORTAL_PATH = '/pharmacy-admin';
export const PHARMACIST_LOGIN_PATH = '/pharmacy-admin/login';

export type PharmacistSession = {
  username: string;
  expMs: number;
};

function getSecret(): string | null {
  return process.env.AUTH_SECRET?.trim() || null;
}

export function getPharmacistCredentials(): { username: string; password: string } | null {
  const username = process.env.PHARMACIST_USERNAME?.trim() || '';
  const password = process.env.PHARMACIST_PASSWORD ?? '';

  if (!username || !password) {
    return null;
  }

  return { username, password };
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

export function credentialsMatch(inputUser: string, inputPassword: string): boolean {
  const expected = getPharmacistCredentials();

  if (!expected) {
    return false;
  }

  const userOk = timingSafeEqual(inputUser.trim(), expected.username);
  const passOk = timingSafeEqual(inputPassword, expected.password);

  return userOk && passOk;
}

async function buildToken(secret: string, session: PharmacistSession): Promise<string> {
  const payload = JSON.stringify(session);
  const sig = await hmacSign(secret, payload);

  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<PharmacistSession | null> {
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

    const session = JSON.parse(payloadJson) as PharmacistSession;

    if (!session.username || !session.expMs) {
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
    // Third-party iframe inside BigCommerce admin requires SameSite=None.
    sameSite: 'none' as const,
    secure: true,
    maxAge: maxAgeSec,
  };
}

export async function getPharmacistSession(): Promise<PharmacistSession | null> {
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

export async function createPharmacistSessionCookie(username: string): Promise<void> {
  const secret = getSecret();

  if (!secret) {
    throw new Error('AUTH_SECRET is not set.');
  }

  const session: PharmacistSession = {
    username,
    expMs: Date.now() + SESSION_MS,
  };
  const token = await buildToken(secret, session);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encodeURIComponent(token), cookieOptions(Math.floor(SESSION_MS / 1000)));
}

export async function clearPharmacistSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    ...cookieOptions(0),
    maxAge: 0,
  });
}
