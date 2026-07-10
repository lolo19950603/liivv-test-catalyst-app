'use client';

import { startTransition, useEffect, useMemo, useState, type FormEvent } from 'react';

import type { VirtualCareChatActionState } from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';
import type { ChatMessageRow } from '~/lib/supabase/chat-messages';

type PendingSend = {
  body: string;
  baselineMessageCount: number;
  baselineBotCount: number;
};

function countBotMessages(messages: ChatMessageRow[]): number {
  return messages.filter((m) => m.sender_type === 'bot').length;
}

function hasNewCustomerMessage(messages: ChatMessageRow[], pendingSend: PendingSend): boolean {
  return messages
    .slice(pendingSend.baselineMessageCount)
    .some((m) => m.sender_type === 'customer' && m.body === pendingSend.body);
}

export function useChatOptimisticSend({
  messages,
  conversationId,
  assistantActive,
  sendAction,
  sendPending,
  sendState,
}: {
  messages: ChatMessageRow[];
  conversationId: string | null;
  assistantActive: boolean;
  sendAction: (formData: FormData) => void;
  sendPending: boolean;
  sendState: VirtualCareChatActionState;
}) {
  const [draft, setDraft] = useState('');
  const [pendingSend, setPendingSend] = useState<PendingSend | null>(null);

  const displayMessages = useMemo(() => {
    if (!pendingSend) {
      return messages;
    }

    if (hasNewCustomerMessage(messages, pendingSend)) {
      return messages;
    }

    return [
      ...messages,
      {
        id: 'optimistic-customer',
        conversation_id: conversationId ?? 'pending',
        sender_type: 'customer' as const,
        body: pendingSend.body,
        created_at: new Date().toISOString(),
      },
    ];
  }, [conversationId, messages, pendingSend]);

  const showTyping = Boolean(
    pendingSend &&
      assistantActive &&
      countBotMessages(messages) === pendingSend.baselineBotCount,
  );

  useEffect(() => {
    if (!pendingSend) {
      return;
    }

    if (sendState?.error) {
      setPendingSend(null);
      return;
    }

    const customerPersisted = hasNewCustomerMessage(messages, pendingSend);
    const botResponded = countBotMessages(messages) > pendingSend.baselineBotCount;

    if (assistantActive && botResponded) {
      setPendingSend(null);
      return;
    }

    if (!sendPending && customerPersisted) {
      setPendingSend(null);
    }
  }, [assistantActive, messages, pendingSend, sendPending, sendState?.error]);

  function capturePendingSend(body: string) {
    setPendingSend({
      body,
      baselineMessageCount: messages.length,
      baselineBotCount: countBotMessages(messages),
    });
  }

  function handleSendSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = draft.trim();

    if (!body || pendingSend) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    formData.set('body', body);
    capturePendingSend(body);
    setDraft('');
    startTransition(() => {
      sendAction(formData);
    });
  }

  return {
    draft,
    displayMessages,
    handleSendSubmit,
    inputLocked: Boolean(pendingSend),
    setDraft,
    showTyping,
  };
}
