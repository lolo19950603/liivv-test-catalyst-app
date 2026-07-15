'use client';

import type { ReactNode } from 'react';

import type { AdminCustomerDetail } from '~/lib/supabase/admin-customers';
import type { CarePackRequestRow, PrescriptionRow, RefillRequestRow } from '~/lib/supabase/prescriptions';
import { parseHealthProfileCategoryResponses } from '~/lib/onboarding/health-profile-display';

import { formatStaffStatusLabel, staffStatusBadgeClass } from '~/components/staff/staff-status';

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
              profileId={profile.id}
              refillRequests={refillRequests}
            />
            <StaffCarePackSection
              carePackRequests={carePackRequests}
              formAction={formAction}
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

function StaffHealthProfileRows({ health }: { health: NonNullable<AdminCustomerDetail['health']> }) {
  const { rows: categoryRows, freeTextNotes } = parseHealthProfileCategoryResponses(health.notes);
  const structured: Array<{ label: string; value: string }> = [
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
  ].filter((row): row is { label: string; value: string } => row != null);

  const answerRows = categoryRows;
  const hasContent = structured.length > 0 || answerRows.length > 0 || Boolean(freeTextNotes);

  if (!hasContent) {
    return <EmptyLine>Health profile saved, but no answers on file.</EmptyLine>;
  }

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {structured.map((row) => (
        <Field key={row.label} label={row.label} value={row.value} />
      ))}
      {answerRows.map((row) => (
        <Field key={row.label} label={row.label} value={row.value} />
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

function StaffRefillsSection({
  profileId,
  refillRequests,
  formAction,
}: {
  profileId: string;
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
                <p className="font-semibold text-[#2c2a26]">Request #{req.id.slice(0, 8)}</p>
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
  carePackRequests,
  formAction,
}: {
  profileId: string;
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
                  <p className="font-semibold text-[#2c2a26]">Request #{req.id.slice(0, 8)}</p>
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
