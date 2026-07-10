'use client';

import { useEffect, useMemo, useState } from 'react';

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
  sendPending,
  sendState,
}: {
  messages: ChatMessageRow[];
  conversationId: string | null;
  assistantActive: boolean;
  sendPending: boolean;
  sendState: VirtualCareChatActionState;
}) {
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

  return {
    capturePendingSend,
    displayMessages,
    inputLocked: Boolean(pendingSend),
    showTyping,
  };
}
