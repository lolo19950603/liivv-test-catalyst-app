import { useEffect, type RefObject } from 'react';

const SLIDESHOW_SELECTOR = '.site-header-slideshow';
const PINNED_CLASS = 'header-pinned';

/**
 * Pin/unpin thresholds (px from viewport top).
 *
 * - `PIN_ON_BELOW = 0`: pin the instant the slideshow's bottom reaches the
 *   viewport top, so the first body component aligns cleanly to the bottom
 *   of the now-fixed header without needing any post-hoc scroll correction.
 * - `PIN_OFF_BELOW = 8`: unpin only when the slideshow bottom is well back
 *   below the viewport top — keeps the 8 px hysteresis vs. pin so we don't
 *   thrash on tiny scrolls.
 */
const PIN_ON_BELOW = 0;
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
 * Pins a header after the site slideshow scrolls away (same behavior as diabetes-care section header).
 * Updates the DOM directly to avoid scroll-driven React re-renders.
 */
export function useHeaderPinAfterSlideshow(
  sectionRef: RefObject<HTMLElement | null>,
  spacerRef: RefObject<HTMLElement | null>,
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
