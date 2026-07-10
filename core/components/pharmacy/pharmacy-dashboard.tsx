'use client';

import { useActionState, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  pharmacyAction,
  type PharmacyActionState,
} from '~/app/[locale]/(default)/account/(portal)/pharmacy/_actions/pharmacy-actions';
import { AddPrescriptionDialog } from '~/components/pharmacy/add-prescription-dialog';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import type {
  PharmacyCarePackRequest,
  PharmacyPrescription,
  PharmacyRefillRequest,
} from '~/lib/pharmacy/pharmacy-mappers';

type RxBucket = 'all' | 'pending' | 'active' | 'rejected' | 'expired';
type PharmacySection = 'prescriptions' | 'refill_requests' | 'carepack';
type RefillFilter = 'all' | 'processing' | 'completed';

function parseSectionParam(raw: string | null): PharmacySection {
  if (raw === 'refill_requests') {
    return 'refill_requests';
  }

  if (raw === 'carepack') {
    return 'carepack';
  }

  return 'prescriptions';
}

function bucketBadge(bucket: PharmacyPrescription['bucket']) {
  if (bucket === 'active') {
    return { text: 'Active', cls: 'bg-[#e8f3e4] text-[#2f6b2f]' };
  }

  if (bucket === 'rejected') {
    return { text: 'Rejected', cls: 'bg-[#fde8e8] text-[#9a2c2c]' };
  }

  if (bucket === 'expired') {
    return { text: 'Expired', cls: 'bg-[#f1efeb] text-[#6b6560]' };
  }

  return { text: 'Pending Review', cls: 'bg-[#fff4d6] text-[#9a6b00]' };
}

function isTabletMedication(rx: PharmacyPrescription): boolean {
  return String(rx.dosageForm ?? '').trim().toLowerCase() === 'tablet';
}

