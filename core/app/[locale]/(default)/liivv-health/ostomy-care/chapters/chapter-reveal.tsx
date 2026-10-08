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
  /*
   * Shown once its top passes 85% of the window's height (gates 80%), not once
   * a share of it is on screen: a card about four windows tall could not show
   * 16% of itself under the header, so a jump to it landed on a blank space
   * (owner note 6, 2026-10-07).
   */
  const rootMargin =
    variant === 'gate' || variant === 'clearing' ? '0px 0px -20% 0px' : '0px 0px -15% 0px';
  const { ref, animated } = useInViewAnimate({ rootMargin, threshold: 0 });

  const base = variant === 'default' ? 'oc-ch-reveal' : `oc-ch-reveal oc-ch-reveal--${variant}`;

  return (
    <div className={animated ? `${base} is-shown` : base} ref={ref}>
      {children}
    </div>
  );
}
