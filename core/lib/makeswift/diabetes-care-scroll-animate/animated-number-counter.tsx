'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_DURATION_SEC = 2;

export interface AnimatedNumberCounterProps {
  value: string;
  /** Seconds to count up (archive `data-duration`). */
  durationSec?: number;
}

interface ParsedCounterValue {
  target: number;
  decimals: number;
}

function parseCounterValue(raw: string): ParsedCounterValue | null {
  const normalized = raw.trim().replace(/,/g, '');

  if (normalized.length === 0) {
    return null;
  }

  const target = Number(normalized);

  if (Number.isNaN(target)) {
    return null;
  }

  const fraction = normalized.split('.')[1];

  return {
    target,
    decimals: fraction != null ? fraction.length : 0,
  };
}

function formatCounterValue(amount: number, decimals: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function runCountUp(
  parsed: ParsedCounterValue,
  durationSec: number,
  onUpdate: (display: string) => void,
): () => void {
  const durationMs = durationSec * 1000;
  const start = performance.now();
  let frame = 0;

  const tick = (now: number): void => {
    const progress = Math.min((now - start) / durationMs, 1);
    const current = parsed.target * easeOutCubic(progress);

    onUpdate(formatCounterValue(current, parsed.decimals));

    if (progress < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      onUpdate(formatCounterValue(parsed.target, parsed.decimals));
    }
  };

  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
  };
}

/** Count-up animation for stat values (Shopify `number-counter` custom element). */
export function AnimatedNumberCounter({
  value,
  durationSec = DEFAULT_DURATION_SEC,
}: AnimatedNumberCounterProps) {
  const parsed = useMemo(() => parseCounterValue(value), [value]);
  const ref = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);
  const [display, setDisplay] = useState(() =>
    parsed != null ? formatCounterValue(0, parsed.decimals) : value,
  );

  useEffect(() => {
    if (parsed == null) {
      setDisplay(value);

      return;
    }

    const element = ref.current;

    if (element == null) {
      return;
    }

    const showFinal = (): void => {
      setDisplay(formatCounterValue(parsed.target, parsed.decimals));
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      showFinal();

      return;
    }

    let cancelCountUp: (() => void) | undefined;

    const startAnimation = (): void => {
      if (hasStarted.current) {
        return;
      }

      hasStarted.current = true;
      setDisplay(formatCounterValue(0, parsed.decimals));
      cancelCountUp = runCountUp(parsed, durationSec, setDisplay);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting !== true) {
          return;
        }

        startAnimation();
        observer.disconnect();
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.2 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelCountUp?.();
    };
  }, [durationSec, parsed, value]);

  if (parsed == null) {
    return <span>{value}</span>;
  }

  return (
    <span data-duration={String(durationSec)} ref={ref}>
      {display}
    </span>
  );
}
