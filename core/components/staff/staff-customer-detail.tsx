'use client';

import type { ReactNode } from 'react';

import { formatStaffStatusLabel, staffStatusBadgeClass } from '~/components/staff/staff-status';
import {
  consentedAnswerKeys,
  healthAnswersSafetyReferralApplies,
  isHealthAnswersWithdrawn,
  readHealthAnswersConsent,
  readHealthAnswersWithdrawalRecord,
} from '~/lib/onboarding/health-profile-consent';
import {
  formatHealthProfileFieldLabel,
  getRawCategoryResponses,
  parseHealthProfileCategoryResponses,
} from '~/lib/onboarding/health-profile-display';
import type { AdminCustomerDetail } from '~/lib/supabase/admin-customers';
import type { CarePackRequestRow, PrescriptionRow, RefillRequestRow } from '~/lib/supabase/prescriptions';

type CarePackRequestIntake = {
  frequentDoseChangeMeds?: string;
  asNeededMeds?: string;
  includeOtcVitamins?: boolean;
  otcVitaminsNotes?: string;
  doctorCoordinationApproved?: boolean;
  holdOrVacationNotes?: string;
  feeAcknowledged?: boolean;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-[#8a8176]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm leading-snug text-[#2c2a26]">{value}</dd>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-2 border-b border-[#efe9e0] pb-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">{title}</h3>
        {typeof count === 'number' ? (
          <span className="text-[11px] tabular-nums text-[#8a8176]">{count}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[#8a8176]">{children}</p>;
}

const selectClass =
  'min-w-[9.5rem] rounded-md border border-[#c4b8a8] bg-white px-2 py-1.5 text-xs font-medium text-[#2c2a26]';

export function StaffCustomerDetail({
  detail,
  formAction,
  chatHref,
  splitSections = false,
}: {
  detail: AdminCustomerDetail;
  formAction: (formData: FormData) => void;
  chatHref?: string;
  /** Two-column health / prescriptions layout (Customers tab). */
  splitSections?: boolean;
}) {
  const { profile, health, insurances, prescriptions, refillRequests, carePackRequests, bigcommerce } =
    detail;
  const name = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || '—'
    : bigcommerce
      ? [bigcommerce.firstName, bigcommerce.lastName].filter(Boolean).join(' ').trim() || '—'
      : '—';
  const email = profile?.email ?? bigcommerce?.email ?? null;
  const phone = bigcommerce?.phone ?? null;
  const bcId = profile?.bigcommerce_customer_id ?? (bigcommerce ? String(bigcommerce.id) : null);

  return (
    <div className="space-y-5 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-lg font-semibold leading-snug text-[#2c2a26]">{name}</p>
          {email ? <p className="break-all text-[#5c564c]">{email}</p> : null}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#8a8176]">
            {phone ? <span>{phone}</span> : null}
            {bcId ? <span>Customer ID {bcId}</span> : null}
            {!profile ? <span>BigCommerce only — no Liivv profile</span> : null}
          </div>
        </div>
        {chatHref ? (
          <a
            className="shrink-0 rounded-lg border border-[#c8d4bc] bg-[#f4f7f0] px-3 py-1.5 text-sm font-medium text-[#375a37] hover:bg-[#eaf0e4]"
            href={chatHref}
          >
            Open chat
          </a>
        ) : null}
      </header>

      {bigcommerce && bigcommerce.addresses.length > 0 ? (
        <Section count={bigcommerce.addresses.length} title="Addresses">
          <ul className="grid gap-2 sm:grid-cols-2">
            {bigcommerce.addresses.map((addr, i) => {
              const line = [addr.address1, addr.address2].filter(Boolean).join(', ');
              const cityLine = [addr.city, addr.stateOrProvince, addr.postalCode]
                .filter(Boolean)
                .join(', ');

              return (
                <li
                  className="rounded-lg border border-[#efe9e0] bg-[#faf9f7] px-3 py-2.5"
                  key={i}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#8a8176]">
                    {i === 0 ? 'Primary' : `Address ${i + 1}`}
                  </p>
                  <p className="mt-1 leading-snug text-[#2c2a26]">{line || '—'}</p>
                  {cityLine ? <p className="mt-0.5 text-xs text-[#5c564c]">{cityLine}</p> : null}
                  {addr.country ? (
                    <p className="mt-0.5 text-xs text-[#8a8176]">{addr.country}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      {profile ? (
        <div className={splitSections ? 'grid gap-5 lg:grid-cols-2' : 'space-y-5'}>
          <div className="space-y-5">
            <Section title="Health profile">
              {health ? (
                <StaffHealthProfileRows health={health} />
              ) : (
                <EmptyLine>No health profile on file.</EmptyLine>
              )}
            </Section>
            <StaffInsuranceSection insurances={insurances} />
          </div>

          <div className="space-y-5">
            <StaffPrescriptionsSection
              formAction={formAction}
              prescriptions={prescriptions}
              profileId={profile.id}
            />
            <StaffRefillsSection
              formAction={formAction}
              prescriptions={prescriptions}
              profileId={profile.id}
              refillRequests={refillRequests}
            />
            <StaffCarePackSection
              carePackRequests={carePackRequests}
              formAction={formAction}
              prescriptions={prescriptions}
              profileId={profile.id}
            />
          </div>
        </div>
      ) : null}

      {detail.bigcommerceLoadError ? (
        <p className="text-xs text-amber-800">{detail.bigcommerceLoadError}</p>
      ) : null}
    </div>
  );
}

function consentDate(grantedAt: string): string {
  const when = grantedAt ? new Date(grantedAt) : null;

  if (!when || Number.isNaN(when.getTime())) {
    return 'unknown date';
  }

  return when.toISOString().slice(0, 10);
}

function answerLabels(keys: string[]): string {
  return keys.map((key) => formatHealthProfileFieldLabel(key)).join(', ');
}

function consentSource(source: 'health_profile_form' | 'landing_quiz'): string {
  return source === 'landing_quiz' ? 'landing quiz' : 'health profile';
}

/* The sentence that has to be true of every answer no tick covers. */
const UNCOVERED_NOTE =
  'Answers no tick covers are not used for personalization: they shape nothing on the customer’s dashboard. They stay on file and you can read them here.';

/*
 * The one exception, spelled out only on the profiles where it is in force.
 *
 * `healthAnswersSafetyReferralApplies` is read whatever the tick says, because
 * all it does is take the shop and pharmacist steps off the dashboard and put
 * an NSWOC there instead. Staff reading "shapes nothing" on such a profile
 * would be wrong about the one thing they are most likely to be asked, so the
 * carve-out is named here rather than left to the reader.
 */
const SAFETY_RULE_NOTE =
  'One exception: this customer told us their body or the fit of their pouching system changed recently, so their dashboard keeps pointing them to an NSWOC instead of to products. That safety rule reads the answer whatever the consent says, and it only ever removes a shopping step.';

function uncoveredNote(notes: unknown, uncoveredKeys: string[]): string {
  const safetyApplies =
    healthAnswersSafetyReferralApplies(notes) && uncoveredKeys.includes('ostomy_journey_stage');

  return safetyApplies ? `${UNCOVERED_NOTE} ${SAFETY_RULE_NOTE}` : UNCOVERED_NOTE;
}

/*
 * Plain-language state of the express consent stored with these answers.
 *
 * Three things have to be said exactly, because staff act on this line. What
 * the latest tick covers; that anything it does not cover is not used for
 * personalization (never "not used" flat — this page shows those answers, and
 * the pharmacy team may act on them in a conversation); and whether the
 * customer has since taken their consent back, which stops personalization for
 * every answer at once while leaving all of them on file — apart from the one
 * safety rule that never depended on the tick, which is named whenever it is
 * actually in force so the line matches the dashboard staff would see.
 */
function consentLine(notes: unknown): string {
  const consent = readHealthAnswersConsent(notes);
  const withdrawal = readHealthAnswersWithdrawalRecord(notes);
  const stored = Object.keys(getRawCategoryResponses(notes));

  if (isHealthAnswersWithdrawn(notes) && withdrawal) {
    const given = consent
      ? ` Consent before that was given ${consentDate(consent.grantedAt)} (${consentSource(consent.source)}, ${consent.version}).`
      : '';
    const unused = healthAnswersSafetyReferralApplies(notes)
      ? `No answer is used for personalization. ${SAFETY_RULE_NOTE}`
      : 'No answer is used for personalization.';

    return `Withdrawn ${consentDate(withdrawal.withdrawnAt)} (${consentSource(withdrawal.source)}).${given} ${unused} Every answer stays on file and is listed below; nothing was deleted.`;
  }

  if (!consent) {
    return `Not recorded — answers predate the consent box, or it was never ticked. ${uncoveredNote(notes, stored)}`;
  }

  const covered = consentedAnswerKeys(notes);
  const uncovered = stored.filter((key) => !covered.includes(key));
  const head = `Latest given ${consentDate(consent.grantedAt)} (${consentSource(consent.source)}, ${consent.version}). Covers: ${covered.length > 0 ? answerLabels(covered) : 'no answers'}.`;

  if (uncovered.length === 0) {
    return head;
  }

  return `${head} Not covered: ${answerLabels(uncovered)}. ${uncoveredNote(notes, uncovered)}`;
}

interface StaffAnswerRow {
  key: string | null;
  label: string;
  value: string;
}

/*
 * The answer key behind each typed column, where there is one. The same answer
 * is stored twice — once in `notes.category_responses` and once in its own
 * column — so the copy in the column has to carry the same consent marker as
 * the copy in the list, or the page would contradict itself.
 */
const COLUMN_ANSWER_KEYS: Record<string, string> = {
  'Ostomy type': 'ostomy_type',
  'Ostomy journey': 'ostomy_journey_stage',
  'Ostomy brand': 'ostomy_preferred_brand',
  'Wound care': 'wound_support_type',
  Breathing: 'breathing_routine',
};

function StaffHealthProfileRows({ health }: { health: NonNullable<AdminCustomerDetail['health']> }) {
  const { rows: categoryRows, freeTextNotes } = parseHealthProfileCategoryResponses(health.notes);
  const structured: StaffAnswerRow[] = [
    health.doctor_name ? { label: 'Doctor', value: health.doctor_name } : null,
    health.doctor_phone ? { label: 'Doctor phone', value: health.doctor_phone } : null,
    health.pharmacy_name ? { label: 'Pharmacy', value: health.pharmacy_name } : null,
    health.pharmacy_phone ? { label: 'Pharmacy phone', value: health.pharmacy_phone } : null,
    health.ostomy_type ? { label: 'Ostomy type', value: health.ostomy_type } : null,
    health.ostomy_tenure ? { label: 'Ostomy journey', value: health.ostomy_tenure } : null,
    health.ostomy_preferred_brand
      ? { label: 'Ostomy brand', value: health.ostomy_preferred_brand }
      : null,
    health.wound_care_type ? { label: 'Wound care', value: health.wound_care_type } : null,
    health.respiratory_type ? { label: 'Breathing', value: health.respiratory_type } : null,
  ]
    .filter((row): row is { label: string; value: string } => row != null)
    .map((row) => ({ ...row, key: COLUMN_ANSWER_KEYS[row.label] ?? null }));

  const answerRows: StaffAnswerRow[] = categoryRows;
  const covered = new Set(consentedAnswerKeys(health.notes));
  const safetyReferral = healthAnswersSafetyReferralApplies(health.notes);
  // An answer with no consent key of its own — a doctor or pharmacy name —
  // is contact detail the customer typed for staff to use, not an answer that
  // personalizes anything, so it carries no marker either way. The journey
  // answer is the one exception to the "not used" marker: while it reads
  // body_change it still steers the dashboard to an NSWOC, tick or no tick.
  const answerLabel = (row: StaffAnswerRow) => {
    if (!row.key || covered.has(row.key)) {
      return row.label;
    }

    if (safetyReferral && row.key === 'ostomy_journey_stage') {
      return `${row.label} — not used for personalization, except the NSWOC safety rule`;
    }

    return `${row.label} — not used for personalization`;
  };
  const hasContent = structured.length > 0 || answerRows.length > 0 || Boolean(freeTextNotes);

  if (!hasContent) {
    return <EmptyLine>Health profile saved, but no answers on file.</EmptyLine>;
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 sm:col-span-2">
        <Field label="Consent to use health answers" value={consentLine(health.notes)} />
      </div>
      {structured.map((row) => (
        <Field key={row.label} label={answerLabel(row)} value={row.value} />
      ))}
      {answerRows.map((row) => (
        <Field key={row.label} label={answerLabel(row)} value={row.value} />
      ))}
      {freeTextNotes ? (
        <div className="min-w-0 sm:col-span-2">
          <Field label="Notes" value={freeTextNotes} />
        </div>
      ) : null}
    </dl>
  );
}

function StaffInsuranceSection({ insurances }: { insurances: AdminCustomerDetail['insurances'] }) {
  return (
    <Section count={insurances.length} title="Insurance">
      {insurances.length === 0 ? (
        <EmptyLine>No insurance on file.</EmptyLine>
      ) : (
        <ul className="space-y-2">
          {insurances.map((entry) => (
            <li className="rounded-lg border border-[#efe9e0] bg-[#faf9f7] px-3 py-2.5" key={entry.id}>
              <dl className="grid gap-2 sm:grid-cols-3">
                {entry.provider_name ? (
                  <Field label="Provider" value={entry.provider_name} />
                ) : null}
                {entry.policy_number ? (
                  <Field label="Policy #" value={entry.policy_number} />
                ) : null}
                {entry.member_id ? <Field label="Member ID" value={entry.member_id} /> : null}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function StaffPrescriptionsSection({
  profileId,
  prescriptions,
  formAction,
}: {
  profileId: string;
  prescriptions: (PrescriptionRow & { photoDisplayUrl?: string | null })[];
  formAction: (formData: FormData) => void;
}) {
  return (
    <Section count={prescriptions.length} title="Prescriptions">
      {prescriptions.length === 0 ? (
        <EmptyLine>No prescriptions on file.</EmptyLine>
      ) : (
        <ul className="space-y-2">
          {prescriptions.map((rx) => {
            const approval = String(rx.approval_status ?? '').toLowerCase();
            const statusValue =
              approval === 'approved' ||
              approval === 'rejected' ||
              approval === 'expired' ||
              approval === 'pending_review'
                ? approval
                : (rx.approval_status ?? rx.status ?? 'pending_review');
            const meta = [rx.dosage, rx.frequency].filter(Boolean).join(' · ');

            return (
              <li className="rounded-lg border border-[#efe9e0] bg-[#faf9f7] px-3 py-2.5" key={rx.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-snug text-[#2c2a26]">{rx.medication_name}</p>
                    {meta ? <p className="mt-0.5 text-xs text-[#5c564c]">{meta}</p> : null}
                  </div>
                  <span className={`shrink-0 ${staffStatusBadgeClass(statusValue)}`}>
                    {formatStaffStatusLabel(statusValue)}
                  </span>
                </div>
                {rx.photoDisplayUrl ? (
                  <img
                    alt=""
                    className="mt-2 h-24 rounded border border-[#efe9e0] object-contain"
                    src={rx.photoDisplayUrl}
                  />
                ) : null}
                <form action={formAction} className="mt-2">
                  <input name="intent" type="hidden" value="prescription_set_status" />
                  <input name="profileId" type="hidden" value={profileId} />
                  <input name="prescriptionId" type="hidden" value={rx.id} />
                  <label className="sr-only" htmlFor={`rx-status-${rx.id}`}>
                    Approval status
                  </label>
                  <select
                    className={selectClass}
                    defaultValue={
                      approval === 'approved' || approval === 'rejected' || approval === 'expired'
                        ? approval
                        : 'pending_review'
                    }
                    id={`rx-status-${rx.id}`}
                    name="status"
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  >
                    <option value="pending_review">Pending review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function medicationNamesForRequest(
  prescriptionIds: string[] | null | undefined,
  prescriptions: PrescriptionRow[],
): string {
  const namesById = new Map(prescriptions.map((rx) => [rx.id, rx.medication_name]));
  const names = (prescriptionIds ?? []).map((id) => namesById.get(id) ?? 'Unknown medication');

  return names.length > 0 ? names.join(', ') : 'No medications listed';
}

function StaffRefillsSection({
  profileId,
  prescriptions,
  refillRequests,
  formAction,
}: {
  profileId: string;
  prescriptions: PrescriptionRow[];
  refillRequests: RefillRequestRow[];
  formAction: (formData: FormData) => void;
}) {
  return (
    <Section count={refillRequests.length} title="Refill requests">
      {refillRequests.length === 0 ? (
        <EmptyLine>No refill requests on file.</EmptyLine>
      ) : (
        <ul className="space-y-2">
          {refillRequests.map((req) => (
            <li className="rounded-lg border border-[#efe9e0] bg-[#faf9f7] px-3 py-2.5" key={req.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold leading-snug text-[#2c2a26]">
                    {medicationNamesForRequest(req.prescription_ids, prescriptions)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#8a8176]">Request #{req.id.slice(0, 8)}</p>
                </div>
                <span className={`shrink-0 ${staffStatusBadgeClass(req.status)}`}>
                  {formatStaffStatusLabel(req.status)}
                </span>
              </div>
              <form action={formAction} className="mt-2">
                <input name="intent" type="hidden" value="refill_set_status" />
                <input name="profileId" type="hidden" value={profileId} />
                <input name="refillRequestId" type="hidden" value={req.id} />
                <select
                  className={selectClass}
                  defaultValue={String(req.status ?? '').toLowerCase()}
                  name="status"
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                >
                  <option value="pending_review">Pending review</option>
                  <option value="refill_processing">Refill processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </form>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function StaffCarePackSection({
  profileId,
  prescriptions,
  carePackRequests,
  formAction,
}: {
  profileId: string;
  prescriptions: PrescriptionRow[];
  carePackRequests: CarePackRequestRow[];
  formAction: (formData: FormData) => void;
}) {
  return (
    <Section count={carePackRequests.length} title="CarePack requests">
      {carePackRequests.length === 0 ? (
        <EmptyLine>No CarePack requests on file.</EmptyLine>
      ) : (
        <ul className="space-y-2">
          {carePackRequests.map((req) => {
            let intake: CarePackRequestIntake | null = null;

            if (req.notes) {
              try {
                intake = JSON.parse(req.notes) as CarePackRequestIntake;
              } catch {
                intake = null;
              }
            }

            return (
              <li className="rounded-lg border border-[#efe9e0] bg-[#faf9f7] px-3 py-2.5" key={req.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug text-[#2c2a26]">
                      {medicationNamesForRequest(req.prescription_ids, prescriptions)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8a8176]">Request #{req.id.slice(0, 8)}</p>
                  </div>
                  <span className={`shrink-0 ${staffStatusBadgeClass(req.status)}`}>
                    {formatStaffStatusLabel(req.status)}
                  </span>
                </div>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  {intake?.frequentDoseChangeMeds ? (
                    <Field label="Dose changes" value={intake.frequentDoseChangeMeds} />
                  ) : null}
                  {intake?.asNeededMeds ? (
                    <Field label="As-needed" value={intake.asNeededMeds} />
                  ) : null}
                  {intake?.includeOtcVitamins ? (
                    <Field label="OTC vitamins" value={intake.otcVitaminsNotes?.trim() || 'Yes'} />
                  ) : null}
                  {intake?.holdOrVacationNotes ? (
                    <Field label="Hold / vacation" value={intake.holdOrVacationNotes} />
                  ) : null}
                </dl>
                <form action={formAction} className="mt-2">
                  <input name="intent" type="hidden" value="carepack_set_status" />
                  <input name="profileId" type="hidden" value={profileId} />
                  <input name="carePackRequestId" type="hidden" value={req.id} />
                  <select
                    className={selectClass}
                    defaultValue={String(req.status ?? '').toLowerCase()}
                    name="status"
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  >
                    <option value="pending_review">Pending review</option>
                    <option value="setup_in_progress">Setup in progress</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
