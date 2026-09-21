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

/*
 * The stored row as an upsert payload, so a caller that only means to change
 * one field writes every other column back exactly as it found it.
 */
export function healthProfileRowToUpsertPayload(
  row: HealthProfileRow,
): UpsertHealthProfilePayload {
  return {
    profile_id: row.profile_id,
    diabetes_type: row.diabetes_type,
    diagnosis_year: row.diagnosis_year,
    current_medications: row.current_medications,
    allergies: row.allergies,
    insulin_pump_user: Boolean(row.insulin_pump_user),
    cgm_user: Boolean(row.cgm_user),
    preferred_cgm_brand: row.preferred_cgm_brand,
    preferred_pump_brand: row.preferred_pump_brand,
    ostomy_type: row.ostomy_type,
    ostomy_tenure: row.ostomy_tenure,
    ostomy_preferred_brand: row.ostomy_preferred_brand,
    ostomy_product_type: row.ostomy_product_type,
    wants_ostomy_specialist: Boolean(row.wants_ostomy_specialist),
    catheter_type: row.catheter_type,
    catheter_length: row.catheter_length,
    catheter_preferred_brand: row.catheter_preferred_brand,
    catheter_french_size: row.catheter_french_size,
    wound_care_type: row.wound_care_type,
    wound_care_preferred_brand: row.wound_care_preferred_brand,
    respiratory_type: row.respiratory_type,
    respiratory_preferred_brand: row.respiratory_preferred_brand,
    doctor_name: row.doctor_name,
    doctor_phone: row.doctor_phone,
    pharmacy_name: row.pharmacy_name,
    pharmacy_phone: row.pharmacy_phone,
    notes: row.notes,
  };
}

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
