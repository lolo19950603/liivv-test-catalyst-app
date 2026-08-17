'use server';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { saveLandingCategoryAnswers } from '~/lib/onboarding/apply-pending-guest-health-profile';
import {
  isLandingHealthCategoryId,
  pickCategoryResponses,
  validateCategoryResponses,
  type CategoryResponses,
} from '~/lib/onboarding/category-questionnaires';

export async function saveSignedInLandingQuiz(input: {
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

  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { ok: false, error: 'Please sign in to save this to your health profile.' };
  }

  try {
    const saved = await saveLandingCategoryAnswers(customer, {
      categoryId: input.categoryId,
      responses,
      placement: 'append',
    });

    if (!saved) {
      return { ok: false, error: 'Could not save your answers. Please try again.' };
    }
  } catch {
    return { ok: false, error: 'Could not save your answers. Please try again.' };
  }

  return { ok: true };
}
