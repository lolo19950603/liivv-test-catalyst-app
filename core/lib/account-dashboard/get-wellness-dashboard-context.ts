import { cache } from 'react';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { applyPendingGuestHealthProfile } from '~/lib/onboarding/apply-pending-guest-health-profile';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
} from '~/lib/onboarding/liiv-primary-health-category';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { listInsuranceByProfileId } from '~/lib/supabase/insurance';
import { getOnboardingStatus } from '~/lib/supabase/onboarding';
import { ensureCustomerProfile, getCustomerProfileByBigCommerceId } from '~/lib/supabase/profile';

export const getWellnessDashboardContext = cache(async () => {
  const empty = {
    supabaseReady: false,
    primaryCategory: null,
    careInterests: [] as string[],
    healthCategoryLabels: [] as string[],
    healthProfileComplete: false,
    insuranceComplete: false,
    insuranceProviderName: null as string | null,
    hasInsurance: null as boolean | null,
  };

  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return empty;
  }

  await applyPendingGuestHealthProfile(customer);

  const ensured = await ensureCustomerProfile(customer);
  const profile =
    (await getCustomerProfileByBigCommerceId(String(customer.entityId))) ??
    (ensured.status === 'ok' ? ensured.profile : null);
  const status = await getOnboardingStatus(String(customer.entityId));
  const ranked = resolveInitialHealthCategoriesWithRank(
    profile?.care_interests ?? status?.care_interests,
  );
  const primary = ranked[0] ? getPrimaryCategoryDisplay(ranked[0].id) : null;
  const healthCategoryLabels = ranked.map((entry) => getPrimaryCategoryDisplay(entry.id).shortLabel);

  const careInterests = profile?.care_interests ?? status?.care_interests ?? [];

  let insuranceProviderName: string | null = null;
  if (profile?.id) {
    const rows = await listInsuranceByProfileId(profile.id);
    const named = rows.find((row) => row.provider_name?.trim());
    insuranceProviderName = named?.provider_name?.trim() ?? null;
  }

  return {
    supabaseReady: ensured.status === 'ok' || profile != null,
    primaryCategory: primary,
    careInterests,
    healthCategoryLabels,
    healthProfileComplete:
      Boolean(status?.health_profile_completed_at) && ranked.length > 0,
    insuranceComplete: Boolean(status?.insurance_info_completed_at),
    insuranceProviderName,
    hasInsurance: status?.has_insurance ?? null,
  };
});
