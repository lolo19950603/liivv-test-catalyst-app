import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

export type HealthProfileRow = {
  id: string;
  profile_id: string;
  diabetes_type: string | null;
  diagnosis_year: number | null;
  current_medications: string[] | null;
  allergies: string[] | null;
  insulin_pump_user: boolean | null;
  cgm_user: boolean | null;
  preferred_cgm_brand: string | null;
  preferred_pump_brand: string | null;
  ostomy_type: string | null;
  ostomy_tenure: string | null;
  ostomy_preferred_brand: string | null;
  ostomy_product_type: string | null;
  wants_ostomy_specialist: boolean | null;
  catheter_type: string | null;
  catheter_length: string | null;
  catheter_preferred_brand: string | null;
  catheter_french_size: string | null;
  wound_care_type: string | null;
  wound_care_preferred_brand: string | null;
  respiratory_type: string | null;
  respiratory_preferred_brand: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  pharmacy_name: string | null;
  pharmacy_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertHealthProfilePayload = {
  profile_id: string;
  diabetes_type: string | null;
  diagnosis_year: number | null;
  current_medications: string[] | null;
  allergies: string[] | null;
  insulin_pump_user: boolean;
  cgm_user: boolean;
  preferred_cgm_brand: string | null;
  preferred_pump_brand: string | null;
  ostomy_type: string | null;
  ostomy_tenure: string | null;
  ostomy_preferred_brand: string | null;
  ostomy_product_type: string | null;
  wants_ostomy_specialist: boolean;
  catheter_type: string | null;
  catheter_length: string | null;
  catheter_preferred_brand: string | null;
  catheter_french_size: string | null;
  wound_care_type: string | null;
  wound_care_preferred_brand: string | null;
  respiratory_type: string | null;
  respiratory_preferred_brand: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  pharmacy_name: string | null;
  pharmacy_phone: string | null;
  notes: string | null;
};

export async function getHealthProfileByProfileId(
  profileId: string,
): Promise<HealthProfileRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as HealthProfileRow;
}

export async function upsertHealthProfile(
  payload: UpsertHealthProfilePayload,
): Promise<{ ok: true; row: HealthProfileRow } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('health_profiles')
    .upsert(
      {
        ...payload,
        updated_at: now,
      },
      { onConflict: 'profile_id' },
    )
    .select()
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: 'No row returned from health_profiles upsert.' };
  }

  return { ok: true, row: data as HealthProfileRow };
}
