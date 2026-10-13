'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { type OnboardingCustomer } from '~/lib/account/get-session-customer';
import { runCustomerAction } from '~/lib/action-gateway/session';
import { carePackRegionFromProvince } from '~/lib/pharmacy/carepack-region';
import { isCpapPrescriptionWaiting } from '~/lib/pharmacy/cpap-prescription';
import {
  isTabletDosageForm,
  medicationPrescriptionRows,
  normalizeBucket,
} from '~/lib/pharmacy/pharmacy-mappers';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { listCpapPrescriptionsByProfileId } from '~/lib/supabase/cpap-prescriptions';
import {
  createCarePackRequest,
  createPrescription,
  createRefillRequest,
  deleteRefillRequestById,
  getRefillRequestById,
  listPrescriptionsByProfileId,
  updateRefillRequestPrescriptions,
} from '~/lib/supabase/prescriptions';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

import { getCustomerProvince } from '../page-data';

export type PharmacyActionState = { ok?: boolean; error?: string } | null;

/*
 * A CPAP prescription sent from the Pharmacy page's CPAP card: by transfer
 * from the customer's current CPAP supplier, clinic or pharmacy (name and
 * phone), or by their prescriber's fax. The prescriber's name is optional.
 */
const CpapSubmissionSchema = z.object({
  method: z.enum(['transfer', 'fax']),
  sourceName: z.string().trim().max(160).optional().default(''),
  sourcePhone: z.string().trim().max(40).optional().default(''),
  prescriberName: z.string().trim().max(160).optional().default(''),
});

/* Parses JSON text, or answers undefined when it is not JSON. */
function parseJson(raw: string): unknown {
  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed;
  } catch {
    return undefined;
  }
}

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

async function loadPharmacyProfile(customer: OnboardingCustomer) {
  if (!isSupabaseConfigured()) {
    return { profile: null as null };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { profile: null as null };
  }

  return { profile: ensured.profile };
}

export async function pharmacyAction(
  _prevState: PharmacyActionState,
  formData: FormData,
): Promise<PharmacyActionState> {
  return runCustomerAction({ redirectTo: '/login?redirectTo=/account/pharmacy' }, async (customer) => {
  const { profile } = await loadPharmacyProfile(customer);

  if (!profile) {
    return { ok: false, error: 'Pharmacy storage is not configured.' };
  }

  const intent = String(formData.get('intent') ?? '');

  /*
   * A CPAP prescription, so a complete CPAP mask can be bought (owner ruling
   * C26 (b), 2026-10-13). Saved as a prescriptions row with rx_kind 'cpap',
   * waiting for a Liivv pharmacist, who validates it and sets its expiry in
   * the Prescriptions queue. Two ways it reaches Liivv, as for medications:
   * a transfer from the customer's current CPAP supplier, clinic or pharmacy,
   * or a fax the customer asks their prescriber to send (the request they
   * copy is generateCpapFaxRequestEmail). No upload.
   */
  if (intent === 'submit_cpap_prescription') {
    const payload = formData.get('payload');
    const parsed = CpapSubmissionSchema.safeParse(
      typeof payload === 'string' ? parseJson(payload) : undefined,
    );

    if (!parsed.success) {
      return { ok: false, error: 'Choose how your CPAP prescription will reach Liivv.' };
    }

    const { method, sourceName, sourcePhone, prescriberName } = parsed.data;

    if (method === 'transfer' && (!sourceName || !sourcePhone)) {
      return {
        ok: false,
        error: 'Enter the name and phone number of your current CPAP supplier, clinic or pharmacy.',
      };
    }

    // One at a time: while a CPAP prescription is with a pharmacist, another
    // would only add a second row for them to work.
    let alreadyWaiting: boolean;

    try {
      alreadyWaiting = (await listCpapPrescriptionsByProfileId(profile.id)).some(
        isCpapPrescriptionWaiting,
      );
    } catch {
      return {
        ok: false,
        error: 'Your CPAP prescription could not be saved right now. Please try again later.',
      };
    }

    if (alreadyWaiting) {
      return {
        ok: false,
        error:
          'Your CPAP prescription is already with a Liivv pharmacist. Its status is shown on this page.',
      };
    }

    const created = await createPrescription({
      profile_id: profile.id,
      rx_kind: 'cpap',
      medication_name: 'CPAP therapy',
      din: null,
      dosage: null,
      dosage_form: null,
      frequency: null,
      quantity: null,
      prescribing_doctor: prescriberName || null,
      pharmacy_name: method === 'transfer' ? sourceName : null,
      rx_number: null,
      refills_remaining: null,
      last_filled_date: null,
      next_refill_date: null,
      end_date: null,
      status: 'pending',
      approval_status: 'pending_review',
      submission_method: method,
      notes:
        method === 'transfer'
          ? `CPAP prescription transfer from: ${sourceName}, ${sourcePhone}`
          : 'CPAP prescription: the customer asked their prescriber to fax it to Liivv.',
    });

    if (!created.ok) {
      return {
        ok: false,
        error: 'Your CPAP prescription could not be saved right now. Please try again later.',
      };
    }

    revalidatePath('/account/pharmacy');
    return { ok: true };
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
    return { ok: true };
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

    // CPAP prescriptions are never refilled: medications only.
    const rows = medicationPrescriptionRows(await listPrescriptionsByProfileId(profile.id));
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
    return { ok: true };
  }

  if (intent === 'create_carepack_request') {
    const province = await getCustomerProvince();

    if (carePackRegionFromProvince(province) === 'other') {
      return {
        ok: false,
        error: 'CarePack is available in Ontario today. The rest of Canada is coming soon.',
      };
    }

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

    // CPAP prescriptions never go in a CarePack: medications only.
    const rows = medicationPrescriptionRows(await listPrescriptionsByProfileId(profile.id));
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
    return { ok: true };
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
    return { ok: true };
  }

  return { ok: false, error: 'Invalid request.' };
  });
}
