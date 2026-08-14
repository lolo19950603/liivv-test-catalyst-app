import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { getHealthProfileStepData } from './page-data';
import { HealthProfileStepClient } from './health-profile-step-client';
import { getOnboardingCustomer } from '~/lib/account/get-session-customer';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return {
    title: 'Health profile',
  };
}

export default async function HealthProfilePage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const customer = await getOnboardingCustomer();
  const stepData = await getHealthProfileStepData();

  if (!customer || !stepData) {
    return null;
  }

  return (
    <HealthProfileStepClient
      stepData={{
        initialCategories: stepData.initialCategories,
        isOntario: stepData.isOntario,
        initialHealthProfile: stepData.initialHealthProfile,
        supabaseReady: stepData.supabaseReady,
      }}
    />
  );
}
