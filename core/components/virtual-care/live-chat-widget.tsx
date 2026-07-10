'use client';

import {
  useActionState,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  getLiveChatSessionAction,
  getLiveChatUnreadStaffCountAction,
  markLiveChatReadAction,
  virtualCareChatAction,
  type LiveChatSessionPayload,
  type VirtualCareChatActionState,
} from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';
import { Link } from '~/components/link';
import type { ChatMessageRow } from '~/lib/supabase/chat-messages';
import { ChatMessageBody } from '~/components/virtual-care/chat-message-body';
import { ChatSystemMessage } from '~/components/virtual-care/chat-system-message';
import { ChatTypingIndicator } from '~/components/virtual-care/chat-typing-indicator';
import {
  CHAT_ACTIVE_POLL_MS,
  CHAT_IDLE_POLL_MS,
  useChatBurstRefresh,
  useChatPollRefresh,
} from '~/components/virtual-care/use-chat-poll-refresh';

const CHAT_CLOSED_UNREAD_POLL_MS = 3000;
const CHAT_GUEST_AUTH_POLL_MS = 3000;

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
      height="28"
      viewBox="0 0 24 24"
      width="28"
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
  const [sendBurstTrigger, setSendBurstTrigger] = useState(0);
  const [optimisticBody, setOptimisticBody] = useState<string | null>(null);
  const [sendState, sendAction, sendPending] = useActionState<
    VirtualCareChatActionState,
    FormData
  >(virtualCareChatAction, null);
  const refresh = useEffectEvent(onRefresh);

  const supabaseReady = data?.supabaseReady ?? false;
  const botEnabled = data?.botEnabled ?? false;
  const careTeamActive = data?.careTeamActive ?? false;
  const conversationId = data?.conversationId ?? null;
  const messages = data?.messages ?? [];
  const escalatedToPharmacistAt = data?.escalatedToPharmacistAt ?? null;
  const assistantActive = botEnabled && !careTeamActive && !escalatedToPharmacistAt;

  const displayMessages = useMemo(() => {
    if (!optimisticBody) {
      return messages;
    }

    const alreadyPersisted = messages.some(
      (m) => m.sender_type === 'customer' && m.body === optimisticBody,
    );

    if (alreadyPersisted) {
      return messages;
    }

    return [
      ...messages,
      {
        id: 'optimistic-customer',
        conversation_id: conversationId ?? 'pending',
        sender_type: 'customer' as const,
        body: optimisticBody,
        created_at: new Date().toISOString(),
      },
    ];
  }, [conversationId, messages, optimisticBody]);

  const showTyping = Boolean(sendPending && optimisticBody && assistantActive);
  const pollIntervalMs = conversationId ? CHAT_ACTIVE_POLL_MS : CHAT_IDLE_POLL_MS;

  useChatPollRefresh({
    enabled: supabaseReady,
    intervalMs: pollIntervalMs,
    onRefresh: refresh,
  });

  useChatBurstRefresh({
    trigger: sendBurstTrigger,
    onRefresh: refresh,
  });

  useEffect(() => {
    const el = scrollRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [displayMessages.length, showTyping]);

  useEffect(() => {
    if (sendPending) {
      formRef.current?.reset();
    }
  }, [sendPending]);

  useEffect(() => {
    if (!optimisticBody) {
      return;
    }

    const persisted = messages.some(
      (m) => m.sender_type === 'customer' && m.body === optimisticBody,
    );

    if (persisted && !sendPending) {
      setOptimisticBody(null);
    }
  }, [messages, optimisticBody, sendPending]);

  useEffect(() => {
    if (sendState?.error) {
      setOptimisticBody(null);
    }
  }, [sendState?.error]);

  useEffect(() => {
    if (sendState?.ok) {
      setSendBurstTrigger((value) => value + 1);
      refresh();
    }
  }, [sendState?.ok]);

  function handleSendSubmit(event: FormEvent<HTMLFormElement>) {
    const body = String(new FormData(event.currentTarget).get('body') ?? '').trim();

    if (body) {
      setOptimisticBody(body);
    }
  }

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
        {careTeamActive ? (
          <div className="rounded-xl border border-[#c5ccd4] bg-[#f4f6f8] px-3 py-2.5 text-xs text-[#3d4a36]">
            You&apos;re connected with a care team member. They&apos;ll reply here when available.
          </div>
        ) : assistantActive ? (
          <div className="rounded-xl border border-[#d4dfc8] bg-[#f8faf6] px-3 py-2.5 text-xs text-[#3d4a36]">
            Ask about products, orders, or your account. For medication advice, a pharmacist will
            join.
          </div>
        ) : escalatedToPharmacistAt ? (
          <div className="rounded-xl border border-[#d4dfc8] bg-[#f8faf6] px-3 py-2.5 text-xs text-[#3d4a36]">
            A pharmacist has been notified and will join this conversation.
          </div>
        ) : null}

        {!conversationId && displayMessages.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-[#2c2a26] shadow-sm">
            {assistantActive
              ? 'Hi! I can help with products, orders, prescriptions, and your account. What do you need?'
              : careTeamActive
                ? 'A care team member will join this conversation shortly.'
                : 'Send a message to our care team. Conversations are saved so we can follow up.'}
          </div>
        ) : null}

        {displayMessages.map((m) => {
          if (m.sender_type === 'system') {
            return <ChatSystemMessage body={m.body} key={m.id} />;
          }

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
                <ChatMessageBody body={m.body} />
                <p className="mt-1 text-[10px] opacity-75">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}

        {showTyping ? <ChatTypingIndicator /> : null}
      </div>

      <div className="border-t border-[#e8e2d8] bg-white p-3">
        <form
          action={sendAction}
          className="flex gap-2"
          onSubmit={handleSendSubmit}
          ref={formRef}
        >
          <input name="intent" type="hidden" value="send" />
          <input
            className="min-w-0 flex-1 rounded-xl border-0 bg-[#f0ebe3] px-3.5 py-3 text-sm text-[#2c2a26] outline-none placeholder:text-[#8a8176] focus:ring-2 focus:ring-[#8a9a7b]"
            disabled={sendPending}
            maxLength={8000}
            name="body"
            placeholder={
              careTeamActive
                ? 'Message the care team…'
                : assistantActive
                  ? 'Ask the store assistant…'
                  : 'Type your message'
            }
            required
            type="text"
          />
          <button
            className="liivv-btn-primary shrink-0 rounded-xl px-4 py-3 text-sm disabled:opacity-60"
            disabled={sendPending}
            type="submit"
          >
            Send
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
  const chatQuery = searchParams.get('chat');
  const openFromQuery = chatQuery === 'open';
  const [open, setOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<LiveChatWidgetData | null>(null);
  const [unreadStaffCount, setUnreadStaffCount] = useState(0);
  const pathnameRef = useRef(pathname);
  const skipPathnameRefreshRef = useRef(true);

  const refreshSession = useEffectEvent(async () => {
    const session = await getLiveChatSessionAction();

    setIsLoggedIn(session.isLoggedIn);
    setData(session.data);
    setSessionReady(true);
  });

  const refreshUnreadStaffCount = useEffectEvent(async () => {
    const result = await getLiveChatUnreadStaffCountAction();

    setUnreadStaffCount(result.count);
  });

  const markChatRead = useEffectEvent(async () => {
    await markLiveChatReadAction();
    setUnreadStaffCount(0);
  });

  useEffect(() => {
    if (openFromQuery) {
      void markChatRead();
      setOpen(true);
    }
  }, [openFromQuery]);

  useEffect(() => {
    const onOpen = () => {
      void markChatRead();
      setOpen(true);
    };

    window.addEventListener(LIVE_CHAT_OPEN_EVENT, onOpen);

    return () => window.removeEventListener(LIVE_CHAT_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) {
      skipPathnameRefreshRef.current = true;
      return;
    }

    setSessionReady(false);
    void refreshSession();
  }, [open]);

  useEffect(() => {
    if (!open) {
      pathnameRef.current = pathname;
      return;
    }

    if (skipPathnameRefreshRef.current) {
      skipPathnameRefreshRef.current = false;
      pathnameRef.current = pathname;
      return;
    }

    if (pathnameRef.current === pathname) {
      return;
    }

    pathnameRef.current = pathname;
    void refreshSession();
  }, [open, pathname]);

  useEffect(() => {
    if (!open || !openFromQuery) {
      return;
    }

    const soon = window.setTimeout(() => {
      void refreshSession();
    }, 500);

    const later = window.setTimeout(() => {
      void refreshSession();
    }, 1500);

    return () => {
      window.clearTimeout(soon);
      window.clearTimeout(later);
    };
  }, [open, openFromQuery]);

  useEffect(() => {
    if (!open || !sessionReady || isLoggedIn) {
      return;
    }

    const refreshAuth = () => {
      if (document.visibilityState === 'visible') {
        void refreshSession();
      }
    };

    void refreshAuth();

    const id = window.setInterval(refreshAuth, CHAT_GUEST_AUTH_POLL_MS);

    window.addEventListener('focus', refreshAuth);
    document.addEventListener('visibilitychange', refreshAuth);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', refreshAuth);
      document.removeEventListener('visibilitychange', refreshAuth);
    };
  }, [open, sessionReady, isLoggedIn]);

  useEffect(() => {
    if (open) {
      return;
    }

    void refreshUnreadStaffCount();

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshUnreadStaffCount();
      }
    }, CHAT_CLOSED_UNREAD_POLL_MS);

    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open || !sessionReady) {
      return;
    }

    void markChatRead();
  }, [open, sessionReady, data?.messages.length]);

  const clearChatQuery = () => {
    if (!openFromQuery) {
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
    void markChatRead();
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
                      ? data?.careTeamActive
                        ? 'Care team'
                        : data?.escalatedToPharmacistAt
                          ? 'Pharmacist requested'
                          : data?.botEnabled
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
          aria-label={
            unreadStaffCount > 0
              ? `Open live chat, ${unreadStaffCount} unread message${unreadStaffCount === 1 ? '' : 's'}`
              : 'Open live chat'
          }
          className="liivv-live-chat-launcher liivv-live-chat-launcher--icon-only pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a9a7b] focus-visible:ring-offset-2"
          onClick={handleOpen}
          type="button"
        >
          <ChatIcon />
          {unreadStaffCount > 0 ? (
            <span aria-hidden="true" className="liivv-live-chat-launcher__badge">
              {unreadStaffCount > 9 ? '9+' : unreadStaffCount}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
