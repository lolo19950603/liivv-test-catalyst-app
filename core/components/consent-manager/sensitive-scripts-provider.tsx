'use client';

import { ClientSideOptionsProvider } from '@c15t/nextjs/client';
import type { PropsWithChildren } from 'react';

import { usePathname } from '~/i18n/routing';
import { isSensitiveOstomyPath } from '~/lib/analytics/ad-signals';

import type { C15tScripts } from './consent-providers';

/*
 * =============================================================================
 * STORE SCRIPTS OBEY THE SAME RULE AS THE GTAG
 * =============================================================================
 * Denying ad_storage, ad_user_data and ad_personalization speaks to the GA4 tag
 * and to nothing else. BigCommerce Script Manager injects whatever the store
 * has configured, and a script in the TARGETING category — a Meta pixel, a
 * Google Ads tag — arrives here mapped to 'marketing' (scripts-transformer.ts)
 * and is handed straight to c15t, which on this channel gates nothing because
 * the cookie banner is off.
 *
 * Nothing loads today: the channel has no Script Manager scripts. This is the
 * day marketing adds one, and it would otherwise fire on
 * /liivv-health/ostomy-care/** carrying the URL — the health fact the rest of
 * ~/lib/analytics/ad-signals exists to keep out of advertising.
 *
 * So marketing scripts are dropped on ostomy routes. Every other category still
 * loads, on every page: this withholds advertising, not measurement or
 * functionality.
 *
 * Matched on the path alone, deliberately, and NOT on the <DenyAdSignals/> meta
 * tag the pages also render. The tag is invisible to the server, so reading it
 * here would render one script list on the server and a different one in the
 * browser — a hydration mismatch in the root layout. The path is the same
 * answer on both sides.
 *
 * Residual, recorded: that leaves the two contexts only the server can see —
 * an ostomy product's own PDP and a cart holding ostomy supplies — outside this
 * filter. They keep the gtag denial and the item suppression; a store script in
 * the marketing category would still load there.
 * =============================================================================
 */
export function SensitiveScriptsProvider({
  children,
  scripts,
}: PropsWithChildren<{ scripts: C15tScripts }>) {
  const pathname = usePathname();
  const safeScripts = isSensitiveOstomyPath(pathname)
    ? scripts.filter((script) => script.category !== 'marketing')
    : scripts;

  return <ClientSideOptionsProvider scripts={safeScripts}>{children}</ClientSideOptionsProvider>;
}
