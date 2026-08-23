import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import {
  isLandingHealthCategoryId,
  pickCategoryResponses,
  validateCategoryResponses,
  type CategoryResponses,
  type LandingHealthCategoryId,
} from '~/lib/onboarding/category-questionnaires';

export const PENDING_GUEST_HEALTH_COOKIE = 'liivv_pending_health_profile';

/** Quiz answers only follow the guest into register/login if they continue in this window. */
export const PENDING_GUEST_HEALTH_MAX_AGE_SECONDS = 60 * 60;

const pendingGuestHealthSchema = z.object({
  categoryId: z.string().min(1),
  responses: z.record(z.string(), z.union([z.string().min(1), z.array(z.string().min(1))])),
  createdAt: z.number().optional(),
});

export type PendingGuestHealthProfile = {
  categoryId: LandingHealthCategoryId;
  responses: CategoryResponses;
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

function encode(data: StoredPendingGuestHealthProfile): string {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
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

function decode(raw: string): PendingGuestHealthProfile | null {
  try {
    const parsed = pendingGuestHealthSchema.parse(
      JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')),
    );

    if (!isLandingHealthCategoryId(parsed.categoryId) || !isFresh(parsed.createdAt)) {
      return null;
    }

    const responses = pickCategoryResponses(parsed.categoryId, parsed.responses);

    if (!validateCategoryResponses(parsed.categoryId, responses)) {
      return null;
    }

    return { categoryId: parsed.categoryId, responses };
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

  return decode(cookie.value);
}

export async function setPendingGuestHealthProfile(
  payload: PendingGuestHealthProfile,
): Promise<void> {
  const responses = pickCategoryResponses(payload.categoryId, payload.responses);

  if (!validateCategoryResponses(payload.categoryId, responses)) {
    throw new Error('Incomplete health profile answers.');
  }

  const cookieStore = await cookies();

  cookieStore.set(
    PENDING_GUEST_HEALTH_COOKIE,
    encode({ categoryId: payload.categoryId, responses, createdAt: Date.now() }),
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
