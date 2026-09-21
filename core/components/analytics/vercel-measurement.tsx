'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { hasAdSignalsFlag, isSensitiveOstomyPath } from '~/lib/analytics/ad-signals';

/*
 * =============================================================================
 * VERCEL'S OWN MEASUREMENT OBEYS THE SAME RULE AS THE GTAG
 * =============================================================================
 * Web Analytics and Speed Insights are opt-OUT: they are on unless
 * DISABLE_VERCEL_ANALYTICS / DISABLE_VERCEL_SPEED_INSIGHTS are set to 'true' in
 * the Vercel project, and both report the URL of every page view. On this site
 * the URL is often the health fact — /liivv-health/ostomy-care/chapters/... says
 * why someone is reading, and an ostomy product's slug IS the product name
 * (/stay-hydrated-high-output-dehydration-rescue/). That is the same thing
 * ~/lib/analytics/ad-signals exists to keep out of the GA4 tag, sent to a third
 * party instead, with nobody's consent asked.
 *
 * So the two components stay, and their events are dropped on a health context
 * before they leave the browser.
 *
 * WHY beforeSend AND NOT AN UNMOUNT
 * -----------------------------------------------------------------------------
 * Not rendering <Analytics/> on an ostomy route only helps on a hard load.
 * Vercel's script installs its own history listener when it loads, so a visitor
 * who arrives on the home page and then navigates into a chapter has the script
 * running already, and unmounting the component removes the tag, not the
 * listener. `beforeSend` is consulted for every event the script sends, however
 * the page was reached, and returning null cancels it — so this holds on soft
 * navigation, which is how most readers will actually reach a chapter.
 *
 * WHAT COUNTS AS A HEALTH CONTEXT
 * -----------------------------------------------------------------------------
 * Two answers, either one enough, exactly as in ad-signals.ts:
 *
 *   the path    /liivv-health/ostomy-care/** in any locale, read from the event's
 *               own url so it is the page the event is about, not whatever is on
 *               screen by the time the event is flushed.
 *   the flag    the <DenyAdSignals/> meta tag the server renders. That is what
 *               covers the cases a path cannot see: an ostomy product's own
 *               page, an ostomy shelf, a cart holding ostomy supplies, and a
 *               search whose results hold a sensitive product.
 *
 * Reading the meta tag here is safe in a way it is not in
 * sensitive-scripts-provider.tsx: nothing is rendered from the answer, so there
 * is no server/browser mismatch to hydrate. `beforeSend` runs in the browser at
 * event time, when the tag is in the document.
 *
 * WHAT IS LOST, STATED PLAINLY
 * -----------------------------------------------------------------------------
 * Vercel sees no page view and no web vital for any ostomy route, any ostomy
 * PDP, the cart when it holds ostomy supplies, or a search that finds one. The
 * rest of the site is measured exactly as before. That is the same trade the
 * GA4 side makes, except that Vercel Web Analytics has no consent mode to
 * express it through, so the event is dropped rather than redacted.
 *
 * The two env vars are still the sitewide off switch, and they are documented in
 * `.env.example` and `docs/IT-Architecture.md`. Nothing in the code has ever
 * enforced them, which is why this filter does not depend on them.
 * =============================================================================
 */

/* Whether an event's own URL, or the page it is on, is a health context. */
function isSensitiveEvent(url: string): boolean {
  if (hasAdSignalsFlag()) {
    return true;
  }

  try {
    return isSensitiveOstomyPath(new URL(url, window.location.href).pathname);
  } catch {
    // An unparseable URL is not one of our routes, but it is also not something
    // to guess about: drop it rather than report an address nothing recognises.
    return true;
  }
}

export function VercelMeasurement({
  analytics,
  speedInsights,
}: {
  analytics: boolean;
  speedInsights: boolean;
}) {
  return (
    <>
      {analytics ? (
        <Analytics beforeSend={(event) => (isSensitiveEvent(event.url) ? null : event)} />
      ) : null}
      {speedInsights ? (
        <SpeedInsights beforeSend={(event) => (isSensitiveEvent(event.url) ? null : event)} />
      ) : null}
    </>
  );
}
