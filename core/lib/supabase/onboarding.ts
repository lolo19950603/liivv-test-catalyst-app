import 'server-only';

import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { getSupabaseClient, isSupabaseConfigured } from '~/lib/supabase/client';

export type OnboardingStatus = {
  onboarding_step1_completed_at: string | null;
  health_profile_completed_at: string | null;
  insurance_info_completed_at: string | null;
  has_insurance: boolean | null;
  care_interests: string[] | null;
};

export async function getOnboardingStatus(
  bigcommerceCustomerId: string,
): Promise<OnboardingStatus | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'onboarding_step1_completed_at, health_profile_completed_at, insurance_info_completed_at, has_insurance, care_interests',
    )
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as Record<string, unknown>;

  return {
    onboarding_step1_completed_at:
      (row.onboarding_step1_completed_at as string | null | undefined) ?? null,
    health_profile_completed_at:
      (row.health_profile_completed_at as string | null | undefined) ?? null,
    insurance_info_completed_at:
      (row.insurance_info_completed_at as string | null | undefined) ?? null,
    has_insurance: typeof row.has_insurance === 'boolean' ? row.has_insurance : null,
    care_interests: Array.isArray(row.care_interests)
      ? (row.care_interests as string[])
      : null,
  };
}

export async function completeOnboardingStep1(customer: {
  entityId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): Promise<boolean> {
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok' || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('profiles')
    .update({
      onboarding_step1_completed_at: now,
      updated_at: now,
    })
    .eq('bigcommerce_customer_id', String(customer.entityId))
    .select('onboarding_step1_completed_at')
    .maybeSingle();

  return !error && Boolean(data?.onboarding_step1_completed_at);
}

export async function completeOnboardingStep2(
  customer: {
    entityId: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  },
  careInterests: string[],
): Promise<boolean> {
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok' || !isSupabaseConfigured()) {
    return false;
  }

  const normalized = careInterests.map((value) => value.trim().toLowerCase()).filter(Boolean);
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      care_interests: normalized,
      health_profile_completed_at: now,
      updated_at: now,
    })
    .eq('bigcommerce_customer_id', String(customer.entityId))
    .select('health_profile_completed_at')
    .maybeSingle();

  return !error && Boolean(data?.health_profile_completed_at);
}

export async function completeOnboardingStep3(
  customer: {
    entityId: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  },
  hasInsurance: boolean | null,
): Promise<boolean> {
  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok' || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    insurance_info_completed_at: now,
    updated_at: now,
  };

  if (hasInsurance !== null) {
    patch.has_insurance = hasInsurance;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('bigcommerce_customer_id', String(customer.entityId))
    .select('insurance_info_completed_at')
    .maybeSingle();

  return !error && Boolean(data?.insurance_info_completed_at);
}
