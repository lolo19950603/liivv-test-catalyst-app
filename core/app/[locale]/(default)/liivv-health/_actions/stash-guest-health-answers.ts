'use server';

import {
  isLandingHealthCategoryId,
  pickCategoryResponses,
  validateCategoryResponses,
  type CategoryResponses,
} from '~/lib/onboarding/category-questionnaires';
import { setPendingGuestHealthProfile } from '~/lib/onboarding/pending-guest-health-profile';

export async function stashGuestHealthAnswers(input: {
  categoryId: string;
  responses: CategoryResponses;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isLandingHealthCategoryId(input.categoryId)) {
    return { ok: false, error: 'This health category is not available yet.' };
  }

  const responses = pickCategoryResponses(input.categoryId, input.responses);

  if (!validateCategoryResponses(input.categoryId, responses)) {
    return { ok: false, error: 'Please answer every question before continuing.' };
  }

  try {
    await setPendingGuestHealthProfile({ categoryId: input.categoryId, responses });
  } catch {
    return { ok: false, error: 'Could not save your answers. Please try again.' };
  }

  return { ok: true };
}
