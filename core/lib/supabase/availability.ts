import 'server-only';

import { cache } from 'react';

import { isGatewayStatus, isNetworkFailure, logVendorOutage } from '~/lib/vendor-outage';

import { isSupabaseConfigured } from './client';

/**
 * Lightweight reachability probe for Supabase HTTPS (PostgREST).
 * Missing env is not an outage — callers should treat that separately.
 */
export const isSupabaseReachable = cache(async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });

    if (isGatewayStatus(response.status)) {
      logVendorOutage('supabase', new Error(`Supabase returned ${response.status}`));

      return false;
    }

    // Any non-gateway response means the API answered (including 404 on the root).
    return true;
  } catch (error) {
    if (isNetworkFailure(error) || error instanceof Error) {
      logVendorOutage('supabase', error);
    }

    return false;
  }
});
