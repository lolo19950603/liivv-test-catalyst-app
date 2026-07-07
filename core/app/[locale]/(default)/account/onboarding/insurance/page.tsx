import { InsuranceStepForm } from './insurance-step-form';

interface Props {
  searchParams: Promise<{ setup?: string }>;
}

export default async function OnboardingInsurancePage({ searchParams }: Props) {
  const { setup } = await searchParams;

  return <InsuranceStepForm isSetupFlow={setup === '1'} />;
}
