import 'server-only';

import { getSupabaseClient, isSupabaseConfigured } from '~/lib/supabase/client';

export type CustomerProfileRow = {
  id: string;
  bigcommerce_customer_id: string;
  email?: string | null;
  first_name: string | null;
  last_name: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  onboarding_step1_completed_at: string | null;
  health_profile_completed_at: string | null;
  insurance_info_completed_at: string | null;
  care_interests: string[] | null;
  has_insurance: boolean | null;
  auth_first_session_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EnsureCustomerProfileResult =
  | { status: 'skipped'; reason: 'not_configured' }
  | { status: 'ok'; profile: CustomerProfileRow }
  | { status: 'error'; message: string };

export async function ensureCustomerProfile(customer: {
  entityId: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): Promise<EnsureCustomerProfileResult> {
  if (!isSupabaseConfigured()) {
    return { status: 'skipped', reason: 'not_configured' };
  }

  try {
    const supabase = getSupabaseClient();
    const customerId = String(customer.entityId);
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          bigcommerce_customer_id: customerId,
          first_name: customer.firstName ?? null,
          last_name: customer.lastName ?? null,
          email: customer.email?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'bigcommerce_customer_id' },
      )
      .select()
      .single();

    if (error) {
      return { status: 'error', message: error.message };
    }

    if (!data) {
      return { status: 'error', message: 'No profile row returned from upsert.' };
    }

    return { status: 'ok', profile: data as CustomerProfileRow };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return { status: 'error', message };
  }
}

export async function getCustomerProfileByBigCommerceId(
  bigcommerceCustomerId: string,
): Promise<CustomerProfileRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CustomerProfileRow;
}

export async function markAuthFirstSessionCompleted(bigcommerceCustomerId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    await supabase
      .from('profiles')
      .update({
        auth_first_session_completed_at: now,
        updated_at: now,
      })
      .eq('bigcommerce_customer_id', bigcommerceCustomerId);
  } catch {
    // Non-fatal.
  }
}
