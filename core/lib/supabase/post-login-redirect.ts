import 'server-only';

import { getFirstIncompleteOnboardingHref } from '~/lib/supabase/onboarding-redirect';
import {
  ensureCustomerProfile,
  markAuthFirstSessionCompleted,
} from '~/lib/supabase/profile';
import { isSupabaseConfigured } from '~/lib/supabase/client';

export async function getDashboardPostLoginRedirect(customer: {
  entityId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const ensured = await ensureCustomerProfile(customer);

    if (ensured.status !== 'ok') {
      return null;
    }

    if (ensured.profile.auth_first_session_completed_at) {
      return null;
    }

    const nextStep = await getFirstIncompleteOnboardingHref(customer, ensured);

    if (!nextStep) {
      await markAuthFirstSessionCompleted(String(customer.entityId));

      return null;
    }

    await markAuthFirstSessionCompleted(String(customer.entityId));

    return nextStep;
  } catch {
    return null;
  }
}
