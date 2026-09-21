'use server';

import {
  isLandingHealthCategoryId,
  pickCategoryResponses,
  validateCategoryResponses,
  type CategoryResponses,
} from '~/lib/onboarding/category-questionnaires';
import {
  buildHealthAnswersConsent,
  HEALTH_ANSWERS_CONSENT_REQUIRED_CODE,
  HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE,
} from '~/lib/onboarding/health-profile-consent';
import { setPendingGuestHealthProfile } from '~/lib/onboarding/pending-guest-health-profile';

export async function stashGuestHealthAnswers(input: {
  categoryId: string;
  responses: CategoryResponses;
  consentGranted: boolean;
  locale?: string;
}): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  if (!isLandingHealthCategoryId(input.categoryId)) {
    return { ok: false, error: 'This health category is not available yet.' };
  }

  const responses = pickCategoryResponses(input.categoryId, input.responses);

  if (!validateCategoryResponses(input.categoryId, responses)) {
    return { ok: false, error: 'Please answer every question before continuing.' };
  }

  // Answers only leave the page once the guest has ticked the consent box.
  if (!input.consentGranted) {
    return {
      ok: false,
      code: HEALTH_ANSWERS_CONSENT_REQUIRED_CODE,
      error: HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE,
    };
  }

  try {
    await setPendingGuestHealthProfile({
      categoryId: input.categoryId,
      responses,
      consent: buildHealthAnswersConsent({
        source: 'landing_quiz',
        locale: input.locale,
        covers: Object.keys(responses),
      }),
    });
  } catch {
    return { ok: false, error: 'Could not save your answers. Please try again.' };
  }

  return { ok: true };
}
