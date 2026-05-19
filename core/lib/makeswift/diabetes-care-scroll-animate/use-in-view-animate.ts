'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -6% 0px',
  threshold: 0.12,
};

export interface UseInViewAnimateOptions {
  /** Skip observing (e.g. parent drives animation via context). */
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/** Scroll-into-view animation trigger; keeps `dc-animated` in React state to avoid hydration mismatches. */
export function useInViewAnimate(options?: UseInViewAnimateOptions) {
  const ref = useRef<HTMLElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (options?.disabled === true) {
      return;
    }

    const element = ref.current;

    if (element == null) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      setAnimated(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          setAnimated(true);
          observer.disconnect();
        });
      },
      {
        ...DEFAULT_OBSERVER_OPTIONS,
        rootMargin: options?.rootMargin ?? DEFAULT_OBSERVER_OPTIONS.rootMargin,
        threshold: options?.threshold ?? DEFAULT_OBSERVER_OPTIONS.threshold,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options?.disabled, options?.rootMargin, options?.threshold]);

  return { ref, animated };
}
