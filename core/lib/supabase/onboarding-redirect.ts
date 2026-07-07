import 'server-only';

import {
  ACCOUNT_ONBOARDING_HEALTH_PROFILE,
  ACCOUNT_ONBOARDING_INSURANCE,
  ACCOUNT_ONBOARDING_PROFILE,
  appendSetupFlowQuery,
} from '~/lib/onboarding/onboarding-flow';
import { getOnboardingStatus } from '~/lib/supabase/onboarding';
import { ensureCustomerProfile, type EnsureCustomerProfileResult } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export async function getFirstIncompleteOnboardingHref(
  customer: {
    entityId: number;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  },
  ensured?: EnsureCustomerProfileResult,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const resolved = ensured ?? (await ensureCustomerProfile(customer));

    if (resolved.status !== 'ok') {
      return null;
    }

    const status = await getOnboardingStatus(String(customer.entityId));

    if (!status) {
      return appendSetupFlowQuery(ACCOUNT_ONBOARDING_PROFILE);
    }

    const step1Complete =
      Boolean(status.onboarding_step1_completed_at) ||
      Boolean(status.health_profile_completed_at);

    if (!step1Complete) {
      return appendSetupFlowQuery(ACCOUNT_ONBOARDING_PROFILE);
    }

    if (!status.health_profile_completed_at) {
      return appendSetupFlowQuery(ACCOUNT_ONBOARDING_HEALTH_PROFILE);
    }

    if (!status.insurance_info_completed_at) {
      return appendSetupFlowQuery(ACCOUNT_ONBOARDING_INSURANCE);
    }

    return null;
  } catch {
    return null;
  }
}
