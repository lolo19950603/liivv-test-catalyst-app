'use client';

import { Suspense } from 'react';

import { LiveChatWidget } from '~/components/virtual-care/live-chat-widget';

function LiveChatLauncherFallback() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end p-4 sm:p-5">
      <div
        aria-hidden="true"
        className="liivv-live-chat-launcher h-[50px] w-[148px] opacity-90"
      />
    </div>
  );
}

export function LiveChatWidgetHost() {
  return (
    <Suspense fallback={<LiveChatLauncherFallback />}>
      <LiveChatWidget />
    </Suspense>
  );
}
