'use client';

import { startTransition, useActionState, useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  pharmacyAction,
  type PharmacyActionState,
} from '~/app/[locale]/(default)/account/(portal)/pharmacy/_actions/pharmacy-actions';
import {
  DpdMedicationSearchField,
  type MedicationDetails,
  type MedicationResult,
} from '~/components/pharmacy/dpd-medication-search-field';
import { generateFaxRequestEmail } from '~/lib/pharmacy/pharmacy-fax';

export type TransferMedicationInput = {
  name: string;
  din: string;
  dosage: string;
  dosageForm?: string;
  frequency: string;
};

type TransferMedicationRow = TransferMedicationInput & { clientKey: string };

export function AddPrescriptionDialog({
  open,
  onClose,
  userProvince,
  userFullName,
  supabaseReady,
}: {
  open: boolean;
  onClose: () => void;
  userProvince: string | null;
  userFullName: string;
  supabaseReady: boolean;
}) {
  const [method, setMethod] = useState<'transfer' | 'fax' | 'photo'>('transfer');
  const [transferType, setTransferType] = useState<'all' | 'specific'>('all');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [medications, setMedications] = useState<TransferMedicationRow[]>([]);
  const [faxCopied, setFaxCopied] = useState(false);
  const [state, formAction, isPending] = useActionState<PharmacyActionState, FormData>(
    pharmacyAction,
    null,
  );
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    onClose();
    router.refresh();
  }, [state, onClose, router]);

  const faxEmail = useMemo(
    () =>
      generateFaxRequestEmail({
        provinceLabel: userProvince ?? '',
        fullName: userFullName,
      }),
    [userFullName, userProvince],
  );

  if (!open) {
    return null;
  }

  const addMedicationFromSearch = (med: MedicationResult, details: MedicationDetails | null) => {
    const strength = details?.ingredients?.[0];
    const dosage =
      strength?.strength && strength?.strengthUnit
        ? `${strength.strength}${strength.strengthUnit}`
        : '';
    const dosageForm = details?.forms?.[0] ? String(details.forms[0]) : '';

    setMedications((prev) => [
      ...prev,
      {
        clientKey: crypto.randomUUID(),
        name: med.brandName,
        din: med.din,
        dosage: dosage || 'Pending',
        dosageForm,
        frequency: 'Pending',
      },
    ]);
  };

  const submitTransfer = () => {
    const fd = new FormData();

    fd.set('intent', 'transfer_prescriptions');
    fd.set(
      'payload',
      JSON.stringify({
        pharmacyName,
        pharmacyPhone,
        pharmacyAddress: pharmacyAddress || null,
        transferType,
        medications: transferType === 'specific' ? medications : undefined,
      }),
    );
    startTransition(() => {
      formAction(fd);
    });
  };

  const copyFaxEmail = async () => {
    try {
      await navigator.clipboard.writeText(faxEmail);
      setFaxCopied(true);
      window.setTimeout(() => setFaxCopied(false), 2000);
    } catch {
      setFaxCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e5dfd5] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#2c2a26]" id={titleId}>
              Add prescription
            </h2>
            <p className="mt-1 text-sm text-[#6b6560]">
              Transfer from your pharmacy, request a doctor fax, or upload a photo.
            </p>
          </div>
          <button
            aria-label="Close dialog"
            className="rounded-lg px-2 py-1 text-sm text-[#6b6560] hover:bg-[#f7f4ef]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {!supabaseReady ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Connect Supabase to save prescriptions.
          </p>
        ) : null}

        {state?.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}

        <div className="mt-4 inline-flex rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
          {(['transfer', 'fax', 'photo'] as const).map((id) => (
            <button
              className={
                method === id
                  ? 'rounded-lg border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                  : 'px-3 py-1.5 text-[#6b6560]'
              }
              key={id}
              onClick={() => setMethod(id)}
              type="button"
            >
              {id === 'transfer' ? 'Transfer' : id === 'fax' ? 'Doctor fax' : 'Photo'}
            </button>
          ))}
        </div>

        {method === 'transfer' ? (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-[#2c2a26]">Pharmacy name</span>
                <input
                  className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                  onChange={(e) => setPharmacyName(e.target.value)}
                  required
                  value={pharmacyName}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-[#2c2a26]">Pharmacy phone</span>
                <input
                  className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                  onChange={(e) => setPharmacyPhone(e.target.value)}
                  required
                  value={pharmacyPhone}
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-[#2c2a26]">Pharmacy address (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                onChange={(e) => setPharmacyAddress(e.target.value)}
                value={pharmacyAddress}
              />
            </label>
            <div className="inline-flex rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
              <button
                className={transferType === 'all' ? 'rounded-lg bg-white px-3 py-1.5 font-medium' : 'px-3 py-1.5'}
                onClick={() => setTransferType('all')}
                type="button"
              >
                Transfer all
              </button>
              <button
                className={
                  transferType === 'specific' ? 'rounded-lg bg-white px-3 py-1.5 font-medium' : 'px-3 py-1.5'
                }
                onClick={() => setTransferType('specific')}
                type="button"
              >
                Specific medications
              </button>
            </div>
            {transferType === 'specific' ? (
              <div className="space-y-3">
                <DpdMedicationSearchField
                  clearQueryAfterSelect
                  medicationsBaseUrl="/api/medications"
                  onSelect={addMedicationFromSearch}
                />
                {medications.map((med) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-[#e8e2d8] px-3 py-2 text-sm"
                    key={med.clientKey}
                  >
                    <span>
                      {med.name} {med.din ? `(DIN ${med.din})` : ''}
                    </span>
                    <button
                      className="text-[#9a2c2c]"
                      onClick={() =>
                        setMedications((prev) => prev.filter((row) => row.clientKey !== med.clientKey))
                      }
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              className="liivv-btn-primary inline-flex px-4 py-2.5 text-sm disabled:opacity-50"
              disabled={isPending || !supabaseReady}
              onClick={submitTransfer}
              type="button"
            >
              {isPending ? 'Submitting…' : 'Submit transfer request'}
            </button>
          </div>
        ) : null}

        {method === 'fax' ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[#6b6560]">
              Copy this email template and send it to your doctor&apos;s office to request a fax to Liivv
              Pharmacy.
            </p>
            <pre className="max-h-64 overflow-auto rounded-xl border border-[#e8e2d8] bg-[#faf8f5] p-4 text-xs whitespace-pre-wrap text-[#2c2a26]">
              {faxEmail}
            </pre>
            <button
              className="liivv-btn-secondary px-4 py-2 text-sm"
              onClick={() => void copyFaxEmail()}
              type="button"
            >
              {faxCopied ? 'Copied!' : 'Copy email text'}
            </button>
          </div>
        ) : null}

        {method === 'photo' ? (
          <form action={formAction} className="mt-4 space-y-3">
            <input name="intent" type="hidden" value="upload_prescription_photo" />
            <label className="block text-sm">
              <span className="font-medium text-[#2c2a26]">Prescription photo</span>
              <span className="mt-1 block rounded-xl border border-dashed border-[#ddd4c8] bg-[#faf8f5] p-4">
                <input
                  accept="image/*"
                  className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#eef4ee] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2d4a2d]"
                  name="photo"
                  required
                  type="file"
                />
                <span className="mt-2 block text-xs text-[#8a8176]">
                  JPG or PNG, up to 5 MB. Include the full prescription label.
                </span>
              </span>
            </label>
            <button
              className="liivv-btn-primary inline-flex px-4 py-2.5 text-sm disabled:opacity-50"
              disabled={isPending || !supabaseReady}
              type="submit"
            >
              {isPending ? 'Uploading…' : 'Upload for review'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
