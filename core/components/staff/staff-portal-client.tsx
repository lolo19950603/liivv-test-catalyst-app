'use client';

import Link from 'next/link';
import { useActionState, useEffect, useEffectEvent, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  loadOlderStaffChatMessagesAction,
  staffPortalAction,
  type StaffActionState,
} from '~/app/pharmacy-admin/_actions/staff-portal-actions';
import type { PharmacyQueue, StaffPortalData, StaffTab } from '~/app/pharmacy-admin/page-data';
import { StaffCustomerDetail } from '~/components/staff/staff-customer-detail';
import {
  formatStaffStatusLabel,
  staffStatusBadgeClass,
  staffWorklistBucket,
  type StaffWorklistBucket,
} from '~/components/staff/staff-status';
import { ChatMessageBody } from '~/components/virtual-care/chat-message-body';
import { ChatSystemMessage } from '~/components/virtual-care/chat-system-message';
import { useChatMessagePages } from '~/components/virtual-care/use-chat-message-pages';
import { STORE_ASSISTANT_NAME } from '~/lib/chat/store-assistant';
import {
  CHAT_ACTIVE_POLL_MS,
  useChatBurstRefresh,
  useChatPollRefresh,
} from '~/components/virtual-care/use-chat-poll-refresh';
import { isStaffJoinedToChat } from '~/lib/chat/session';
import type { AdminConversationSummary } from '~/lib/supabase/chat-messages';
import type {
  AdminCarePackQueueRow,
  AdminPrescriptionQueueRow,
  AdminRefillQueueRow,
} from '~/lib/supabase/prescriptions';

type QueueRow = AdminPrescriptionQueueRow | AdminRefillQueueRow | AdminCarePackQueueRow;
type BucketFilter = StaffWorklistBucket | 'all';

const BUCKET_FILTERS: Array<{ id: BucketFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'needs_review', label: 'Needs review' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'closed', label: 'Closed' },
];

const NAV: Array<{ id: StaffTab; label: string }> = [
  { id: 'pharmacy', label: 'Queue' },
  { id: 'customers', label: 'Customers' },
  { id: 'chat', label: 'Inbox' },
];

function customerName(
  first: string | null | undefined,
  last: string | null | undefined,
  email: string | null | undefined,
  fallback: string,
): string {
  const name = [first, last].filter(Boolean).join(' ').trim();

  return name || email || fallback;
}

function portalHref(basePath: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const qs = search.toString();

  return qs ? `${basePath}?${qs}` : basePath;
}

function rowStatus(row: QueueRow, queue: PharmacyQueue): string {
  if (queue === 'prescription' && 'approval_status' in row) {
    return row.approval_status ?? row.status ?? 'pending';
  }

  return row.status;
}

function rowItemLabel(row: QueueRow): string {
  if ('medication_name' in row && row.medication_name) {
    return row.medication_name;
  }

  if ('medication_names' in row && row.medication_names.length > 0) {
    return row.medication_names.join(', ');
  }

  return `Request #${row.id.slice(0, 8)}`;
}

function messagePreview(sender: string | null, body: string | null): string | null {
  if (!body) {
    return null;
  }

  const flat = body.replace(/\s+/g, ' ').trim();

  if (!flat) {
    return null;
  }

  const prefix = sender === 'staff' ? 'You: ' : sender === 'bot' ? `${STORE_ASSISTANT_NAME}: ` : '';
  const text = `${prefix}${flat}`;

  return text.length > 90 ? `${text.slice(0, 89)}…` : text;
}

function formatStaffTimestamp(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const hour = value('hour') === '24' ? '00' : value('hour');

  return `${value('year')}-${value('month')}-${value('day')} ${hour}:${value('minute')}`;
}

