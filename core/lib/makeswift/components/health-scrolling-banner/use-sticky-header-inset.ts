'use client';

import { useEffect, useState } from 'react';

import { SCROLL_BANNER_SSR_STICKY_INSET_PX } from './scroll-banner-motion';

const DEFAULT_INSET_PX = SCROLL_BANNER_SSR_STICKY_INSET_PX;

function measureStickyHeaderInset(): number {
  if (typeof document === 'undefined') {
    return DEFAULT_INSET_PX;
  }

  const header =
    document.querySelector<HTMLElement>('.header-section.header-sticky') ??
    document.querySelector<HTMLElement>('.header-section') ??
    document.querySelector<HTMLElement>('header[is="sticky-header"]');

  const height = header?.getBoundingClientRect().height;

  return height != null && height > 0 ? Math.round(height) : DEFAULT_INSET_PX;
}

/** Matches archive `sticky-element` `--inset` (sticky nav height). */
export function useStickyHeaderInset(defaultInsetPx = DEFAULT_INSET_PX): number {
  const [insetPx, setInsetPx] = useState(defaultInsetPx);

  useEffect(() => {
    const update = () => {
      setInsetPx(measureStickyHeaderInset());
    };

    update();
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
  }, [defaultInsetPx]);

  return insetPx;
}
