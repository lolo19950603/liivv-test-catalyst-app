'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const SHOW_DELAY_MS = 120;
const SAFETY_TIMEOUT_MS = 12_000;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldShowForAnchor(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (isModifiedClick(event)) {
    return false;
  }

  if (anchor.hasAttribute('download')) {
    return false;
  }

  const target = anchor.getAttribute('target');

  if (target && target !== '_self') {
    return false;
  }

  const href = anchor.getAttribute('href');

  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  try {
    const nextUrl = new URL(href, window.location.href);

    if (nextUrl.origin !== window.location.origin) {
      return false;
    }

    const current = `${window.location.pathname}${window.location.search}`;
    const next = `${nextUrl.pathname}${nextUrl.search}`;

    return current !== next;
  } catch {
    return false;
  }
}

export function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigatingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const stopNavigating = useCallback(() => {
    navigatingRef.current = false;
    clearTimers();
    setVisible(false);
  }, [clearTimers]);

  const startNavigating = useCallback(() => {
    if (navigatingRef.current) {
      return;
    }

    navigatingRef.current = true;
    clearTimers();

    showTimerRef.current = setTimeout(() => {
      if (navigatingRef.current) {
        setVisible(true);
      }
    }, SHOW_DELAY_MS);

    safetyTimerRef.current = setTimeout(() => {
      stopNavigating();
    }, SAFETY_TIMEOUT_MS);
  }, [clearTimers, stopNavigating]);

  useEffect(() => {
    stopNavigating();
  }, [pathname, search, stopNavigating]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a');

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!shouldShowForAnchor(anchor, event)) {
        return;
      }

      startNavigating();
    };

    const onPopState = () => {
      startNavigating();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      clearTimers();
    };
  }, [clearTimers, startNavigating]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#faf8f3]/80 backdrop-blur-[1px]"
      role="status"
    >
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-[#e0d9ce]">
        <div className="h-full w-full origin-left animate-pulse bg-[#6b7f5c]" />
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-[#e0d9ce] bg-white px-5 py-3.5 text-sm text-[#2c2a26] shadow-sm">
        <span
          aria-hidden
          className="inline-block size-4 animate-spin rounded-full border-2 border-[#6b7f5c] border-t-transparent"
        />
        <span>Loading page…</span>
      </div>
    </div>
  );
}
