'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';
import { isTabletDosageForm, normalizeBucket } from '~/lib/pharmacy/pharmacy-mappers';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  createCarePackRequest,
  createPrescription,
  createRefillRequest,
  deleteRefillRequestById,
  getRefillRequestById,
  listPrescriptionsByProfileId,
  updateRefillRequestPrescriptions,
} from '~/lib/supabase/prescriptions';
import { uploadPrescriptionPhoto } from '~/lib/supabase/prescription-storage';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

export type PharmacyActionState = { ok?: boolean; error?: string } | null;

type TransferMedicationInput = {
  name: string;
  din: string;
  dosage: string;
  dosageForm?: string;
  frequency: string;
};

type CarePackRequestIntake = {
  frequentDoseChangeMeds?: string;
  asNeededMeds?: string;
  includeOtcVitamins?: boolean;
  otcVitaminsNotes?: string;
  doctorCoordinationApproved?: boolean;
  holdOrVacationNotes?: string;
  feeAcknowledged?: boolean;
};

function normalizeRefillStatus(status: string): string {
  return String(status ?? '').trim().toLowerCase();
}

async function requirePharmacyProfile() {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/pharmacy');
  }

  if (!isSupabaseConfigured()) {
    return { customer, profile: null as null };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { customer, profile: null as null };
  }

  return { customer, profile: ensured.profile };
}

