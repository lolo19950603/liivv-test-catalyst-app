import 'server-only';

import { cookies } from 'next/headers';
import { decode as decodeJwt, encode as encodeJwt } from 'next-auth/jwt';
import { z } from 'zod';

import {
  isLandingHealthCategoryId,
  pickCategoryResponses,
  validateCategoryResponses,
  type CategoryResponses,
  type LandingHealthCategoryId,
} from '~/lib/onboarding/category-questionnaires';
import {
  type HealthAnswersConsent,
  isHealthAnswersConsentGranted,
  readHealthAnswersConsentRecord,
} from '~/lib/onboarding/health-profile-consent';

export const PENDING_GUEST_HEALTH_COOKIE = 'liivv_pending_health_profile';

/** Quiz answers only follow the guest into register/login if they continue in this window. */
export const PENDING_GUEST_HEALTH_MAX_AGE_SECONDS = 60 * 60;

const pendingGuestConsentSchema = z.object({
  granted: z.boolean(),
  version: z.string(),
  grantedAt: z.string(),
  source: z.string(),
  locale: z.string().nullable().optional(),
  /**
   * The answer keys the tick was given for. Optional only so a cookie written
   * before this existed still parses; it then decodes to no coverage at all.
   */
  covers: z.array(z.string()).optional(),
});

const pendingGuestHealthSchema = z.object({
  categoryId: z.string().min(1),
  responses: z.record(z.string(), z.union([z.string().min(1), z.array(z.string().min(1))])),
  createdAt: z.number().optional(),
  /**
   * Optional in the schema only so a cookie written before express consent
   * existed still parses. It decodes to null, and null answers are dropped
   * rather than written to a profile.
   */
  consent: pendingGuestConsentSchema.optional(),
});

export type PendingGuestHealthProfile = {
  categoryId: LandingHealthCategoryId;
  responses: CategoryResponses;
  /** The express consent the guest gave before these answers were stashed. */
  consent: HealthAnswersConsent | null;
};

type StoredPendingGuestHealthProfile = PendingGuestHealthProfile & {
  createdAt: number;
};

function pendingGuestCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    ...(maxAge <= 0 ? { expires: new Date(0) } : {}),
  };
}

/*
 * =============================================================================
 * THE COOKIE IS ENCRYPTED, NOT ENCODED
 * =============================================================================
 * What travels in here is "this visitor has an ileostomy, and they are three
 * weeks post-op". It was base64, which is not a protection: anything that logs
 * or dumps a request cookie — an edge or CDN access log, a WAF rule, a server-
 * side request dump, a support screenshot — captured a health record that is
 * one `atob` from plain text. `path: '/'` means it rides on every request to
 * the origin for the hour it lives, so that is a lot of places.
 *
 * Now a JWE, using the same next-auth encode/decode and the same AUTH_SECRET
 * the anonymous session already relies on (core/auth/anonymous-session.ts), so
 * no new secret and no new dependency. The token also carries its own `exp`, so
 * the one-hour window is enforced by the crypto as well as by `isFresh`.
 *
 * Only these two functions changed. The cookie's own options — httpOnly,
 * secure, sameSite lax, maxAge one hour — are unchanged and still do the rest.
 * A cookie written before this ships simply fails to decrypt and decodes to
 * null, which is the same answer as an expired one.
 * =============================================================================
 */
function getCookieSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }

  return secret;
}

async function encode(data: StoredPendingGuestHealthProfile): Promise<string> {
  return encodeJwt({
    salt: PENDING_GUEST_HEALTH_COOKIE,
    secret: getCookieSecret(),
    maxAge: PENDING_GUEST_HEALTH_MAX_AGE_SECONDS,
    token: { ...data },
  });
}

function isFresh(createdAt: number | undefined): boolean {
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) {
    return false;
  }

  const ageMs = Date.now() - createdAt;

  if (ageMs < -60_000) {
    return false;
  }

  return ageMs <= PENDING_GUEST_HEALTH_MAX_AGE_SECONDS * 1000;
}

async function decode(raw: string): Promise<PendingGuestHealthProfile | null> {
  try {
    const parsed = pendingGuestHealthSchema.parse(
      await decodeJwt({
        salt: PENDING_GUEST_HEALTH_COOKIE,
        secret: getCookieSecret(),
        token: raw,
      }),
    );

    if (!isLandingHealthCategoryId(parsed.categoryId) || !isFresh(parsed.createdAt)) {
      return null;
    }

    const responses = pickCategoryResponses(parsed.categoryId, parsed.responses);

    if (!validateCategoryResponses(parsed.categoryId, responses)) {
      return null;
    }

    return {
      categoryId: parsed.categoryId,
      responses,
      consent: readHealthAnswersConsentRecord(parsed.consent),
    };
  } catch {
    return null;
  }
}

export async function getPendingGuestHealthProfile(): Promise<PendingGuestHealthProfile | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(PENDING_GUEST_HEALTH_COOKIE);

  if (!cookie?.value) {
    return null;
  }

  return await decode(cookie.value);
}

export async function setPendingGuestHealthProfile(
  payload: PendingGuestHealthProfile,
): Promise<void> {
  const responses = pickCategoryResponses(payload.categoryId, payload.responses);

  if (!validateCategoryResponses(payload.categoryId, responses)) {
    throw new Error('Incomplete health profile answers.');
  }

  // Nothing health-related is written to this device without the tick either.
  if (!isHealthAnswersConsentGranted(payload.consent)) {
    throw new Error('Express consent is required before health answers are kept.');
  }

  const cookieStore = await cookies();
  const value = await encode({
    categoryId: payload.categoryId,
    responses,
    consent: payload.consent,
    createdAt: Date.now(),
  });

  cookieStore.set(
    PENDING_GUEST_HEALTH_COOKIE,
    value,
    pendingGuestCookieOptions(PENDING_GUEST_HEALTH_MAX_AGE_SECONDS),
  );
}

export async function clearPendingGuestHealthProfile(): Promise<void> {
  const cookieStore = await cookies();

  try {
    cookieStore.delete({ name: PENDING_GUEST_HEALTH_COOKIE, path: '/' });
  } catch {
    // Server Components cannot mutate cookies.
  }

  try {
    cookieStore.set(PENDING_GUEST_HEALTH_COOKIE, '', pendingGuestCookieOptions(0));
  } catch {
    // Same as above — login/register actions still clear this.
  }
}
