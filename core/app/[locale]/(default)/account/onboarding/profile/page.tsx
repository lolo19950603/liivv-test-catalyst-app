import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  ACCOUNT_ONBOARDING_INSURANCE,
  ACCOUNT_ONBOARDING_PROFILE,
} from '~/lib/onboarding/onboarding-flow';
import { enforceSetupFlowStep } from '~/lib/onboarding/enforce-setup-flow-step';

import { getOnboardingCustomer, getOnboardingProfileInitial } from '../page-data';
import { ProfileStepForm } from './profile-step-form';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingProfilePage({ searchParams }: Props) {
  const params = await searchParams;
  const isSetupFlow = params.setup === '1';
  const customer = await getOnboardingCustomer();
  const initial = await getOnboardingProfileInitial();

  if (!customer || !initial) {
    return null;
  }

  if (isSetupFlow) {
    await enforceSetupFlowStep(ACCOUNT_ONBOARDING_PROFILE, customer);
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl border border-[#e8e2d8] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#2c2a26]">Profile setup</h1>
        <p className="mt-4 text-sm text-[#6b6560]">
          Configure Supabase (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) and run
          `core/lib/supabase/onboarding-schema.sql` to enable onboarding.
        </p>
      </div>
    );
  }

  return <ProfileStepForm initial={initial} isSetupFlow={isSetupFlow} />;
}
