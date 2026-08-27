/* eslint-disable check-file/folder-naming-convention */
/*
 * Liivv Health microsite sitemap.
 *
 * These are App Router pages, so BigCommerce's own sitemap knows nothing about
 * them — without this file the microsites and their chapters are invisible to
 * search engines, which matters because they are the acquisition surface.
 *
 * Referenced from the sitemap index in ../sitemap.xml/route.ts.
 *
 * English URLs only, on purpose: the microsite copy is hardcoded English JSX,
 * so the /fr/ variants render English. Listing them would be duplicate content.
 * Add them here once the copy is translated.
 */

import { CHAPTER_SLUGS } from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/chapters-data';
import { defaultLocale } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

/** Landing pages for every vertical that is actually live. */
const LANDING_PATHS = [
  '/liivv-health',
  '/liivv-health/ostomy-care',
  '/liivv-health/diabetes-care',
  '/liivv-health/womens-health',
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET = async () => {
  const paths = [
    ...LANDING_PATHS,
    ...CHAPTER_SLUGS.map((slug) => `/liivv-health/ostomy-care/chapters/${slug}`),
  ];

  const urls = await Promise.all(
    paths.map(async (path) => {
      const { canonical } = await getMetadataAlternates({
        path,
        locale: defaultLocale,
        includeAlternates: false,
      });

      return canonical;
    }),
  );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
