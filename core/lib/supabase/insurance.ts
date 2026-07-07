import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

export type InsuranceInfoRow = {
  id: string;
  profile_id: string;
  provider_name: string | null;
  policy_number: string | null;
  group_number: string | null;
  member_id: string | null;
  primary_holder_name: string | null;
  relationship: string | null;
  card_image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listInsuranceByProfileId(profileId: string): Promise<InsuranceInfoRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('insurance_info')
    .select('*')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as InsuranceInfoRow[];
}

export async function insertInsuranceInfo(payload: {
  profile_id: string;
  provider_name: string | null;
  policy_number: string | null;
  group_number: string | null;
  member_id: string | null;
  primary_holder_name: string | null;
  relationship: string | null;
  card_image_url: string | null;
  notes: string | null;
}): Promise<{ ok: true; row: InsuranceInfoRow } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('insurance_info')
    .insert({
      ...payload,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: 'No row returned from insurance_info insert.' };
  }

  return { ok: true, row: data as InsuranceInfoRow };
}
