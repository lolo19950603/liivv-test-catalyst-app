'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { runCustomerAction } from '~/lib/action-gateway/session';
import {
  buildHealthAnswersConsent,
  buildHealthAnswersNotes,
  buildHealthAnswersWithdrawal,
  buildHealthAnswersWithdrawalNotes,
  HEALTH_ANSWERS_CONSENT_LOCALE_FIELD,
  HEALTH_ANSWERS_CONSENT_REQUIRED_CODE,
  HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE,
  HEALTH_ANSWERS_CONSENT_WITHDRAWN_CODE,
  HEALTH_ANSWERS_CONSENT_WITHDRAWN_MESSAGE,
  type HealthAnswersConsent,
  isHealthAnswersConsentTicked,
  isHealthAnswersWithdrawn,
  readHealthAnswersConsent,
} from '~/lib/onboarding/health-profile-consent';
import { validateHealthProfileComplete } from '~/lib/onboarding/health-profile-form-validation';
import {
  encodeRankedCareInterest,
  isLiivPrimaryCategoryId,
  isPrimaryCategoryAllowedForCustomer,
  isOntarioZoneCode,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import { completeOnboardingStep2, getOnboardingStatus } from '~/lib/supabase/onboarding';
import {
  getHealthProfileByProfileId,
  type HealthProfileRow,
  healthProfileRowToUpsertPayload,
  upsertHealthProfile,
  type UpsertHealthProfilePayload,
} from '~/lib/supabase/health-profile';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

/**
 * `code` names an outcome the client can put into the reader's own language.
 * `error` stays an English sentence so nothing has to know the codes, and
 * `notice` carries an outcome that is not a failure — withdrawing consent is
 * something the person asked for, so it is not shown as an error.
 */
export type HealthProfileActionState = {
  error?: string;
  notice?: string;
  code?: string;
} | null;

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

function buildHealthPayload(
  profileId: string,
  formData: FormData,
  categoryResponses: Record<string, string | string[]>,
  consent: HealthAnswersConsent,
  existingNotes: string | null,
): UpsertHealthProfilePayload {
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
    // The consent record rides in the same JSON as the answers it covers, so
    // the two can never be stored apart. No new column, no migration. This form
    // rebuilds the whole answer set from the submission, hence `replace`: a
    // category the person removed leaves the row instead of being merged back
    // in. Everything else the row already carried — an earlier tick from the
    // landing quiz, its history, a recorded withdrawal — is written back by
    // buildHealthAnswersNotes rather than flattened away.
    notes: buildHealthAnswersNotes({
      existingNotes,
      newResponses: categoryResponses,
      consent,
      answers: 'replace',
    }),
  };
}

/*
 * What an unticked save means.
 *
 * With a tick already on file it is a withdrawal, and a real one: the
 * withdrawal is written down, and from that moment nothing personalizes from
 * these answers. The answers themselves are left exactly where they are — this
 * action deletes nothing, and the wording on the form says so — and no part of
 * the submission is saved, because the person did not agree to it.
 *
 * With nothing to withdraw it is still a refusal: there is no consent, so
 * there is nothing to write, and the message tells them so.
 */
async function withdrawOrRefuse(
  existing: HealthProfileRow | null,
  locale: string,
): Promise<HealthProfileActionState> {
  const refusal = {
    code: HEALTH_ANSWERS_CONSENT_REQUIRED_CODE,
    error: HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE,
  };

  if (!existing || !readHealthAnswersConsent(existing.notes)) {
    return refusal;
  }

  if (isHealthAnswersWithdrawn(existing.notes)) {
    return refusal;
  }

  const withdrawal = buildHealthAnswersWithdrawal({ source: 'health_profile_form', locale });
  const up = await upsertHealthProfile({
    ...healthProfileRowToUpsertPayload(existing),
    notes: buildHealthAnswersWithdrawalNotes({ existingNotes: existing.notes, withdrawal }),
  });

  if (!up.ok) {
    return { error: up.message };
  }

  revalidatePath('/account/dashboard');
  revalidatePath('/account/health-profile');

  return {
    code: HEALTH_ANSWERS_CONSENT_WITHDRAWN_CODE,
    notice: HEALTH_ANSWERS_CONSENT_WITHDRAWN_MESSAGE,
  };
}

export async function saveHealthProfileStep(
  _prevState: HealthProfileActionState,
  formData: FormData,
): Promise<HealthProfileActionState> {
  return runCustomerAction(
    { result: { error: 'Please sign in to continue.' } },
    async (customer) => {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase is not configured.' };
      }

      const intent = str(formData, 'intent');
      const isOntario = isOntarioZoneCode(
        str(formData, 'zoneCode') || str(formData, 'stateOrProvince'),
      );
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

      const existing = await getHealthProfileByProfileId(ensured.profile.id);
      const consentLocale = str(formData, HEALTH_ANSWERS_CONSENT_LOCALE_FIELD);

      // Health answers are only written once the person has ticked the express
      // consent box on this submission. Nothing new is saved without it — not the
      // answers, not the completed-step timestamp. This runs before the form
      // validation below on purpose: taking consent back writes none of the
      // submission, so it must not be blocked by a question left unanswered.
      if (!isHealthAnswersConsentTicked(formData)) {
        return withdrawOrRefuse(existing, consentLocale);
      }

      const validation = validateHealthProfileComplete(formData);

      if (!validation.ok) {
        return { error: validation.message };
      }

      const categoryResponses = buildCategoryResponses(formData);
      const consent = buildHealthAnswersConsent({
        source: 'health_profile_form',
        locale: consentLocale,
        // Every answer written here came from this submission, so the person read
        // each one back to us before ticking.
        covers: Object.keys(categoryResponses),
      });
      const payload = buildHealthPayload(
        ensured.profile.id,
        formData,
        categoryResponses,
        consent,
        existing?.notes ?? null,
      );
      const up = await upsertHealthProfile(payload);

      if (!up.ok) {
        return { error: up.message };
      }

      const saved = await completeOnboardingStep2(customer, normalizedCareWithRank);

      if (!saved) {
        return { error: 'Could not save health profile.' };
      }

      revalidatePath('/account/dashboard');
      revalidatePath('/account/health-profile');

      const status = await getOnboardingStatus(String(customer.entityId));
      const celebrate = Boolean(status?.insurance_info_completed_at);

      redirect(celebrate ? '/account/dashboard/?oliviaCelebrate=1' : '/account/dashboard/');
    },
  );
}
