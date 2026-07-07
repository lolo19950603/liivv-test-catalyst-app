import { redirect } from 'next/navigation';

import { appendSetupFlowQuery, ACCOUNT_ONBOARDING_PROFILE } from '~/lib/onboarding/onboarding-flow';

export default function OnboardingIndexPage() {
  redirect(appendSetupFlowQuery(ACCOUNT_ONBOARDING_PROFILE));
}
