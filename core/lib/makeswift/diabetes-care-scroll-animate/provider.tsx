'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -6% 0px',
  threshold: 0.12,
};

function activateElement(root: Element): void {
  root.classList.add('dc-animated');

  root.querySelectorAll('[data-dc-animate-child]').forEach((child) => {
    child.classList.add('dc-animated');
  });

  root.querySelectorAll('.highlighted-text').forEach((em) => {
    em.classList.add('animated');
  });
}

function observeElement(element: Element, observer: IntersectionObserver): void {
  if (element.classList.contains('dc-animated')) {
    return;
  }

  observer.observe(element);
}

function collectAnimateRoots(container: HTMLElement): Element[] {
  return Array.from(
    container.querySelectorAll(
      '[data-animate]:not(.dc-animated), [data-dc-scroll-reveal]:not(.dc-animated)',
    ),
  );
}

export function DiabetesCareScrollAnimateProvider({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (container == null) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      collectAnimateRoots(container).forEach(activateElement);

      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        activateElement(entry.target);
        observer.unobserve(entry.target);
      });
    }, OBSERVER_OPTIONS);

    const scan = (): void => {
      collectAnimateRoots(container).forEach((el) => {
        observeElement(el, observer);
      });
    };

    scan();

    const mutationObserver = new MutationObserver(scan);

    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
