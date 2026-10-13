'use client';

import { useState } from 'react';

import { Link } from '~/components/link';
import { AddPrescriptionDialog } from '~/components/pharmacy/add-prescription-dialog';
import type { CpapPrescriptionState } from '~/lib/pharmacy/cpap-prescription';

/*
 * The account Pharmacy page's "CPAP prescription" card (owner ruling C26 (b),
 * 2026-10-13). A complete CPAP mask can't be paid for until a Liivv
 * pharmacist has approved the customer's CPAP prescription and set its
 * expiry (~/lib/checkout/checkout-gates.ts); this card says where that
 * stands and sends a new one, by transfer or prescriber fax
 * (AddPrescriptionDialog in 'cpap' mode). Parts for a mask the customer
 * already has never need it. While one is with a pharmacist, the card sends
 * no other (the action refuses a second one too). A child's mask needs the
 * child's CPAP prescription (wording for the nurse to confirm, C17).
 *
 * English only, like the rest of the Pharmacy page.
 */

function formatDate(value: string | null | undefined): string | null {
  const day = String(value ?? '').slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return null;
  }

  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`));
}

function statusOf(state: CpapPrescriptionState): {
  label: string;
  cls: string;
  detail: string;
  /** Show the contact link after the detail. */
  contact?: boolean;
} {
  switch (state.kind) {
    case 'valid':
      return {
        label: `Valid until ${formatDate(state.validUntil) ?? state.validUntil}`,
        cls: 'bg-[#e8f3e4] text-[#2f6b2f]',
        detail:
          'A Liivv pharmacist checked your CPAP prescription. You can order a complete CPAP mask until this date. A Liivv pharmacist still checks each complete-mask order before it ships.',
      };

    case 'pending':
      return {
        label: 'Sent, waiting for a pharmacist',
        cls: 'bg-[#fff4d6] text-[#9a6b00]',
        detail:
          state.method === 'fax'
            ? 'A Liivv pharmacist checks it once your prescriber’s fax arrives. You can order a complete CPAP mask after that.'
            : 'A Liivv pharmacist is getting your CPAP prescription and will check it. You can order a complete CPAP mask after that.',
      };

    case 'expired':
      return {
        label: 'Expired',
        cls: 'bg-[#f1efeb] text-[#6b6560]',
        detail: state.expiredOn
          ? `Your CPAP prescription on file ran until ${formatDate(state.expiredOn) ?? state.expiredOn}. Send a new one to order a complete CPAP mask.`
          : 'Your CPAP prescription on file has expired. Send a new one to order a complete CPAP mask.',
      };

    case 'rejected':
      return {
        label: 'Not accepted',
        cls: 'bg-[#fde8e8] text-[#9a2c2c]',
        detail:
          'A Liivv pharmacist couldn’t accept the CPAP prescription you sent. Send a new one, or talk to a pharmacist:',
        contact: true,
      };

    default:
      return {
        label: 'None on file',
        cls: 'bg-[#f1efeb] text-[#6b6560]',
        detail:
          'A complete CPAP mask needs a CPAP prescription that a Liivv pharmacist checks: yours, or your child’s for a child’s mask. Parts for a mask you already have don’t need it.',
      };
  }
}

export function CpapPrescriptionCard({
  state,
  supabaseReady,
  userFullName,
  userProvince,
}: {
  state: CpapPrescriptionState;
  supabaseReady: boolean;
  userFullName: string;
  userProvince: string | null;
}) {
  const [open, setOpen] = useState(false);
  const status = statusOf(state);
  // Nothing new to send while one is with a pharmacist (the action refuses it too).
  const canSend = state.kind !== 'pending';

  return (
    <section
      aria-labelledby="cpap-prescription-title"
      className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-5"
      data-cpap-prescription={state.kind}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#2c2a26]" id="cpap-prescription-title">
            CPAP prescription
          </h2>
          {supabaseReady ? (
            <span
              className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}
            >
              {status.label}
            </span>
          ) : null}
        </div>
        {canSend || !supabaseReady ? (
          <button
            className="liivv-btn-secondary px-4 py-2 text-sm disabled:opacity-50"
            disabled={!supabaseReady}
            onClick={() => setOpen(true)}
            type="button"
          >
            Add CPAP prescription
          </button>
        ) : null}
      </div>
      <p className="mt-2 max-w-2xl text-sm text-[#5c564c]">
        {supabaseReady
          ? status.detail
          : 'Your CPAP prescription can’t be shown right now. Please try again later.'}
        {supabaseReady && status.contact ? (
          <>
            {' '}
            <Link className="font-medium underline" href="/contact-us">
              Contact Liivv
            </Link>
          </>
        ) : null}
      </p>
      <AddPrescriptionDialog
        mode="cpap"
        onClose={() => setOpen(false)}
        open={open}
        supabaseReady={supabaseReady}
        userFullName={userFullName}
        userProvince={userProvince}
      />
    </section>
  );
}
