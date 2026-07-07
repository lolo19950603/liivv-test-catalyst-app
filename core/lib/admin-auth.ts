import 'server-only';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'liiv_staff';
const COOKIE_PATH = '/staff';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function getPassword(): string | null {
  return process.env.ADMIN_DASHBOARD_PASSWORD?.trim() || null;
}

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
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

  return Buffer.from(sig).toString('base64');
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

async function buildToken(secret: string, expMs: number): Promise<string> {
  const payload = String(expMs);
  const sig = await hmacSign(secret, payload);

  return `${payload}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<boolean> {
  const dot = token.indexOf('.');

  if (dot < 1) {
    return false;
  }

  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number.parseInt(expStr, 10);

  if (Number.isNaN(exp) || Date.now() > exp) {
    return false;
  }

  const expected = await hmacSign(secret, expStr);

  return timingSafeEqual(sig, expected);
}

export function isStaffAuthConfigured(): boolean {
  return Boolean(getPassword() && getSecret());
}

export async function isValidStaffSession(): Promise<boolean> {
  const secret = getSecret();

  if (!secret) {
    return false;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return false;
  }

  try {
    return await verifyToken(secret, decodeURIComponent(raw));
  } catch {
    return false;
  }
}

export async function createStaffSessionCookie(): Promise<void> {
  const secret = getSecret();

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set.');
  }

  const exp = Date.now() + SESSION_MS;
  const token = await buildToken(secret, exp);
  const cookieStore = await cookies();
  const maxAgeSec = Math.floor(SESSION_MS / 1000);

  cookieStore.set(COOKIE_NAME, encodeURIComponent(token), {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: maxAgeSec,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearStaffSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  });
}

export function verifyStaffPassword(password: string): boolean {
  const expected = getPassword();

  if (!expected) {
    return false;
  }

  return timingSafeEqual(password.trim(), expected);
}
