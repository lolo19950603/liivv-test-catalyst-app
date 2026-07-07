import { getHealthProfileStepData, getOnboardingProfileInitial } from '../page-data';
import { HealthProfileStepClient } from './health-profile-step-client';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingHealthProfilePage({ searchParams }: Props) {
  const { setup } = await searchParams;
  const isSetupFlow = setup === '1';
  const stepData = await getHealthProfileStepData();
  const profileInitial = await getOnboardingProfileInitial();

  if (!stepData) {
    return null;
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
