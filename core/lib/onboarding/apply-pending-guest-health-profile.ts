import 'server-only';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';

import { runCustomerAction } from '~/lib/action-gateway/session';
import {
  buildHealthAnswersNotes,
  consentedAnswerKeys,
  type HealthAnswersConsent,
  isHealthAnswersConsentGranted,
  isHealthAnswersWithdrawn,
} from '~/lib/onboarding/health-profile-consent';
import {
  encodeRankedCareInterest,
  resolveInitialHealthCategoriesWithRank,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import {
  clearPendingGuestHealthProfile,
  getPendingGuestHealthProfile,
} from '~/lib/onboarding/pending-guest-health-profile';
import { completeOnboardingStep2 } from '~/lib/supabase/onboarding';
import {
  getHealthProfileByProfileId,
  healthProfileRowToUpsertPayload,
  upsertHealthProfile,
  type UpsertHealthProfilePayload,
} from '~/lib/supabase/health-profile';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

import type { CategoryResponses } from './category-questionnaires';

type ApplyCustomer = {
  entityId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

function parseCategoryResponses(notes: string | null | undefined): CategoryResponses {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes) as { category_responses?: CategoryResponses };
    return parsed?.category_responses ?? {};
  } catch {
    return {};
  }
}

function responsesAlreadyPresent(stored: CategoryResponses, pending: CategoryResponses): boolean {
  return Object.entries(pending).every(([key, value]) => {
    const current = stored[key];

    if (Array.isArray(value)) {
      return (
        Array.isArray(current) &&
        value.length === current.length &&
        value.every((entry) => current.includes(entry))
      );
    }

    return current === value;
  });
}

function emptyPayload(profileId: string): UpsertHealthProfilePayload {
  return {
    profile_id: profileId,
    diabetes_type: null,
    diagnosis_year: null,
    current_medications: null,
    allergies: null,
    insulin_pump_user: false,
    cgm_user: false,
    preferred_cgm_brand: null,
    preferred_pump_brand: null,
    ostomy_type: null,
    ostomy_tenure: null,
    ostomy_preferred_brand: null,
    ostomy_product_type: null,
    wants_ostomy_specialist: false,
    catheter_type: null,
    catheter_length: null,
    catheter_preferred_brand: null,
    catheter_french_size: null,
    wound_care_type: null,
    wound_care_preferred_brand: null,
    respiratory_type: null,
    respiratory_preferred_brand: null,
    doctor_name: null,
    doctor_phone: null,
    pharmacy_name: null,
    pharmacy_phone: null,
    notes: null,
  };
}

function optStr(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function mergeCareInterests(
  existing: string[] | null | undefined,
  categoryId: LiivPrimaryCategoryId,
  placement: 'primary' | 'append',
): string[] {
  const ranked = resolveInitialHealthCategoriesWithRank(existing).filter(
    (row) => row.id !== categoryId,
  );

  if (placement === 'append') {
    return [
      ...ranked.map((row) => encodeRankedCareInterest(row.id, row.rank)),
      encodeRankedCareInterest(categoryId, ranked.length + 1),
    ];
  }

  return [
    encodeRankedCareInterest(categoryId, 1),
    ...ranked.map((row, index) => encodeRankedCareInterest(row.id, index + 2)),
  ];
}

export async function saveLandingCategoryAnswers(
  customer: ApplyCustomer,
  input: {
    categoryId: LiivPrimaryCategoryId;
    responses: CategoryResponses;
    placement?: 'primary' | 'append';
    /**
     * The express consent that covers these answers. Required, so no caller
     * can reach this function without having asked. Null or withdrawn means
     * nothing is written at all.
     */
    consent: HealthAnswersConsent | null;
  },
): Promise<boolean> {
  if (!isHealthAnswersConsentGranted(input.consent)) {
    return false;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return false;
  }

  const existing = await getHealthProfileByProfileId(ensured.profile.id);
  const storedResponses = parseCategoryResponses(existing?.notes);
  const alreadyHasCategory = resolveInitialHealthCategoriesWithRank(
    ensured.profile.care_interests,
  ).some((row) => row.id === input.categoryId);
  const alreadyConsented = consentedAnswerKeys(existing?.notes);
  // Skip the write only when there is nothing left to record: the same answers
  // are on file, under this category, and a tick already covers them. A tick
  // for answers that are on file but uncovered still has to be written down,
  // and so does one given after a withdrawal — that is how someone turns
  // personalization back on.
  const nothingToRecord =
    alreadyHasCategory &&
    !isHealthAnswersWithdrawn(existing?.notes) &&
    responsesAlreadyPresent(storedResponses, input.responses) &&
    Object.keys(input.responses).every((key) => alreadyConsented.includes(key));

  if (nothingToRecord) {
    return true;
  }

  const base = existing
    ? healthProfileRowToUpsertPayload(existing)
    : emptyPayload(ensured.profile.id);
  const payload: UpsertHealthProfilePayload = {
    ...base,
    profile_id: ensured.profile.id,
    ostomy_type: optStr(input.responses.ostomy_type) ?? base.ostomy_type,
    ostomy_tenure: optStr(input.responses.ostomy_journey_stage) ?? base.ostomy_tenure,
    ostomy_preferred_brand:
      optStr(input.responses.ostomy_preferred_brand) ?? base.ostomy_preferred_brand,
    // Consent travels with the answers it covers, in the JSON that is already
    // stored in `notes`. The tick this quiz collected covers the answers on
    // this page and nothing else: answers already on file keep the consent they
    // came with — or none — and earlier ticks are preserved beside it.
    notes: buildHealthAnswersNotes({
      existingNotes: existing?.notes,
      newResponses: input.responses,
      consent: input.consent,
    }),
  };

  const up = await upsertHealthProfile(payload);

  if (!up.ok) {
    return false;
  }

  const ranked = mergeCareInterests(
    ensured.profile.care_interests,
    input.categoryId,
    input.placement ?? 'primary',
  );
  const saved = await completeOnboardingStep2(customer, ranked);

  if (!saved) {
    return false;
  }

  revalidatePath('/account/dashboard');
  revalidatePath('/account/health-profile');
  revalidatePath('/liivv-health/diabetes-care');
  revalidatePath('/liivv-health/ostomy-care');
  revalidatePath('/liivv-health/womens-health');

  return true;
}

/**
 * Reads the guest landing-page quiz cookie and writes it into the signed-in
 * customer's health profile. Session is checked here — callers cannot pass a
 * customer. Deduped per request via React cache().
 *
 * Answers stashed before the guest ticked the consent box carry no consent
 * record, so they are dropped here rather than written. The cookie is cleared
 * either way.
 */
export const applyPendingGuestHealthProfile = cache(async () => {
  return runCustomerAction({ result: { applied: false as const } }, async (customer) => {
    try {
      if (!isSupabaseConfigured()) {
        return { applied: false as const };
      }

      const pending = await getPendingGuestHealthProfile();

      if (!pending) {
        return { applied: false as const };
      }

      const saved = await saveLandingCategoryAnswers(customer, {
        categoryId: pending.categoryId,
        responses: pending.responses,
        placement: 'primary',
        consent: pending.consent,
      });

      return { applied: Boolean(saved) };
    } catch {
      return { applied: false as const };
    } finally {
      await clearPendingGuestHealthProfile();
    }
  });
});
