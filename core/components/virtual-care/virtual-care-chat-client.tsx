'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
  virtualCareChatAction,
  type VirtualCareChatActionState,
} from '~/app/[locale]/(default)/account/virtual-care/_actions/virtual-care-actions';
import { Link } from '~/components/link';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

export function VirtualCareChatClient({
  supabaseReady,
  conversationId,
  customerLeftAt,
  staffClosedAt,
  messages,
  loadError,
}: {
  supabaseReady: boolean;
  conversationId: string | null;
  customerLeftAt: string | null;
  staffClosedAt: string | null;
  messages: ChatMessageRow[];
  loadError: string | null;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sendState, sendAction, sendPending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);
  const [leaveState, leaveAction, leavePending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);

  useEffect(() => {
    if (!supabaseReady || !conversationId) {
      return;
    }

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    }, 15000);

    return () => window.clearInterval(id);
  }, [conversationId, router, supabaseReady]);

  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    if (sendState?.ok) {
      router.refresh();
    }
  }, [router, sendState?.ok]);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <OnboardingSectionHeader
        description="Send updates and questions to your care team. Messages are saved so staff can follow up."
        kicker="Secure messaging"
        titleAccent="team"
        titleBefore="Chat with our "
      />
      <Link className="text-sm font-medium text-[#375a37] hover:underline" href="/account/virtual-care">
        ‹ Virtual care
      </Link>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadError}
        </div>
      ) : null}

      {!supabaseReady ? (
        <div className="rounded-2xl border border-dashed border-[#c4b8a8] bg-[#faf8f5] px-6 py-8 text-sm text-[#5c564c]">
          <p className="font-medium text-[#2c2a26]">Chat storage is not configured</p>
          <p className="mt-2">Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customerLeftAt ? (
            <div className="rounded-lg border border-[#c4d4b8] bg-[#f4f7f0] px-4 py-3 text-sm">
              You previously left this chat ({new Date(customerLeftAt).toLocaleString()}).
            </div>
          ) : null}
          {staffClosedAt ? (
            <div className="rounded-lg border border-[#c5ccd4] bg-[#f4f6f8] px-4 py-3 text-sm">
              Our team closed this conversation ({new Date(staffClosedAt).toLocaleString()}). Send a
              message below to continue.
            </div>
          ) : null}

          <div
            className="max-h-[min(420px,55vh)] space-y-3 overflow-y-auto rounded-xl border border-[#e5dfd5] bg-white p-4"
            ref={scrollRef}
          >
            {!conversationId && messages.length === 0 ? (
              <p className="text-center text-sm text-[#8a8176]">
                No conversation yet — send a message below to start.
              </p>
            ) : null}
            {messages.map((m) => (
              <div
                className={`flex ${m.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
                key={m.id}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender_type === 'customer'
                      ? 'bg-[#6b7f5c] text-white'
                      : 'border border-[#dcd6cc] bg-white text-[#2c2a26]'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-75">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {conversationId && !customerLeftAt ? (
            <form action={leaveAction}>
              <input name="intent" type="hidden" value="leave" />
              <button
                className="text-sm text-[#6b6560] hover:underline disabled:opacity-50"
                disabled={leavePending}
                type="submit"
              >
                Leave chat
              </button>
              {leaveState?.error ? <p className="text-sm text-red-700">{leaveState.error}</p> : null}
            </form>
          ) : null}

          <form action={sendAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input name="intent" type="hidden" value="send" />
            <textarea
              className="min-h-22 w-full resize-y rounded-xl border border-[#e0d9ce] px-3.5 py-2.5 text-sm"
              disabled={sendPending || Boolean(loadError)}
              maxLength={8000}
              name="body"
              placeholder="Type your message…"
              required
              rows={3}
            />
            <button
              className="liivv-btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
              disabled={sendPending || Boolean(loadError)}
              type="submit"
            >
              {sendPending ? 'Sending…' : 'Send'}
            </button>
          </form>
          {sendState?.error ? <p className="text-sm text-red-700">{sendState.error}</p> : null}
        </div>
      )}
    </section>
  );
}
