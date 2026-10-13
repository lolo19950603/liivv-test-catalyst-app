'use client';

import { formatStaffStatusLabel, staffStatusBadgeClass } from '~/components/staff/staff-status';
import { cpapToday, isCpapPrescriptionValid } from '~/lib/pharmacy/cpap-prescription';
import type { PrescriptionRow } from '~/lib/supabase/prescriptions';
import type { AdminRxOrderCheckQueueRow } from '~/lib/supabase/rx-order-checks';

/*
 * =============================================================================
 * PHARMACIST CONTROLS FOR CPAP PRESCRIPTIONS AND COMPLETE-MASK ORDERS
 * =============================================================================
 * Owner ruling C26 (b), 2026-10-13. A CPAP prescription is approved only with
 * the date it is valid until (the checkout lets the customer pay for a
 * complete CPAP mask while it is approved and in date), and rejected only
 * with a reason. A complete-mask order is signed off, sent back for more
 * information, or rejected; phase 1 records the decision only, and a rejected
 * order is cancelled and refunded by hand. The server checks every
 * transition again (staff-portal-actions.ts) and records who decided: the
 * admin is one shared login, so each form asks for the pharmacist's own name
 * and licence number.
 * =============================================================================
 */

const inputClass =
  'w-full rounded-md border border-[#c4b8a8] bg-white px-2.5 py-2 text-base text-[#2c2a26]';
const primaryButton =
  'rounded-md bg-[#375a37] px-3 py-1.5 text-base font-medium text-white disabled:opacity-60';
const secondaryButton =
  'rounded-md border border-[#c4b8a8] bg-white px-3 py-1.5 text-base text-[#3f3d39] hover:bg-[#f4f3f1]';
const dangerButton =
  'rounded-md border border-[#e3b5b2] bg-white px-3 py-1.5 text-base font-medium text-[#8a2420] hover:bg-[#fdf1f0]';

export function CpapBadge() {
  return (
    <span className="ml-2 inline-flex rounded bg-[#1f5f8b] px-1.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-white">
      CPAP
    </span>
  );
}

export function ChildBadge() {
  return (
    <span className="ml-2 inline-flex rounded bg-[#c46b2f] px-1.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-white">
      Child
    </span>
  );
}

export function AlwaysHoldBadge() {
  return (
    <span className="ml-2 inline-flex rounded bg-[#7a1d18] px-1.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-white">
      Always hold
    </span>
  );
}

/* The pharmacist's own name and licence number, required on every decision. */
function ReviewerField() {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#2c2a26]">Your name and licence number (required)</span>
      <input
        autoComplete="name"
        className={`mt-1 ${inputClass}`}
        maxLength={120}
        minLength={3}
        name="reviewerName"
        required
        type="text"
      />
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-[#6b6560]">{label}</dt>
      <dd className="mt-0.5 break-words text-base leading-snug text-[#2c2a26]">{value}</dd>
    </div>
  );
}

function formatWhen(iso: string | null | undefined): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function submissionLabel(method: string | null | undefined): string | null {
  if (method === 'fax') {
    return 'Prescriber fax';
  }

  if (method === 'transfer') {
    return 'Transfer';
  }

  return method ?? null;
}

/* The review panel for one CPAP prescription row. */
export function CpapPrescriptionReview({
  rx,
  profileId,
  formAction,
}: {
  rx: PrescriptionRow;
  profileId: string;
  formAction: (formData: FormData) => void;
}) {
  const approval =
    String(rx.approval_status ?? '')
      .trim()
      .toLowerCase() || 'pending_review';
  const today = cpapToday();
  const canApprove = ['pending_review', 'needs_info', 'approved', 'expired'].includes(approval);
  const canReject = canApprove;
  const canReopen = ['approved', 'rejected', 'expired'].includes(approval);

  return (
    <div className="mt-2 space-y-3" data-cpap-review={rx.id}>
      <dl className="grid gap-2 sm:grid-cols-2">
        <Detail label="How it will arrive" value={submissionLabel(rx.submission_method)} />
        <Detail label="Transfer from" value={rx.pharmacy_name} />
        <Detail label="Prescriber" value={rx.prescribing_doctor} />
        <Detail label="Valid until" value={rx.end_date ? String(rx.end_date).slice(0, 10) : null} />
        <Detail
          label="Reviewed"
          value={
            rx.reviewed_by
              ? [rx.reviewed_by, formatWhen(rx.reviewed_at)].filter(Boolean).join(' · ')
              : null
          }
        />
        <Detail label="Reason" value={rx.review_reason} />
      </dl>
      {rx.notes ? <p className="text-sm text-[#5c564c]">{rx.notes}</p> : null}

      {canApprove ? (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input name="intent" type="hidden" value="cpap_rx_approve" />
          <input name="profileId" type="hidden" value={profileId} />
          <input name="prescriptionId" type="hidden" value={rx.id} />
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">Valid until (required)</span>
            <input
              className={`mt-1 ${inputClass}`}
              defaultValue={rx.end_date ? String(rx.end_date).slice(0, 10) : undefined}
              min={today}
              name="endDate"
              required
              type="date"
            />
          </label>
          <ReviewerField />
          <button className={primaryButton} type="submit">
            {approval === 'approved' ? 'Update expiry' : 'Approve'}
          </button>
        </form>
      ) : null}

      {canReject ? (
        <form action={formAction} className="space-y-2">
          <input name="intent" type="hidden" value="cpap_rx_reject" />
          <input name="profileId" type="hidden" value={profileId} />
          <input name="prescriptionId" type="hidden" value={rx.id} />
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">Reason for not accepting (required)</span>
            <textarea
              className={`mt-1 ${inputClass}`}
              maxLength={500}
              name="reason"
              required
              rows={2}
            />
          </label>
          <ReviewerField />
          <button className={dangerButton} type="submit">
            Reject
          </button>
        </form>
      ) : null}

      {canReopen ? (
        <form action={formAction} className="space-y-2">
          <input name="intent" type="hidden" value="cpap_rx_reopen" />
          <input name="prescriptionId" type="hidden" value={rx.id} />
          <ReviewerField />
          <button className={secondaryButton} type="submit">
            Back to pending review
          </button>
        </form>
      ) : null}
      {approval === 'approved' ? (
        <form action={formAction} className="space-y-2">
          <input name="intent" type="hidden" value="cpap_rx_expire" />
          <input name="prescriptionId" type="hidden" value={rx.id} />
          <ReviewerField />
          <button className={secondaryButton} type="submit">
            Mark expired
          </button>
        </form>
      ) : null}
    </div>
  );
}