export function PharmacyDashboard({
  displayName,
  prescriptions,
  supabaseReady,
  userProvince,
  refillRequests,
  carepackRequests,
}: {
  displayName: string;
  prescriptions: PharmacyPrescription[];
  supabaseReady: boolean;
  userProvince: string | null;
  refillRequests: PharmacyRefillRequest[];
  carepackRequests: PharmacyCarePackRequest[];
}) {
  const searchParams = useSearchParams();
  const [section, setSection] = useState<PharmacySection>(() =>
    parseSectionParam(searchParams.get('section')),
  );
  const [filterTab, setFilterTab] = useState<RxBucket>('all');
  const [refillFilter, setRefillFilter] = useState<RefillFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [refillOpen, setRefillOpen] = useState(false);
  const [selectedRefillIds, setSelectedRefillIds] = useState<string[]>([]);
  const [editingRefillRequestId, setEditingRefillRequestId] = useState<string | null>(null);
  const [carePackOpen, setCarePackOpen] = useState(false);
  const [selectedCarePackIds, setSelectedCarePackIds] = useState<string[]>([]);
  const [carePackForm, setCarePackForm] = useState({
    frequentDoseChangeMeds: '',
    asNeededMeds: '',
    includeOtcVitamins: false,
    otcVitaminsNotes: '',
    doctorCoordinationApproved: false,
    holdOrVacationNotes: '',
    feeAcknowledged: false,
  });
  const [state, formAction, isPending] = useActionState<PharmacyActionState, FormData>(
    pharmacyAction,
    null,
  );

  useEffect(() => {
    setSection(parseSectionParam(searchParams.get('section')));
  }, [searchParams]);

  const counts = useMemo(
    () => ({
      all: prescriptions.length,
      pending: prescriptions.filter((p) => p.bucket === 'pending').length,
      active: prescriptions.filter((p) => p.bucket === 'active').length,
      rejected: prescriptions.filter((p) => p.bucket === 'rejected').length,
      expired: prescriptions.filter((p) => p.bucket === 'expired').length,
    }),
    [prescriptions],
  );

  const filtered = useMemo(
    () => (filterTab === 'all' ? prescriptions : prescriptions.filter((p) => p.bucket === filterTab)),
    [prescriptions, filterTab],
  );
  const activePrescriptions = useMemo(
    () => prescriptions.filter((p) => p.bucket === 'active'),
    [prescriptions],
  );

  const setSectionInUrl = (next: PharmacySection) => {
    setSection(next);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);

      url.searchParams.set('section', next);
      window.history.replaceState(window.history.state, '', url.toString());
    }
  };

  const submitPayload = (intent: string, payload: unknown) => {
    const fd = new FormData();

    fd.set('intent', intent);
    fd.set('payload', JSON.stringify(payload));
    formAction(fd);
  };

  const toggleRefillSelection = (id: string) => {
    setSelectedRefillIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const refillStatusMeta = (status: PharmacyRefillRequest['status']) => {
    if (status === 'rejected') {
      return { label: 'Rejected', cls: 'bg-[#fde8e8] text-[#9a2c2c]' };
    }

    if (status === 'completed') {
      return { label: 'Completed', cls: 'bg-[#e8f3e4] text-[#2f6b2f]' };
    }

    if (status === 'refill_processing') {
      return { label: 'Refill Processing', cls: 'bg-[#e7f0ff] text-[#2556a8]' };
    }

    return { label: 'Pending Review', cls: 'bg-[#fff4d6] text-[#9a6b00]' };
  };

  const carePackStatusMeta = (status: PharmacyCarePackRequest['status']) => {
    if (status === 'rejected') {
      return { label: 'Rejected', cls: 'bg-[#fde8e8] text-[#9a2c2c]' };
    }

    if (status === 'active') {
      return { label: 'Active', cls: 'bg-[#e8f3e4] text-[#2f6b2f]' };
    }

    if (status === 'setup_in_progress') {
      return { label: 'Setup in Progress', cls: 'bg-[#e7f0ff] text-[#2556a8]' };
    }

    return { label: 'Pending Review', cls: 'bg-[#fff4d6] text-[#9a6b00]' };
  };

  return (
    <section className="space-y-6">
      <OnboardingSectionHeader
        description={`Signed in as ${displayName}. Manage prescriptions, refills, and CarePack in one place.`}
        kicker="Account pharmacy"
        titleAccent="cy"
        titleBefore="Pharma"
      />

      {!supabaseReady ? (
        <p className="rounded-2xl border border-[#e8dcc4] bg-[#fdf8ee] px-4 py-3 text-sm text-[#7a5c20]">
          Connect Supabase in your environment to load and save prescriptions.
        </p>
      ) : null}

      {state?.error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {state.error}
        </p>
      ) : null}

      <div className="inline-flex rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
        {(
          [
            ['prescriptions', 'Prescriptions'],
            ['refill_requests', 'Refill requests'],
            ['carepack', 'CarePack'],
          ] as const
        ).map(([id, label]) => (
          <button
            className={
              section === id
                ? 'rounded-xl border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                : 'px-3 py-1.5 text-[#6b6560]'
            }
            key={id}
            onClick={() => setSectionInUrl(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {section === 'prescriptions' ? (
        <>
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium text-[#2d4a2d]">Transfer your prescription</p>
              <p className="text-sm text-[#5c564c]">
                Transfer from any pharmacy in Canada or upload a photo of your prescription label.
              </p>
            </div>
            <button
              className="liivv-btn-primary inline-flex items-center justify-center px-4 py-2.5 text-sm"
              onClick={() => setAddOpen(true)}
              type="button"
            >
              Add Prescription
            </button>
          </div>

          <div className="inline-flex flex-wrap rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
            {(['all', 'active', 'pending', 'rejected', 'expired'] as const).map((bucket) => (
              <button
                className={
                  filterTab === bucket
                    ? 'rounded-xl border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                    : 'px-3 py-1.5 text-[#6b6560]'
                }
                key={bucket}
                onClick={() => setFilterTab(bucket)}
                type="button"
              >
                {bucket === 'all' ? 'All' : bucket.charAt(0).toUpperCase() + bucket.slice(1)} (
                {counts[bucket]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-[#e8e2d8] bg-white p-4 text-sm text-[#6b6560]">
              No prescriptions in this filter yet.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((rx) => {
                const badge = bucketBadge(rx.bucket);
                const tabletEligible = isTabletMedication(rx);

                return (
                  <article
                    className="rounded-xl border border-[#e8e2d8] bg-white p-4"
                    key={rx.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      {rx.photoDisplayUrl ? (
                        <img
                          alt=""
                          className="h-24 w-full rounded-lg border border-[#efe9df] object-contain sm:w-32"
                          src={rx.photoDisplayUrl}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-[#2c2a26]">{rx.medicationName}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}>
                            {badge.text}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#6b6560]">
                          {[rx.dosage, rx.dosageForm, rx.frequency].filter(Boolean).join(' • ') ||
                            'Dosage pending'}
                          {rx.rxNumber ? ` • RX ${rx.rxNumber}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-[#8a8176]">
                          {rx.pharmacyName ?? 'Pharmacy pending'} •{' '}
                          {rx.prescribingDoctor ?? 'Doctor pending'}
                        </p>
                        {rx.bucket === 'active' && tabletEligible ? (
                          <button
                            className="liivv-btn-primary mt-3 px-3 py-1.5 text-xs"
                            onClick={() => {
                              setSelectedCarePackIds([rx.id]);
                              setCarePackOpen(true);
                            }}
                            type="button"
                          >
                            Start CarePack
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      {section === 'refill_requests' ? (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e2d8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#2c2a26]">Request refill</h3>
              <p className="text-sm text-[#6b6560]">
                Choose active prescriptions to combine in one refill request.
              </p>
            </div>
            <button
              className="liivv-btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
              disabled={activePrescriptions.length === 0}
              onClick={() => {
                setEditingRefillRequestId(null);
                setSelectedRefillIds([]);
                setRefillOpen(true);
              }}
              type="button"
            >
              Request refill
            </button>
          </div>

          {refillRequests.length === 0 ? (
            <p className="rounded-xl border border-[#e8e2d8] bg-white p-4 text-sm text-[#6b6560]">
              No refill requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {refillRequests
                .filter((req) => {
                  if (refillFilter === 'all') {
                    return true;
                  }

                  if (refillFilter === 'processing') {
                    return req.status === 'refill_processing';
                  }

                  return req.status === 'completed' || req.status === 'rejected';
                })
                .map((req) => {
                  const meta = refillStatusMeta(req.status);

                  return (
                    <article
                      className="rounded-xl border border-[#e8e2d8] bg-white p-4"
                      key={req.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-[#8a8176]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#2c2a26]">{req.medicationNames.join(', ')}</p>
                      {req.status === 'pending_review' ? (
                        <div className="mt-3 flex gap-2">
                          <button
                            className="text-sm font-medium text-[#375a37]"
                            onClick={() => {
                              setEditingRefillRequestId(req.id);
                              setSelectedRefillIds(req.prescriptionIds);
                              setRefillOpen(true);
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                          <form action={formAction}>
                            <input name="intent" type="hidden" value="delete_refill_request" />
                            <input name="refillRequestId" type="hidden" value={req.id} />
                            <button className="text-sm text-[#9a2c2c]" disabled={isPending} type="submit">
                              Delete
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
            </div>
          )}
        </>
      ) : null}

      {section === 'carepack' ? (
        <>
          <div className="rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-5">
            <h3 className="text-base font-semibold text-[#2d4a2d]">Liivv CarePack</h3>
            <p className="mt-1 text-sm text-[#5c564c]">
              Pre-packaged pouches for tablet medications, shipped every 4 weeks.
            </p>
            <button
              className="liivv-btn-primary mt-3 px-4 py-2.5 text-sm disabled:opacity-40"
              disabled={activePrescriptions.filter(isTabletMedication).length === 0}
              onClick={() => {
                setSelectedCarePackIds([]);
                setCarePackOpen(true);
              }}
              type="button"
            >
              Request CarePack
            </button>
          </div>

          {carepackRequests.length === 0 ? (
            <p className="rounded-xl border border-[#e8e2d8] bg-white p-4 text-sm text-[#6b6560]">
              No CarePack requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {carepackRequests.map((req) => {
                const meta = carePackStatusMeta(req.status);

                return (
                  <article
                    className="rounded-xl border border-[#e8e2d8] bg-white p-4"
                    key={req.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#8a8176]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#2c2a26]">{req.medicationNames.join(', ')}</p>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : null}

      <AddPrescriptionDialog
        onClose={() => setAddOpen(false)}
        open={addOpen}
        supabaseReady={supabaseReady}
        userFullName={displayName}
        userProvince={userProvince}
      />

      {refillOpen ? (
        <Modal title={editingRefillRequestId ? 'Edit refill request' : 'Request refill'} onClose={() => setRefillOpen(false)}>
          <div className="space-y-2">
            {activePrescriptions.map((rx) => (
              <label className="flex items-center gap-2 text-sm" key={rx.id}>
                <input
                  checked={selectedRefillIds.includes(rx.id)}
                  onChange={() => toggleRefillSelection(rx.id)}
                  type="checkbox"
                />
                {rx.medicationName}
              </label>
            ))}
          </div>
          <button
            className="liivv-btn-primary mt-4 px-4 py-2.5 text-sm disabled:opacity-50"
            disabled={isPending || selectedRefillIds.length === 0}
            onClick={() =>
              submitPayload(
                editingRefillRequestId ? 'update_refill_request' : 'create_refill_request',
                {
                  refillRequestId: editingRefillRequestId,
                  prescriptionIds: selectedRefillIds,
                },
              )
            }
            type="button"
          >
            {isPending ? 'Submitting…' : 'Submit refill request'}
          </button>
        </Modal>
      ) : null}

      {carePackOpen ? (
        <Modal title="CarePack request" onClose={() => setCarePackOpen(false)}>
          <div className="space-y-3 text-sm">
            <p className="text-[#6b6560]">Select active tablet medications:</p>
            {activePrescriptions.filter(isTabletMedication).map((rx) => (
              <label className="flex items-center gap-2" key={rx.id}>
                <input
                  checked={selectedCarePackIds.includes(rx.id)}
                  onChange={() =>
                    setSelectedCarePackIds((prev) =>
                      prev.includes(rx.id) ? prev.filter((id) => id !== rx.id) : [...prev, rx.id],
                    )
                  }
                  type="checkbox"
                />
                {rx.medicationName}
              </label>
            ))}
            <label className="block">
              <span className="font-medium">Medications with frequent dose changes</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2"
                onChange={(e) =>
                  setCarePackForm((f) => ({ ...f, frequentDoseChangeMeds: e.target.value }))
                }
                rows={2}
                value={carePackForm.frequentDoseChangeMeds}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={carePackForm.doctorCoordinationApproved}
                onChange={(e) =>
                  setCarePackForm((f) => ({ ...f, doctorCoordinationApproved: e.target.checked }))
                }
                type="checkbox"
              />
              I authorize Liivv to coordinate with my doctor if needed.
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={carePackForm.feeAcknowledged}
                onChange={(e) => setCarePackForm((f) => ({ ...f, feeAcknowledged: e.target.checked }))}
                type="checkbox"
              />
              I understand CarePack packaging fees apply.
            </label>
          </div>
          <button
            className="liivv-btn-primary mt-4 px-4 py-2.5 text-sm disabled:opacity-50"
            disabled={isPending || selectedCarePackIds.length === 0}
            onClick={() =>
              submitPayload('create_carepack_request', {
                prescriptionIds: selectedCarePackIds,
                intake: carePackForm,
              })
            }
            type="button"
          >
            {isPending ? 'Submitting…' : 'Submit CarePack request'}
          </button>
        </Modal>
      ) : null}
    </section>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#2c2a26]">{title}</h3>
          <button className="text-sm text-[#6b6560]" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
