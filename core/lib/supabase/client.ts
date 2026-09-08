import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import {
  isGatewayStatus,
  isNetworkFailure,
  VendorOutageError,
} from '~/lib/vendor-outage';

let supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, { ...options, cache: 'no-store' });

    if (isGatewayStatus(response.status)) {
      throw new VendorOutageError('supabase');
    }

    return response;
  } catch (error) {
    if (error instanceof VendorOutageError) {
      throw error;
    }

    if (isNetworkFailure(error)) {
      throw new VendorOutageError('supabase', error);
    }

    throw error;
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          fetch: supabaseFetch,
        },
      },
    );
  }

  return supabaseClient;
}
