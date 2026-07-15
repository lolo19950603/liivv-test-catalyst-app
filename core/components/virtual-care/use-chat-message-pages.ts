'use client';

import { useEffect, useEffectEvent, useRef, useState, type RefObject } from 'react';

import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

export type LoadOlderChatMessages = (beforeCreatedAt: string) => Promise<
  | { ok: true; messages: ChatMessageRow[]; hasMoreOlder: boolean }
  | { ok: false; error: string }
>;

function mergeChatMessages(
  existing: ChatMessageRow[],
  incoming: ChatMessageRow[],
): ChatMessageRow[] {
  const map = new Map<string, ChatMessageRow>();

  for (const message of existing) {
    map.set(message.id, message);
  }

  for (const message of incoming) {
    map.set(message.id, message);
  }

  return [...map.values()].sort((a, b) => {
    const byTime = a.created_at.localeCompare(b.created_at);

    return byTime !== 0 ? byTime : a.id.localeCompare(b.id);
  });
}

export function useChatMessagePages({
  conversationId,
  recentMessages,
  recentHasMoreOlder,
  scrollRef,
  loadOlderMessages,
}: {
  conversationId: string | null;
  recentMessages: ChatMessageRow[];
  recentHasMoreOlder: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  loadOlderMessages: LoadOlderChatMessages;
}) {
  const [messages, setMessages] = useState<ChatMessageRow[]>(recentMessages);
  const [hasMoreOlder, setHasMoreOlder] = useState(recentHasMoreOlder);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const conversationIdRef = useRef(conversationId);
  const stickToBottomRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const suppressAutoScrollRef = useRef(false);

  useEffect(() => {
    if (conversationId !== conversationIdRef.current) {
      conversationIdRef.current = conversationId;
      setMessages(recentMessages);
      setHasMoreOlder(recentHasMoreOlder);
      stickToBottomRef.current = true;
      return;
    }

    setMessages((previous) => mergeChatMessages(previous, recentMessages));
  }, [conversationId, recentHasMoreOlder, recentMessages]);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el || suppressAutoScrollRef.current) {
      suppressAutoScrollRef.current = false;
      return;
    }

    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, scrollRef]);

  const loadOlder = useEffectEvent(async () => {
    if (
      !conversationId ||
      !hasMoreOlder ||
      loadingOlderRef.current ||
      messages.length === 0
    ) {
      return;
    }

    const oldest = messages[0];

    if (!oldest) {
      return;
    }

    const el = scrollRef.current;
    const previousHeight = el?.scrollHeight ?? 0;

    loadingOlderRef.current = true;
    setLoadingOlder(true);

    try {
      const result = await loadOlderMessages(oldest.created_at);

      if (!result.ok) {
        return;
      }

      suppressAutoScrollRef.current = true;
      setMessages((previous) => mergeChatMessages(result.messages, previous));
      setHasMoreOlder(result.hasMoreOlder);

      requestAnimationFrame(() => {
        const node = scrollRef.current;

        if (node) {
          node.scrollTop = node.scrollHeight - previousHeight;
        }
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  });

  function handleScroll() {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    stickToBottomRef.current = distanceFromBottom < 96;

    if (el.scrollTop < 72) {
      void loadOlder();
    }
  }

  return {
    messages,
    hasMoreOlder,
    loadingOlder,
    handleScroll,
  };
}