/* The selected complete-mask order, with the pharmacist's sign-off actions. */
export function MaskOrderReview({
  row,
  formAction,
}: {
  row: AdminRxOrderCheckQueueRow;
  formAction: (formData: FormData) => void;
}) {
  const status = row.status.trim().toLowerCase();
  const open = status === 'awaiting_signoff' || status === 'needs_info';
  const alwaysHold = ['QC', 'YT', 'NT', 'NU'].includes(String(row.region ?? ''));
  const prescriptionValidNow = row.prescription
    ? isCpapPrescriptionValid({ id: row.prescription_id ?? '', ...row.prescription }, cpapToday())
    : false;
  const prescriptionLabel = (() => {
    if (!row.prescription_id) {
      return 'None on file when the order was paid';
    }

    if (!row.prescription) {
      return `#${row.prescription_id.slice(0, 8)} (could not be read)`;
    }

    const until = row.prescription.end_date
      ? `valid until ${String(row.prescription.end_date).slice(0, 10)}`
      : 'no expiry set';

    return `${formatStaffStatusLabel(row.prescription.approval_status)}, ${until}`;
  })();

  return (
    <div
      className="rounded-lg border border-[#c9d8c9] bg-[#f4f7f0] px-3 py-3"
      data-mask-order={row.id}
    >
      <p className="text-sm font-semibold text-[#375a37]">Selected mask order</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#2c2a26]">
            Order #{row.bigcommerce_order_id}
            {row.paediatric ? <ChildBadge /> : null}
            {alwaysHold ? <AlwaysHoldBadge /> : null}
          </p>
          <p className="mt-0.5 text-sm text-[#5c564c]">
            {row.region ? `Ships to ${row.region}` : 'Region not recorded'}
          </p>
        </div>
        <span className={`shrink-0 ${staffStatusBadgeClass(status)}`}>
          {formatStaffStatusLabel(status)}
        </span>
      </div>

      <ul className="mt-2 space-y-1 text-base text-[#2c2a26]">
        {row.lines.length > 0
          ? row.lines.map((line, index) => (
              <li key={`${line.productId}-${index}`}>
                {line.quantity} × {line.name}
                {line.options ? (
                  <span className="text-sm text-[#5c564c]"> · {line.options}</span>
                ) : null}
              </li>
            ))
          : row.product_ids.map((id) => <li key={id}>Product {id}</li>)}
      </ul>

      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-sm font-medium text-[#6b6560]">CPAP prescription now</dt>
          <dd className="mt-0.5 break-words text-base leading-snug text-[#2c2a26]">
            {prescriptionLabel}
            {prescriptionValidNow ? null : (
              <span className="mt-0.5 block text-sm font-semibold text-[#8a2420]">
                Not approved and in date today. Check the customer’s CPAP prescriptions below.
              </span>
            )}
          </dd>
        </div>
        <Detail
          label="Reviewed"
          value={
            row.reviewed_by
              ? [row.reviewed_by, formatWhen(row.reviewed_at)].filter(Boolean).join(' · ')
              : null
          }
        />
        <Detail label="Reason" value={row.reason} />
      </dl>

      {open ? (
        <div className="mt-3 space-y-3">
          <form action={formAction} className="space-y-2">
            <input name="intent" type="hidden" value="mask_order_sign_off" />
            <input name="checkId" type="hidden" value={row.id} />
            <ReviewerField />
            <button className={primaryButton} type="submit">
              Sign off
            </button>
          </form>
          {status === 'awaiting_signoff' ? (
            <form action={formAction} className="space-y-2">
              <input name="intent" type="hidden" value="mask_order_needs_info" />
              <input name="checkId" type="hidden" value={row.id} />
              <label className="block text-sm">
                <span className="font-medium text-[#2c2a26]">What is needed (required)</span>
                <textarea
                  className={`mt-1 ${inputClass}`}
                  maxLength={500}
                  name="reason"
                  required
                  rows={2}
                />
              </label>
              <ReviewerField />
              <button className={secondaryButton} type="submit">
                Needs info
              </button>
            </form>
          ) : null}
          <form action={formAction} className="space-y-2">
            <input name="intent" type="hidden" value="mask_order_reject" />
            <input name="checkId" type="hidden" value={row.id} />
            <label className="block text-sm">
              <span className="font-medium text-[#2c2a26]">Reason for rejecting (required)</span>
              <textarea
                className={`mt-1 ${inputClass}`}
                maxLength={500}
                name="reason"
                required
                rows={2}
              />
            </label>
            <ReviewerField />
            <button className={dangerButton} type="submit">
              Reject
            </button>
            <p className="text-sm text-[#5c564c]">
              Rejecting records the decision and marks the BigCommerce order "DO NOT SHIP" in its
              staff notes. Cancel and refund the order by hand in BigCommerce and Stripe.
            </p>
          </form>
        </div>
      ) : null}
    </div>
  );
}
