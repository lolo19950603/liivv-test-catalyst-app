import 'server-only';

import { cache } from 'react';

import { isSupabaseReachable } from '~/lib/supabase/availability';
import { isSupabaseConfigured } from '~/lib/supabase/client';

/**
 * Cart kit sessions are stored in Supabase (`cart_kit_sessions`) when it is
 * configured. If that vendor is down, hide curated-kit add flows and refuse
 * add-kit-to-cart (cookie/KV alone is not the production path).
 */
export const areCartKitsAvailable = cache(async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return true;
  }

  return isSupabaseReachable();
});
