import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ACCOUNT_ONBOARDING_HEALTH_PROFILE } from '~/lib/onboarding/onboarding-flow';
import { enforceSetupFlowStep } from '~/lib/onboarding/enforce-setup-flow-step';

import { getHealthProfileStepData, getOnboardingCustomer } from '../../onboarding/page-data';
import { HealthProfileStepClient } from './health-profile-step-client';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ setup?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return {
    title: 'Health profile',
  };
}

export default async function HealthProfilePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { setup } = await searchParams;
  const isSetupFlow = setup === '1';

  setRequestLocale(locale);

  const customer = await getOnboardingCustomer();
  const stepData = await getHealthProfileStepData();

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
        supabaseReady: stepData.supabaseReady,
      }}
    />
  );
}
