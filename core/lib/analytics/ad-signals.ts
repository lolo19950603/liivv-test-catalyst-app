/*
 * =============================================================================
 * WHERE ADVERTISING SIGNALS ARE TURNED OFF
 * =============================================================================
 * Suppressing a product's name from an ecommerce event (see
 * ~/lib/analytics/sensitive-products) keeps the item out of the report. It
 * does nothing about the page itself: gtag('config') sends an automatic
 * page_view carrying page_location and page_title, and with ad_storage granted
 * that view is available for advertising and for building an audience. On
 * /liivv-health/ostomy-care/chapters/first-weeks the URL *is* the health fact.
 *
 * So the advertising half of consent is denied outright wherever the context
 * reveals something about a person's body. The OPC's guidance on meaningful
 * consent treats health information as sensitive and normally needing express
 * consent, and its position on online behavioural advertising is that health
 * data should be kept out of it. Nobody has given that consent here, so the
 * honest default is off.
 *
 * Two answers say a page is such a context, and either one is enough:
 *
 *   the flag    the server renders <DenyAdSignals/> (a meta tag) on the page —
 *               ostomy routes, ostomy shelves, an ostomy product's own page,
 *               and a cart that holds ostomy supplies. The server is the only
 *               side that knows the last two.
 *   the path    /liivv-health/ostomy-care/** in any locale. Belt and braces:
 *               it holds even if a page forgets the flag, and it is true
 *               before a streamed part of the page has arrived.
 *
 * The flag is a meta tag rather than a cookie or a storage entry on purpose.
 * "This person is shopping for ostomy supplies" must not be written anywhere
 * that outlives the page or travels on a later request; the tag lives and dies
 * with the document, and on the cart page it says nothing the rendered line
 * items do not already say.
 *
 * Deliberately no "granted" counterpart: this module can only turn signals
 * off, never back on. Denial is sticky for the page session.
 * =============================================================================
 */

import { locales } from '~/i18n/locales';

/** Marks a page whose advertising signals must be denied. */
export const AD_SIGNALS_META_NAME = 'liivv-ad-signals';
export const AD_SIGNALS_META_CONTENT = 'denied';

/**
 * Dispatched on `window` when a page that needs the denial mounts, so the
 * analytics provider hears about a context it cannot see from the path — a
 * cart whose contents changed, or an ostomy product page that streamed in
 * after the provider had already looked.
 */
export const AD_SIGNALS_DENIED_EVENT = 'liivv:ad-signals-denied';

const OSTOMY_PATH = /^\/liivv-health\/ostomy-care(?:\/|$)/;

/*
 * The path without its locale segment, so one pattern answers for every
 * locale. `usePathname` from `~/i18n/routing` has already done this;
 * `window.location.pathname` has not.
 */
function withoutLocale(pathname: string): string {
  const firstSegment = pathname.split('/')[1];

  if (firstSegment !== undefined && locales.includes(firstSegment)) {
    return pathname.slice(firstSegment.length + 1) || '/';
  }

  return pathname;
}

/* An ostomy route: the URL alone reveals why someone is reading. */
export function isSensitiveOstomyPath(pathname: string): boolean {
  return OSTOMY_PATH.test(withoutLocale(pathname));
}

/*
 * Whether following this link would land on an ostomy route.
 *
 * The href is read exactly as it was written on the anchor — it may be
 * relative, a bare fragment, or somewhere else entirely — so it is resolved
 * against the page it was found on. Another origin is not one of our routes
 * and cannot be one; an unparseable href is not either.
 */
export function isSensitiveLinkHref(href: string, documentUrl: string): boolean {
  try {
    const target = new URL(href, documentUrl);

    if (target.origin !== new URL(documentUrl).origin) {
      return false;
    }

    return isSensitiveOstomyPath(target.pathname);
  } catch {
    return false;
  }
}

/* Whether the server marked this document with <DenyAdSignals/>. */
export function hasAdSignalsFlag(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  return document.querySelector(`meta[name="${AD_SIGNALS_META_NAME}"]`) !== null;
}

/*
 * Whether the advertising signals must be denied for the page on screen.
 *
 * Pass the pathname where you have one (the provider has it from
 * `usePathname`); with no argument it reads the document's own location, which
 * is what the tag's own initialisation has to do.
 */
export function isAdSignalDenialRequired(pathname?: string): boolean {
  if (hasAdSignalsFlag()) {
    return true;
  }

  const path = pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);

  return path !== '' && isSensitiveOstomyPath(path);
}
