'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { SplittingBannerRevealContext } from './splitting-banner-reveal-context';

const MOBILE_REVEAL_MQ = '(max-width: 1023px)';
/** Prefer the stacked stage; fall back to cover media / root. */
const STAGE_SELECTOR = '.dcrift-reveal-stage, .dcrift-reveal-media, .reveal-banner__cover-media';

/** Ease-out so the last bit of the fade lingers a little longer. */
function easeFadeOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));

  return 1 - (1 - clamped) * (1 - clamped);
}

/**
 * Opacity for a headline layered on the portrait:
 * fully visible while the stage sits in view, then slowly fades as it scrolls up.
 * No sticky cover / image-over-text runway.
 */
function resolveHeadlineOpacity(stage: Element, mobile: boolean): number {
  const rect = stage.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Fully off-screen — hide.
  if (rect.bottom <= 0 || rect.top >= viewportHeight) {
    return 0;
  }

  /**
   * Stay fully opaque while the portrait is mostly on screen. Start fading once
   * the top edge is near the top of the viewport; finish over ~0.6vh more scroll.
   */
  const fadeStartY = viewportHeight * (mobile ? 0.18 : 0.12);
  const fadeRange = viewportHeight * (mobile ? 0.6 : 0.7);
  const fadeEndY = fadeStartY - fadeRange;

  if (rect.top >= fadeStartY) {
    return 1;
  }

  if (rect.top <= fadeEndY) {
    return 0;
  }

  const raw = (fadeStartY - rect.top) / (fadeStartY - fadeEndY);

  return Math.max(0, 1 - easeFadeOut(raw));
}

/**
 * Scroll-driven headline fade for Reveal + story (“Meet Mya” on the cutout).
 * Headline is composited on the image; opacity only — no sticky cover runway.
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

    const wrapper = root.querySelector('.splitting-wrapper');

    if (wrapper == null) {
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
      const stage = root.querySelector(STAGE_SELECTOR) ?? root;
      let opacity = resolveHeadlineOpacity(stage, mobile);

      if (inEditorPreview && opacity < 0.85) {
        const rect = stage.getBoundingClientRect();
        const visibleHeight =
          Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

        if (visibleRatio > (mobile ? 0.12 : 0.2)) {
          opacity = 1;
        }
      }

      wrapperEl.style.opacity = String(opacity);
      wrapperEl.style.visibility = opacity <= 0.01 ? 'hidden' : 'visible';
      setHeadlineRevealed(opacity > 0.05);
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

    const stageEl = root.querySelector(STAGE_SELECTOR);
    const resizeObserver =
      stageEl != null && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            scheduleUpdate();
          })
        : null;

    if (stageEl != null && resizeObserver != null) {
      resizeObserver.observe(stageEl);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();

      if (raf !== 0) {
        window.cancelAnimationFrame(raf);
      }

      wrapperEl.style.removeProperty('opacity');
      wrapperEl.style.removeProperty('visibility');
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
