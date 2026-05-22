'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';

export function IconChevronLeft() {
  return (
    <svg
      className="icon icon-chevron-left icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 6L8 12L14 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight() {
  return (
    <svg
      className="icon icon-chevron-right icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 6L16 12L10 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CarouselArrowButton({
  ariaLabel,
  controls,
  direction,
  disabled,
  onClick,
  variant = 'default',
}: {
  ariaLabel: string;
  controls?: string;
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  variant?: 'default' | 'overlay';
}) {
  if (variant === 'overlay') {
    return (
      <button
        aria-controls={controls}
        aria-label={ariaLabel}
        className="dc-carousel-arrow-overlay flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/50 text-current shadow-md backdrop-blur-[2px] transition enabled:hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        type="button"
      >
        {direction === 'prev' ? <IconChevronLeft /> : <IconChevronRight />}
      </button>
    );
  }

  return (
    <button
      aria-controls={controls}
      aria-label={ariaLabel}
      className="button button--secondary"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      type="button"
    >
      <span className="btn-fill sf-hidden" data-fill />
      <span className="btn-text">
        {direction === 'prev' ? <IconChevronLeft /> : <IconChevronRight />}
      </span>
      <span className="btn-loader">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

export type CarouselScrollSyncOptions = {
  /** How scroll position maps to the active slide. Use `start` for left-aligned strips. */
  scrollInline?: 'start' | 'center';
};

/** Debounced scroll-end sync for horizontal carousels. */
export function useCarouselScrollSync(
  stripRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  onIndexChange: (index: number) => void,
  enabled: boolean,
  options?: CarouselScrollSyncOptions,
) {
  const scrollInline = options?.scrollInline ?? 'center';
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const setItemRef = useCallback((el: HTMLElement | null, index: number) => {
    itemRefs.current[index] = el;
  }, []);

  const resolveIndexFromScroll = useCallback(() => {
    const strip = stripRef.current;

    if (!strip || itemCount === 0) {
      return;
    }

    let best = 0;

    if (scrollInline === 'start') {
      const anchor = strip.scrollLeft + 1;

      for (let i = 0; i < itemCount; i += 1) {
        const item = itemRefs.current[i];

        if (item != null && item.offsetLeft <= anchor + item.offsetWidth * 0.35) {
          best = i;
        }
      }
    } else {
      const center = strip.scrollLeft + strip.clientWidth / 2;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < itemCount; i += 1) {
        const item = itemRefs.current[i];

        if (item) {
          const mid = item.offsetLeft + item.offsetWidth / 2;
          const d = Math.abs(center - mid);

          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
      }
    }

    onIndexChange(best);
  }, [itemCount, onIndexChange, scrollInline, stripRef]);

  useEffect(() => {
    const strip = stripRef.current;

    if (!enabled || !strip || itemCount <= 1) {
      return;
    }

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
      resolveIndexFromScroll();
    };

    const onScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 220);
    };

    const onScrollEnd = () => {
      finish();
    };

    strip.addEventListener('scroll', onScroll, { passive: true });
    strip.addEventListener('scrollend', onScrollEnd);

    return () => {
      clearTimeout(idleTimer);
      strip.removeEventListener('scroll', onScroll);
      strip.removeEventListener('scrollend', onScrollEnd);
    };
  }, [enabled, itemCount, resolveIndexFromScroll, stripRef]);

  const scrollItemIntoView = useCallback(
    (index: number) => {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: scrollInline,
      });
    },
    [scrollInline],
  );

  return { setItemRef, scrollItemIntoView };
}
