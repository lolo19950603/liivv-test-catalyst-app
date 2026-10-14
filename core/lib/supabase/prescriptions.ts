import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

/*
 * What a prescriptions row is for (core/lib/supabase/cpap-prescriptions-migration.sql):
 * 'medication' (the default: drugs, refills and CarePack) or 'cpap' (a CPAP
 * prescription a Liivv pharmacist validates before a complete CPAP mask can
 * be paid for; owner ruling C26, 2026-10-13). Rows read before the migration
 * has run carry no rx_kind and are medication.
 */
export type PrescriptionKind = 'medication' | 'cpap';

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
  notes: string | null;
  /** Left out for a medication, so inserts work before the CPAP migration has run. */
  rx_kind?: PrescriptionKind;
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
  notes: string | null;
  /** Missing until the CPAP migration has run (then 'medication' by default). */
  rx_kind?: string | null;
  /** The staff username that approved or rejected a CPAP prescription. */
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  /** Why a CPAP prescription was not accepted. */
  review_reason?: string | null;
  /**
   * The provincial pharmacy that received a CPAP prescription (ON, BC, …), set at
   * intake (pharmacy-messages-migration.sql). Missing on older rows and until the
   * migration has run.
   */
  pharmacy_region?: string | null;
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

/* Whether a value read from Supabase is a prescriptions row (it has its id). */
function isPrescriptionRow(value: unknown): value is PrescriptionRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'profile_id' in value
  );
}

/* One prescriptions row, or null when it is not there or can't be read. */
export async function getPrescriptionById(prescriptionId: string): Promise<PrescriptionRow | null> {
  const supabase = getSupabaseClient();
  const result = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', prescriptionId)
    .maybeSingle();

  if (result.error) {
    return null;
  }

  const row: unknown = result.data;

  return isPrescriptionRow(row) ? row : null;
}

/*
 * A pharmacist's decision on a CPAP prescription: approved with the expiry
 * they set, rejected with a reason, set back to pending review, or marked
 * expired. Records who decided and when. Fails (rather than silently
 * dropping a field) if the CPAP migration has not run.
 *
 * `fromStatuses` is the approval status the row must still have when it is
 * written, so two decisions made at once can't overwrite each other: the
 * second matches no row and is refused. 'pending_review' also matches a row
 * with no approval status.
 */
export async function updateCpapPrescriptionReview(args: {
  prescriptionId: string;
  fromStatuses: readonly string[];
  approval_status: 'approved' | 'rejected' | 'pending_review' | 'expired';
  status: string;
  end_date?: string | null;
  review_reason?: string | null;
  reviewed_by: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    approval_status: args.approval_status,
    status: args.status,
    reviewed_by: args.reviewed_by,
    reviewed_at: now,
    review_reason: args.review_reason ?? null,
    updated_at: now,
  };

  if (args.end_date !== undefined) {
    payload.end_date = args.end_date;
  }

  const allowed = args.fromStatuses.filter((status) => /^[a-z_]+$/.test(status));

  if (allowed.length === 0) {
    return {
      ok: false,
      message: 'This CPAP prescription can’t be changed from its current status.',
    };
  }

  const statusFilter = [
    `approval_status.in.(${allowed.join(',')})`,
    ...(allowed.includes('pending_review') ? ['approval_status.is.null'] : []),
  ].join(',');
  const { data, error } = await supabase
    .from('prescriptions')
    .update(payload)
    .eq('id', args.prescriptionId)
    .eq('rx_kind', 'cpap')
    .or(statusFilter)
    .select('id');

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.length === 0) {
    return {
      ok: false,
      message: 'This CPAP prescription was already updated. Refresh to see its status.',
    };
  }

  return { ok: true };
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
  medication_names: string[];
};

export type AdminCarePackQueueRow = CarePackRequestRow & {
  customer: AdminProfileLite | null;
  medication_names: string[];
};

async function listMedicationNamesByIds(ids: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('id, medication_name')
    .in('id', uniqueIds);

  if (error || !data) {
    return new Map();
  }

  return new Map(
    (data as Array<{ id: string; medication_name: string }>).map((row) => [
      row.id,
      row.medication_name,
    ]),
  );
}

function resolveMedicationNames(
  prescriptionIds: string[] | null | undefined,
  namesById: Map<string, string>,
): string[] {
  return (prescriptionIds ?? []).map((id) => namesById.get(id) ?? 'Unknown medication');
}

export async function listProfileLiteByIds(
  profileIds: string[],
): Promise<Map<string, AdminProfileLite>> {
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
  const [profileMap, medicationNamesById] = await Promise.all([
    listProfileLiteByIds([...new Set(rows.map((r) => r.profile_id).filter(Boolean))]),
    listMedicationNamesByIds(rows.flatMap((r) => r.prescription_ids ?? [])),
  ]);

  return rows.map((row) => ({
    ...row,
    customer: profileMap.get(row.profile_id) ?? null,
    medication_names: resolveMedicationNames(row.prescription_ids, medicationNamesById),
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
  const [profileMap, medicationNamesById] = await Promise.all([
    listProfileLiteByIds([...new Set(rows.map((r) => r.profile_id).filter(Boolean))]),
    listMedicationNamesByIds(rows.flatMap((r) => r.prescription_ids ?? [])),
  ]);

  return rows.map((row) => ({
    ...row,
    customer: profileMap.get(row.profile_id) ?? null,
    medication_names: resolveMedicationNames(row.prescription_ids, medicationNamesById),
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

/*
 * Records which provincial pharmacy received a CPAP prescription (owner
 * decision Q10, 2026-10-14). Written after the row is created, and best
 * effort: before pharmacy-messages-migration.sql has run the column is
 * missing, and the prescription must still be saved.
 */
export async function setPrescriptionPharmacyRegion(
  prescriptionId: string,
  region: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await getSupabaseClient()
    .from('prescriptions')
    .update({ pharmacy_region: region })
    .eq('id', prescriptionId);

  return error ? { ok: false, message: error.message } : { ok: true };
}
