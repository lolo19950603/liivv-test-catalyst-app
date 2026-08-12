'use client';

import { useEffect, useState } from 'react';

/**
 * Shared Women's Health motion: prefers-reduced-motion + scroll reveals
 * for `[data-reveal]` / `[data-reveal-stagger]` under a page root.
 */
export function useWhMotion(rootId: string) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const root = document.getElementById(rootId);
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    const reveal = (el: Element) => {
      el.classList.add('is-revealed');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );

    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
      if (inView) reveal(node);
      else io.observe(node);
    }

    return () => io.disconnect();
  }, [reduceMotion, rootId]);

  return {
    reduceMotion,
    rootClassName: reduceMotion ? 'wh-motion is-reduce-motion' : 'wh-motion',
  };
}
