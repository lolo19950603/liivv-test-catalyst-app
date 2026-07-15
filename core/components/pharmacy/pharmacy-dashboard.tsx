'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  pharmacyAction,
  type PharmacyActionState,
} from '~/app/[locale]/(default)/account/(portal)/pharmacy/_actions/pharmacy-actions';
import { AddPrescriptionDialog } from '~/components/pharmacy/add-prescription-dialog';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import { isTabletDosageForm } from '~/lib/pharmacy/pharmacy-mappers';
import type {
  PharmacyCarePackRequest,
  PharmacyPrescription,
  PharmacyRefillRequest,
} from '~/lib/pharmacy/pharmacy-mappers';

type RxBucket = 'all' | 'pending' | 'active' | 'rejected' | 'expired';
type PharmacySection = 'prescriptions' | 'refill_requests' | 'carepack';
type RefillFilter = 'all' | 'processing' | 'completed';

const cardClass =
  'rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-5';

const emptyCarePackForm = {
  frequentDoseChangeMeds: '',
  asNeededMeds: '',
  includeOtcVitamins: false,
  otcVitaminsNotes: '',
  doctorCoordinationApproved: false,
  holdOrVacationNotes: '',
  feeAcknowledged: false,
};

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

function SectionTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count?: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? 'rounded-xl border border-[#c9d8c9] bg-[#eef4ee] px-3 py-2 font-semibold text-[#2d4a2d]'
          : 'rounded-xl px-3 py-2 text-[#6b6560] hover:text-[#2c2a26]'
      }
      onClick={onClick}
      type="button"
    >
      {label}
      {count !== undefined ? (
        <span className={`ml-1.5 text-xs ${active ? 'text-[#4a6b4a]' : 'text-[#9a928a]'}`}>
          ({count})
        </span>
      ) : null}
    </button>
  );
}

