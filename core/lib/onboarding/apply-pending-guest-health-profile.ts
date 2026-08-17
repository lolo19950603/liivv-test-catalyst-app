import 'server-only';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';

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
  upsertHealthProfile,
  type HealthProfileRow,
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

function rowToPayload(row: HealthProfileRow): UpsertHealthProfilePayload {
  return {
    profile_id: row.profile_id,
    diabetes_type: row.diabetes_type,
    diagnosis_year: row.diagnosis_year,
    current_medications: row.current_medications,
    allergies: row.allergies,
    insulin_pump_user: Boolean(row.insulin_pump_user),
    cgm_user: Boolean(row.cgm_user),
    preferred_cgm_brand: row.preferred_cgm_brand,
    preferred_pump_brand: row.preferred_pump_brand,
    ostomy_type: row.ostomy_type,
    ostomy_tenure: row.ostomy_tenure,
    ostomy_preferred_brand: row.ostomy_preferred_brand,
    ostomy_product_type: row.ostomy_product_type,
    wants_ostomy_specialist: Boolean(row.wants_ostomy_specialist),
    catheter_type: row.catheter_type,
    catheter_length: row.catheter_length,
    catheter_preferred_brand: row.catheter_preferred_brand,
    catheter_french_size: row.catheter_french_size,
    wound_care_type: row.wound_care_type,
    wound_care_preferred_brand: row.wound_care_preferred_brand,
    respiratory_type: row.respiratory_type,
    respiratory_preferred_brand: row.respiratory_preferred_brand,
    doctor_name: row.doctor_name,
    doctor_phone: row.doctor_phone,
    pharmacy_name: row.pharmacy_name,
    pharmacy_phone: row.pharmacy_phone,
    notes: row.notes,
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
  },
): Promise<boolean> {
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

  if (alreadyHasCategory && responsesAlreadyPresent(storedResponses, input.responses)) {
    return true;
  }

  const base = existing ? rowToPayload(existing) : emptyPayload(ensured.profile.id);
  const mergedResponses = { ...storedResponses, ...input.responses };
  const payload: UpsertHealthProfilePayload = {
    ...base,
    profile_id: ensured.profile.id,
    ostomy_type: optStr(input.responses.ostomy_type) ?? base.ostomy_type,
    ostomy_tenure: optStr(input.responses.ostomy_journey_stage) ?? base.ostomy_tenure,
    ostomy_preferred_brand:
      optStr(input.responses.ostomy_preferred_brand) ?? base.ostomy_preferred_brand,
    notes: JSON.stringify({ category_responses: mergedResponses }),
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
 * customer's health profile. Deduped per request via React cache().
 */
export const applyPendingGuestHealthProfile = cache(async (customer: ApplyCustomer) => {
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
    });

    if (!saved) {
      return { applied: false as const };
    }

    await clearPendingGuestHealthProfile();

    return { applied: true as const };
  } catch {
    return { applied: false as const };
  }
});
