'use client';

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

function row(k: string, v: string | null | undefined) {
  if (v == null || String(v).trim() === '') {
    return null;
  }

  return (
    <div className="grid grid-cols-[minmax(0,7rem)_1fr] gap-x-3 gap-y-1 border-b border-[#f0ebe3] py-2 last:border-0">
      <dt className="text-xs font-medium text-[#8a8176]">{k}</dt>
      <dd className="text-[#2c2a26]">{String(v)}</dd>
    </div>
  );
}

export function StaffCustomerDetail({
  detail,
  formAction,
}: {
  detail: AdminCustomerDetail;
  formAction: (formData: FormData) => void;
}) {
  const { profile, health, insurances, prescriptions, refillRequests, carePackRequests, bigcommerce } =
    detail;
  const name = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || '—'
    : bigcommerce
      ? [bigcommerce.firstName, bigcommerce.lastName].filter(Boolean).join(' ').trim() || '—'
      : '—';

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm">
      {profile ? (
        <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Profile</h3>
          <dl className="mt-2">
            {row('Name', name)}
            {row('Email', profile.email)}
            {row('BigCommerce ID', profile.bigcommerce_customer_id)}
            {row('Profile id', profile.id)}
          </dl>
        </section>
      ) : (
        <section className="rounded-lg border border-[#e8e0d4] bg-[#faf8f5] p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv profile</h3>
          <p className="mt-2 text-[#6b6560]">No Supabase profile. BigCommerce data shown below when available.</p>
        </section>
      )}

      {bigcommerce ? (
        <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">BigCommerce</h3>
          <dl className="mt-2">
            {row('Name', [bigcommerce.firstName, bigcommerce.lastName].filter(Boolean).join(' '))}
            {row('Email', bigcommerce.email)}
            {row('Phone', bigcommerce.phone)}
            {row('Customer ID', String(bigcommerce.id))}
          </dl>
          {bigcommerce.addresses.length > 0 ? (
            <ul className="mt-3 space-y-2 text-xs">
              {bigcommerce.addresses.map((addr, i) => (
                <li className="rounded-md border border-[#efe9e0] bg-[#faf9f7] px-3 py-2" key={i}>
                  {[addr.address1, addr.address2, addr.city, addr.stateOrProvince, addr.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {profile ? (
        <>
          <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Health profile</h3>
            {health ? (
              <dl className="mt-2">
                {row('Doctor', health.doctor_name)}
                {row('Doctor phone', health.doctor_phone)}
                {row('Pharmacy', health.pharmacy_name)}
                {row('Pharmacy phone', health.pharmacy_phone)}
                {row('Notes', health.notes)}
              </dl>
            ) : (
              <p className="mt-2 text-[#8a8176]">No health profile on file.</p>
            )}
          </section>

          <StaffPrescriptionsSection formAction={formAction} prescriptions={prescriptions} profileId={profile.id} />
          <StaffRefillsSection formAction={formAction} profileId={profile.id} refillRequests={refillRequests} />
          <StaffCarePackSection
            carePackRequests={carePackRequests}
            formAction={formAction}
            profileId={profile.id}
          />
          <StaffInsuranceSection insurances={insurances} />
        </>
      ) : null}
    </div>
  );
}

function StaffInsuranceSection({ insurances }: { insurances: AdminCustomerDetail['insurances'] }) {
  return (
    <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Insurance</h3>
      {insurances.length === 0 ? (
        <p className="mt-2 text-[#8a8176]">No insurance record on file.</p>
      ) : (
        <div className="mt-2 space-y-3">
          {insurances.map((entry) => (
            <div className="rounded-md border border-[#efe9e0] bg-[#faf9f7] p-3" key={entry.id}>
              <dl>
                {row('Provider', entry.provider_name)}
                {row('Policy #', entry.policy_number)}
                {row('Member ID', entry.member_id)}
              </dl>
            </div>
          ))}
        </div>
      )}
    </section>
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
    <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Prescriptions</h3>
      {prescriptions.length === 0 ? (
        <p className="mt-2 text-[#8a8176]">No prescriptions on file.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {prescriptions.map((rx) => {
            const approval = String(rx.approval_status ?? '').toLowerCase();

            return (
              <li className="rounded-md border border-[#efe9e0] bg-[#faf9f7] px-3 py-2 text-xs" key={rx.id}>
                <p className="font-semibold text-[#2c2a26]">{rx.medication_name}</p>
                <p className="mt-1 text-[#5c564c]">
                  {[rx.dosage, rx.frequency].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className="mt-1 text-[#8a8176]">
                  Approval: {rx.approval_status ?? '—'} • Status: {rx.status ?? '—'}
                </p>
                {rx.photoDisplayUrl ? (
                  <img alt="" className="mt-2 h-24 rounded border object-contain" src={rx.photoDisplayUrl} />
                ) : null}
                <form action={formAction} className="mt-2 flex flex-wrap gap-2">
                  <input name="intent" type="hidden" value="prescription_set_status" />
                  <input name="profileId" type="hidden" value={profileId} />
                  <input name="prescriptionId" type="hidden" value={rx.id} />
                  <select
                    className="rounded-md border border-[#c4b8a8] bg-white px-2 py-1 text-[11px] font-semibold"
                    defaultValue={
                      approval === 'approved' || approval === 'rejected' || approval === 'expired'
                        ? approval
                        : 'pending_review'
                    }
                    name="status"
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  >
                    <option value="pending_review">Pending review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </form>
                <form action={formAction} className="mt-1">
                  <input name="intent" type="hidden" value="prescription_mark_active" />
                  <input name="profileId" type="hidden" value={profileId} />
                  <input name="prescriptionId" type="hidden" value={rx.id} />
                  <button
                    className="liivv-btn-primary px-2 py-1 text-[11px]"
                    type="submit"
                  >
                    Mark active
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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
    <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Refill requests</h3>
      {refillRequests.length === 0 ? (
        <p className="mt-2 text-[#8a8176]">No refill requests on file.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {refillRequests.map((req) => (
            <li className="rounded-md border border-[#efe9e0] bg-[#faf9f7] px-3 py-2 text-xs" key={req.id}>
              <p className="font-semibold text-[#2c2a26]">Request #{req.id.slice(0, 8)}</p>
              <p className="mt-1 text-[#8a8176]">Status: {req.status}</p>
              <form action={formAction} className="mt-2">
                <input name="intent" type="hidden" value="refill_set_status" />
                <input name="profileId" type="hidden" value={profileId} />
                <input name="refillRequestId" type="hidden" value={req.id} />
                <select
                  className="rounded-md border border-[#c4b8a8] bg-white px-2 py-1 text-[11px] font-semibold"
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
    </section>
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
    <section className="rounded-lg border border-[#ece6dc] bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">CarePack requests</h3>
      {carePackRequests.length === 0 ? (
        <p className="mt-2 text-[#8a8176]">No CarePack requests on file.</p>
      ) : (
        <ul className="mt-2 space-y-3">
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
              <li className="rounded-md border border-[#efe9e0] bg-[#faf9f7] px-3 py-2 text-xs" key={req.id}>
                <p className="font-semibold text-[#2c2a26]">Request #{req.id.slice(0, 8)}</p>
                <p className="mt-1 text-[#8a8176]">Status: {req.status}</p>
                {intake?.frequentDoseChangeMeds ? (
                  <p className="mt-1 text-[#8a8176]">Dose changes: {intake.frequentDoseChangeMeds}</p>
                ) : null}
                <form action={formAction} className="mt-2">
                  <input name="intent" type="hidden" value="carepack_set_status" />
                  <input name="profileId" type="hidden" value={profileId} />
                  <input name="carePackRequestId" type="hidden" value={req.id} />
                  <select
                    className="rounded-md border border-[#c4b8a8] bg-white px-2 py-1 text-[11px] font-semibold"
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
    </section>
  );
}
