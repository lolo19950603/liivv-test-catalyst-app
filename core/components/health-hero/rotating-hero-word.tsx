'use client';

import { useEffect, useState } from 'react';

export function RotatingHeroWord({
  className,
  intervalMs = 2600,
  words,
}: {
  className?: string;
  intervalMs?: number;
  words: readonly string[];
}) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);

    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, reduceMotion, words]);

  const word = words[index] ?? words[0] ?? '';

  /*
   * Not a live region.
   *
   * This used to carry aria-live="polite", so the interval re-announced the
   * heading every 2.6 seconds for the whole visit — WCAG 2.2.2 (auto-updating,
   * auto-started, indefinite, no pause) and, because the span sits inside the
   * h1, heading navigation returned a different primary heading each time.
   *
   * The rotation is decoration. Assistive tech gets the first word once, as a
   * stable accessible name; prefers-reduced-motion is honoured above but is not
   * a substitute for this, since it is not a pause mechanism.
   */
  return (
    <>
      <span aria-hidden className={className} key={word}>
        {word}
      </span>
      <span className="sr-only">{words[0] ?? ''}</span>
    </>
  );
}
