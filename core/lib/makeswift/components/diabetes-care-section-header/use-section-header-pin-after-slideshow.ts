import { useEffect, type RefObject } from 'react';

const SLIDESHOW_SELECTOR = '.site-header-slideshow';
const PINNED_CLASS = 'header-pinned';

/** Hysteresis (px) so pin/unpin does not flicker at the slideshow edge. */
const PIN_ON_BELOW = -6;
const PIN_OFF_BELOW = 8;

function resolveShouldPin(
  slideshow: Element | null,
  section: HTMLElement,
  currentlyPinned: boolean,
): boolean {
  if (slideshow) {
    const bottom = slideshow.getBoundingClientRect().bottom;

    return currentlyPinned ? bottom <= PIN_OFF_BELOW : bottom <= PIN_ON_BELOW;
  }

  const top = section.getBoundingClientRect().top;

  return currentlyPinned ? top <= PIN_OFF_BELOW : top <= PIN_ON_BELOW;
}

function applyPinnedState(
  section: HTMLElement,
  spacer: HTMLElement | null,
  pinned: boolean,
): void {
  section.classList.toggle(PINNED_CLASS, pinned);

  if (spacer) {
    spacer.style.height = pinned ? `${String(section.offsetHeight)}px` : '0px';
  }
}

/**
 * Keeps the section header in normal flow until the slideshow scrolls away,
 * then pins to the viewport top. Updates DOM directly (no scroll-driven React state).
 */
export function useSectionHeaderPinAfterSlideshow(
  sectionRef: RefObject<HTMLDivElement | null>,
  spacerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const section = sectionRef.current;
    const spacer = spacerRef.current;

    if (!enabled || !section) {
      return;
    }

    let pinned = false;
    let frame = 0;

    const update = () => {
      const slideshow = document.querySelector(SLIDESHOW_SELECTOR);
      const shouldPin = resolveShouldPin(slideshow, section, pinned);

      if (shouldPin === pinned) {
        return;
      }

      pinned = shouldPin;
      applyPinnedState(section, spacer, pinned);
    };

    const scheduleUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    applyPinnedState(section, spacer, false);
    update();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    const slideshow = document.querySelector(SLIDESHOW_SELECTOR);
    const resizeObserver = new ResizeObserver(() => {
      if (pinned && spacer) {
        spacer.style.height = `${String(section.offsetHeight)}px`;
      }

      scheduleUpdate();
    });

    resizeObserver.observe(section);

    if (slideshow) {
      resizeObserver.observe(slideshow);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver.disconnect();

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      section.classList.remove(PINNED_CLASS);

      if (spacer) {
        spacer.style.height = '0px';
      }
    };
  }, [enabled, sectionRef, spacerRef]);
}