function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className={`${cardClass} text-center`}>
      <p className="text-base font-semibold text-[#2c2a26]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6b6560]">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
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
  const router = useRouter();
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
  const [carePackForm, setCarePackForm] = useState(emptyCarePackForm);
  const [state, formAction, isPending] = useActionState<PharmacyActionState, FormData>(
    pharmacyAction,
    null,
  );

  useEffect(() => {
    setSection(parseSectionParam(searchParams.get('section')));
  }, [searchParams]);

  useEffect(() => {
    if (!state?.ok) {
      return;
    }

    setRefillOpen(false);
    setCarePackOpen(false);
    setEditingRefillRequestId(null);
    setSelectedRefillIds([]);
    setSelectedCarePackIds([]);
    setCarePackForm(emptyCarePackForm);
    router.refresh();
  }, [state, router]);

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
  const tabletPrescriptions = useMemo(
    () => activePrescriptions.filter((rx) => isTabletDosageForm(rx.dosageForm)),
    [activePrescriptions],
  );

  const refillCounts = useMemo(
    () => ({
      all: refillRequests.length,
      processing: refillRequests.filter((r) => r.status === 'refill_processing').length,
      completed: refillRequests.filter(
        (r) => r.status === 'completed' || r.status === 'rejected',
      ).length,
    }),
    [refillRequests],
  );

  const filteredRefillRequests = useMemo(() => {
    if (refillFilter === 'all') {
      return refillRequests;
    }

    if (refillFilter === 'processing') {
      return refillRequests.filter((req) => req.status === 'refill_processing');
    }

    return refillRequests.filter(
      (req) => req.status === 'completed' || req.status === 'rejected',
    );
  }, [refillFilter, refillRequests]);

  const setSectionInUrl = (next: PharmacySection) => {
    setSection(next);

    const params = new URLSearchParams(searchParams.toString());

    params.set('section', next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const openCarePackModal = (preselectedIds: string[] = []) => {
    setCarePackForm(emptyCarePackForm);
    setSelectedCarePackIds(preselectedIds);
    setCarePackOpen(true);
  };

  const submitPayload = (intent: string, payload: unknown) => {
    const fd = new FormData();

    fd.set('intent', intent);
    fd.set('payload', JSON.stringify(payload));
    startTransition(() => {
      formAction(fd);
    });
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

  const pendingRefills = refillRequests.filter((r) => r.status === 'pending_review').length;
  const activeCarePack = carepackRequests.some(
    (r) => r.status === 'active' || r.status === 'setup_in_progress',
  );

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

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#d8e4d8] bg-[#eef4ee] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#5a6d4d]">
            Active prescriptions
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#2d4a2d]">{counts.active}</p>
        </div>
        <div className="rounded-xl border border-[#e8e2d8] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8a8176]">
            Refills in progress
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#2c2a26]">{refillCounts.processing}</p>
        </div>
        <div className="rounded-xl border border-[#e8e2d8] bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8a8176]">CarePack</p>
          <p className="mt-1 text-2xl font-semibold text-[#2c2a26]">
            {activeCarePack ? 'Active' : carepackRequests.length > 0 ? 'Requested' : '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
        <SectionTab
          active={section === 'prescriptions'}
          count={prescriptions.length}
          label="Prescriptions"
          onClick={() => setSectionInUrl('prescriptions')}
        />
        <SectionTab
          active={section === 'refill_requests'}
          count={refillRequests.length}
          label="Refill requests"
          onClick={() => setSectionInUrl('refill_requests')}
        />
        <SectionTab
          active={section === 'carepack'}
          count={carepackRequests.length}
          label="CarePack"
          onClick={() => setSectionInUrl('carepack')}
        />
      </div>

      {section === 'prescriptions' ? (
        <>
          {prescriptions.length === 0 ? (
            <div className="rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-6 text-center sm:p-8">
              <p className="text-lg font-semibold text-[#2d4a2d]">No prescriptions yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#5c564c]">
                Transfer from any pharmacy in Canada, request a doctor fax, or upload a photo of your
                prescription label.
              </p>
              <button
                className="liivv-btn-primary mt-5 inline-flex items-center justify-center px-4 py-2.5 text-sm"
                onClick={() => setAddOpen(true)}
                type="button"
              >
                Add prescription
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-[#2d4a2d]">Transfer your prescription</p>
                  <p className="mt-1 text-sm text-[#5c564c]">
                    Transfer from any pharmacy in Canada, request a doctor fax, or upload a photo of
                    your prescription label.
                  </p>
                </div>
                <button
                  className="liivv-btn-primary inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-sm"
                  onClick={() => setAddOpen(true)}
                  type="button"
                >
                  Add prescription
                </button>
              </div>

              <div className="flex flex-wrap gap-1 rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
                {(['all', 'active', 'pending', 'rejected', 'expired'] as const).map((bucket) => (
                  <button
                    className={
                      filterTab === bucket
                        ? 'rounded-xl border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                        : 'rounded-xl px-3 py-1.5 text-[#6b6560] hover:text-[#2c2a26]'
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
                <EmptyState
                  description={`No ${filterTab} prescriptions right now. Try another filter.`}
                  title="Nothing in this filter"
                />
              ) : (
                <div className="space-y-3">
                  {filtered.map((rx) => {
                const badge = bucketBadge(rx.bucket);
                const tabletEligible = isTabletDosageForm(rx.dosageForm);

                return (
                  <article className={cardClass} key={rx.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {rx.photoDisplayUrl ? (
                        <img
                          alt={`Prescription photo for ${rx.medicationName}`}
                          className="h-28 w-full rounded-lg border border-[#efe9df] bg-[#faf8f5] object-contain sm:h-24 sm:w-28"
                          src={rx.photoDisplayUrl}
                        />
                      ) : (
                        <div
                          aria-hidden
                          className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-[#ddd4c8] bg-[#faf8f5] text-xs text-[#9a928a] sm:h-24 sm:w-28"
                        >
                          No photo
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-[#2c2a26]">{rx.medicationName}</h3>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge.cls}`}
                          >
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
                            className="liivv-btn-secondary mt-3 px-3 py-1.5 text-xs"
                            onClick={() => openCarePackModal([rx.id])}
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
          )}
        </>
      ) : null}

      {section === 'refill_requests' ? (
        <>
          <div
            className={`${cardClass} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div>
              <h3 className="text-base font-semibold text-[#2c2a26]">Request a refill</h3>
              <p className="mt-1 text-sm text-[#6b6560]">
                Combine active prescriptions into one refill request.{' '}
                {pendingRefills > 0
                  ? `${pendingRefills} request${pendingRefills === 1 ? '' : 's'} awaiting review.`
                  : ''}
              </p>
            </div>
            <button
              className="liivv-btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-40"
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

          {refillRequests.length > 0 ? (
            <div className="flex flex-wrap gap-1 rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
              {(
                [
                  ['all', 'All'],
                  ['processing', 'Processing'],
                  ['completed', 'Completed'],
                ] as const
              ).map(([id, label]) => (
                <button
                  className={
                    refillFilter === id
                      ? 'rounded-xl border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                      : 'rounded-xl px-3 py-1.5 text-[#6b6560] hover:text-[#2c2a26]'
                  }
                  key={id}
                  onClick={() => setRefillFilter(id)}
                  type="button"
                >
                  {label} ({refillCounts[id]})
                </button>
              ))}
            </div>
          ) : null}

          {filteredRefillRequests.length === 0 ? (
            <EmptyState
              description={
                refillRequests.length === 0
                  ? 'When you need more medication, select your active prescriptions and submit a refill request.'
                  : 'No refill requests match this filter.'
              }
              title={refillRequests.length === 0 ? 'No refill requests yet' : 'Nothing in this filter'}
            />
          ) : (
            <div className="space-y-3">
              {filteredRefillRequests.map((req) => {
                const meta = refillStatusMeta(req.status);

                return (
                  <article className={cardClass} key={req.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#8a8176]">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#2c2a26]">
                      {req.medicationNames.join(', ')}
                    </p>
                    <p className="mt-1 text-xs text-[#8a8176]">
                      {req.prescriptionIds.length} prescription
                      {req.prescriptionIds.length === 1 ? '' : 's'} included
                    </p>
                    {req.status === 'pending_review' ? (
                      <div className="mt-3 flex gap-3 border-t border-[#efe9df] pt-3">
                        <button
                          className="text-sm font-medium text-[#375a37] hover:underline"
                          disabled={isPending}
                          onClick={() => {
                            setEditingRefillRequestId(req.id);
                            setSelectedRefillIds(req.prescriptionIds);
                            setRefillOpen(true);
                          }}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm text-[#9a2c2c] hover:underline disabled:opacity-40"
                          disabled={isPending}
                          onClick={() => {
                            if (
                              !window.confirm(
                                'Are you sure you want to cancel this refill request?',
                              )
                            ) {
                              return;
                            }

                            const fd = new FormData();

                            fd.set('intent', 'delete_refill_request');
                            fd.set('refillRequestId', req.id);
                            startTransition(() => {
                              formAction(fd);
                            });
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
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
          <div className="rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-[#2d4a2d]">Liivv CarePack</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c564c]">
              Pre-packaged pouches for eligible tablet medications, organized by date and time and
              shipped every 4 weeks. Ideal if you take multiple tablets daily.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-[#5c564c]">
              <li>• Tablet medications only</li>
              <li>• Morning, afternoon, and evening dosing options</li>
              <li>• Pharmacist review before your first shipment</li>
            </ul>
            <button
              className="liivv-btn-primary mt-4 px-4 py-2.5 text-sm disabled:opacity-40"
              disabled={tabletPrescriptions.length === 0}
              onClick={() => openCarePackModal()}
              type="button"
            >
              Request CarePack
            </button>
            {tabletPrescriptions.length === 0 ? (
              <p className="mt-2 text-xs text-[#8a8176]">
                Add an active tablet prescription to request CarePack.
              </p>
            ) : null}
          </div>

          {carepackRequests.length === 0 ? (
            <EmptyState
              description="Select your tablet medications and complete a short intake form to get started."
              title="No CarePack requests yet"
            />
          ) : (
            <div className="space-y-3">
              {carepackRequests.map((req) => {
                const meta = carePackStatusMeta(req.status);

                return (
                  <article className={cardClass} key={req.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-[#8a8176]">
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-[#2c2a26]">
                      {req.medicationNames.join(', ')}
                    </p>
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
        <Modal
          onClose={() => setRefillOpen(false)}
          title={editingRefillRequestId ? 'Edit refill request' : 'Request refill'}
        >
          {activePrescriptions.length === 0 ? (
            <p className="text-sm text-[#6b6560]">No active prescriptions available for refill.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[#6b6560]">Select prescriptions to include:</p>
              {activePrescriptions.map((rx) => (
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e8e2d8] px-3 py-2.5 text-sm transition hover:bg-[#faf8f5]"
                  key={rx.id}
                >
                  <input
                    checked={selectedRefillIds.includes(rx.id)}
                    className="h-4 w-4 accent-[#375a37]"
                    onChange={() => toggleRefillSelection(rx.id)}
                    type="checkbox"
                  />
                  <span className="font-medium text-[#2c2a26]">{rx.medicationName}</span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="liivv-btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
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
            <button
              className="liivv-btn-secondary px-4 py-2.5 text-sm"
              onClick={() => setRefillOpen(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </Modal>
      ) : null}

      {carePackOpen ? (
        <Modal onClose={() => setCarePackOpen(false)} title="CarePack request">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-[#2c2a26]">Select tablet medications</p>
              {tabletPrescriptions.length === 0 ? (
                <p className="mt-1 text-[#6b6560]">No eligible tablet prescriptions found.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {tabletPrescriptions.map((rx) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e8e2d8] px-3 py-2.5 transition hover:bg-[#faf8f5]"
                      key={rx.id}
                    >
                      <input
                        checked={selectedCarePackIds.includes(rx.id)}
                        className="h-4 w-4 accent-[#375a37]"
                        onChange={() =>
                          setSelectedCarePackIds((prev) =>
                            prev.includes(rx.id)
                              ? prev.filter((id) => id !== rx.id)
                              : [...prev, rx.id],
                          )
                        }
                        type="checkbox"
                      />
                      <span>
                        {rx.medicationName}
                        {rx.dosageForm ? (
                          <span className="text-[#8a8176]"> · {rx.dosageForm}</span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label className="block">
              <span className="font-medium text-[#2c2a26]">
                Medications with frequent dose changes
              </span>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                onChange={(e) =>
                  setCarePackForm((f) => ({ ...f, frequentDoseChangeMeds: e.target.value }))
                }
                placeholder="List any medications where your dose changes often"
                rows={2}
                value={carePackForm.frequentDoseChangeMeds}
              />
            </label>

            <label className="block">
              <span className="font-medium text-[#2c2a26]">As-needed (PRN) medications</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                onChange={(e) =>
                  setCarePackForm((f) => ({ ...f, asNeededMeds: e.target.value }))
                }
                placeholder="Medications you take only when needed"
                rows={2}
                value={carePackForm.asNeededMeds}
              />
            </label>

            <div className="rounded-lg border border-[#e8e2d8] bg-[#faf8f5] p-3">
              <label className="flex items-start gap-2">
                <input
                  checked={carePackForm.includeOtcVitamins}
                  className="mt-0.5 h-4 w-4 accent-[#375a37]"
                  onChange={(e) =>
                    setCarePackForm((f) => ({ ...f, includeOtcVitamins: e.target.checked }))
                  }
                  type="checkbox"
                />
                <span>Include OTC vitamins or supplements in my pouches</span>
              </label>
              {carePackForm.includeOtcVitamins ? (
                <textarea
                  className="mt-2 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                  onChange={(e) =>
                    setCarePackForm((f) => ({ ...f, otcVitaminsNotes: e.target.value }))
                  }
                  placeholder="List vitamins or supplements to include"
                  rows={2}
                  value={carePackForm.otcVitaminsNotes}
                />
              ) : null}
            </div>

            <label className="block">
              <span className="font-medium text-[#2c2a26]">Hold or vacation dates (optional)</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
                onChange={(e) =>
                  setCarePackForm((f) => ({ ...f, holdOrVacationNotes: e.target.value }))
                }
                placeholder="Let us know if you need to pause shipments"
                rows={2}
                value={carePackForm.holdOrVacationNotes}
              />
            </label>

            <div className="space-y-2 border-t border-[#efe9df] pt-3">
              <label className="flex items-start gap-2">
                <input
                  checked={carePackForm.doctorCoordinationApproved}
                  className="mt-0.5 h-4 w-4 accent-[#375a37]"
                  onChange={(e) =>
                    setCarePackForm((f) => ({ ...f, doctorCoordinationApproved: e.target.checked }))
                  }
                  type="checkbox"
                />
                <span>I authorize Liivv to coordinate with my doctor if needed.</span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  checked={carePackForm.feeAcknowledged}
                  className="mt-0.5 h-4 w-4 accent-[#375a37]"
                  onChange={(e) =>
                    setCarePackForm((f) => ({ ...f, feeAcknowledged: e.target.checked }))
                  }
                  type="checkbox"
                />
                <span>I understand CarePack packaging fees apply.</span>
              </label>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="liivv-btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
              disabled={
                isPending ||
                selectedCarePackIds.length === 0 ||
                !carePackForm.doctorCoordinationApproved ||
                !carePackForm.feeAcknowledged
              }
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
            <button
              className="liivv-btn-secondary px-4 py-2.5 text-sm"
              onClick={() => setCarePackOpen(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
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
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e5dfd5] bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#2c2a26]" id={titleId}>
            {title}
          </h3>
          <button
            aria-label="Close dialog"
            className="rounded-lg px-2 py-1 text-sm text-[#6b6560] hover:bg-[#f7f4ef]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
