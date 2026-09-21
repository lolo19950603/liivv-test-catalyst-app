'use client';

import { useEffect, useRef } from 'react';

import {
  AD_SIGNALS_DENIED_EVENT,
  AD_SIGNALS_META_CONTENT,
  AD_SIGNALS_META_NAME,
} from '~/lib/analytics/ad-signals';

/*
 * Render this on any page whose context is a health fact — an ostomy route, an
 * ostomy shelf, an ostomy product's page, a cart holding ostomy supplies — and
 * the advertising signals are denied for the rest of the page session. See
 * ~/lib/analytics/ad-signals for why, and for what the tag does and does not
 * say.
 *
 * Two things happen, because a page arrives in two ways. The meta tag ships
 * with the server-rendered HTML, so the tag's very first consent command, sent
 * before gtag('js') and gtag('config'), already has the signals off. The event
 * covers everything after that: a client-side navigation into a chapter, a
 * cart whose contents changed under it, a product page whose sensitivity was
 * only known once its data had streamed in. The analytics provider listens.
 *
 * A client component, so the effect can fire — but it renders on the server
 * like any other, which is what makes the flag part of the first response.
 *
 * ONE TAG PER DOCUMENT, AND NEVER NONE
 * ---------------------------------------------------------------------------
 * React hoists a `<meta>` into <head> wherever it is rendered, and in this app
 * the client render appends its own rather than claiming the one the server
 * sent, which leaves two identical tags in <head> after hydration. Harmless to
 * the only reader — `hasAdSignalsFlag()` asks whether there is at least one —
 * but a tag that says "this page is about someone's ostomy" is not a thing to
 * leave lying around in duplicate for a third-party script to count.
 *
 * The duplicate is therefore cleared from the other side, and the render stays
 * unconditional: every mounted instance owns a tag of its own. That second
 * part matters. Two sensitive pages in a row, reached by a client-side
 * navigation, mount the incoming instance while the outgoing one is still on
 * screen. An instance that read the document first and declined to render
 * because a tag was already there would render nothing, and React would then
 * remove the tag belonging to the instance it is unmounting — leaving a page
 * the server marked sensitive with no flag at all, which is the one state the
 * flag must never be in. Render first and prune after cannot do that: the
 * count settles at one, never at zero.
 *
 * The prune keeps this instance's own tag — the ref, or failing that the last
 * one in <head>, which is where React appends what it creates — and removes
 * any other. The only other tag it can find is the unclaimed server-rendered
 * orphan, which React does not track and is free to delete; call sites render
 * at most one instance at a time, so it never finds a live React-owned tag
 * besides its own.
 */
export function DenyAdSignals() {
  const ownTag = useRef<HTMLMetaElement>(null);

  useEffect(() => {
    window.dispatchEvent(new Event(AD_SIGNALS_DENIED_EVENT));

    const tags = document.querySelectorAll<HTMLMetaElement>(`meta[name="${AD_SIGNALS_META_NAME}"]`);
    const keep = ownTag.current ?? tags[tags.length - 1];

    tags.forEach((tag) => {
      if (tag !== keep) {
        tag.remove();
      }
    });
  }, []);

  return <meta content={AD_SIGNALS_META_CONTENT} name={AD_SIGNALS_META_NAME} ref={ownTag} />;
}
