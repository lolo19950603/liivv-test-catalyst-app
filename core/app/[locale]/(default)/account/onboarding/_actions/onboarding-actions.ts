'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { syncOnboardingProfileToBigCommerce } from '~/lib/onboarding/bigcommerce-profile-sync';
import { validateHealthProfileComplete } from '~/lib/onboarding/health-profile-form-validation';
import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  ACCOUNT_ONBOARDING_INSURANCE,
  appendSetupFlowQuery,
  SETUP_FLOW_VALUE,
} from '~/lib/onboarding/onboarding-flow';
import { redirectAfterHealthProfileStep } from '~/lib/onboarding/redirect-after-health-step';
import {
  encodeRankedCareInterest,
  isLiivPrimaryCategoryId,
  isPrimaryCategoryAllowedForCustomer,
  isOntarioZoneCode,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';
import {
  completeOnboardingStep1,
  completeOnboardingStep2,
  completeOnboardingStep3,
  getOnboardingStatus,
} from '~/lib/supabase/onboarding';
import { upsertHealthProfile, type UpsertHealthProfilePayload } from '~/lib/supabase/health-profile';
import { replaceInsuranceInfo } from '~/lib/supabase/insurance';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { getOnboardingCustomer } from '../page-data';

export type OnboardingActionState = { error?: string; nameError?: string } | null;

const UpdateCustomerMutation = graphql(`
  mutation OnboardingNameUpdateMutation($input: UpdateCustomerInput!) {
    customer {
      updateCustomer(input: $input) {
        customer {
          firstName
          lastName
        }
        errors {
          __typename
          ... on ValidationError {
            message
          }
          ... on CustomerNotLoggedInError {
            message
          }
        }
      }
    }
  }
`);

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

export async function saveOnboardingProfileStep(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { error: 'Please sign in to continue.' };
  }

  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const firstName = str(formData, 'firstName');
  const lastName = str(formData, 'lastName');
  const isSetupFlow = str(formData, 'setup') === SETUP_FLOW_VALUE;

  if (!firstName || !lastName || !str(formData, 'address1') || !str(formData, 'city') || !str(formData, 'postalCode')) {
    return { error: 'Name and mailing address are required to continue.' };
  }

  const synced = await syncOnboardingProfileToBigCommerce({
    firstName,
    lastName,
    phone: str(formData, 'phone'),
    address1: str(formData, 'address1'),
    address2: str(formData, 'address2'),
    city: str(formData, 'city'),
    postalCode: str(formData, 'postalCode'),
    stateOrProvince: str(formData, 'stateOrProvince'),
    countryCode: str(formData, 'countryCode') || 'CA',
  });

  if (!synced.ok) {
    return { error: synced.message };
  }

  const saved = await completeOnboardingStep1(customer);

  if (!saved) {
    return { error: 'Could not save onboarding progress. Please try again.' };
  }

  redirect(
    isSetupFlow
      ? appendSetupFlowQuery(ACCOUNT_ONBOARDING_HEALTH_PROFILE)
      : ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  );
}

export async function saveHealthProfileStep(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { error: 'Please sign in to continue.' };
  }

  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const intent = str(formData, 'intent');
  const isSetupFlow = str(formData, 'setup') === SETUP_FLOW_VALUE;
  const isOntario = isOntarioZoneCode(str(formData, 'zoneCode') || str(formData, 'stateOrProvince'));
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { error: ensured.status === 'error' ? ensured.message : 'Profile not ready.' };
  }

  if (intent === 'skip') {
    const statusBefore = await getOnboardingStatus(String(customer.entityId));

    if (!statusBefore?.health_profile_completed_at) {
      const stepOk = await completeOnboardingStep2(customer, []);

      if (!stepOk) {
        return { error: 'Could not save onboarding progress.' };
      }
    }

    await redirectAfterHealthProfileStep(customer, isSetupFlow);
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

  const stepOk = await completeOnboardingStep2(customer, normalizedCareWithRank);

  if (!stepOk) {
    return { error: 'Could not save onboarding progress.' };
  }

  await redirectAfterHealthProfileStep(customer, isSetupFlow);
}

export async function updateOnboardingCustomerName(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    return { nameError: 'Please sign in to continue.' };
  }

  const firstName = str(formData, 'firstName');
  const lastName = str(formData, 'lastName');

  if (!firstName || !lastName) {
    return { nameError: 'First and last name are required.' };
  }

  const response = await client.fetch({
    document: UpdateCustomerMutation,
    customerAccessToken,
    variables: {
      input: { firstName, lastName },
    },
    fetchOptions: { cache: 'no-store' },
  });

  const errors = response.data.customer.updateCustomer.errors;

  if (errors.length > 0) {
    const firstError = errors[0];

    return {
      nameError:
        firstError && 'message' in firstError && firstError.message
          ? firstError.message
          : 'Could not update your name.',
    };
  }

  revalidatePath('/account/onboarding/health-profile');

  return null;
}

export async function saveMedicationsStep(formData: FormData): Promise<void> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/onboarding/medications');
  }

  const intent = str(formData, 'intent');
  const isSetupFlow = str(formData, 'setup') === SETUP_FLOW_VALUE;

  if (isSetupFlow) {
    await redirectAfterHealthProfileStep(customer, true);
  }

  if (intent === 'skip' || intent === 'continue') {
    redirect(ACCOUNT_ONBOARDING_INSURANCE);
  }

  redirect(ACCOUNT_ONBOARDING_INSURANCE);
}

export async function saveInsuranceStep(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { error: 'Please sign in to continue.' };
  }

  if (!isSupabaseConfigured()) {
    return { error: 'Supabase is not configured.' };
  }

  const intent = str(formData, 'intent');
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { error: ensured.status === 'error' ? ensured.message : 'Profile not ready.' };
  }

  if (intent === 'skip') {
    const stepOk = await completeOnboardingStep3(customer, null);

    if (!stepOk) {
      return { error: 'Could not save onboarding progress.' };
    }

    redirect('/account/dashboard/');
  }

  const noInsurance = formData.get('noInsurance') === 'true' || formData.get('noInsurance') === 'on';

  if (noInsurance) {
    const stepOk = await completeOnboardingStep3(customer, false);

    if (!stepOk) {
      return { error: 'Could not save insurance step.' };
    }

    redirect('/account/dashboard/');
  }

  const providerName = optStr(formData, 'providerName');
  const policyNumber = optStr(formData, 'policyNumber');
  const memberId = optStr(formData, 'memberId');

  if (!providerName || !policyNumber || !memberId) {
    return {
      error: 'Insurance provider, policy number, and member ID are required when you have coverage.',
    };
  }

  const inserted = await replaceInsuranceInfo({
    profile_id: ensured.profile.id,
    provider_name: providerName,
    policy_number: policyNumber,
    group_number: optStr(formData, 'groupNumber'),
    member_id: memberId,
    primary_holder_name: optStr(formData, 'primaryHolderName'),
    relationship: optStr(formData, 'relationship') ?? 'self',
    card_image_url: null,
    notes: null,
  });

  if (!inserted.ok) {
    return { error: inserted.message };
  }

  const stepOk = await completeOnboardingStep3(customer, true);

  if (!stepOk) {
    return { error: 'Could not save insurance step.' };
  }

  revalidatePath('/account/dashboard');
  redirect('/account/dashboard/');
}
