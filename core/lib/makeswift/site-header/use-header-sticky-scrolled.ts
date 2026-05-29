import { useEffect, type RefObject } from 'react';

const SCROLLED_CLASS = 'header-scrolled';

/**
 * Toggles `header-scrolled` on the header section when a sticky header is stuck
 * to the viewport top. Matches archive Shopify behavior (flattens top radii so
 * page content does not bleed through rounded corners while scrolling).
 *
 * Uses a 1px sentinel immediately before the sticky section — no React state on scroll.
 */
export function useHeaderStickyScrolled(
  sectionRef: RefObject<HTMLElement | null>,
  sentinelRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    const sentinel = sentinelRef.current;

    if (!enabled || !section || !sentinel) {
      return;
    }

    const apply = (isStuck: boolean) => {
      section.classList.toggle(SCROLLED_CLASS, isStuck);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        apply(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      section.classList.remove(SCROLLED_CLASS);
    };
  }, [enabled, sectionRef, sentinelRef]);
}
