'use server';

import { runCustomerAction } from '~/lib/action-gateway/session';
import { saveLandingCategoryAnswers } from '~/lib/onboarding/apply-pending-guest-health-profile';
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

export async function saveSignedInLandingQuiz(input: {
  categoryId: string;
  responses: CategoryResponses;
  consentGranted: boolean;
  locale?: string;
}): Promise<{ ok: true } | { ok: false; error: string; code?: string }> {
  return runCustomerAction(
    { result: { ok: false, error: 'Please sign in to save this to your health profile.' } },
    async (customer) => {
      if (!isLandingHealthCategoryId(input.categoryId)) {
        return { ok: false, error: 'This health category is not available yet.' };
      }

      const responses = pickCategoryResponses(input.categoryId, input.responses);

      if (!validateCategoryResponses(input.categoryId, responses)) {
        return { ok: false, error: 'Please answer every question before continuing.' };
      }

      // Same rule as the health-profile form: no tick, nothing written.
      if (!input.consentGranted) {
        return {
          ok: false,
          code: HEALTH_ANSWERS_CONSENT_REQUIRED_CODE,
          error: HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE,
        };
      }

      try {
        const saved = await saveLandingCategoryAnswers(customer, {
          categoryId: input.categoryId,
          responses,
          placement: 'append',
          // The tick on this page covers the answers on this page. Anything already
          // on the profile keeps the consent it was given, or none.
          consent: buildHealthAnswersConsent({
            source: 'landing_quiz',
            locale: input.locale,
            covers: Object.keys(responses),
          }),
        });

        if (!saved) {
          return { ok: false, error: 'Could not save your answers. Please try again.' };
        }
      } catch {
        return { ok: false, error: 'Could not save your answers. Please try again.' };
      }

      return { ok: true };
    },
  );
}
