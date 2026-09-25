'use client';

/*
 * =============================================================================
 * FRAGMENT LANDING — re-apply the URL fragment once the page is in the document
 * =============================================================================
 * This was written for a boundary that no longer exists. Every page in this
 * route group used to be streamed inside the Suspense boundary that
 * `(default)/loading.tsx` opened: the document the browser first received held a
 * spinner where the page's body would go, the body arrived afterwards inside a
 * `<div hidden>` that an inline script moved into place, and by then the browser
 * had already looked for the fragment — `#red-flags`, `#card-6`,
 * `#recovery-map` — found nothing, and given up. That file has been removed and
 * the body is in the first flush of the HTML, so the browser resolves the
 * fragment itself. This now guards nothing in the common case and could be
 * retired; it is left in place because it is inert once the browser has scrolled
 * (see the `scrollY` guard below), and removing it belongs with a check of every
 * fragment link rather than with the boundary change.
 *
 * The situation doors are what made this visible. Four of the six point at a
 * fragment on a chapter page, and the urgent one promises "Emergency signs
 * first, then who to ask" while dropping the reader more than a thousand pixels
 * above the emergency list.
 *
 * So: once, on the first mount, if the reader has not scrolled, put them where
 * the fragment said. `scrollIntoView` honours the `scroll-margin-top` these
 * anchors already carry, so the target clears the sticky header exactly as it
 * does when the same link is followed from inside the page.
 *
 * Guards, in order:
 * - one frame after mount, so the streamed body is in the document and laid out;
 * - only when `scrollY` is still 0, so this never fights a browser that got
 *   there on its own, a restored scroll position, or a reader who has started
 *   reading;
 * - only on the first mount, so a later hash change is left to the browser;
 * - only a target that exists and can be scrolled to. A card inside a horizontal
 *   group row is still in the document, so the browser scrolls that row sideways
 *   as well as the page.
 *
 * With JavaScript off none of this runs — and it no longer needs to: the body is
 * in the served HTML, so the browser resolves the fragment on its own.
 * =============================================================================
 */

import { useEffect } from 'react';

/* A hand-typed or truncated fragment can be invalid percent-encoding. */
function decodeFragment(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function HashTargetScroll() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const { hash } = window.location;

      if (hash.length < 2 || window.scrollY > 0) return;

      document.getElementById(decodeFragment(hash.slice(1)))?.scrollIntoView();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