export async function pharmacyAction(
  _prevState: PharmacyActionState,
  formData: FormData,
): Promise<PharmacyActionState> {
  const { profile } = await requirePharmacyProfile();

  if (!profile) {
    return { ok: false, error: 'Pharmacy storage is not configured.' };
  }

  const intent = String(formData.get('intent') ?? '');

  if (intent === 'upload_prescription_photo') {
    const file = formData.get('photo');

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: 'Please choose a prescription photo to upload.' };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: 'Photo must be 5 MB or smaller.' };
    }

    const mime = file.type || 'image/jpeg';

    if (!mime.startsWith('image/')) {
      return { ok: false, error: 'Upload must be an image file.' };
    }

    const up = await uploadPrescriptionPhoto(profile.id, file);

    if (!up.ok) {
      return { ok: false, error: up.message };
    }

    const result = await createPrescription({
      profile_id: profile.id,
      medication_name: 'Pending Pharmacist Review',
      din: null,
      dosage: 'Pending',
      dosage_form: null,
      frequency: 'Pending',
      quantity: null,
      prescribing_doctor: null,
      pharmacy_name: null,
      rx_number: null,
      refills_remaining: null,
      last_filled_date: null,
      next_refill_date: null,
      status: 'active',
      approval_status: 'pending_review',
      submission_method: 'photo',
      photo_url: up.path,
      notes: null,
    });

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    revalidatePath('/account/pharmacy');
    redirect('/account/pharmacy');
  }

  if (intent === 'transfer_prescriptions') {
    const raw = formData.get('payload');

    if (typeof raw !== 'string' || !raw.trim()) {
      return { ok: false, error: 'Missing transfer request payload.' };
    }

    let body: {
      pharmacyName: string;
      pharmacyPhone: string;
      pharmacyAddress: string | null;
      transferType: 'all' | 'specific';
      medications?: TransferMedicationInput[];
    };

    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return { ok: false, error: 'Invalid transfer request payload.' };
    }

    const { pharmacyName, pharmacyPhone, pharmacyAddress, transferType, medications } = body;

    if (!pharmacyName?.trim() || !pharmacyPhone?.trim()) {
      return {
        ok: false,
        error: 'Pharmacy name and phone are required to submit a transfer.',
      };
    }

    const addressNote = pharmacyAddress?.trim() ?? '';

    if (transferType === 'specific' && medications && medications.length > 0) {
      for (const med of medications) {
        const name = med.name?.trim() || 'Transfer Request';
        const r = await createPrescription({
          profile_id: profile.id,
          medication_name: name,
          din: med.din?.trim() || null,
          dosage: med.dosage?.trim() || 'Pending',
          dosage_form: med.dosageForm?.trim() || null,
          frequency: med.frequency?.trim() || 'Pending',
          quantity: null,
          prescribing_doctor: null,
          pharmacy_name: pharmacyName.trim(),
          rx_number: null,
          refills_remaining: null,
          last_filled_date: null,
          next_refill_date: null,
          status: 'active',
          approval_status: 'pending_review',
          submission_method: 'transfer',
          notes: addressNote
            ? `Transfer from: ${pharmacyName.trim()}, ${addressNote}`
            : `Transfer from: ${pharmacyName.trim()}`,
        });

        if (!r.ok) {
          return { ok: false, error: `Could not save transfer medication "${name}": ${r.message}` };
        }
      }
    } else if (transferType === 'specific') {
      return { ok: false, error: 'Add at least one medication before submitting transfer.' };
    } else {
      const transferDetails = [pharmacyName, pharmacyAddress, pharmacyPhone].filter(Boolean).join(', ');
      const r = await createPrescription({
        profile_id: profile.id,
        medication_name: 'Transfer All Prescriptions',
        din: null,
        dosage: 'Pending',
        dosage_form: null,
        frequency: 'Pending',
        quantity: null,
        prescribing_doctor: null,
        pharmacy_name: pharmacyName.trim(),
        rx_number: null,
        refills_remaining: null,
        last_filled_date: null,
        next_refill_date: null,
        status: 'active',
        approval_status: 'pending_review',
        submission_method: 'transfer',
        notes: transferDetails ? `Transfer all prescriptions from: ${transferDetails}` : null,
      });

      if (!r.ok) {
        return { ok: false, error: `Could not save transfer request: ${r.message}` };
      }
    }

    revalidatePath('/account/pharmacy');
    redirect('/account/pharmacy');
  }

  if (intent === 'create_refill_request' || intent === 'update_refill_request') {
    const raw = String(formData.get('payload') ?? '').trim();

    if (!raw) {
      return { ok: false, error: 'Missing refill request data.' };
    }

    let body: { refillRequestId?: unknown; prescriptionIds?: unknown };

    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return { ok: false, error: 'Invalid refill request data.' };
    }

    const prescriptionIds = Array.isArray(body.prescriptionIds)
      ? body.prescriptionIds.map((id) => String(id)).filter((id) => id.length > 0)
      : [];

    if (prescriptionIds.length === 0) {
      return { ok: false, error: 'Select at least one active prescription.' };
    }

    const rows = await listPrescriptionsByProfileId(profile.id);
    const activeSet = new Set(
      rows.filter((row) => normalizeBucket(row) === 'active').map((row) => row.id),
    );
    const requestedActiveIds = prescriptionIds.filter((id) => activeSet.has(id));

    if (requestedActiveIds.length === 0) {
      return { ok: false, error: 'No active prescriptions were selected.' };
    }

    if (intent === 'create_refill_request') {
      const created = await createRefillRequest({
        profile_id: profile.id,
        prescription_ids: requestedActiveIds,
        notes: null,
      });

      if (!created.ok) {
        return { ok: false, error: created.message };
      }
    } else {
      const refillRequestId = String(body.refillRequestId ?? '').trim();

      if (!refillRequestId) {
        return { ok: false, error: 'Missing refill request id.' };
      }

      const existing = await getRefillRequestById(refillRequestId);

      if (!existing || existing.profile_id !== profile.id) {
        return { ok: false, error: 'Refill request not found.' };
      }

      if (normalizeRefillStatus(existing.status) !== 'pending_review') {
        return {
          ok: false,
          error:
            'This refill request was already moved to Refill Processing before your changes were submitted.',
        };
      }

      const updated = await updateRefillRequestPrescriptions({
        refillRequestId,
        prescriptionIds: requestedActiveIds,
      });

      if (!updated.ok) {
        return { ok: false, error: updated.message };
      }
    }

    revalidatePath('/account/pharmacy');
    redirect('/account/pharmacy?section=refill_requests');
  }

  if (intent === 'create_carepack_request') {
    const raw = String(formData.get('payload') ?? '').trim();

    if (!raw) {
      return { ok: false, error: 'Missing CarePack request data.' };
    }

    let body: { prescriptionIds?: unknown; intake?: unknown };

    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      return { ok: false, error: 'Invalid CarePack request data.' };
    }

    const prescriptionIds = Array.isArray(body.prescriptionIds)
      ? body.prescriptionIds.map((id) => String(id)).filter((id) => id.length > 0)
      : [];

    if (prescriptionIds.length === 0) {
      return { ok: false, error: 'Select at least one active medication for CarePack.' };
    }

    const rows = await listPrescriptionsByProfileId(profile.id);
    const activeTabletSet = new Set(
      rows
        .filter((row) => normalizeBucket(row) === 'active' && isTabletDosageForm(row.dosage_form))
        .map((row) => row.id),
    );
    const requestedTabletIds = prescriptionIds.filter((id) => activeTabletSet.has(id));

    if (requestedTabletIds.length === 0) {
      return {
        ok: false,
        error: 'CarePack is only available for active tablet medications.',
      };
    }

    if (requestedTabletIds.length !== prescriptionIds.length) {
      return {
        ok: false,
        error: 'One or more selected medications are not eligible for CarePack.',
      };
    }

    const intake = (body.intake ?? {}) as CarePackRequestIntake;

    if (!intake.doctorCoordinationApproved) {
      return {
        ok: false,
        error: 'Please authorize doctor coordination before submitting CarePack.',
      };
    }

    if (!intake.feeAcknowledged) {
      return {
        ok: false,
        error: 'Please acknowledge CarePack pricing terms before submitting your request.',
      };
    }

    const intakePayload: CarePackRequestIntake = {
      frequentDoseChangeMeds: String(intake.frequentDoseChangeMeds ?? '').trim(),
      asNeededMeds: String(intake.asNeededMeds ?? '').trim(),
      includeOtcVitamins: Boolean(intake.includeOtcVitamins),
      otcVitaminsNotes: String(intake.otcVitaminsNotes ?? '').trim(),
      doctorCoordinationApproved: true,
      holdOrVacationNotes: String(intake.holdOrVacationNotes ?? '').trim(),
      feeAcknowledged: true,
    };

    const created = await createCarePackRequest({
      profile_id: profile.id,
      prescription_ids: requestedTabletIds,
      notes: JSON.stringify(intakePayload),
    });

    if (!created.ok) {
      return { ok: false, error: created.message };
    }

    revalidatePath('/account/pharmacy');
    redirect('/account/pharmacy?section=carepack');
  }

  if (intent === 'delete_refill_request') {
    const refillRequestId = String(formData.get('refillRequestId') ?? '').trim();

    if (!refillRequestId) {
      return { ok: false, error: 'Missing refill request id.' };
    }

    const existing = await getRefillRequestById(refillRequestId);

    if (!existing || existing.profile_id !== profile.id) {
      return { ok: false, error: 'Refill request not found.' };
    }

    if (normalizeRefillStatus(existing.status) !== 'pending_review') {
      return {
        ok: false,
        error:
          'This refill request was already moved to Refill Processing before your deletion request.',
      };
    }

    const removed = await deleteRefillRequestById(refillRequestId);

    if (!removed.ok) {
      return { ok: false, error: removed.message };
    }

    revalidatePath('/account/pharmacy');
    redirect('/account/pharmacy?section=refill_requests');
  }

  return { ok: false, error: 'Invalid request.' };
}
