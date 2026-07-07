import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

export type PrescriptionWritable = {
  profile_id: string;
  medication_name: string;
  din: string | null;
  dosage: string | null;
  dosage_form?: string | null;
  frequency: string | null;
  quantity: string | null;
  prescribing_doctor: string | null;
  pharmacy_name: string | null;
  rx_number: string | null;
  refills_remaining: number | null;
  last_filled_date: string | null;
  next_refill_date: string | null;
  end_date?: string | null;
  status: string | null;
  approval_status: string | null;
  submission_method: string | null;
  photo_url?: string | null;
  notes: string | null;
};

export type PrescriptionRow = {
  id: string;
  profile_id: string;
  medication_name: string;
  din: string | null;
  dosage: string | null;
  dosage_form: string | null;
  frequency: string | null;
  quantity: string | null;
  prescribing_doctor: string | null;
  pharmacy_name: string | null;
  rx_number: string | null;
  refills_remaining: number | null;
  last_filled_date: string | null;
  next_refill_date: string | null;
  end_date: string | null;
  status: string | null;
  approval_status: string | null;
  submission_method: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RefillRequestRow = {
  id: string;
  profile_id: string;
  prescription_ids: string[];
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CarePackRequestRow = {
  id: string;
  profile_id: string;
  prescription_ids: string[];
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function createPrescription(
  payload: PrescriptionWritable,
): Promise<{ ok: true; row: PrescriptionRow } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({ ...payload, updated_at: now })
    .select()
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: 'No row returned from prescriptions insert.' };
  }

  return { ok: true, row: data as PrescriptionRow };
}

export async function listPrescriptionsByProfileId(profileId: string): Promise<PrescriptionRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PrescriptionRow[];
}

export async function createRefillRequest(args: {
  profile_id: string;
  prescription_ids: string[];
  notes?: string | null;
}): Promise<{ ok: true; row: RefillRequestRow } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('refill_requests')
    .insert({
      profile_id: args.profile_id,
      prescription_ids: args.prescription_ids,
      status: 'pending_review',
      notes: args.notes ?? null,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: 'No row returned from refill request insert.' };
  }

  return { ok: true, row: data as RefillRequestRow };
}

export async function listRefillRequestsByProfileId(profileId: string): Promise<RefillRequestRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('refill_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as RefillRequestRow[];
}

export async function getRefillRequestById(refillRequestId: string): Promise<RefillRequestRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('refill_requests')
    .select('*')
    .eq('id', refillRequestId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as RefillRequestRow;
}

export async function updateRefillRequestPrescriptions(args: {
  refillRequestId: string;
  prescriptionIds: string[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('refill_requests')
    .update({
      prescription_ids: args.prescriptionIds,
      updated_at: new Date().toISOString(),
    })
    .eq('id', args.refillRequestId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function deleteRefillRequestById(
  refillRequestId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('refill_requests').delete().eq('id', refillRequestId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function createCarePackRequest(args: {
  profile_id: string;
  prescription_ids: string[];
  notes?: string | null;
}): Promise<{ ok: true; row: CarePackRequestRow } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('carepack_requests')
    .insert({
      profile_id: args.profile_id,
      prescription_ids: args.prescription_ids,
      status: 'pending_review',
      notes: args.notes ?? null,
      updated_at: now,
    })
    .select('*')
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: 'No row returned from carepack request insert.' };
  }

  return { ok: true, row: data as CarePackRequestRow };
}

export async function listCarePackRequestsByProfileId(
  profileId: string,
): Promise<CarePackRequestRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('carepack_requests')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CarePackRequestRow[];
}

export type AdminProfileLite = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  bigcommerce_customer_id: string | null;
};

export type AdminPrescriptionQueueRow = PrescriptionRow & {
  customer: AdminProfileLite | null;
};

export type AdminRefillQueueRow = RefillRequestRow & {
  customer: AdminProfileLite | null;
};

export type AdminCarePackQueueRow = CarePackRequestRow & {
  customer: AdminProfileLite | null;
};

async function listProfileLiteByIds(profileIds: string[]): Promise<Map<string, AdminProfileLite>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, bigcommerce_customer_id')
    .in('id', profileIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(
    (data as AdminProfileLite[]).map((row) => [row.id, row]),
  );
}

export async function listAdminPrescriptionQueue(limit = 200): Promise<AdminPrescriptionQueueRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const rows = data as PrescriptionRow[];
  const profileMap = await listProfileLiteByIds(
    [...new Set(rows.map((r) => r.profile_id).filter(Boolean))],
  );

  return rows.map((row) => ({
    ...row,
    customer: profileMap.get(row.profile_id) ?? null,
  }));
}

export async function listAdminRefillQueue(limit = 200): Promise<AdminRefillQueueRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('refill_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const rows = data as RefillRequestRow[];
  const profileMap = await listProfileLiteByIds(
    [...new Set(rows.map((r) => r.profile_id).filter(Boolean))],
  );

  return rows.map((row) => ({
    ...row,
    customer: profileMap.get(row.profile_id) ?? null,
  }));
}

export async function listAdminCarePackQueue(limit = 200): Promise<AdminCarePackQueueRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('carepack_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const rows = data as CarePackRequestRow[];
  const profileMap = await listProfileLiteByIds(
    [...new Set(rows.map((r) => r.profile_id).filter(Boolean))],
  );

  return rows.map((row) => ({
    ...row,
    customer: profileMap.get(row.profile_id) ?? null,
  }));
}

export async function updateCarePackRequestStatus(args: {
  carePackRequestId: string;
  status: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('carepack_requests')
    .update({ status: args.status, updated_at: new Date().toISOString() })
    .eq('id', args.carePackRequestId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function updatePrescriptionApprovalStatus(args: {
  prescriptionId: string;
  approval_status: string;
  status?: string | null;
  next_refill_date?: string | null;
  end_date?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {
    approval_status: args.approval_status,
    updated_at: new Date().toISOString(),
  };

  if (args.status !== undefined) {
    payload.status = args.status;
  }

  if (args.next_refill_date !== undefined) {
    payload.next_refill_date = args.next_refill_date;
  }

  if (args.end_date !== undefined) {
    payload.end_date = args.end_date;
  }

  const { error } = await supabase.from('prescriptions').update(payload).eq('id', args.prescriptionId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function updateRefillRequestStatus(args: {
  refillRequestId: string;
  status: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('refill_requests')
    .update({ status: args.status, updated_at: new Date().toISOString() })
    .eq('id', args.refillRequestId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function listPrescriptionsByProfileIdWithSignedPhotos(
  profileId: string,
): Promise<(PrescriptionRow & { photoDisplayUrl: string | null })[]> {
  const { getPrescriptionPhotoSignedUrl } = await import('~/lib/supabase/prescription-storage');
  const rows = await listPrescriptionsByProfileId(profileId);

  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      photoDisplayUrl: await getPrescriptionPhotoSignedUrl(row.photo_url),
    })),
  );
}
