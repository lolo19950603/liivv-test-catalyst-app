'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { validateHealthProfileComplete } from '~/lib/onboarding/health-profile-form-validation';
import {
  encodeRankedCareInterest,
  isLiivPrimaryCategoryId,
  isPrimaryCategoryAllowedForCustomer,
  isOntarioZoneCode,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import { completeOnboardingStep2 } from '~/lib/supabase/onboarding';
import { upsertHealthProfile, type UpsertHealthProfilePayload } from '~/lib/supabase/health-profile';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export type HealthProfileActionState = { error?: string } | null;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function optStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);

  return value || null;
}

function buildCategoryResponses(formData: FormData): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  const singleKeys = [
    'diabetes_path',
    'diabetes_journey_stage',
    'ostomy_type',
    'ostomy_journey_stage',
    'ostomy_preferred_brand',
    'womens_age_range',
    'womens_life_phase',
    'sleep_rest_barrier',
    'sleep_rest_cpap_status',
    'wound_support_type',
    'minor_ailment_focus',
    'personal_care_priority',
    'breathing_routine',
    'heart_tracking_pref',
    'heart_circulation_issue',
    'skin_goal',
    'skin_rules',
    'nutrition_fuel_focus',
  ] as const;

  for (const key of singleKeys) {
    const value = optStr(formData, key);

    if (value) {
      out[key] = value;
    }
  }

  const diabetesManagement = formData
    .getAll('diabetes_management')
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (diabetesManagement.length > 0) {
    out.diabetes_management = [...new Set(diabetesManagement)];
  }

  const nutritionGuardrails = formData
    .getAll('nutrition_guardrails')
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (nutritionGuardrails.length > 0) {
    out.nutrition_guardrails = [...new Set(nutritionGuardrails)];
  }

  return out;
}

function buildHealthPayload(profileId: string, formData: FormData): UpsertHealthProfilePayload {
  const categoryResponses = buildCategoryResponses(formData);

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
    ostomy_type: optStr(formData, 'ostomy_type'),
    ostomy_tenure: optStr(formData, 'ostomy_journey_stage'),
    ostomy_preferred_brand: optStr(formData, 'ostomy_preferred_brand'),
    ostomy_product_type: null,
    wants_ostomy_specialist: false,
    catheter_type: null,
    catheter_length: null,
    catheter_preferred_brand: null,
    catheter_french_size: null,
    wound_care_type: optStr(formData, 'wound_support_type'),
    wound_care_preferred_brand: null,
    respiratory_type: optStr(formData, 'breathing_routine'),
    respiratory_preferred_brand: null,
    doctor_name: null,
    doctor_phone: null,
    pharmacy_name: null,
    pharmacy_phone: null,
    notes: JSON.stringify({ category_responses: categoryResponses }),
  };
}

export async function saveHealthProfileStep(
  _prevState: HealthProfileActionState,
  formData: FormData,
): Promise<HealthProfileActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { error: 'Please sign in to continue.' };
  }

  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const intent = str(formData, 'intent');
  const isOntario = isOntarioZoneCode(str(formData, 'zoneCode') || str(formData, 'stateOrProvince'));
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { error: ensured.status === 'error' ? ensured.message : 'Profile not ready.' };
  }

  const rawCategoryIds = formData.getAll('care_interests').flatMap((value) => {
    if (typeof value !== 'string') {
      return [];
    }

    const normalized = value.trim().toLowerCase();

    return normalized ? [normalized] : [];
  });
  const normalizedCare = [...new Set(rawCategoryIds)];
  const normalizedCareWithRank = normalizedCare.map((id, index) =>
    encodeRankedCareInterest(id as LiivPrimaryCategoryId, index + 1),
  );

  if (intent !== 'save') {
    return { error: 'Unknown action.' };
  }

  for (const id of normalizedCare) {
    if (!isLiivPrimaryCategoryId(id)) {
      return { error: 'Invalid category selection.' };
    }

    if (!isPrimaryCategoryAllowedForCustomer(id, { isOntario })) {
      return { error: 'One or more categories are not available for your province.' };
    }
  }

  const validation = validateHealthProfileComplete(formData);

  if (!validation.ok) {
    return { error: validation.message };
  }

  const payload = buildHealthPayload(ensured.profile.id, formData);
  const up = await upsertHealthProfile(payload);

  if (!up.ok) {
    return { error: up.message };
  }

  const saved = await completeOnboardingStep2(customer, normalizedCareWithRank);

  if (!saved) {
    return { error: 'Could not save health profile.' };
  }

  revalidatePath('/account/dashboard');
  redirect('/account/dashboard/');
}
