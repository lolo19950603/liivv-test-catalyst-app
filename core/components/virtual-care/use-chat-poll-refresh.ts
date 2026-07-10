'use client';

import { useEffect, useEffectEvent } from 'react';

export const CHAT_ACTIVE_POLL_MS = 2000;
export const CHAT_IDLE_POLL_MS = 15000;

export function useChatPollRefresh({
  enabled,
  intervalMs,
  onRefresh,
}: {
  enabled: boolean;
  intervalMs: number;
  onRefresh: () => void;
}) {
  const refresh = useEffectEvent(onRefresh);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}

export function useChatBurstRefresh({
  trigger,
  onRefresh,
}: {
  trigger: number;
  onRefresh: () => void;
}) {
  const refresh = useEffectEvent(onRefresh);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    refresh();

    const soon = window.setTimeout(() => {
      refresh();
    }, 500);

    const later = window.setTimeout(() => {
      refresh();
    }, 1500);

    return () => {
      window.clearTimeout(soon);
      window.clearTimeout(later);
    };
  }, [trigger]);
}
