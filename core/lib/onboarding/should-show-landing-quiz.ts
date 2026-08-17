import { cache } from 'react';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { type LandingHealthCategoryId } from '~/lib/onboarding/category-questionnaires';
import { resolveInitialHealthCategoriesWithRank } from '~/lib/onboarding/liiv-primary-health-category';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

export const shouldShowLandingQuiz = cache(async (categoryId: LandingHealthCategoryId) => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { showQuiz: true, isSignedIn: false };
  }

  if (!isSupabaseConfigured()) {
    return { showQuiz: false, isSignedIn: true };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { showQuiz: false, isSignedIn: true };
  }

  const alreadyHasCategory = resolveInitialHealthCategoriesWithRank(
    ensured.profile.care_interests,
  ).some((row) => row.id === categoryId);

  return { showQuiz: !alreadyHasCategory, isSignedIn: true };
});
