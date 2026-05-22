'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { SplittingBannerRevealContext } from './splitting-banner-reveal-context';

const MOBILE_REVEAL_MQ = '(max-width: 1023px)';

function revealProgress(tracker: Element, mobile: boolean): number {
  const { top } = tracker.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const revealStart = viewportHeight;
  /** Shorter scroll range on phone/tablet so the portrait image follows sooner. */
  const revealEnd = viewportHeight * (mobile ? 0.5 : 0.35);
  const range = revealStart - revealEnd;

  if (range <= 0) {
    return 1;
  }

  return Math.min(1, Math.max(0, (revealStart - top) / range));
}

/**
 * Scroll-driven headline reveal for the diabetes-care “Meet Armaan…” banner.
 * Replaces the Shopify theme `splitting-banner` custom element (needs `html.js`).
 */
export function SplittingBanner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [headlineRevealed, setHeadlineRevealed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;

    if (root == null) {
      return;
    }

    const tracker = root.querySelector('.reveal-banner__tracker');
    const wrapper = root.querySelector('.splitting-wrapper');

    if (tracker == null || wrapper == null) {
      return;
    }

    const wrapperEl = wrapper as HTMLElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const inEditorPreview = window.self !== window.top;

    const showImmediately = (): void => {
      wrapperEl.style.opacity = '1';
      setHeadlineRevealed(true);
    };

    if (reducedMotion) {
      showImmediately();

      return;
    }

    let raf = 0;

    const update = (): void => {
      raf = 0;

      const mobile = window.matchMedia(MOBILE_REVEAL_MQ).matches;
      let progress = revealProgress(tracker, mobile);
      let revealed = progress >= (mobile ? 0.08 : 0.12);

      if (inEditorPreview && progress < 0.85) {
        const scroller = root.querySelector('.reveal-banner__scroller');

        if (scroller != null) {
          const rect = scroller.getBoundingClientRect();
          const visibleHeight =
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
          const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

          if (visibleRatio > (mobile ? 0.12 : 0.25)) {
            progress = 1;
            revealed = true;
          }
        }
      }

      wrapperEl.style.opacity = String(progress);
      setHeadlineRevealed(revealed);
    };

    const scheduleUpdate = (): void => {
      if (raf !== 0) {
        return;
      }

      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);

      if (raf !== 0) {
        window.cancelAnimationFrame(raf);
      }

      wrapperEl.style.removeProperty('opacity');
    };
  }, []);

  return (
    <SplittingBannerRevealContext.Provider value={headlineRevealed}>
      <div className={clsx(className)} ref={rootRef}>
        {children}
      </div>
    </SplittingBannerRevealContext.Provider>
  );
}
