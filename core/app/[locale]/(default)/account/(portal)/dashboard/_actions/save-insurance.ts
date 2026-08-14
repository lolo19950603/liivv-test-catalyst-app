'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { completeOnboardingStep3, getOnboardingStatus } from '~/lib/supabase/onboarding';
import { replaceInsuranceInfo } from '~/lib/supabase/insurance';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export type InsuranceActionState = { error?: string } | null;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function optStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);

  return value || null;
}

export async function saveInsuranceStep(
  _prevState: InsuranceActionState,
  formData: FormData,
): Promise<InsuranceActionState> {
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
      return { error: 'Could not save insurance details.' };
    }

    return redirectAfterInsurance(customer.entityId);
  }

  const noInsurance = formData.get('noInsurance') === 'true' || formData.get('noInsurance') === 'on';

  if (noInsurance) {
    const stepOk = await completeOnboardingStep3(customer, false);

    if (!stepOk) {
      return { error: 'Could not save insurance details.' };
    }

    return redirectAfterInsurance(customer.entityId);
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
    return { error: 'Could not save insurance details.' };
  }

  return redirectAfterInsurance(customer.entityId);
}

async function redirectAfterInsurance(entityId: number): Promise<never> {
  revalidatePath('/account/dashboard');

  const status = await getOnboardingStatus(String(entityId));
  const celebrate = Boolean(status?.health_profile_completed_at);

  redirect(celebrate ? '/account/dashboard/?oliviaCelebrate=1' : '/account/dashboard/');
}
