'use client';

import { useConsentManager } from '@c15t/nextjs/client';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';

import { FragmentOf } from '~/client/graphql';
import { usePathname } from '~/i18n/routing';
import { Analytics } from '~/lib/analytics';
import {
  AD_SIGNALS_DENIED_EVENT,
  isAdSignalDenialRequired,
  isSensitiveLinkHref,
} from '~/lib/analytics/ad-signals';
import { GoogleAnalyticsProvider } from '~/lib/analytics/providers/google-analytics';
import { AnalyticsProvider as AnalyticsProviderLib } from '~/lib/analytics/react';
import { getConsentCookie } from '~/lib/consent-manager/cookies/client';

import { WebAnalyticsFragment } from './fragment';

interface Props {
  channelId: number;
  isCookieConsentEnabled: boolean;
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
}

/*
 * The Google provider as well as the dispatcher, because turning advertising
 * signals off is a Google Analytics instruction, not an ecommerce event: it
 * has no place on the provider-agnostic Analytics interface.
 */
interface Instrumentation {
  analytics: Analytics;
  googleAnalytics: GoogleAnalyticsProvider;
}

const getConsent = () => {
  const consentCookie = getConsentCookie();

  if (!consentCookie) {
    return null;
  }

  return {
    functionality: consentCookie['c.functionality'],
    marketing: consentCookie['c.marketing'],
    measurement: consentCookie['c.measurement'],
    necessary: consentCookie['c.necessary'],
  };
};

const getAnalytics = ({
  channelId,
  isCookieConsentEnabled,
  settings,
}: Props): Instrumentation | null => {
  if (settings?.webAnalytics?.ga4?.tagId && channelId) {
    const googleAnalytics = new GoogleAnalyticsProvider({
      gaId: settings.webAnalytics.ga4.tagId,
      consentModeEnabled: isCookieConsentEnabled,
      developerId: 'dMjk3Nj',
      getConsent,
      // Read while the tag is being set up, so the first consent command
      // already knows what page this is.
      isSensitiveContext: () => isAdSignalDenialRequired(),
    });

    return {
      analytics: new Analytics({
        channelId,
        providers: [googleAnalytics],
      }),
      googleAnalytics,
    };
  }

  return null;
};

