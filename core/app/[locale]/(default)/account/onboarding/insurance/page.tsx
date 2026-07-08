import { ACCOUNT_ONBOARDING_INSURANCE } from '~/lib/onboarding/onboarding-flow';
import { enforceSetupFlowStep } from '~/lib/onboarding/enforce-setup-flow-step';

import { getOnboardingCustomer } from '../page-data';
import { InsuranceStepForm } from './insurance-step-form';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingInsurancePage({ searchParams }: Props) {
  const { setup } = await searchParams;
  const isSetupFlow = setup === '1';
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  if (isSetupFlow) {
    await enforceSetupFlowStep(ACCOUNT_ONBOARDING_INSURANCE, customer);
  }

  return <InsuranceStepForm isSetupFlow={isSetupFlow} />;
}
