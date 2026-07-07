'use client';

import { useActionState, useEffect, useMemo, useRef, type RefObject } from 'react';
import { useRouter } from 'next/navigation';

import {
  staffPortalAction,
  type StaffActionState,
} from '~/app/staff/_actions/staff-portal-actions';
import { staffLogoutAction } from '~/app/staff/_actions/staff-auth-actions';
import type { StaffPortalData } from '~/app/staff/page-data';
import { Link } from '~/components/link';
import { StaffCustomerDetail } from '~/components/staff/staff-customer-detail';

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

function staffHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const qs = search.toString();

  return qs ? `/staff?${qs}` : '/staff';
}

export function StaffPortalClient({ data }: { data: StaffPortalData }) {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState<StaffActionState, FormData>(
    staffPortalAction,
    null,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const tab = data.adminTab;

  useEffect(() => {
    if (actionState?.ok) {
      router.refresh();
    }
  }, [actionState?.ok, router]);

  useEffect(() => {
    if (tab === 'chat' && data.selectedConversationId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data.messages.length, data.selectedConversationId, tab]);

  const selectedConversation = useMemo(
    () => data.conversations.find((c) => c.conversationId === data.selectedConversationId) ?? null,
    [data.conversations, data.selectedConversationId],
  );

  const staffClosedAt = selectedConversation?.staffClosedAt ?? null;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2c2a26]">
      <header className="border-b border-[#ebe6df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Liivv staff</p>
            <h1 className="text-xl font-semibold" style={{ color: forest }}>
              Pharmacy & care portal
            </h1>
          </div>
          <form action={staffLogoutAction}>
            <button className="text-sm font-medium text-[#6b6560] hover:underline" type="submit">
              Sign out
            </button>
          </form>
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
          <PharmacyTab data={data} formAction={formAction} isPending={isPending} />
        ) : null}

        {tab === 'customers' ? (
          <CustomersTab data={data} formAction={formAction} />
        ) : null}

        {tab === 'chat' ? <ChatTab bottomRef={bottomRef} data={data} formAction={formAction} isPending={isPending} /> : null}
      </main>
    </div>
  );
}

function PharmacyTab({
  data,
  formAction,
  isPending,
}: {
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}) {
  const queue = data.pharmacyQueue;
  const queueRows =
    queue === 'refill'
      ? data.refillQueue
      : queue === 'carepack'
        ? data.carePackQueue
        : data.prescriptionQueue;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
                        {'medication_name' in row ? row.medication_name : `Request #${row.id.slice(0, 8)}`}
                      </p>
                      <p className="mt-1 text-sm text-[#6b6560]">{name}</p>
                      <p className="mt-1 text-xs text-[#8a8176]">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-medium text-[#9a6b00]">
                      {'approval_status' in row
                        ? (row.approval_status ?? row.status ?? 'pending')
                        : row.status}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      <aside className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#2c2a26]">Customer detail</h2>
        {data.pharmacyCustomerDetailError ? (
          <p className="mt-2 text-sm text-red-700">{data.pharmacyCustomerDetailError}</p>
        ) : data.pharmacyCustomerDetail ? (
          <div className="mt-3">
            <StaffCustomerDetail detail={data.pharmacyCustomerDetail} formAction={formAction} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#8a8176]">Select a queue item to view customer details.</p>
        )}
        {isPending ? <p className="mt-2 text-xs text-[#8a8176]">Saving…</p> : null}
      </aside>
    </div>
  );
}

