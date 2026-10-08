'use client';

import { useSearchParams } from 'next/navigation';
import { useLayoutEffect } from 'react';

const ANCHOR_ID = 'ostomy-shop-anchor';
const RESULTS_ID = 'ostomy-shop-results';

/*
 * Page 2 of this shelf is shorter than page 1. Next keeps the scroll offset of
 * the pager, then the browser clamps it, so the next page opens on the footer
 * instead of the new products. Scroll to the grid once the page param changes.
 * A fresh visit is left to CategoryScrollReset.
 *
 * The grid can suspend while the next page loads. `pendingResultsScroll` asks
 * the grid, once it is back, to finish the scroll.
 */

let pendingResultsScroll = false;
let settledPage: string | null = null;
let requestedPage: string | null = null;
let deferredScroll = false;

function scrollTo(id: string) {
  const target = document.getElementById(id);

  if (!target) {
    return false;
  }

  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - margin;

  window.scrollTo(0, Math.max(0, top));

  return true;
}

function scrollToResultsIfPresent() {
  if (!scrollTo(RESULTS_ID)) {
    return false;
  }

  pendingResultsScroll = false;

  if (requestedPage) {
    settledPage = requestedPage;
  }

  return true;
}

function scrollToCurrentTarget() {
  if (scrollToResultsIfPresent()) {
    return;
  }

  scrollTo(ANCHOR_ID);
}

export function OstomyShopPageScroll() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ?? '1';

  useLayoutEffect(() => {
    return () => {
      pendingResultsScroll = false;
      settledPage = null;
      requestedPage = null;
      deferredScroll = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!deferredScroll && (settledPage === null || settledPage === page)) {
      settledPage ??= page;

      return;
    }

    requestedPage = page;
    pendingResultsScroll = true;
    deferredScroll = true;
    scrollToCurrentTarget();

    const timer = window.setTimeout(() => {
      deferredScroll = false;
      scrollToCurrentTarget();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [page]);

  return null;
}

export function OstomyShopResultsScroll() {
  useLayoutEffect(() => {
    if (!pendingResultsScroll) {
      return;
    }

    scrollToResultsIfPresent();

    const timer = window.setTimeout(scrollToResultsIfPresent, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
