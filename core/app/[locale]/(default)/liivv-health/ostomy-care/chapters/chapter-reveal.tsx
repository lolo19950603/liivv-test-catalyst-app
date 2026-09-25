'use client';

import { type ReactNode } from 'react';

import { useInViewAnimate } from '~/lib/makeswift/diabetes-care-scroll-animate';

/*
 * Fade a block in once, the same way the diabetes-care sections do. The hide
 * rule lives in chapter-page.css and steps aside for reduced motion, print,
 * and pages with scripting off, so a crisis line is never the thing waiting
 * on an animation.
 *
 * Living Trail variants: clearing (gates), stone (shelves), media (photos).
 */
export type ChapterRevealVariant = 'entry' | 'gate' | 'clearing' | 'stone' | 'media' | 'default';

export function ChapterReveal({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: ChapterRevealVariant;
}) {
  const threshold = variant === 'gate' || variant === 'clearing' ? 0.28 : 0.16;
  const { ref, animated } = useInViewAnimate({ threshold });

  const base = variant === 'default' ? 'oc-ch-reveal' : `oc-ch-reveal oc-ch-reveal--${variant}`;

  return (
    <div className={animated ? `${base} is-shown` : base} ref={ref}>
      {children}
    </div>
  );
}