function CustomersTab({
  data,
  formAction,
}: {
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#2c2a26]">Search customers</h2>
        <form action="/staff" className="mt-3 flex gap-2" method="get">
          <input name="tab" type="hidden" value="customers" />
          <input
            className="min-w-0 flex-1 rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm"
            defaultValue={data.customerQuery}
            minLength={2}
            name="q"
            placeholder="Name or email"
            required
          />
          <button className="liivv-btn-primary px-4 py-2 text-sm" type="submit">
            Search
          </button>
        </form>
        {data.customerSearchError ? (
          <p className="mt-2 text-sm text-red-700">{data.customerSearchError}</p>
        ) : null}
        {data.bigcommerceSearchWarning ? (
          <p className="mt-2 text-xs text-amber-800">{data.bigcommerceSearchWarning}</p>
        ) : null}
        <ul className="mt-4 divide-y divide-[#f0ebe3]">
          {data.customerSearchRows.map((row) => {
            if (row.source === 'supabase') {
              const p = row.profile;
              const name = customerName(p.first_name, p.last_name, p.email, 'Customer');

              return (
                <li key={p.id}>
                  <Link
                    className="block py-3 hover:bg-[#faf8f5]"
                    href={staffHref({ tab: 'customers', q: data.customerQuery, p: p.id })}
                  >
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-[#8a8176]">{p.email}</p>
                  </Link>
                </li>
              );
            }

            const hit = row.hit;
            const name = customerName(hit.firstName, hit.lastName, hit.email, 'Customer');

            return (
              <li key={hit.bigcommerce_customer_id}>
                <Link
                  className="block py-3 hover:bg-[#faf8f5]"
                  href={staffHref({
                    tab: 'customers',
                    q: data.customerQuery,
                    bc: hit.bigcommerce_customer_id,
                  })}
                >
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-[#8a8176]">{hit.email} (BC only)</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#2c2a26]">Customer record</h2>
        {data.customerDetailError ? (
          <p className="mt-2 text-sm text-red-700">{data.customerDetailError}</p>
        ) : data.customerDetail ? (
          <div className="mt-3">
            <StaffCustomerDetail detail={data.customerDetail} formAction={formAction} />
            {data.customerDetail.profile ? (
              <Link
                className="mt-4 inline-flex text-sm font-medium text-[#375a37] hover:underline"
                href={staffHref({
                  tab: 'chat',
                  profile: data.customerDetail.profile.id,
                })}
              >
                Open chat →
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#8a8176]">Search and select a customer to view details.</p>
        )}
      </section>
    </div>
  );
}

function ChatTab({
  data,
  formAction,
  isPending,
  bottomRef,
}: {
  data: StaffPortalData;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}) {
  const staffClosedAt =
    data.conversations.find((c) => c.conversationId === data.selectedConversationId)?.staffClosedAt ??
    null;

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
                const active = c.conversationId === data.selectedConversationId;

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
                        {c.staffClosedAt ? ' • Closed' : ''}
                      </p>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          <div className="min-h-[420px] bg-[#faf8f5] p-4">
            {!data.selectedConversationId ? (
              <p className="text-sm text-[#8a8176]">Select a conversation.</p>
            ) : data.messagesError ? (
              <p className="text-sm text-red-700">{data.messagesError}</p>
            ) : (
              <>
                <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border border-[#ece6dc] bg-white p-3">
                  {data.messages.map((m) => (
                    <div
                      className={`flex ${m.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}
                      key={m.id}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                          m.sender_type === 'staff'
                            ? 'bg-[#2c2a26] text-white'
                            : 'border border-[#dcd6cc] bg-white text-[#2c2a26]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className="mt-1 text-[10px] opacity-70">
                          {m.sender_type === 'staff' ? 'Staff' : 'Customer'} ·{' '}
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {staffClosedAt ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p>Conversation closed. Reopen to reply.</p>
                    <form action={formAction}>
                      <input name="intent" type="hidden" value="reopenConversation" />
                      <input name="conversationId" type="hidden" value={data.selectedConversationId} />
                      <button
                        className="liivv-btn-secondary px-3 py-1.5 text-sm"
                        disabled={isPending}
                        type="submit"
                      >
                        Reopen
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={formAction} className="mt-3">
                    <input name="intent" type="hidden" value="endConversation" />
                    <input name="conversationId" type="hidden" value={data.selectedConversationId} />
                    <button
                      className="liivv-btn-secondary px-3 py-1.5 text-sm"
                      disabled={isPending}
                      type="submit"
                    >
                      End conversation
                    </button>
                  </form>
                )}

                <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input name="intent" type="hidden" value="reply" />
                  <input name="conversationId" type="hidden" value={data.selectedConversationId} />
                  <textarea
                    className="min-h-20 w-full rounded-xl border border-[#e0d9ce] px-3 py-2 text-sm"
                    disabled={isPending || Boolean(staffClosedAt)}
                    maxLength={8000}
                    name="body"
                    placeholder="Type staff reply…"
                    required
                    rows={3}
                  />
                  <button
                    className="liivv-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
                    disabled={isPending || Boolean(staffClosedAt)}
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
