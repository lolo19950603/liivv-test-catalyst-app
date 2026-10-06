/* Twin of ostomy-care/chapters/chapters-data.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * Where a site's pages live, as paths. Ostomy's LANDING, chapterHref, cardHref
 * and localeHref, with the landing read from the site rather than written in.
 * Plain functions with no client or server dependency, so the route, the
 * composer and the components all share them.
 */

import { defaultLocale } from '~/i18n/locales';

import type { SiteConfig } from '../site';

export function chapterHref(site: Pick<SiteConfig, 'basePath'>, slug: string) {
  return `${site.basePath}/chapters/${slug}`;
}

/* A card on a chapter page, by its 1-based number (the `#card-<n>` anchor). */
export function cardHref(site: Pick<SiteConfig, 'basePath'>, slug: string, card: number) {
  return `${chapterHref(site, slug)}#card-${card}`;
}

/*
 * A micro-site path in the page locale.
 *
 * These pages render plain <a>, not next-intl's <Link>, so nothing puts the
 * locale prefix on an href for them: on /fr a bare `/liivv-health/…` lands the
 * reader on the English page. Middleware redirects a reader whose NEXT_LOCALE
 * cookie says fr, at the cost of a hop, but a shared link, a crawler reading
 * the /fr alternates and anything that turns locale detection off all land in
 * English. `localePrefix` is 'as-needed' (i18n/routing.ts), so the default
 * locale keeps the bare path and every other locale takes a prefix.
 *
 * Anything that is not a site-absolute path — a same-document fragment, an
 * outward https:// link, a mailto: — is left exactly as it is.
 */
export function localeHref(href: string, locale: string) {
  if (locale === defaultLocale || !href.startsWith('/')) return href;

  return `/${locale}${href}`;
}
