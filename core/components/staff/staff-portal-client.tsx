'use client';

import Link from 'next/link';
import { useActionState, useEffect, useEffectEvent, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  loadOlderStaffChatMessagesAction,
  staffPortalAction,
  type StaffActionState,
} from '~/app/staff/_actions/staff-portal-actions';
import { staffLogoutAction } from '~/app/staff/_actions/staff-auth-actions';
import type { StaffPortalData } from '~/app/staff/page-data';
import { StaffCustomerDetail } from '~/components/staff/staff-customer-detail';
import { formatStaffStatusLabel, staffStatusBadgeClass } from '~/components/staff/staff-status';
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

const forest = '#375a37';

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

export function StaffPortalClient({
  data,
  basePath = '/staff',
  embedded = false,
  embeddedUserEmail,
}: {
  data: StaffPortalData;
  basePath?: string;
  embedded?: boolean;
  embeddedUserEmail?: string;
}) {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState<StaffActionState, FormData>(
    staffPortalAction,
    null,
  );
  const [chatRefreshTrigger, setChatRefreshTrigger] = useState(0);
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);

  const tab = data.adminTab;

  useEffect(() => {
    if (actionState?.ok) {
      router.refresh();
      if (tab === 'chat') {
        setChatRefreshTrigger((value) => value + 1);
      }
    }
  }, [actionState?.ok, router, tab]);

  return (
    <div className={embedded ? 'min-h-0 bg-[#faf8f5] text-[#2c2a26]' : 'min-h-screen bg-[#faf8f5] text-[#2c2a26]'}>
      <header className="border-b border-[#ebe6df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">
              {embedded ? 'Liivv Staff' : 'Liivv staff'}
            </p>
            <h1 className="text-xl font-semibold" style={{ color: forest }}>
              Pharmacy & care portal
            </h1>
            {embedded && embeddedUserEmail ? (
              <p className="mt-1 text-sm text-[#6b6560]">Signed in as {embeddedUserEmail}</p>
            ) : null}
          </div>
          {!embedded ? (
            <form action={staffLogoutAction}>
              <button className="text-sm font-medium text-[#6b6560] hover:underline" type="submit">
                Sign out
              </button>
            </form>
          ) : null}
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 px-4 pb-3">
          {(
            [
              ['pharmacy', 'Pharmacy'],
              ['customers', 'Customers'],
              ['chat', 'Chat'],
            ] as const
          ).map(([id, label]) => (
            <Link
              className={
                tab === id
                  ? 'rounded-lg border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 text-sm font-semibold text-[#2d4a2d]'
                  : 'rounded-lg px-3 py-1.5 text-sm text-[#6b6560] hover:bg-[#f7f4ef]'
              }
              href={staffHref({ tab: id === 'pharmacy' ? undefined : id })}
              key={id}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {actionState?.error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {actionState.error}
          </p>
        ) : null}

        {!data.supabaseReady ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
            Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
          </div>
        ) : null}

        {tab === 'pharmacy' ? (
          <PharmacyTab basePath={basePath} data={data} formAction={formAction} isPending={isPending} />
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
      </main>
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
  const staffHref = (params: Record<string, string | undefined>) => portalHref(basePath, params);
  const queue = data.pharmacyQueue;
  const queueRows =
    queue === 'refill'
      ? data.refillQueue
      : queue === 'carepack'
        ? data.carePackQueue
        : data.prescriptionQueue;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
      <section className="space-y-4">
        <div className="inline-flex rounded-xl border border-[#ddd4c8] bg-[#f7f4ef] p-1 text-sm">
          {(
            [
              ['prescription', 'Prescriptions'],
              ['refill', 'Refills'],
              ['carepack', 'CarePack'],
            ] as const
          ).map(([id, label]) => (
            <Link
              className={
                queue === id
                  ? 'rounded-lg border border-[#c9d8c9] bg-[#eef4ee] px-3 py-1.5 font-semibold text-[#2d4a2d]'
                  : 'px-3 py-1.5 text-[#6b6560]'
              }
              href={staffHref({ tab: 'pharmacy', queue: id })}
              key={id}
            >
              {label}
            </Link>
          ))}
        </div>

        {data.pharmacyQueueError ? (
          <p className="text-sm text-red-700">{data.pharmacyQueueError}</p>
        ) : null}

        <div className="space-y-3">
          {queueRows.length === 0 ? (
            <p className="rounded-xl border border-[#e8e2d8] bg-white p-4 text-sm text-[#6b6560]">
              Queue is empty.
            </p>
          ) : (
            queueRows.map((row) => {
              const customer = row.customer;
              const name = customerName(
                customer?.first_name ?? null,
                customer?.last_name ?? null,
                customer?.email ?? null,
                'Customer',
              );
              const requestType = queue;
              const selected =
                data.selectedRequestId === row.id && data.selectedRequestType === requestType;
              const statusValue =
                'approval_status' in row
                  ? (row.approval_status ?? row.status ?? 'pending')
                  : row.status;

              return (
                <Link
                  className={`block rounded-xl border bg-white p-4 shadow-sm ${
                    selected ? 'border-[#8a9a7b]' : 'border-[#e8e2d8]'
                  }`}
                  href={staffHref({
                    tab: 'pharmacy',
                    queue,
                    requestType,
                    requestId: row.id,
                  })}
                  key={row.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#2c2a26]">
                        {'medication_name' in row
                          ? row.medication_name
                          : 'medication_names' in row && row.medication_names.length > 0
                            ? row.medication_names.join(', ')
                            : `Request #${row.id.slice(0, 8)}`}
                      </p>
                      <p className="mt-1 text-sm text-[#6b6560]">{name}</p>
                      {'medication_names' in row ? (
                        <p className="mt-0.5 text-xs text-[#8a8176]">
                          Request #{row.id.slice(0, 8)}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[#8a8176]">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={staffStatusBadgeClass(statusValue)}>
                      {formatStaffStatusLabel(statusValue)}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <aside className="sticky top-4 flex max-h-[calc(100vh-5rem)] flex-col self-start overflow-hidden rounded-xl border border-[#e5dfd5] bg-white shadow-sm">
        <div className="shrink-0 border-b border-[#efe9e0] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#2c2a26]">Customer detail</h2>
          {isPending ? <p className="mt-1 text-xs text-[#8a8176]">Saving…</p> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {data.pharmacyCustomerDetailError ? (
            <p className="text-sm text-red-700">{data.pharmacyCustomerDetailError}</p>
          ) : data.pharmacyCustomerDetail ? (
            <StaffCustomerDetail detail={data.pharmacyCustomerDetail} formAction={formAction} />
          ) : (
            <p className="text-sm text-[#8a8176]">Select a queue item to view customer details.</p>
          )}
        </div>
      </aside>
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
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#2c2a26]">Search customers</h2>
        <form
          className="mt-3 flex gap-2"
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
            className="min-w-0 flex-1 rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm"
            minLength={2}
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or email"
            required
            value={query}
          />
          <button
            className="liivv-btn-primary px-4 py-2 text-sm disabled:opacity-60"
            disabled={isNavigating}
            type="submit"
          >
            {isNavigating ? 'Searching…' : 'Search'}
          </button>
        </form>
        {isNavigating ? (
          <p className="mt-2 text-xs text-[#8a8176]" role="status">
            Loading…
          </p>
        ) : null}
        {data.customerSearchError ? (
          <p className="mt-2 text-sm text-red-700">{data.customerSearchError}</p>
        ) : null}
        {data.bigcommerceSearchWarning ? (
          <p className="mt-2 text-xs text-amber-800">{data.bigcommerceSearchWarning}</p>
        ) : null}
        <ul
          aria-busy={isNavigating}
          className={`mt-4 divide-y divide-[#f0ebe3] ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
        >
          {data.customerSearchRows.length === 0 && data.customerQuery.trim().length >= 2 && !isNavigating ? (
            <li className="py-3 text-sm text-[#8a8176]">No customers found.</li>
          ) : null}
          {data.customerSearchRows.map((row) => {
            if (row.source === 'supabase') {
              const p = row.profile;
              const name = customerName(p.first_name, p.last_name, p.email, 'Customer');
              const href = staffHref({ tab: 'customers', q: data.customerQuery, p: p.id });
              const active = data.selectedProfileId === p.id;

              return (
                <li key={p.id}>
                  <button
                    className={`block w-full py-3 text-left hover:bg-[#faf8f5] ${active ? 'bg-[#f7f4ef]' : ''}`}
                    onClick={() => navigate(href)}
                    type="button"
                  >
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-[#8a8176]">{p.email}</p>
                  </button>
                </li>
              );
            }

            const hit = row.hit;
            const name = customerName(hit.firstName, hit.lastName, hit.email, 'Customer');
            const href = staffHref({
              tab: 'customers',
              q: data.customerQuery,
              bc: hit.bigcommerce_customer_id,
            });
            const active = data.selectedBigCommerceId === hit.bigcommerce_customer_id;

            return (
              <li key={hit.bigcommerce_customer_id}>
                <button
                  className={`block w-full py-3 text-left hover:bg-[#faf8f5] ${active ? 'bg-[#f7f4ef]' : ''}`}
                  onClick={() => navigate(href)}
                  type="button"
                >
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-[#8a8176]">{hit.email} (BC only)</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="relative rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#2c2a26]">Customer record</h2>
        {isNavigating ? (
          <div
            aria-live="polite"
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80"
            role="status"
          >
            <div className="rounded-lg border border-[#e5dfd5] bg-white px-4 py-3 text-sm text-[#5c564c] shadow-sm">
              Loading…
            </div>
          </div>
        ) : null}
        {data.customerDetailError ? (
          <p className="mt-2 text-sm text-red-700">{data.customerDetailError}</p>
        ) : data.customerDetail ? (
          <div className="mt-3">
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
          <p className="mt-2 text-sm text-[#8a8176]">Search and select a customer to view details.</p>
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
    data.conversations.find((c) => c.conversationId === data.selectedConversationId) ?? null;
  const staffClosedAt = selectedConversation?.staffClosedAt ?? null;
  const staffJoinedAt = selectedConversation?.staffJoinedAt ?? null;
  const staffInChat = isStaffJoinedToChat({ staffJoinedAt, staffClosedAt });
  const refresh = useEffectEvent(onRefresh);
  const conversationId = data.selectedConversationId;

  const { messages, loadingOlder, handleScroll } = useChatMessagePages({
    conversationId,
    loadOlderMessages: (beforeCreatedAt) =>
      loadOlderStaffChatMessagesAction(conversationId ?? '', beforeCreatedAt),
    recentHasMoreOlder: data.hasMoreOlder,
    recentMessages: data.messages,
    scrollRef,
  });

  useChatPollRefresh({
    enabled: Boolean(conversationId),
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

  return (
    <div className="rounded-xl border border-[#e5dfd5] bg-white shadow-sm">
      {data.listError ? (
        <p className="p-4 text-sm text-red-700">{data.listError}</p>
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr]">
          <ul className="divide-y divide-[#f0ebe3] border-r border-[#f0ebe3]">
            {data.conversations.length === 0 ? (
              <li className="p-4 text-sm text-[#8a8176]">No chats yet.</li>
            ) : (
              data.conversations.map((c) => {
                const name = customerName(c.firstName, c.lastName, c.email, c.bigcommerceCustomerId);
                const active = c.conversationId === conversationId;

                return (
                  <li key={c.conversationId}>
                    <Link
                      className={`block px-4 py-3 ${active ? 'bg-[#f7f4ef]' : 'hover:bg-[#faf8f5]'}`}
                      href={staffHref({ tab: 'chat', c: c.conversationId })}
                    >
                      <p className="text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-[#6b6560]">{c.email}</p>
                      <p className="mt-1 text-[10px] text-[#8a8176]">
                        {new Date(c.updatedAt).toLocaleString()}
                        {c.escalatedToPharmacistAt ? ' • Pharmacist requested' : ''}
                        {isStaffJoinedToChat({
                          staffJoinedAt: c.staffJoinedAt,
                          staffClosedAt: c.staffClosedAt,
                        })
                          ? ' • In chat'
                          : c.staffClosedAt
                            ? ' • Left chat'
                            : ''}
                      </p>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          <div className="min-h-[420px] bg-[#faf8f5] p-4">
            {!conversationId ? (
              <p className="text-sm text-[#8a8176]">Select a conversation.</p>
            ) : data.messagesError ? (
              <p className="text-sm text-red-700">{data.messagesError}</p>
            ) : (
              <>
                <div
                  className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border border-[#ece6dc] bg-white p-3"
                  onScroll={handleScroll}
                  ref={scrollRef}
                >
                  {loadingOlder ? (
                    <p className="py-1 text-center text-xs text-[#8a8176]" role="status">
                      Loading earlier messages…
                    </p>
                  ) : null}
                  {messages.map((m) => {
                    if (m.sender_type === 'system') {
                      return <ChatSystemMessage body={m.body} key={m.id} />;
                    }

                    const alignEnd = m.sender_type === 'staff';
                    const label =
                      m.sender_type === 'staff'
                        ? 'Staff'
                        : m.sender_type === 'bot'
                          ? STORE_ASSISTANT_NAME
                          : 'Customer';

                    return (
                      <div
                        className={`flex ${alignEnd ? 'justify-end' : 'justify-start'}`}
                        key={m.id}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                            m.sender_type === 'staff'
                              ? 'bg-[#2c2a26] text-white'
                              : m.sender_type === 'bot'
                                ? 'border border-[#c8d4bc] bg-[#f4f7f0] text-[#2c2a26]'
                                : 'border border-[#dcd6cc] bg-white text-[#2c2a26]'
                          }`}
                        >
                          <ChatMessageBody body={m.body} />
                          <p className="mt-1 text-[10px] opacity-70">
                            {label} · {new Date(m.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {staffInChat ? (
                  <form action={formAction} className="mt-3">
                    <input name="intent" type="hidden" value="endConversation" />
                    <input name="conversationId" type="hidden" value={conversationId} />
                    <button
                      className="liivv-btn-secondary px-3 py-1.5 text-sm"
                      disabled={isPending}
                      type="submit"
                    >
                      Leave chat
                    </button>
                  </form>
                ) : (
                  <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p>Join this chat to reply to the customer.</p>
                    <form action={formAction}>
                      <input name="intent" type="hidden" value="joinConversation" />
                      <input name="conversationId" type="hidden" value={conversationId} />
                      <button
                        className="liivv-btn-primary px-3 py-1.5 text-sm"
                        disabled={isPending}
                        type="submit"
                      >
                        Join chat
                      </button>
                    </form>
                  </div>
                )}

                <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input name="intent" type="hidden" value="reply" />
                  <input name="conversationId" type="hidden" value={conversationId} />
                  <textarea
                    className="min-h-20 w-full rounded-xl border border-[#e0d9ce] px-3 py-2 text-sm"
                    disabled={isPending || !staffInChat}
                    maxLength={8000}
                    name="body"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    placeholder={staffInChat ? 'Type staff reply…' : 'Join chat to reply…'}
                    required
                    rows={3}
                  />
                  <button
                    className="liivv-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
                    disabled={isPending || !staffInChat}
                    type="submit"
                  >
                    {isPending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
