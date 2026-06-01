import type { CSSProperties } from 'react';

/** Stable SSR / first-paint defaults — updated after mount to avoid hydration mismatch. */
export const SCROLL_BANNER_SSR_VIEWPORT_HEIGHT = 900;
export const SCROLL_BANNER_SSR_STICKY_INSET_PX = 160;

/** Breathing room between sticky header and banner content (archive `media--100vh` `- 40px`). */
export const SCROLL_BANNER_TOP_GAP_PX = 40;

export type ScrollBannerMotion = {
  progress: number;
  segmentIndex: number;
  segmentProgress: number;
};

export function resolveScrollBannerMotion(panelCount: number, progress: number): ScrollBannerMotion {
  if (panelCount <= 1) {
    return { progress, segmentIndex: 0, segmentProgress: 0 };
  }

  const segments = panelCount - 1;
  const scaled = progress * segments;
  const segmentIndex = Math.min(Math.floor(scaled), panelCount - 1);
  const segmentProgress = scaled - Math.floor(scaled);

  return { progress, segmentIndex, segmentProgress };
}

/** Vertical wipe between outgoing and incoming panel images while scrolling. */
export function scrollBannerImageLayerStyle(
  index: number,
  panelCount: number,
  segmentIndex: number,
  segmentProgress: number,
): CSSProperties {
  if (panelCount <= 1) {
    return index === 0
      ? { zIndex: 1, clipPath: 'inset(0 0 0 0)' }
      : { zIndex: 0, clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' };
  }

  if (index < segmentIndex) {
    return { zIndex: 0, clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' };
  }

  if (index > segmentIndex + 1) {
    return { zIndex: 0, clipPath: 'inset(100% 0 0 0)', pointerEvents: 'none' };
  }

  if (index === segmentIndex) {
    if (segmentProgress <= 0 || index === panelCount - 1) {
      return { zIndex: 2, clipPath: 'inset(0 0 0 0)' };
    }

    return {
      zIndex: 2,
      clipPath: `inset(0 0 ${String(segmentProgress * 100)}% 0)`,
    };
  }

  if (segmentProgress >= 1) {
    return { zIndex: 2, clipPath: 'inset(0 0 0 0)' };
  }

  return {
    zIndex: 1,
    clipPath: `inset(${(1 - segmentProgress) * 100}% 0 0 0)`,
  };
}

export function isScrollBannerContentRevealed(
  index: number,
  panelCount: number,
  segmentIndex: number,
): boolean {
  if (panelCount <= 1) {
    return index === 0;
  }

  return index === segmentIndex;
}

export function scrollBannerContentLayerStyle(
  index: number,
  panelCount: number,
  segmentIndex: number,
  _segmentProgress: number,
): CSSProperties {
  const revealed = isScrollBannerContentRevealed(index, panelCount, segmentIndex);

  if (panelCount <= 1) {
    return revealed
      ? { pointerEvents: 'auto', zIndex: 1 }
      : { pointerEvents: 'none', zIndex: 0 };
  }

  return {
    pointerEvents: revealed ? 'auto' : 'none',
    zIndex: revealed ? 2 : index === segmentIndex + 1 ? 1 : 0,
  };
}

export function scrollBannerTrackHeightPx(
  panelCount: number,
  segmentPx: number,
  viewportHeight: number,
  stickyInsetPx: number,
): number {
  if (panelCount <= 1) {
    return Math.max(segmentPx, viewportHeight - stickyInsetPx - SCROLL_BANNER_TOP_GAP_PX);
  }

  const visibleHeight = Math.max(
    viewportHeight - stickyInsetPx - SCROLL_BANNER_TOP_GAP_PX,
    segmentPx,
  );

  return (panelCount - 1) * segmentPx + visibleHeight;
}

export function computeScrollBannerProgress(
  trackEl: HTMLElement,
  stickyInsetPx: number,
): number {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollable =
    trackEl.offsetHeight - (viewportHeight - stickyInsetPx - SCROLL_BANNER_TOP_GAP_PX);

  if (scrollable <= 0) {
    return 0;
  }

  const scrolled = stickyInsetPx - trackEl.getBoundingClientRect().top;

  return Math.min(1, Math.max(0, scrolled / scrollable));
}
