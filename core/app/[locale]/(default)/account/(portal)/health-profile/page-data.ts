import { cache } from 'react';

import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { applyPendingGuestHealthProfile } from '~/lib/onboarding/apply-pending-guest-health-profile';
import { resolveInitialHealthCategoriesWithRank } from '~/lib/onboarding/liiv-primary-health-category';
import { getHealthProfileByProfileId } from '~/lib/supabase/health-profile';
import { ensureCustomerProfile, getCustomerProfileByBigCommerceId } from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export const getHealthProfileStepData = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  const addressData = await getCustomerAddresses({ limit: 1 });
  const address = addressData?.addresses[0];
  const isOntario =
    (address?.stateOrProvince ?? '').trim().toUpperCase() === 'ON' ||
    (address?.stateOrProvince ?? '').trim().toUpperCase() === 'ONTARIO';

  if (!isSupabaseConfigured()) {
    return {
      customer,
      supabaseReady: false,
      isOntario,
      initialCategories: [],
      initialHealthProfile: null,
    };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return {
      customer,
      supabaseReady: false,
      isOntario,
      initialCategories: [],
      initialHealthProfile: null,
    };
  }

  await applyPendingGuestHealthProfile(customer);

  const profile =
    (await getCustomerProfileByBigCommerceId(String(customer.entityId))) ?? ensured.profile;
  const healthProfile = await getHealthProfileByProfileId(profile.id);

  return {
    customer,
    supabaseReady: true,
    isOntario,
    initialCategories: resolveInitialHealthCategoriesWithRank(profile.care_interests).map(
      (row) => row.id,
    ),
    initialHealthProfile: healthProfile,
    profileId: profile.id,
  };
});
