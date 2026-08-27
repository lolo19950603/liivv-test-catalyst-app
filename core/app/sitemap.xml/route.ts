/* eslint-disable check-file/folder-naming-convention */
/*
 * Proxy to the existing BigCommerce sitemap index on the canonical URL,
 * with our own App Router sitemaps appended.
 *
 * BigCommerce only knows about catalog and CMS pages, so anything built as an
 * App Router route (the Liivv Health microsites, for instance) has to be listed
 * separately or it is invisible to search engines.
 */

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { defaultLocale } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

/** App Router sitemaps to splice into the BigCommerce index. */
const EXTRA_SITEMAP_PATHS = ['/liivv-health-sitemap.xml'];

const CLOSING_TAG = '</sitemapindex>';

export const GET = async () => {
  const sitemapIndex = await client.fetchSitemapIndex(getChannelIdFromLocale(defaultLocale));

  const extraEntries = await Promise.all(
    EXTRA_SITEMAP_PATHS.map(async (path) => {
      const { canonical } = await getMetadataAlternates({
        path,
        locale: defaultLocale,
        includeAlternates: false,
      });

      // getMetadataAlternates may append a trailing slash depending on
      // TRAILING_SLASH; a sitemap URL must not have one.
      const loc = canonical.endsWith('/') ? canonical.slice(0, -1) : canonical;

      return `  <sitemap><loc>${loc}</loc></sitemap>`;
    }),
  );

  // If BigCommerce ever returns something unexpected, serve it untouched rather
  // than emitting malformed XML.
  const body = sitemapIndex.includes(CLOSING_TAG)
    ? sitemapIndex.replace(CLOSING_TAG, `${extraEntries.join('\n')}\n${CLOSING_TAG}`)
    : sitemapIndex;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
