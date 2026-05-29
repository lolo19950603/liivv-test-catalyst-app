'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface UseSectionScrollParallaxXOptions {
  /** Max horizontal shift in px (left at scroll start, right at scroll end). */
  maxOffsetPx?: number;
  disabled?: boolean;
}

/**
 * Maps scroll progress through `ref`'s viewport travel to horizontal translateX:
 * scrolling down shifts content right; scrolling up shifts it left.
 */
export function useSectionScrollParallaxX(
  ref: RefObject<HTMLElement | null>,
  options?: UseSectionScrollParallaxXOptions,
): number {
  const maxOffset = options?.maxOffsetPx ?? 56;
  const disabled = options?.disabled === true;
  const [offsetX, setOffsetX] = useState(0);
  const frameRef = useRef<number | null>(null);

  const update = useCallback(() => {
    frameRef.current = null;

    if (disabled || typeof window === 'undefined') {
      return;
    }

    const el = ref.current;

    if (el == null) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOffsetX(0);

      return;
    }

    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const range = rect.height + viewportH;

    if (range <= 0) {
      return;
    }

    const scrolled = viewportH - rect.top;
    const progress = clamp(scrolled / range, 0, 1);

    setOffsetX(lerp(-maxOffset, maxOffset, progress));
  }, [disabled, maxOffset, ref]);

  const schedule = useCallback(() => {
    if (frameRef.current != null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [disabled, schedule]);

  return offsetX;
}
