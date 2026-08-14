import { cache } from 'react';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
} from '~/lib/onboarding/liiv-primary-health-category';
import { getOnboardingStatus } from '~/lib/supabase/onboarding';
import { ensureCustomerProfile, getCustomerProfileByBigCommerceId } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export const getWellnessDashboardContext = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return {
      supabaseReady: false,
      primaryCategory: null,
      careInterests: [] as string[],
      healthProfileComplete: false,
      insuranceComplete: false,
    };
  }

  const ensured = await ensureCustomerProfile(customer);
  const profile =
    ensured.status === 'ok'
      ? ensured.profile
      : await getCustomerProfileByBigCommerceId(String(customer.entityId));
  const status = await getOnboardingStatus(String(customer.entityId));
  const ranked = resolveInitialHealthCategoriesWithRank(
    profile?.care_interests ?? status?.care_interests,
  );
  const primary = ranked[0] ? getPrimaryCategoryDisplay(ranked[0].id) : null;

  const careInterests = profile?.care_interests ?? status?.care_interests ?? [];

  return {
    supabaseReady: ensured.status === 'ok' || profile != null,
    primaryCategory: primary,
    careInterests,
    healthProfileComplete:
      Boolean(status?.health_profile_completed_at) && ranked.length > 0,
    insuranceComplete: Boolean(status?.insurance_info_completed_at),
  };
});
