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
import {
  type ContactChoiceValue,
  isContactChoiceComplete,
  PharmacyContactConsent,
} from '~/components/pharmacy/pharmacy-contact-consent';
import { generateCpapFaxRequestEmail, generateFaxRequestEmail } from '~/lib/pharmacy/pharmacy-fax';
import type { PharmacyContactIntake } from '~/lib/pharmacy-mail/view-types';

export type TransferMedicationInput = {
  name: string;
  din: string;
  dosage: string;
  dosageForm?: string;
  frequency: string;
};

type TransferMedicationRow = TransferMedicationInput & { clientKey: string };

type ContactIntake = PharmacyContactIntake | null | undefined;

const NO_CONTACT_CHOICE: ContactChoiceValue = { mode: null, agree: false };

/*
 * The CPAP intake's "How your Liivv pharmacist can reach you" (owner decision
 * Q10, 2026-10-14): required before a CPAP prescription is sent, once the
 * owner has approved the consent wording (D8). Until then no email choice is
 * offered: the customer is told the pharmacist phones. The medication dialog
 * never shows it or waits for it.
 */
function CpapContactStep({
  mode,
  contactIntake,
  value,
  onChange,
}: {
  mode: 'medication' | 'cpap';
  contactIntake: ContactIntake;
  value: ContactChoiceValue;
  onChange: (value: ContactChoiceValue) => void;
}) {
  if (mode !== 'cpap') {
    return null;
  }

  if (!contactIntake?.emailOffered) {
    return (
      <p className="mt-4 rounded-xl border border-[#e8e2d8] bg-[#faf8f5] p-4 text-sm text-[#5c564c]">
        If a Liivv pharmacist needs to reach you about your CPAP prescription or a mask order, they
        will phone you at the number on your account, and their message will appear on this Pharmacy
        page.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <PharmacyContactConsent
        accountEmail={contactIntake.accountEmail}
        messageModeOffered={contactIntake.messageModeOffered}
        name="cpap-intake-contact"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

/* The CPAP send buttons wait for the dialog, Supabase and (CPAP, when offered) the contact choice. */
function cpapSendDisabled(input: {
  mode: 'medication' | 'cpap';
  isPending: boolean;
  supabaseReady: boolean;
  contact: ContactChoiceValue;
  emailOffered: boolean;
}): boolean {
  return (
    input.isPending ||
    !input.supabaseReady ||
    (input.mode === 'cpap' && input.emailOffered && !isContactChoiceComplete(input.contact))
  );
}

function contactPayload(contact: ContactChoiceValue, emailOffered: boolean) {
  return emailOffered && contact.mode ? { mode: contact.mode, agree: contact.agree } : undefined;
}

/* The words and fax request that differ between the two modes. */
const MEDICATION_DIALOG_COPY = {
  title: 'Add prescription',
  intro: 'Transfer from your pharmacy or request a doctor fax.',
  faxTabLabel: 'Doctor fax',
  faxRequest: generateFaxRequestEmail,
};

const CPAP_DIALOG_COPY = {
  title: 'Add CPAP prescription',
  intro:
    'A complete CPAP mask needs a CPAP prescription: yours, or your child’s for a child’s mask. A Liivv pharmacist checks it before you can order the mask. Parts for a mask you already have don’t need it.',
  faxTabLabel: 'Prescriber fax',
  faxRequest: generateCpapFaxRequestEmail,
};

/*
 * Add a prescription: a medication (transfer from a pharmacy, or a doctor fax
 * request), or, in 'cpap' mode, a CPAP prescription so a complete CPAP mask
 * can be bought (owner ruling C26 (b), 2026-10-13). A CPAP prescription comes
 * by transfer from the customer's current CPAP supplier, clinic or pharmacy,
 * or by their prescriber's fax (generateCpapFaxRequestEmail); both save a row
 * a Liivv pharmacist validates. No upload.
 */
export function AddPrescriptionDialog({
  open,
  onClose,
  userProvince,
  userFullName,
  supabaseReady,
  mode = 'medication',
  contactIntake,
}: {
  open: boolean;
  onClose: () => void;
  userProvince: string | null;
  userFullName: string;
  supabaseReady: boolean;
  mode?: 'medication' | 'cpap';
  /*
   * CPAP mode: the "How your Liivv pharmacist can reach you" choice (owner
   * decision Q10, 2026-10-14), required before the CPAP prescription is sent.
   */
  contactIntake?: ContactIntake;
}) {
  const copy = mode === 'cpap' ? CPAP_DIALOG_COPY : MEDICATION_DIALOG_COPY;
  const [method, setMethod] = useState<'transfer' | 'fax'>('transfer');
  const panel = `${mode}-${method}` as const;
  const [prescriberName, setPrescriberName] = useState('');
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
  const [contact, setContact] = useState<ContactChoiceValue>(NO_CONTACT_CHOICE);
  const emailOffered = contactIntake?.emailOffered ?? false;
  const cpapDisabled = cpapSendDisabled({ mode, isPending, supabaseReady, contact, emailOffered });
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
      copy.faxRequest({
        provinceLabel: userProvince ?? '',
        fullName: userFullName,
      }),
    [copy, userFullName, userProvince],
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

    setMedications((prev) => {
      const existingIndex = prev.findIndex((row) => row.din === med.din && row.name === med.brandName);

      if (existingIndex >= 0) {
        if (!details) {
          return prev;
        }

        const next = [...prev];
        const current = next[existingIndex];

        if (!current) {
          return prev;
        }

        next[existingIndex] = {
          ...current,
          dosage: dosage || current.dosage,
          dosageForm: dosageForm || current.dosageForm,
        };

        return next;
      }

      return [
        ...prev,
        {
          clientKey: crypto.randomUUID(),
          name: med.brandName,
          din: med.din,
          dosage: dosage || 'Pending',
          dosageForm,
          frequency: 'Pending',
        },
      ];
    });
  };

  const submitCpap = (cpapMethod: 'transfer' | 'fax') => {
    const fd = new FormData();

    fd.set('intent', 'submit_cpap_prescription');
    fd.set(
      'payload',
      JSON.stringify({
        method: cpapMethod,
        sourceName: cpapMethod === 'transfer' ? pharmacyName : '',
        sourcePhone: cpapMethod === 'transfer' ? pharmacyPhone : '',
        prescriberName,
        contact: contactPayload(contact, emailOffered),
      }),
    );
    startTransition(() => {
      formAction(fd);
    });
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
              {copy.title}
            </h2>
            <p className="mt-1 text-sm text-[#6b6560]">
              {copy.intro}
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
            Health tools are temporarily unavailable. Prescriptions cannot be saved right now.
          </p>
        ) : null}

        {state?.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.error}
          </p>
        ) : null}

        <div className="mt-4 inline-flex rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
          {(['transfer', 'fax'] as const).map((id) => (
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
              {id === 'transfer' ? 'Transfer' : copy.faxTabLabel}
            </button>
          ))}
        </div>

        <CpapContactStep
          contactIntake={contactIntake}
          mode={mode}
          onChange={setContact}
          value={contact}
        />

        {panel === 'cpap-transfer' ? (
          <CpapTransferPanel
            disabled={cpapDisabled}
            isPending={isPending}
            onPrescriberName={setPrescriberName}
            onSourceName={setPharmacyName}
            onSourcePhone={setPharmacyPhone}
            onSubmit={() => submitCpap('transfer')}
            prescriberName={prescriberName}
            sourceName={pharmacyName}
            sourcePhone={pharmacyPhone}
          />
        ) : null}

        {panel === 'cpap-fax' ? (
          <CpapFaxPanel
            disabled={cpapDisabled}
            faxCopied={faxCopied}
            faxEmail={faxEmail}
            isPending={isPending}
            onCopy={() => {
              copyFaxEmail().catch(() => setFaxCopied(false));
            }}
            onPrescriberName={setPrescriberName}
            onSubmit={() => submitCpap('fax')}
            prescriberName={prescriberName}
          />
        ) : null}

        {panel === 'medication-transfer' ? (
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
                {medications.length === 0 ? (
                  <p className="text-xs text-[#6b6560]">
                    Choose a medication from the results to add it. You can add more than one before submitting.
                  </p>
                ) : null}
                {medications.map((med) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-[#c9d8c9] bg-[#eef4ee] px-3 py-2 text-sm"
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

        {panel === 'medication-fax' ? (
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

      </div>
    </div>
  );
}

const CPAP_INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30';

function PrescriberNameField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#2c2a26]">Prescriber’s name (optional)</span>
      <input
        className={CPAP_INPUT_CLASS}
        maxLength={160}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </label>
  );
}

/* CPAP mode, Transfer: where the CPAP prescription is now. */
function CpapTransferPanel({
  sourceName,
  sourcePhone,
  prescriberName,
  onSourceName,
  onSourcePhone,
  onPrescriberName,
  disabled,
  isPending,
  onSubmit,
}: {
  sourceName: string;
  sourcePhone: string;
  prescriberName: string;
  onSourceName: (value: string) => void;
  onSourcePhone: (value: string) => void;
  onPrescriberName: (value: string) => void;
  disabled: boolean;
  isPending: boolean;
  onSubmit: () => void;
}) {
  const incomplete = !sourceName.trim() || !sourcePhone.trim();

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-[#6b6560]">
        Tell us where your CPAP prescription is now: the supplier, clinic or pharmacy where you got
        your last mask or machine. A Liivv pharmacist asks them for it.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-[#2c2a26]">Current CPAP supplier, clinic or pharmacy</span>
          <input
            className={CPAP_INPUT_CLASS}
            maxLength={160}
            onChange={(e) => onSourceName(e.target.value)}
            required
            value={sourceName}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-[#2c2a26]">Their phone number</span>
          <input
            className={CPAP_INPUT_CLASS}
            maxLength={40}
            onChange={(e) => onSourcePhone(e.target.value)}
            required
            type="tel"
            value={sourcePhone}
          />
        </label>
      </div>
      <PrescriberNameField onChange={onPrescriberName} value={prescriberName} />
      <button
        className="liivv-btn-primary inline-flex px-4 py-2.5 text-sm disabled:opacity-50"
        disabled={disabled || incomplete}
        onClick={onSubmit}
        type="button"
      >
        {isPending ? 'Submitting…' : 'Send transfer request'}
      </button>
    </div>
  );
}

/* CPAP mode, Prescriber fax: the request the customer sends to their prescriber. */
function CpapFaxPanel({
  faxEmail,
  faxCopied,
  onCopy,
  prescriberName,
  onPrescriberName,
  disabled,
  isPending,
  onSubmit,
}: {
  faxEmail: string;
  faxCopied: boolean;
  onCopy: () => void;
  prescriberName: string;
  onPrescriberName: (value: string) => void;
  disabled: boolean;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-[#6b6560]">
        Copy this request, fill in the patient’s name and date of birth (yours, or your child’s), and
        send it to the prescriber’s office, so they fax the CPAP prescription to Liivv. Then tell us
        you’ve sent it.
      </p>
      <pre className="max-h-64 overflow-auto rounded-xl border border-[#e8e2d8] bg-[#faf8f5] p-4 text-xs whitespace-pre-wrap text-[#2c2a26]">
        {faxEmail}
      </pre>
      <button className="liivv-btn-secondary px-4 py-2 text-sm" onClick={onCopy} type="button">
        {faxCopied ? 'Copied!' : 'Copy request'}
      </button>
      <PrescriberNameField onChange={onPrescriberName} value={prescriberName} />
      <div>
        <button
          className="liivv-btn-primary inline-flex px-4 py-2.5 text-sm disabled:opacity-50"
          disabled={disabled}
          onClick={onSubmit}
          type="button"
        >
          {isPending ? 'Saving…' : 'I’ve asked my prescriber to fax it'}
        </button>
      </div>
    </div>
  );
}
