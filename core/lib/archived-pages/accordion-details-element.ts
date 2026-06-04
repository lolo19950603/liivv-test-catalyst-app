const CONTENT_SELECTOR = '.details__content';

const CONTENT_TRANSITION =
  'opacity var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1)), transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1))';

const HEIGHT_TRANSITION =
  'height var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1))';

const CLOSED_OFFSET = 'translateY(-10px)';
const OPEN_OFFSET = 'translateY(0)';

const ANIMATION_FALLBACK_MS = 550;

const DETAILS_SELECTOR =
  'details.details[is="accordion-details"], details.details[is=accordion-details]';

const boundDetails = new WeakSet<HTMLDetailsElement>();

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function syncAriaExpanded(details: HTMLDetailsElement): void {
  details.setAttribute('aria-expanded', details.open ? 'true' : 'false');
}

function summaryHeight(details: HTMLDetailsElement): number {
  const summary = details.querySelector('summary');

  return summary?.offsetHeight ?? details.offsetHeight;
}

function applyOpenStyles(details: HTMLDetailsElement, persist: boolean): void {
  const content = details.querySelector<HTMLElement>(CONTENT_SELECTOR);

  if (content != null && persist) {
    resetContentStyles(content);
  } else if (content != null) {
    content.style.opacity = '1';
    content.style.transform = OPEN_OFFSET;
  }

  if (persist) {
    details.style.overflow = 'visible';
    details.style.height = 'auto';
    details.style.transition = '';
  }
}

function clearPanelStyles(details: HTMLDetailsElement): void {
  details.style.overflow = '';
  details.style.height = '';
  details.style.transition = '';
}

function resetContentStyles(content: HTMLElement): void {
  content.style.opacity = '';
  content.style.transform = '';
  content.style.transition = '';
}

function openAccordion(details: HTMLDetailsElement): void {
  const content = details.querySelector<HTMLElement>(CONTENT_SELECTOR);

  if (content == null || prefersReducedMotion()) {
    details.open = true;
    syncAriaExpanded(details);
    applyOpenStyles(details, true);
    return;
  }

  const startHeight = summaryHeight(details);

  details.style.overflow = 'hidden';
  details.style.height = `${startHeight}px`;
  details.style.transition = HEIGHT_TRANSITION;

  details.open = true;
  syncAriaExpanded(details);

  content.style.transition = CONTENT_TRANSITION;
  content.style.opacity = '0';
  content.style.transform = CLOSED_OFFSET;

  const targetHeight = details.scrollHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      details.style.height = `${targetHeight}px`;
      content.style.opacity = '1';
      content.style.transform = OPEN_OFFSET;
    });
  });

  let finished = false;

  const finish = (): void => {
    if (finished) {
      return;
    }

    finished = true;
    applyOpenStyles(details, true);
    content.style.transition = '';
  };

  const onTransitionEnd = (transitionEvent: TransitionEvent): void => {
    if (transitionEvent.target !== details || transitionEvent.propertyName !== 'height') {
      return;
    }

    details.removeEventListener('transitionend', onTransitionEnd);
    finish();
  };

  details.addEventListener('transitionend', onTransitionEnd);
  window.setTimeout(finish, ANIMATION_FALLBACK_MS);
}

function closeAccordion(details: HTMLDetailsElement, state: { closing: boolean }): void {
  const content = details.querySelector<HTMLElement>(CONTENT_SELECTOR);

  if (content == null || prefersReducedMotion()) {
    details.open = false;
    syncAriaExpanded(details);
    clearPanelStyles(details);
    return;
  }

  if (state.closing) {
    return;
  }

  state.closing = true;

  const startHeight = details.scrollHeight;
  const endHeight = summaryHeight(details);

  details.style.overflow = 'hidden';
  details.style.height = `${startHeight}px`;
  details.style.transition = HEIGHT_TRANSITION;
  content.style.transition = CONTENT_TRANSITION;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      details.style.height = `${endHeight}px`;
      content.style.opacity = '0';
      content.style.transform = CLOSED_OFFSET;
    });
  });

  let finished = false;

  const finish = (): void => {
    if (finished) {
      return;
    }

    finished = true;
    state.closing = false;
    details.open = false;
    syncAriaExpanded(details);
    clearPanelStyles(details);
    resetContentStyles(content);
  };

  const onTransitionEnd = (transitionEvent: TransitionEvent): void => {
    if (transitionEvent.target !== details || transitionEvent.propertyName !== 'height') {
      return;
    }

    details.removeEventListener('transitionend', onTransitionEnd);
    finish();
  };

  details.addEventListener('transitionend', onTransitionEnd);
  window.setTimeout(finish, ANIMATION_FALLBACK_MS);
}

function isAccordionHydrationPending(details: HTMLDetailsElement): boolean {
  return details.closest('[data-accordion-hydration-pending]') != null;
}

function bindAccordionDetails(details: HTMLDetailsElement): () => void {
  const state = { closing: false };
  const summary = details.querySelector('summary');

  if (details.open) {
    syncAriaExpanded(details);
  }

  const onSummaryClick = (event: MouseEvent): void => {
    event.preventDefault();

    if (state.closing) {
      return;
    }

    if (details.open) {
      closeAccordion(details, state);
    } else {
      openAccordion(details);
    }
  };

  summary?.addEventListener('click', onSummaryClick);

  return () => {
    summary?.removeEventListener('click', onSummaryClick);
    details.removeAttribute('aria-expanded');
    clearPanelStyles(details);
    const content = details.querySelector<HTMLElement>(CONTENT_SELECTOR);

    if (content != null) {
      resetContentStyles(content);
    }

    boundDetails.delete(details);
  };
}

/** Binds height + fade animations to archive `<details is="accordion-details">` nodes. */
export function initAccordionDetails(root: ParentNode = document): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLDetailsElement>(DETAILS_SELECTOR).forEach((details) => {
    if (boundDetails.has(details) || isAccordionHydrationPending(details)) {
      return;
    }

    boundDetails.add(details);
    cleanups.push(bindAccordionDetails(details));
  });

  return () => {
    cleanups.forEach((cleanup) => {
      cleanup();
    });
  };
}

/**
 * Binds accordion click handlers after mount. `aria-expanded` is rendered in React
 * (`archiveAccordionDetailsProps`); this must not set attributes before Suspense children hydrate.
 */
export function scheduleAccordionDetailsInit(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let teardown: (() => void) | undefined;
  let observer: MutationObserver | undefined;
  let timeoutId = 0;

  const start = (): void => {
    teardown = initAccordionDetails(document);
    observer = new MutationObserver(() => {
      initAccordionDetails(document);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const scheduleStart = (): void => {
    requestAnimationFrame(() => {
      requestAnimationFrame(start);
    });
  };

  timeoutId = window.setTimeout(scheduleStart, 0);

  return () => {
    window.clearTimeout(timeoutId);
    observer?.disconnect();
    teardown?.();
  };
}
