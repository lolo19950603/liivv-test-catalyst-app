import 'server-only';

import { cache } from 'react';

import { isStripeReachable } from '~/lib/stripe/availability';
import { isStripeConfigured } from '~/lib/stripe/client';
import { isSupabaseReachable } from '~/lib/supabase/availability';
import { isSupabaseConfigured } from '~/lib/supabase/client';

/**
 * New subscriptions and subscription checkout need Stripe, and Supabase when it is
 * configured (cart subscription line metadata). If either configured vendor is down,
 * hide subscribe UI and refuse new subscription flows site-wide.
 */
export const areSubscriptionsAvailable = cache(async (): Promise<boolean> => {
  if (!isStripeConfigured()) {
    return false;
  }

  if (!(await isStripeReachable())) {
    return false;
  }

  if (isSupabaseConfigured() && !(await isSupabaseReachable())) {
    return false;
  }

  return true;
});
