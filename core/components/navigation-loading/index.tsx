'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { OliviaSpinner } from '~/components/olivia/olivia-spinner';

/** Delay before showing so fast navigations never flash a progress UI. */
const SHOW_DELAY_MS = 400;
const SAFETY_TIMEOUT_MS = 12_000;

const START_EVENT = 'liivv:navigation-loading-start';
const STOP_EVENT = 'liivv:navigation-loading-stop';

type StartDetail = {
  /** Skip the delay and show the full loading screen immediately. */
  immediate?: boolean;
};

export function startNavigationLoading(options?: StartDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(START_EVENT, { detail: options ?? {} }));
}

export function stopNavigationLoading() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(STOP_EVENT));
}

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
  const [isImmediate, setIsImmediate] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigatingRef = useRef(false);
  const isImmediateRef = useRef(false);

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
    isImmediateRef.current = false;
    clearTimers();
    setVisible(false);
    setIsImmediate(false);
  }, [clearTimers]);

  const startNavigating = useCallback(
    (options?: StartDetail) => {
      const showImmediately = options?.immediate === true;

      if (navigatingRef.current) {
        if (showImmediately && !isImmediateRef.current) {
          isImmediateRef.current = true;
          setIsImmediate(true);
          setVisible(true);
        }

        return;
      }

      navigatingRef.current = true;
      isImmediateRef.current = showImmediately;
      clearTimers();
      setIsImmediate(showImmediately);

      if (showImmediately) {
        setVisible(true);
      } else {
        showTimerRef.current = setTimeout(() => {
          if (navigatingRef.current) {
            setVisible(true);
          }
        }, SHOW_DELAY_MS);
      }

      safetyTimerRef.current = setTimeout(() => {
        stopNavigating();
      }, SAFETY_TIMEOUT_MS);
    },
    [clearTimers, stopNavigating],
  );

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

    const onStart = (event: Event) => {
      const detail = (event as CustomEvent<StartDetail>).detail;
      startNavigating(detail);
    };

    const onStop = () => {
      stopNavigating();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    window.addEventListener(START_EVENT, onStart);
    window.addEventListener(STOP_EVENT, onStop);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(START_EVENT, onStart);
      window.removeEventListener(STOP_EVENT, onStop);
      clearTimers();
    };
  }, [clearTimers, startNavigating, stopNavigating]);

  if (!visible) {
    return null;
  }

  if (isImmediate) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#faf8f3]/90"
        role="status"
      >
        <OliviaSpinner caption="Olivia is fetching that…" />
      </div>
    );
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      role="status"
    >
      <span className="sr-only">Olivia is fetching that…</span>
      <div className="olivia-nav-runner">
        <div className="olivia-nav-runner__track">
          <div className="olivia-nav-runner__bar" />
        </div>
      </div>
    </div>
  );
}