export function AnalyticsProvider({
  channelId,
  isCookieConsentEnabled,
  settings,
  children,
}: PropsWithChildren<Props>) {
  const { consents } = useConsentManager();
  const prevConsentsRef = useRef<Record<string, boolean> | null>(null);
  const adSignalsDeniedRef = useRef(false);
  const pathname = usePathname();

  const instrumentation = getAnalytics({
    channelId,
    isCookieConsentEnabled,
    settings,
  });
  const analytics = instrumentation?.analytics ?? null;
  const googleAnalytics = instrumentation?.googleAnalytics ?? null;

  /*
   * Once denied, denied for the rest of the page session. Someone who has read
   * a chapter and moved on to a general shelf is still the same person, and a
   * signal sent a route later is no less about them.
   *
   * The page parameters go with the signals, and for the same reason. Denying
   * ad_storage keeps an ostomy URL out of advertising; it does nothing about
   * the URL itself, which GA4's enhanced measurement sends as page_location on
   * every history change with analytics_storage still granted. On a hard load
   * the tag's own config already carries the redaction (`configParams`); this
   * is every other way into a health context, and it is deliberately the same
   * call site and the same condition, so the two can never disagree about
   * whether this page is one. Both are sticky for the document — see
   * `redactPage` for why lifting the redaction cannot be done honestly.
   */
  const denyAdSignals = useCallback(
    (force = false) => {
      if (adSignalsDeniedRef.current && !force) {
        return;
      }

      googleAnalytics?.denyAdSignals();
      googleAnalytics?.redactPage();
      adSignalsDeniedRef.current = true;
    },
    [googleAnalytics],
  );

  /*
   * The first load is already covered: the page's server-rendered flag was
   * read while the tag's consent default was being written. This is for
   * everything after it — a client-side navigation into a health context, and
   * the event a <DenyAdSignals/> fires when it mounts on a page the path alone
   * does not give away (a cart holding ostomy supplies, a product page whose
   * data had to stream in first).
   *
   * Declared before the consent effect below so that on mount this one runs
   * first, and the flag it sets is true by the time that one reads it.
   */
  useEffect(() => {
    if (!googleAnalytics) {
      return;
    }

    const denyIfSensitive = () => {
      if (isAdSignalDenialRequired(pathname)) {
        denyAdSignals();
      }
    };

    /*
     * ON THE INTENT TO NAVIGATE, NOT ON THE ARRIVAL
     * ---------------------------------------------------------------------
     * This effect runs after React has committed the new route, and by then
     * the App Router has already called history.pushState. GA4's enhanced
     * measurement listens for exactly that, so a history-change page_view can
     * carry the ostomy URL out ahead of the denial. There is no router hook
     * here that fires before the push — `usePathname` is the push, already
     * happened — so the earliest honest moment is the press itself: a
     * pointerdown on a link, or the Enter that activates a focused one. Both
     * are before the router is asked.
     *
     * A false positive costs nothing worth keeping. The denial only takes
     * advertising signals away, it never grants them, and it is sticky for
     * the page session — so a link pressed and not followed is treated the
     * same as one that is, and that is the right way round.
     *
     * The page redaction rides along on the same press, and there the false
     * positive does cost something: a link pressed and not followed leaves
     * the rest of that document's page_views reported as `/redacted`. Still
     * the right way round. Firing after the push instead would mean the
     * history-change page_view had already gone out with the ostomy URL on
     * it, and a lost URL is recoverable from the next hard load while a sent
     * one is not.
     *
     * `denyIfSensitive` below stays as the backstop, for every other way into
     * a route: a redirect, a router.push from code, the back button.
     */
    const denyBeforeNavigation = (event: Event) => {
      const { target } = event;

      if (!(target instanceof Element)) {
        return;
      }

      const href = target.closest('a')?.getAttribute('href');

      if (href != null && isSensitiveLinkHref(href, window.location.href)) {
        denyAdSignals();
      }
    };

    const denyBeforeKeyNavigation = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        denyBeforeNavigation(event);
      }
    };

    denyIfSensitive();

    window.addEventListener(AD_SIGNALS_DENIED_EVENT, denyIfSensitive);
    // Capture, so a handler that stops propagation cannot stop this.
    document.addEventListener('pointerdown', denyBeforeNavigation, true);
    document.addEventListener('keydown', denyBeforeKeyNavigation, true);

    return () => {
      window.removeEventListener(AD_SIGNALS_DENIED_EVENT, denyIfSensitive);
      document.removeEventListener('pointerdown', denyBeforeNavigation, true);
      document.removeEventListener('keydown', denyBeforeKeyNavigation, true);
    };
  }, [denyAdSignals, googleAnalytics, pathname]);

  // Update consent when user changes preferences
  useEffect(() => {
    if (!isCookieConsentEnabled || !analytics) {
      return;
    }

    const currentConsents = consents;
    const prevConsents = prevConsentsRef.current;

    // Check if consents have changed
    if (prevConsents && JSON.stringify(currentConsents) !== JSON.stringify(prevConsents)) {
      const consentState = getConsent();

      if (consentState) {
        /*
         * That update re-states marketing consent across the board, so on a
         * page where the advertising signals are off it would hand them back.
         * Masked here, in the command itself, rather than corrected by a
         * second command afterwards: gtag acts on a consent update the moment
         * it is pushed — it is what releases the tags held under
         * wait_for_update — so a 'granted' it saw for even one command is a
         * 'granted' it acted on. A cookie banner never asked whether health
         * browsing could be advertised against; ticking "marketing" is an
         * answer to a different question.
         */
        const onSensitivePage = adSignalsDeniedRef.current;

        analytics.consent.consentUpdated(
          onSensitivePage ? { ...consentState, marketing: false } : consentState,
        );

        /*
         * Belt and braces, and the only thing that re-states
         * ads_data_redaction, which a consent update does not carry.
         */
        if (onSensitivePage) {
          denyAdSignals(true);
        }
      }
    }

    prevConsentsRef.current = currentConsents;
  }, [isCookieConsentEnabled, analytics, consents, denyAdSignals]);

  return <AnalyticsProviderLib analytics={analytics ?? null}>{children}</AnalyticsProviderLib>;
}
