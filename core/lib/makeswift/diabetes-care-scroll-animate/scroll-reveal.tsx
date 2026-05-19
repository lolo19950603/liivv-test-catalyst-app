'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import { useInViewAnimate } from './use-in-view-animate';

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animate?: 'fade-up' | 'fade-up-large';
  /** Delay in ms before the block animates (after scroll into view). */
  delayMs?: number;
}

/** Fades/slides a section block up when scrolled into view. */
export function ScrollReveal({
  children,
  className,
  style: styleProp,
  animate = 'fade-up',
  delayMs = 0,
}: ScrollRevealProps) {
  const { ref, animated } = useInViewAnimate();

  const style: CSSProperties | undefined =
    delayMs > 0 || styleProp != null
      ? {
          ...styleProp,
          ...(delayMs > 0 ? ({ '--dc-animate-delay': delayMs } as CSSProperties) : {}),
        }
      : undefined;

  return (
    <div
      ref={ref}
      className={clsx(className, animated && 'dc-animated')}
      data-animate={animate}
      data-dc-scroll-reveal
      style={style}
    >
      {children}
    </div>
  );
}
