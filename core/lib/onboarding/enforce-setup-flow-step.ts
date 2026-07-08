import 'server-only';

import { redirect } from 'next/navigation';

import { getFirstIncompleteOnboardingHref } from '~/lib/supabase/onboarding-redirect';

import type { OnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';

function normalizePath(path: string): string {
  const base = path.split('?')[0] ?? path;

  return base.replace(/\/$/, '') || '/';
}

/** In guided setup mode, keep the user on the next required onboarding step. */
export async function enforceSetupFlowStep(
  currentPath: string,
  customer: OnboardingCustomer,
): Promise<void> {
  const nextHref = await getFirstIncompleteOnboardingHref(customer);

  if (!nextHref) {
    redirect('/account/dashboard/');
  }

  if (normalizePath(currentPath) !== normalizePath(nextHref)) {
    redirect(nextHref);
  }
}
