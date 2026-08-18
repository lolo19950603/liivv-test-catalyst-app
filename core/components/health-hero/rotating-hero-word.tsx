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

  return (
    <span aria-live="polite" className={className} key={word}>
      {word}
    </span>
  );
}
