'use client';

import {
  useActionState,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  getLiveChatSessionAction,
  virtualCareChatAction,
  type LiveChatSessionPayload,
  type VirtualCareChatActionState,
} from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';
import { Link } from '~/components/link';
import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

export const LIVE_CHAT_OPEN_EVENT = 'liivv:open-live-chat';

export function openLiveChat(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(LIVE_CHAT_OPEN_EVENT));
}

export type LiveChatWidgetData = LiveChatSessionPayload;

function messageBubbleClass(senderType: ChatMessageRow['sender_type']): string {
  if (senderType === 'customer') {
    return 'bg-[#6b7f5c] text-white';
  }

  if (senderType === 'bot') {
    return 'border border-[#c8d4bc] bg-[#f4f7f0] text-[#2c2a26]';
  }

  return 'border border-[#dcd6cc] bg-white text-[#2c2a26]';
}

function messageLabel(senderType: ChatMessageRow['sender_type']): string | null {
  if (senderType === 'bot') {
    return 'Store assistant';
  }

  if (senderType === 'staff') {
    return 'Care team';
  }

  return null;
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="22"
      viewBox="0 0 24 24"
      width="22"
    >
      <path
        d="M7 9.5h10M7 13h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.75"
      />
      <path
        d="M5.5 4.75h13A2.75 2.75 0 0 1 21.25 7.5v7a2.75 2.75 0 0 1-2.75 2.75H11.2L7.4 20.4a.75.75 0 0 1-1.2-.6v-2.55H5.5A2.75 2.75 0 0 1 2.75 14.5v-7A2.75 2.75 0 0 1 5.5 4.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function GuestPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#f4f4f4] p-4">
        <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-[#2c2a26] shadow-sm">
          To help direct your chat to the right place, please sign in to your Liivv account.
        </div>
        <div className="flex flex-col gap-2.5">
          <Link
            className="rounded-full border border-[#2c2a26] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2c2a26] transition hover:bg-[#f7f4ef]"
            href="/login?redirectTo=/?chat=open"
          >
            Sign In
          </Link>
          <Link
            className="rounded-full border border-[#2c2a26] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2c2a26] transition hover:bg-[#f7f4ef]"
            href="/login/forgot-password"
          >
            Unable to sign In
          </Link>
          <Link
            className="rounded-full border border-[#2c2a26] bg-white px-4 py-3 text-center text-sm font-semibold text-[#2c2a26] transition hover:bg-[#f7f4ef]"
            href="/register?redirectTo=/?chat=open"
          >
            I&apos;m not a customer
          </Link>
        </div>
      </div>
      <div className="border-t border-[#e8e2d8] bg-white p-3">
        <p className="rounded-xl bg-[#f0ebe3] px-3.5 py-3 text-sm text-[#8a8176]">
          Sign in to type a message
        </p>
        <button
          className="mt-2 w-full text-center text-xs text-[#6b6560] hover:underline"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function AuthenticatedPanel({
  data,
  onClose,
  onRefresh,
}: {
  data: LiveChatWidgetData | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [sendState, sendAction, sendPending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);
  const [leaveState, leaveAction, leavePending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);
  const refresh = useEffectEvent(onRefresh);

  const supabaseReady = data?.supabaseReady ?? false;
  const botEnabled = data?.botEnabled ?? false;
  const conversationId = data?.conversationId ?? null;
  const messages = data?.messages ?? [];
  const customerLeftAt = data?.customerLeftAt ?? null;
  const staffClosedAt = data?.staffClosedAt ?? null;
  const escalatedToPharmacistAt = data?.escalatedToPharmacistAt ?? null;

  useEffect(() => {
    if (!supabaseReady || !conversationId) {
      return;
    }

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }, 15000);

    return () => window.clearInterval(id);
  }, [conversationId, supabaseReady]);

  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    if (sendState?.ok) {
      formRef.current?.reset();
      refresh();
    }
  }, [sendState?.ok]);

  useEffect(() => {
    if (leaveState?.ok) {
      refresh();
    }
  }, [leaveState?.ok]);

  if (!data || !supabaseReady) {
    return (
      <div className="flex h-full flex-col bg-[#f4f4f4] p-4">
        <div className="rounded-2xl border border-dashed border-[#c4b8a8] bg-white px-4 py-6 text-sm text-[#5c564c]">
          <p className="font-medium text-[#2c2a26]">Chat is temporarily unavailable</p>
          <p className="mt-2">Please try again later, or visit Virtual care from your account.</p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-[#375a37] hover:underline"
            href="/account/virtual-care"
          >
            Go to Virtual care →
          </Link>
        </div>
        <button
          className="mt-auto pt-4 text-center text-xs text-[#6b6560] hover:underline"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto bg-[#f4f4f4] p-4" ref={scrollRef}>
        {botEnabled ? (
          <div className="rounded-xl border border-[#d4dfc8] bg-[#f8faf6] px-3 py-2.5 text-xs text-[#3d4a36]">
            Ask about products, orders, or your account. For medication advice, a pharmacist will
            join.
            {escalatedToPharmacistAt ? (
              <span className="mt-1 block font-medium">
                A pharmacist has been notified and will join this conversation.
              </span>
            ) : null}
          </div>
        ) : null}

        {customerLeftAt ? (
          <div className="rounded-xl border border-[#c4d4b8] bg-[#f4f7f0] px-3 py-2 text-xs">
            You previously left this chat. Send a message to continue.
          </div>
        ) : null}

        {staffClosedAt ? (
          <div className="rounded-xl border border-[#c5ccd4] bg-[#f4f6f8] px-3 py-2 text-xs">
            Our team closed this conversation. Send a message below to continue.
          </div>
        ) : null}

        {!conversationId && messages.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-[#2c2a26] shadow-sm">
            {botEnabled
              ? 'Hi! I can help with products, orders, prescriptions, and your account. What do you need?'
              : 'Send a message to our care team. Conversations are saved so we can follow up.'}
          </div>
        ) : null}

        {messages.map((m) => {
          const alignEnd = m.sender_type === 'customer';

          return (
            <div className={`flex ${alignEnd ? 'justify-end' : 'justify-start'}`} key={m.id}>
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${messageBubbleClass(m.sender_type)}`}
              >
                {messageLabel(m.sender_type) ? (
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {messageLabel(m.sender_type)}
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className="mt-1 text-[10px] opacity-75">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#e8e2d8] bg-white p-3">
        {conversationId && !customerLeftAt ? (
          <form action={leaveAction} className="mb-2">
            <input name="intent" type="hidden" value="leave" />
            <button
              className="text-xs text-[#6b6560] hover:underline disabled:opacity-50"
              disabled={leavePending}
              type="submit"
            >
              Leave chat
            </button>
            {leaveState?.error ? (
              <p className="text-xs text-red-700">{leaveState.error}</p>
            ) : null}
          </form>
        ) : null}

        <form action={sendAction} className="flex gap-2" ref={formRef}>
          <input name="intent" type="hidden" value="send" />
          <input
            className="min-w-0 flex-1 rounded-xl border-0 bg-[#f0ebe3] px-3.5 py-3 text-sm text-[#2c2a26] outline-none placeholder:text-[#8a8176] focus:ring-2 focus:ring-[#8a9a7b]"
            disabled={sendPending}
            maxLength={8000}
            name="body"
            placeholder="Type your message"
            required
            type="text"
          />
          <button
            className="liivv-btn-primary shrink-0 rounded-xl px-4 py-3 text-sm disabled:opacity-60"
            disabled={sendPending}
            type="submit"
          >
            {sendPending ? '…' : 'Send'}
          </button>
        </form>
        {sendState?.error ? <p className="mt-2 text-xs text-red-700">{sendState.error}</p> : null}
      </div>
    </div>
  );
}

export function OpenLiveChatButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button className={className} onClick={openLiveChat} type="button">
      {children}
    </button>
  );
}

export function LiveChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<LiveChatWidgetData | null>(null);

  const refreshSession = useEffectEvent(async () => {
    const session = await getLiveChatSessionAction();

    setIsLoggedIn(session.isLoggedIn);
    setData(session.data);
    setSessionReady(true);
  });

  useEffect(() => {
    if (searchParams.get('chat') === 'open') {
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const onOpen = () => setOpen(true);

    window.addEventListener(LIVE_CHAT_OPEN_EVENT, onOpen);

    return () => window.removeEventListener(LIVE_CHAT_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSessionReady(false);
    void refreshSession();
  }, [open]);

  const clearChatQuery = () => {
    if (searchParams.get('chat') !== 'open') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());

    next.delete('chat');
    const qs = next.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleClose = () => {
    setOpen(false);
    clearChatQuery();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end p-4 sm:p-5">
      {open ? (
        <div
          aria-label="Live chat"
          className="pointer-events-auto flex h-[min(640px,calc(100vh-5.5rem))] w-[min(100%,380px)] flex-col overflow-hidden rounded-t-2xl border border-[#e5dfd5] bg-white shadow-[0_12px_40px_rgba(44,42,38,0.18)]"
          role="dialog"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 bg-[#2c2a26] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#375a37] text-[11px] font-bold"
              >
                L
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Live Chat</p>
                <p className="truncate text-[11px] text-white/70">
                  {!sessionReady
                    ? 'Connecting…'
                    : isLoggedIn
                      ? data?.botEnabled
                        ? 'Store assistant'
                        : 'Care team'
                      : 'Sign in to continue'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                aria-label="Minimize chat"
                className="rounded-md p-1.5 text-white/90 hover:bg-white/10"
                onClick={handleClose}
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
                  <path
                    d="M6 14h12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                  />
                </svg>
              </button>
              <button
                aria-label="Close chat"
                className="rounded-md p-1.5 text-white/90 hover:bg-white/10"
                onClick={handleClose}
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
                  <path
                    d="M7 7l10 10M17 7 7 17"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                  />
                </svg>
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1">
            {!sessionReady ? (
              <div className="flex h-full items-center justify-center bg-[#f4f4f4] p-4 text-sm text-[#8a8176]">
                Loading chat…
              </div>
            ) : isLoggedIn ? (
              <AuthenticatedPanel
                data={data}
                onClose={handleClose}
                onRefresh={() => {
                  void refreshSession();
                }}
              />
            ) : (
              <GuestPanel onClose={handleClose} />
            )}
          </div>
        </div>
      ) : (
        <button
          aria-label="Need Help? Open live chat"
          className="liivv-live-chat-launcher pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a9a7b] focus-visible:ring-offset-2"
          onClick={handleOpen}
          type="button"
        >
          <ChatIcon />
          Need Help?
        </button>
      )}
    </div>
  );
}