function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();

  if (!Number.isFinite(ms) || ms < 0) {
    return '—';
  }

  const minutes = Math.floor(ms / 60_000);

  if (minutes < 1) {
    return 'Now';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.floor(hours / 24)}d`;
}

function compareQueueRows(queue: PharmacyQueue, a: QueueRow, b: QueueRow): number {
  const rank: Record<StaffWorklistBucket, number> = {
    needs_review: 0,
    in_progress: 1,
    closed: 2,
  };
  const bucketA = staffWorklistBucket(rowStatus(a, queue));
  const bucketB = staffWorklistBucket(rowStatus(b, queue));

  if (rank[bucketA] !== rank[bucketB]) {
    return rank[bucketA] - rank[bucketB];
  }

  const timeA = new Date(a.created_at).getTime();
  const timeB = new Date(b.created_at).getTime();

  if (bucketA === 'needs_review') {
    return timeA - timeB;
  }

  return timeB - timeA;
}

function needsAttention(conversation: AdminConversationSummary): boolean {
  const inChat = isStaffJoinedToChat({
    staffJoinedAt: conversation.staffJoinedAt,
    staffClosedAt: conversation.staffClosedAt,
  });

  if (inChat) {
    return false;
  }

  return Boolean(conversation.escalatedToPharmacistAt) || !conversation.staffClosedAt;
}

function inboxRank(conversation: AdminConversationSummary): number {
  const inChat = isStaffJoinedToChat({
    staffJoinedAt: conversation.staffJoinedAt,
    staffClosedAt: conversation.staffClosedAt,
  });
  const escalatedOpen =
    Boolean(conversation.escalatedToPharmacistAt) && !inChat && !conversation.staffClosedAt;

  if (escalatedOpen) {
    return 0;
  }

  if (!inChat && !conversation.staffClosedAt) {
    return 1;
  }

  if (inChat) {
    return 2;
  }

  return 3;
}

export function StaffPortalClient({
  data,
  basePath = '/pharmacy-admin',
  signedInAs,
  signOutAction,
}: {
  data: StaffPortalData;
  basePath?: string;
  signedInAs?: string;
  signOutAction?: () => Promise<void>;
}) {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState<StaffActionState, FormData>(
    staffPortalAction,
    null,
  );
  const [chatRefreshTrigger, setChatRefreshTrigger] = useState(0);
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);
  const tab = data.adminTab;
  const sectionTitle = NAV.find((item) => item.id === tab)?.label ?? 'Queue';

  const queueNeedsReview =
    tab === 'pharmacy'
      ? data.prescriptionQueue.filter(
          (row) => staffWorklistBucket(rowStatus(row, 'prescription')) === 'needs_review',
        ).length +
        data.refillQueue.filter((row) => staffWorklistBucket(row.status) === 'needs_review').length +
        data.carePackQueue.filter((row) => staffWorklistBucket(row.status) === 'needs_review').length
      : null;
  const customerCount =
    tab === 'customers' && data.customerQuery.trim().length >= 2 ? data.customerSearchRows.length : null;
  const inboxCount =
    tab === 'chat' ? data.conversations.filter((conversation) => needsAttention(conversation)).length : null;
  const navCount: Record<StaffTab, number | null> = {
    pharmacy: queueNeedsReview,
    customers: customerCount,
    chat: inboxCount,
  };

  useEffect(() => {
    if (actionState?.ok) {
      router.refresh();
      if (tab === 'chat') {
        setChatRefreshTrigger((value) => value + 1);
      }
    }
  }, [actionState?.ok, router, tab]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#e7f0e4] text-base text-[#1c1b19]">
      <aside className="flex w-56 shrink-0 flex-col bg-[#234028] text-white">
        <div className="px-4 py-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#b7d4b2]">Liivv</p>
          <p className="mt-1 text-lg font-semibold text-white">Pharmacist admin</p>
        </div>
        <nav aria-label="Pharmacist admin" className="flex flex-1 flex-col gap-1 px-2">
          {NAV.map((item) => {
            const active = tab === item.id;
            const count = navCount[item.id];

            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'flex items-center justify-between rounded-md bg-[#d7efc8] px-3 py-2.5 text-base font-semibold text-[#1c3a24]'
                    : 'flex items-center justify-between rounded-md px-3 py-2.5 text-base text-[#e5f2e2] hover:bg-white/10'
                }
                href={staffHref({ tab: item.id === 'pharmacy' ? undefined : item.id })}
                key={item.id}
              >
                <span>{item.label}</span>
                {count !== null ? (
                  <span
                    className={
                      active
                        ? 'rounded-full bg-[#234028] px-2 text-sm font-semibold tabular-nums text-white'
                        : count > 0
                          ? 'rounded-full bg-[#f0b429] px-2 text-sm font-semibold tabular-nums text-[#3a2a00]'
                          : 'rounded-full bg-white/15 px-2 text-sm font-semibold tabular-nums text-white'
                    }
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[#c9dcc4] bg-white px-5">
          <h1 className="text-lg font-semibold text-[#1c3a24]">{sectionTitle}</h1>
          <div className="flex items-center gap-3">
            {signedInAs ? <p className="text-base text-[#3f5c40]">{signedInAs}</p> : null}
            {signOutAction ? (
              <form action={signOutAction}>
                <button
                  className="rounded-md border border-[#c9dcc4] bg-[#f4faf1] px-3 py-1.5 text-base text-[#234028] hover:bg-[#e3f0dc]"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          {actionState?.error ? (
            <p className="shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {actionState.error}
            </p>
          ) : null}

          {!data.supabaseReady ? (
            <p className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
              Health records are temporarily unavailable. You can still sign in here; queues and chat
              will load when the service is back.
            </p>
          ) : null}

          <div className="min-h-0 flex-1">
            {tab === 'pharmacy' ? (
              <PharmacyTab
                basePath={basePath}
                data={data}
                formAction={formAction}
                isPending={isPending}
              />
            ) : null}

            {tab === 'customers' ? (
              <CustomersTab basePath={basePath} data={data} formAction={formAction} />
            ) : null}

            {tab === 'chat' ? (
              <ChatTab
                actionRefreshTrigger={chatRefreshTrigger}
                basePath={basePath}
                data={data}
                formAction={formAction}
                isPending={isPending}
                onRefresh={() => router.refresh()}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyTab({
  basePath,
  data,
  formAction,
  isPending,
}: {
  basePath: string;
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);
  const queue = data.pharmacyQueue;
  const [bucket, setBucket] = useState<BucketFilter>('all');
  const [query, setQuery] = useState('');
  const queueRows =
    queue === 'refill'
      ? data.refillQueue
      : queue === 'carepack'
        ? data.carePackQueue
        : data.prescriptionQueue;

  const counts = useMemo(() => {
    const next = { all: queueRows.length, needs_review: 0, in_progress: 0, closed: 0 };

    for (const row of queueRows) {
      next[staffWorklistBucket(rowStatus(row, queue))] += 1;
    }

    return next;
  }, [queue, queueRows]);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return [...queueRows]
      .filter((row) => {
        if (bucket !== 'all' && staffWorklistBucket(rowStatus(row, queue)) !== bucket) {
          return false;
        }

        if (!needle) {
          return true;
        }

        const name = customerName(
          row.customer?.first_name ?? null,
          row.customer?.last_name ?? null,
          row.customer?.email ?? null,
          '',
        ).toLowerCase();
        const email = (row.customer?.email ?? '').toLowerCase();

        return name.includes(needle) || email.includes(needle) || rowItemLabel(row).toLowerCase().includes(needle);
      })
      .sort((a, b) => compareQueueRows(queue, a, b));
  }, [bucket, query, queue, queueRows]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#c9dcc4] bg-white px-5 py-3">
        <div className="inline-flex rounded-md border border-[#c9dcc4] bg-[#f4faf1] p-0.5 text-base">
          {(
            [
              ['prescription', 'Prescriptions', data.prescriptionQueue.length, 'bg-[#234028]'],
              ['refill', 'Refills', data.refillQueue.length, 'bg-[#1f5f8b]'],
              ['carepack', 'CarePack', data.carePackQueue.length, 'bg-[#c46b2f]'],
            ] as const
          ).map(([id, label, count, activeClass]) => (
            <Link
              className={
                queue === id
                  ? `rounded ${activeClass} px-3 py-1.5 font-semibold text-white`
                  : 'rounded px-3 py-1.5 text-[#3f3d39] hover:bg-white'
              }
              href={staffHref({ tab: 'pharmacy', queue: id })}
              key={id}
            >
              {label}
              <span className={queue === id ? 'ml-1.5 text-white/80' : 'ml-1.5 text-[#5c564c]'}>
                {count}
              </span>
            </Link>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-[#c9dcc4] bg-[#f4faf1] p-0.5 text-base">
          {BUCKET_FILTERS.map((filter) => {
            const active = bucket === filter.id;
            const activeClass =
              filter.id === 'needs_review'
                ? 'bg-[#f0b429] text-[#3a2a00]'
                : filter.id === 'in_progress'
                  ? 'bg-[#1f5f8b] text-white'
                  : filter.id === 'closed'
                    ? 'bg-[#2f8f4e] text-white'
                    : 'bg-[#234028] text-white';

            return (
              <button
                className={
                  active
                    ? `rounded px-3 py-1.5 font-semibold ${activeClass}`
                    : 'rounded px-3 py-1.5 text-[#3f3d39] hover:bg-white'
                }
                key={filter.id}
                onClick={() => setBucket(filter.id)}
                type="button"
              >
                {filter.label}
                <span className={active ? 'ml-1.5 tabular-nums opacity-80' : 'ml-1.5 tabular-nums text-[#5c564c]'}>
                  {counts[filter.id]}
                </span>
              </button>
            );
          })}
        </div>
        <input
          aria-label="Filter by patient or medication"
          className="ml-auto w-full max-w-xs rounded-md border border-[#c9dcc4] bg-white px-3 py-2 text-base focus:border-[#234028] focus:outline-none"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Patient or medication"
          value={query}
        />
      </div>

      {data.pharmacyQueueError ? (
        <p className="shrink-0 px-4 py-2 text-sm text-red-700">{data.pharmacyQueueError}</p>
      ) : null}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-h-0 overflow-auto">
          {visibleRows.length === 0 ? (
            <p className="px-4 py-6 text-base text-[#6b6560]">
              {queueRows.length === 0 ? 'Queue is empty.' : 'Nothing matches this filter.'}
            </p>
          ) : (
            <table className="w-full border-collapse bg-white text-base">
              <thead className="sticky top-0 z-10 bg-[#234028] text-left text-sm uppercase tracking-wide text-[#d7efc8]">
                <tr className="border-b border-[#e6e2dc]">
                  <th className="px-4 py-2 font-medium">Patient</th>
                  <th className="px-3 py-2 font-medium">Medication</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const name = customerName(
                    row.customer?.first_name ?? null,
                    row.customer?.last_name ?? null,
                    row.customer?.email ?? null,
                    'Customer',
                  );
                  const statusValue = rowStatus(row, queue);
                  const selected =
                    data.selectedRequestId === row.id && data.selectedRequestType === queue;
                  const opened = formatStaffTimestamp(row.created_at);
                  const href = staffHref({
                    tab: 'pharmacy',
                    queue,
                    requestType: queue,
                    requestId: row.id,
                  });

                  return (
                    <tr
                      className={`cursor-pointer ${selected ? 'bg-[#d7efc8]' : 'odd:bg-white even:bg-[#f7fbf5] hover:bg-[#e7f3df]'}`}
                      key={row.id}
                      onClick={() => router.push(href)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          router.push(href);
                        }
                      }}
                      tabIndex={0}
                    >
                      <td className="border-b border-[#f0eeea] px-4 py-2 align-top">
                        <span className="font-medium text-[#1c1b19]">{name}</span>
                        {row.customer?.email ? (
                          <span className="mt-0.5 block truncate text-sm text-[#8a8176]">
                            {row.customer.email}
                          </span>
                        ) : null}
                      </td>
                      <td className="border-b border-[#f0eeea] px-3 py-2 align-top">
                        <span className="text-[#1c1b19]">{rowItemLabel(row)}</span>
                        {queue !== 'prescription' ? (
                          <span className="mt-0.5 block text-sm text-[#8a8176]">
                            #{row.id.slice(0, 8)}
                          </span>
                        ) : null}
                      </td>
                      <td className="border-b border-[#f0eeea] px-3 py-2 align-top whitespace-nowrap">
                        <span className={staffStatusBadgeClass(statusValue)}>
                          {formatStaffStatusLabel(statusValue)}
                        </span>
                      </td>
                      <td className="border-b border-[#f0eeea] px-3 py-2 align-top whitespace-nowrap tabular-nums text-[#5c564c]">
                        <time dateTime={row.created_at} suppressHydrationWarning title={opened}>
                          {ageLabel(row.created_at)}
                        </time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <aside className="flex min-h-0 flex-col border-t border-[#e6e2dc] bg-white lg:border-l lg:border-t-0">
          <div className="shrink-0 border-b border-[#e6e2dc] px-4 py-2">
            <h2 className="text-base font-semibold text-[#1c3a24]">Record</h2>
            {isPending ? <p className="text-sm text-[#8a8176]">Saving…</p> : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {data.pharmacyCustomerDetailError ? (
              <p className="text-sm text-red-700">{data.pharmacyCustomerDetailError}</p>
            ) : data.pharmacyCustomerDetail ? (
              <StaffCustomerDetail
                detail={data.pharmacyCustomerDetail}
                focusRequest={
                  data.selectedRequestId && data.selectedRequestType
                    ? { kind: data.selectedRequestType, id: data.selectedRequestId }
                    : null
                }
                formAction={formAction}
              />
            ) : (
              <p className="text-base text-[#8a8176]">Select a row to open the record.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CustomersTab({
  basePath,
  data,
  formAction,
}: {
  basePath: string;
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
}) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [query, setQuery] = useState(data.customerQuery);
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);

  useEffect(() => {
    setQuery(data.customerQuery);
  }, [data.customerQuery]);

  function navigate(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <section className="flex min-h-0 flex-col border-b border-[#e6e2dc] lg:border-b-0 lg:border-r">
        <form
          className="flex shrink-0 gap-2 border-b border-[#e6e2dc] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            const nextQuery = query.trim();

            if (nextQuery.length < 2) {
              return;
            }

            navigate(staffHref({ tab: 'customers', q: nextQuery }));
          }}
        >
          <input
            aria-label="Search customers"
            className="min-w-0 flex-1 rounded-md border border-[#e6e2dc] px-2.5 py-1.5 text-base focus:border-[#375a37] focus:outline-none"
            minLength={2}
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or email"
            required
            value={query}
          />
          <button
            className="rounded-md bg-[#375a37] px-3 py-1.5 text-base font-medium text-white disabled:opacity-60"
            disabled={isNavigating}
            type="submit"
          >
            {isNavigating ? '…' : 'Search'}
          </button>
        </form>
        {isNavigating ? (
          <p className="px-3 py-2 text-sm text-[#8a8176]" role="status">
            Loading…
          </p>
        ) : null}
        {data.customerSearchError ? (
          <p className="px-3 py-2 text-sm text-red-700">{data.customerSearchError}</p>
        ) : null}
        {data.bigcommerceSearchWarning ? (
          <p className="px-3 py-2 text-sm text-amber-800">{data.bigcommerceSearchWarning}</p>
        ) : null}
        <ul
          aria-busy={isNavigating}
          className={`min-h-0 flex-1 overflow-y-auto ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
        >
          {data.customerSearchRows.length === 0 && data.customerQuery.trim().length >= 2 && !isNavigating ? (
            <li className="px-3 py-3 text-base text-[#8a8176]">No customers found.</li>
          ) : null}
          {data.customerSearchRows.map((row) => {
            if (row.source === 'supabase') {
              const profile = row.profile;
              const name = customerName(profile.first_name, profile.last_name, profile.email, 'Customer');
              const active = data.selectedProfileId === profile.id;

              return (
                <li key={profile.id}>
                  <button
                    className={`block w-full px-3 py-2.5 text-left ${
                      active ? 'bg-[#f4f7f0]' : 'hover:bg-[#fafafa]'
                    }`}
                    onClick={() =>
                      navigate(staffHref({ tab: 'customers', q: data.customerQuery, p: profile.id }))
                    }
                    type="button"
                  >
                    <p className="text-base font-medium">{name}</p>
                    <p className="truncate text-sm text-[#8a8176]">{profile.email}</p>
                  </button>
                </li>
              );
            }

            const hit = row.hit;
            const name = customerName(hit.firstName, hit.lastName, hit.email, 'Customer');
            const active = data.selectedBigCommerceId === hit.bigcommerce_customer_id;

            return (
              <li key={hit.bigcommerce_customer_id}>
                <button
                  className={`block w-full px-3 py-2.5 text-left ${
                    active ? 'bg-[#f4f7f0]' : 'hover:bg-[#fafafa]'
                  }`}
                  onClick={() =>
                    navigate(
                      staffHref({
                        tab: 'customers',
                        q: data.customerQuery,
                        bc: hit.bigcommerce_customer_id,
                      }),
                    )
                  }
                  type="button"
                >
                  <p className="text-base font-medium">{name}</p>
                  <p className="truncate text-sm text-[#8a8176]">{hit.email} · store only</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="relative min-h-0 overflow-y-auto">
        {isNavigating ? (
          <div
            aria-live="polite"
            className="absolute inset-0 z-20 flex items-start justify-center bg-white/70 pt-16"
            role="status"
          >
            <p className="rounded-md border border-[#e6e2dc] bg-white px-3 py-2 text-base text-[#5c564c]">
              Loading…
            </p>
          </div>
        ) : null}
        {data.customerDetailError ? (
          <p className="px-4 py-3 text-sm text-red-700">{data.customerDetailError}</p>
        ) : data.customerDetail ? (
          <div className="px-4 py-3">
            <StaffCustomerDetail
              chatHref={
                data.customerDetail.profile
                  ? staffHref({
                      tab: 'chat',
                      profile: data.customerDetail.profile.id,
                    })
                  : undefined
              }
              detail={data.customerDetail}
              formAction={formAction}
              splitSections
            />
          </div>
        ) : (
          <p className="px-4 py-6 text-base text-[#8a8176]">
            Search and select a customer to open the record.
          </p>
        )}
      </section>
    </div>
  );
}

function ChatTab({
  basePath,
  data,
  formAction,
  isPending,
  onRefresh,
  actionRefreshTrigger,
}: {
  basePath: string;
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  onRefresh: () => void;
  actionRefreshTrigger: number;
}) {
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedConversation =
    data.conversations.find((conversation) => conversation.conversationId === data.selectedConversationId) ??
    null;
  const staffClosedAt = selectedConversation?.staffClosedAt ?? null;
  const staffJoinedAt = selectedConversation?.staffJoinedAt ?? null;
  const staffInChat = isStaffJoinedToChat({ staffJoinedAt, staffClosedAt });
  const refresh = useEffectEvent(onRefresh);
  const conversationId = data.selectedConversationId;
  const [inboxFilter, setInboxFilter] = useState<'open' | 'closed'>('open');
  const conversations = useMemo(
    () =>
      [...data.conversations].sort((a, b) => {
        const rank = inboxRank(a) - inboxRank(b);

        if (rank !== 0) {
          return rank;
        }

        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [data.conversations],
  );

  const { messages, loadingOlder, handleScroll } = useChatMessagePages({
    conversationId,
    loadOlderMessages: (beforeCreatedAt) =>
      loadOlderStaffChatMessagesAction(conversationId ?? '', beforeCreatedAt),
    recentHasMoreOlder: data.hasMoreOlder,
    recentMessages: data.messages,
    scrollRef,
  });

  useChatPollRefresh({
    enabled: true,
    intervalMs: CHAT_ACTIVE_POLL_MS,
    onRefresh: refresh,
  });

  useChatBurstRefresh({
    trigger: actionRefreshTrigger,
    onRefresh: refresh,
  });

  useEffect(() => {
    if (conversationId) {
      refresh();
    }
  }, [conversationId]);

  const patientName = selectedConversation
    ? customerName(
        selectedConversation.firstName,
        selectedConversation.lastName,
        selectedConversation.email,
        selectedConversation.bigcommerceCustomerId,
      )
    : null;

  return (
    <div className="grid h-full min-h-0 bg-[#f7fbf5] lg:grid-cols-[20rem_minmax(0,1fr)_18rem]">
      {data.listError ? (
        <p className="p-4 text-sm text-red-700 lg:col-span-3">{data.listError}</p>
      ) : (
        <>
          <div className="flex min-h-0 flex-col border-b border-[#e6e2dc] lg:border-b-0 lg:border-r">
            <div className="flex shrink-0 gap-1 border-b border-[#e6e2dc] p-2">
              {(
                [
                  ['open', 'Open', conversations.filter((item) => inboxRank(item) < 3).length],
                  ['closed', 'Closed', conversations.filter((item) => inboxRank(item) === 3).length],
                ] as const
              ).map(([id, label, count]) => (
                <button
                  className={
                    inboxFilter === id
                      ? id === 'open'
                        ? 'rounded bg-[#234028] px-3 py-1.5 text-base font-semibold text-white'
                        : 'rounded bg-[#5c564c] px-3 py-1.5 text-base font-semibold text-white'
                      : 'rounded px-3 py-1.5 text-base text-[#3f3d39] hover:bg-[#f4f3f1]'
                  }
                  key={id}
                  onClick={() => setInboxFilter(id)}
                  type="button"
                >
                  {label}
                  <span className="ml-1.5 tabular-nums text-[#8a8176]">{count}</span>
                </button>
              ))}
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto">
            {conversations.filter((item) =>
              inboxFilter === 'closed' ? inboxRank(item) === 3 : inboxRank(item) < 3,
            ).length === 0 ? (
              <li className="px-3 py-4 text-base text-[#8a8176]">
                {conversations.length === 0
                  ? 'No chats yet.'
                  : inboxFilter === 'open'
                    ? 'No open chats.'
                    : 'No closed chats.'}
              </li>
            ) : (
              conversations
                .filter((item) => (inboxFilter === 'closed' ? inboxRank(item) === 3 : inboxRank(item) < 3))
                .map((conversation) => {
                const name = customerName(
                  conversation.firstName,
                  conversation.lastName,
                  conversation.email,
                  conversation.bigcommerceCustomerId,
                );
                const active = conversation.conversationId === conversationId;
                const inChat = isStaffJoinedToChat({
                  staffJoinedAt: conversation.staffJoinedAt,
                  staffClosedAt: conversation.staffClosedAt,
                });
                const state = conversation.escalatedToPharmacistAt && !inChat
                  ? 'Pharmacist requested'
                  : inChat
                    ? 'In chat'
                    : conversation.staffClosedAt
                      ? 'Left chat'
                      : 'Waiting';
                const preview = messagePreview(conversation.lastMessageSender, conversation.lastMessageBody);
                const when = formatStaffTimestamp(conversation.updatedAt);

                const stateClass =
                  state === 'Pharmacist requested'
                    ? 'text-[#9a4b00]'
                    : state === 'In chat'
                      ? 'text-[#1d6b32]'
                      : state === 'Waiting'
                        ? 'text-[#1f5f8b]'
                        : 'text-[#6b6560]';

                return (
                  <li key={conversation.conversationId}>
                    <Link
                      className={`block border-b border-[#e3eedd] px-3 py-3 ${
                        active ? 'bg-[#d7efc8]' : 'bg-white hover:bg-[#f4faf1]'
                      }`}
                      href={staffHref({ tab: 'chat', c: conversation.conversationId })}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-base font-semibold">{name}</span>
                        <time
                          className="shrink-0 text-sm tabular-nums text-[#5c6b5d]"
                          dateTime={conversation.updatedAt}
                          suppressHydrationWarning
                          title={when}
                        >
                          {ageLabel(conversation.updatedAt)}
                        </time>
                      </span>
                      <span className={`mt-0.5 block text-sm font-medium ${stateClass}`}>{state}</span>
                      {preview ? (
                        <span className="mt-1 block truncate text-sm text-[#5c564c]">{preview}</span>
                      ) : null}
                    </Link>
                  </li>
                );
              })
            )}
            </ul>
          </div>

          <div className="flex min-h-0 flex-col border-b border-[#e6e2dc] lg:border-b-0 lg:border-r">
            {!conversationId ? (
              <p className="px-4 py-6 text-base text-[#8a8176]">Select a conversation.</p>
            ) : data.messagesError ? (
              <p className="px-4 py-4 text-sm text-red-700">{data.messagesError}</p>
            ) : (
              <>
                <div
                  className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
                  onScroll={handleScroll}
                  ref={scrollRef}
                >
                  {loadingOlder ? (
                    <p className="py-1 text-center text-sm text-[#8a8176]" role="status">
                      Loading earlier messages…
                    </p>
                  ) : null}
                  {messages.map((message) => {
                    if (message.sender_type === 'system') {
                      return <ChatSystemMessage body={message.body} key={message.id} />;
                    }

                    const alignEnd = message.sender_type === 'staff';
                    const label =
                      message.sender_type === 'staff'
                        ? 'Staff'
                        : message.sender_type === 'bot'
                          ? STORE_ASSISTANT_NAME
                          : 'Customer';

                    return (
                      <div
                        className={`flex ${alignEnd ? 'justify-end' : 'justify-start'}`}
                        key={message.id}
                      >
                        <div
                          className={`max-w-[90%] rounded-lg px-3.5 py-2.5 text-base ${
                            message.sender_type === 'staff'
                              ? 'bg-[#234028] text-white'
                              : message.sender_type === 'bot'
                                ? 'border border-[#b7d4b2] bg-[#e7f3df] text-[#1c1b19]'
                                : 'border border-[#b9d4ef] bg-[#e7f2fc] text-[#1c1b19]'
                          }`}
                        >
                          <ChatMessageBody body={message.body} />
                          <p className="mt-1 text-sm opacity-70">
                            {label} · {formatStaffTimestamp(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="shrink-0 border-t border-[#e6e2dc] p-3">
                  {staffInChat ? (
                    <form action={formAction} className="mb-2">
                      <input name="intent" type="hidden" value="endConversation" />
                      <input name="conversationId" type="hidden" value={conversationId} />
                      <button
                        className="rounded-md border border-[#e6e2dc] px-2.5 py-1 text-base text-[#3f3d39] hover:bg-[#f4f3f1]"
                        disabled={isPending}
                        type="submit"
                      >
                        Leave chat
                      </button>
                    </form>
                  ) : (
                    <form action={formAction} className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-base text-[#3f3d39]">Join this chat to reply.</p>
                      <input name="intent" type="hidden" value="joinConversation" />
                      <input name="conversationId" type="hidden" value={conversationId} />
                      <button
                        className="rounded-md bg-[#375a37] px-3 py-1.5 text-base font-medium text-white disabled:opacity-60"
                        disabled={isPending}
                        type="submit"
                      >
                        Join chat
                      </button>
                    </form>
                  )}
                  <form
                    action={formAction}
                    className="flex items-end gap-2"
                    key={`reply-${conversationId}-${actionRefreshTrigger}`}
                  >
                    <input name="intent" type="hidden" value="reply" />
                    <input name="conversationId" type="hidden" value={conversationId} />
                    <textarea
                      className="min-h-16 w-full rounded-md border border-[#e6e2dc] px-2.5 py-2 text-base focus:border-[#375a37] focus:outline-none"
                      disabled={isPending || !staffInChat}
                      maxLength={8000}
                      name="body"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                      placeholder={staffInChat ? 'Reply…' : 'Join chat to reply…'}
                      required
                      rows={2}
                    />
                    <button
                      className="rounded-md bg-[#375a37] px-3 py-2 text-base font-medium text-white disabled:opacity-60"
                      disabled={isPending || !staffInChat}
                      type="submit"
                    >
                      {isPending ? 'Sending…' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          <aside className="min-h-0 overflow-y-auto p-4">
            {!selectedConversation || !patientName ? (
              <p className="text-base text-[#8a8176]">Patient details appear with the conversation.</p>
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#3f6b42]">Patient</p>
                <p className="mt-2 text-lg font-semibold text-[#1c1b19]">{patientName}</p>
                {selectedConversation.email ? (
                  <p className="mt-1 break-all text-base text-[#5c564c]">{selectedConversation.email}</p>
                ) : null}
                <p className="mt-2 text-sm text-[#8a8176]">
                  Store ID {selectedConversation.bigcommerceCustomerId}
                </p>
                <Link
                  className="mt-4 inline-flex rounded-md border border-[#c9d8c9] px-2.5 py-1.5 text-base font-medium text-[#375a37] hover:bg-[#f4f7f0]"
                  href={staffHref({ tab: 'customers', p: selectedConversation.profileId })}
                >
                  Open record
                </Link>
                {data.chatPatientContext?.profileId === selectedConversation.profileId ? (
                  <div className="mt-5 space-y-4">
                    <PatientContextList
                      empty="No active prescriptions"
                      items={data.chatPatientContext.activePrescriptions}
                      title="Active prescriptions"
                    />
                    <PatientContextList
                      empty="No open refills"
                      items={data.chatPatientContext.openRefills}
                      title="Open refills"
                    />
                    <PatientContextList
                      empty="No CarePack request"
                      items={data.chatPatientContext.carePacks}
                      title="CarePack"
                    />
                  </div>
                ) : null}
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function PatientContextList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-[#8a8176]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-base text-[#8a8176]">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((item, index) => (
            <li className="text-base leading-snug text-[#1c1b19]" key={`${title}-${index}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
