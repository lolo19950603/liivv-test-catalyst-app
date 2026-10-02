'use client';

import { useLayoutEffect } from 'react';

/*
 * A client navigation into a category keeps the scroll offset of the page you
 * left. Ostomy Essentials is a sticky-header link on a very long landing page,
 * so the shelf opened already most of the way down — the footer, not the grid.
 * Next's own scroll reset bails out when some node is already on screen, which
 * is exactly the case when you were scrolled into the previous page.
 *
 * The reset is deferred a tick so it runs after that handler. Back and forward
 * are left alone: the browser is restoring a position on purpose. A fragment
 * is left alone too.
 */

let restoringHistory = false;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    restoringHistory = true;
  });
}

export function CategoryScrollReset() {
  useLayoutEffect(() => {
    if (restoringHistory) {
      restoringHistory = false;

      return;
    }

    if (window.location.hash.length > 1) return;

    const reset = () => {
      window.scrollTo(0, 0);
    };

    reset();

    const timer = window.setTimeout(reset, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
