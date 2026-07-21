'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Delay before showing so fast navigations never flash a progress UI. */
const SHOW_DELAY_MS = 400;
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
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      role="status"
    >
      <span className="sr-only">Loading page…</span>
      <div className="h-0.5 w-full overflow-hidden bg-[#e0d9ce]/80">
        <div className="h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] bg-[#6b7f5c]" />
      </div>
      <style>{`
        @keyframes nav-progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
