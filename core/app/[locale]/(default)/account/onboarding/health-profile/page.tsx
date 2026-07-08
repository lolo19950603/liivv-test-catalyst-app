import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
} from '~/lib/onboarding/onboarding-flow';
import { enforceSetupFlowStep } from '~/lib/onboarding/enforce-setup-flow-step';

import { getHealthProfileStepData, getOnboardingCustomer, getOnboardingProfileInitial } from '../page-data';
import { HealthProfileStepClient } from './health-profile-step-client';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingHealthProfilePage({ searchParams }: Props) {
  const { setup } = await searchParams;
  const isSetupFlow = setup === '1';
  const customer = await getOnboardingCustomer();
  const stepData = await getHealthProfileStepData();
  const profileInitial = await getOnboardingProfileInitial();

  if (!customer || !stepData) {
    return null;
  }

  if (isSetupFlow) {
    await enforceSetupFlowStep(ACCOUNT_ONBOARDING_HEALTH_PROFILE, customer);
  }

  return (
    <HealthProfileStepClient
      isSetupFlow={isSetupFlow}
      stepData={{
        initialCategories: stepData.initialCategories,
        isOntario: stepData.isOntario,
        initialHealthProfile: stepData.initialHealthProfile,
        healthProfileCompleted: stepData.healthProfileCompleted,
        profileInitial: stepData.profileInitial,
        supabaseReady: stepData.supabaseReady,
        stateOrProvince: profileInitial?.stateOrProvince ?? '',
      }}
    />
  );
}
