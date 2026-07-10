import type { CarePackRequestRow, PrescriptionRow, RefillRequestRow } from '~/lib/supabase/prescriptions';

export type RxBucket = 'pending' | 'active' | 'rejected' | 'expired';

export type PharmacyPrescription = {
  id: string;
  medicationName: string;
  dosage?: string | null;
  dosageForm?: string | null;
  frequency?: string | null;
  rxNumber?: string | null;
  endDate?: string | null;
  pharmacyName?: string | null;
  prescribingDoctor?: string | null;
  bucket: RxBucket;
  photoDisplayUrl?: string | null;
};

export type PharmacyRefillRequest = {
  id: string;
  status: 'pending_review' | 'refill_processing' | 'completed' | 'rejected';
  prescriptionIds: string[];
  medicationNames: string[];
  createdAt: string;
};

export type PharmacyCarePackRequest = {
  id: string;
  status: 'pending_review' | 'setup_in_progress' | 'active' | 'rejected';
  prescriptionIds: string[];
  medicationNames: string[];
  createdAt: string;
};

/** CarePack eligibility: tablet dosage forms (case-insensitive, e.g. "Tablet, coated"). */
export function isTabletDosageForm(dosageForm?: string | null): boolean {
  const normalized = String(dosageForm ?? '').trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized === 'tablet' || normalized.includes('tablet');
}

export function normalizeBucket(row: PrescriptionRow): RxBucket {
  const status = (row.status ?? '').trim().toLowerCase();
  const approval = (row.approval_status ?? '').trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  const endDate = String(row.end_date ?? '').slice(0, 10);

  if (approval.includes('expired') || status.includes('expired')) {
    return 'expired';
  }

  if (approval.includes('rejected') || status.includes('rejected')) {
    return 'rejected';
  }

  if (endDate && endDate <= today) {
    return 'expired';
  }

  if (status.includes('past') || status.includes('completed') || status.includes('cancelled')) {
    return 'expired';
  }

  if (approval.includes('pending') || approval.includes('needs_info')) {
    return 'pending';
  }

  if (approval.includes('approved') && status.includes('active')) {
    return 'active';
  }

  return 'pending';
}

export function mapPrescriptionRow(
  row: PrescriptionRow,
  photoDisplayUrl: string | null = null,
): PharmacyPrescription {
  return {
    id: row.id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    dosageForm: row.dosage_form,
    frequency: row.frequency,
    rxNumber: row.rx_number,
    endDate: row.end_date,
    pharmacyName: row.pharmacy_name,
    prescribingDoctor: row.prescribing_doctor,
    bucket: normalizeBucket(row),
    photoDisplayUrl,
  };
}

export function mapRefillRequestRow(
  row: RefillRequestRow,
  prescriptions: PharmacyPrescription[],
): PharmacyRefillRequest {
  const namesById = new Map(prescriptions.map((rx) => [rx.id, rx.medicationName]));
  const statusRaw = String(row.status ?? '').trim().toLowerCase();
  let status: PharmacyRefillRequest['status'] = 'pending_review';

  if (statusRaw === 'rejected') {
    status = 'rejected';
  } else if (statusRaw === 'completed') {
    status = 'completed';
  } else if (statusRaw === 'refill_processing' || statusRaw === 'processing') {
    status = 'refill_processing';
  }

  return {
    id: row.id,
    status,
    prescriptionIds: row.prescription_ids ?? [],
    medicationNames: (row.prescription_ids ?? []).map((id) => namesById.get(id) ?? 'Prescription'),
    createdAt: row.created_at,
  };
}

export function mapCarePackRequestRow(
  row: CarePackRequestRow,
  prescriptions: PharmacyPrescription[],
): PharmacyCarePackRequest {
  const namesById = new Map(prescriptions.map((rx) => [rx.id, rx.medicationName]));
  const statusRaw = String(row.status ?? '').trim().toLowerCase();
  let status: PharmacyCarePackRequest['status'] = 'pending_review';

  if (statusRaw === 'rejected') {
    status = 'rejected';
  } else if (statusRaw === 'active') {
    status = 'active';
  } else if (statusRaw === 'setup_in_progress' || statusRaw === 'processing') {
    status = 'setup_in_progress';
  }

  return {
    id: row.id,
    status,
    prescriptionIds: row.prescription_ids ?? [],
    medicationNames: (row.prescription_ids ?? []).map((id) => namesById.get(id) ?? 'Prescription'),
    createdAt: row.created_at,
  };
}
