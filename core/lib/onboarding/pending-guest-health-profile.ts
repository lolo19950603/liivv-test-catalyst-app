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

const pendingGuestHealthSchema = z.object({
  categoryId: z.string().min(1),
  responses: z.record(z.string(), z.union([z.string().min(1), z.array(z.string().min(1))])),
});

export type PendingGuestHealthProfile = {
  categoryId: LandingHealthCategoryId;
  responses: CategoryResponses;
};

function encode(data: PendingGuestHealthProfile): string {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
}

function decode(raw: string): PendingGuestHealthProfile | null {
  try {
    const parsed = pendingGuestHealthSchema.parse(
      JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')),
    );

    if (!isLandingHealthCategoryId(parsed.categoryId)) {
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

  cookieStore.set(PENDING_GUEST_HEALTH_COOKIE, encode({ categoryId: payload.categoryId, responses }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearPendingGuestHealthProfile(): Promise<void> {
  const cookieStore = await cookies();

  try {
    cookieStore.delete(PENDING_GUEST_HEALTH_COOKIE);
  } catch {
    cookieStore.set(PENDING_GUEST_HEALTH_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }
}
