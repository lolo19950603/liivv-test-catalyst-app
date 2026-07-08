import 'server-only';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import {
  ACCOUNT_ONBOARDING_INSURANCE,
  appendSetupFlowQuery,
} from '~/lib/onboarding/onboarding-flow';
import { getOnboardingStatus } from '~/lib/supabase/onboarding';

import type { OnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';

export async function redirectAfterHealthProfileStep(
  customer: OnboardingCustomer,
  isSetupFlow: boolean,
): Promise<never> {
  revalidatePath('/account/dashboard');

  if (isSetupFlow) {
    const status = await getOnboardingStatus(String(customer.entityId));

    if (!status?.insurance_info_completed_at) {
      redirect(appendSetupFlowQuery(ACCOUNT_ONBOARDING_INSURANCE));
    }
  }

  redirect('/account/dashboard/');
}
