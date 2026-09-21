'use client';

/*
 * =============================================================================
 * FRAGMENT LANDING — re-apply the URL fragment once the page is in the document
 * =============================================================================
 * Every page in this route group is streamed inside the Suspense boundary that
 * `(default)/loading.tsx` opens. The document the browser first receives holds
 * a spinner where this page's body will go; the body arrives afterwards inside
 * a `<div hidden>` that an inline script moves into place. By then the browser
 * has already looked for the fragment — `#red-flags`, `#card-6`, `#recovery-map`
 * — found nothing, and given up. The reader lands at the top of the chapter
 * instead of on the thing the link named.
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
 * - only a target that exists and can be scrolled to — a row the group rail has
 *   filtered away is hidden, and `scrollIntoView` on it does nothing.
 *
 * This is a workaround for the boundary, not a fix for it. With JavaScript off
 * the body is never moved into the document and no fragment resolves at all.
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
