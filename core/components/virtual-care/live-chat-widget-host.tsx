'use client';

import { Suspense } from 'react';

import { LiveChatWidget } from '~/components/virtual-care/live-chat-widget';

export function LiveChatWidgetHost() {
  return (
    <Suspense fallback={null}>
      <LiveChatWidget />
    </Suspense>
  );
}
