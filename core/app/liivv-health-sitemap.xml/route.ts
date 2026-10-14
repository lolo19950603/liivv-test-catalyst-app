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
 *
 * The one exception is a Diabetes Care engine chapter, whose French waits on
 * review under its `chapter:<slug>` gate: its /fr/ URL is listed once the owner
 * has opened that gate in FR_REVIEWED, and not before. Diabetes Care's path
 * pages and funding page follow the same rule under their `paths` and
 * `funding` gates.
 *
 * Sleep Apnea Care is built but not public: none of its URLs is listed until
 * the owner flips SLEEP_APNEA_CARE_LIVE (sleep-apnea-care/launch.ts). Then its
 * English pages are listed, and each /fr page once its own gate in Sleep's
 * FR_REVIEWED is open, exactly as Diabetes Care's are.
 */

import { CHAPTER_META as DIABETES_CHAPTER_META } from '~/app/[locale]/(default)/liivv-health/diabetes-care/chapters/chapters-meta';
import { PATH_META as DIABETES_PATH_META } from '~/app/[locale]/(default)/liivv-health/diabetes-care/chapters/paths-meta';
import { FR_REVIEWED as DIABETES_FR_REVIEWED } from '~/app/[locale]/(default)/liivv-health/diabetes-care/chapters/review-gates';
import { CHAPTER_SLUGS } from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/chapters-data';
import { CHAPTER_META as SLEEP_CHAPTER_META } from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/chapters/chapters-meta';
import { PATH_META as SLEEP_PATH_META } from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/chapters/paths-meta';
import {
  FR_REVIEWED as SLEEP_FR_REVIEWED,
  type GateId as SleepGateId,
} from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/chapters/review-gates';
import { SLEEP_APNEA_CARE_LIVE } from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/launch';
import { defaultLocale } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

/** Landing pages for every vertical that is actually live. */
const LANDING_PATHS = [
  '/liivv-health',
  '/liivv-health/ostomy-care',
  '/liivv-health/diabetes-care',
  '/liivv-health/womens-health',
];

/** Standalone sections that sit alongside the chapters. */
const SECTION_PATHS = ['/liivv-health/ostomy-care/funding'];

/*
 * Diabetes Care chapters served by the chapter engine, after every Ostomy
 * entry. The older chapter pages are gone: their slugs are engine chapters or
 * path pages now, and the old journey hub redirects to the landing.
 */
const diabetesChapterEntries = DIABETES_CHAPTER_META.flatMap(({ slug }) => {
  const path = `/liivv-health/diabetes-care/chapters/${slug}`;
  const english = { path, locale: defaultLocale };

  return DIABETES_FR_REVIEWED.has(`chapter:${slug}`)
    ? [english, { path, locale: 'fr' }]
    : [english];
});

/*
 * Diabetes Care's five path pages (reading lists by type), after its chapters.
 * English only until the owner opens their `paths` gate.
 */
const diabetesPathEntries = DIABETES_PATH_META.flatMap(({ slug }) => {
  const path = `/liivv-health/diabetes-care/chapters/${slug}`;
  const english = { path, locale: defaultLocale };

  return DIABETES_FR_REVIEWED.has('paths') ? [english, { path, locale: 'fr' }] : [english];
});

/*
 * Diabetes Care's Funding & Coverage page, after its path pages. English only,
 * as Ostomy's funding page is, until the owner opens its `funding` gate.
 */
const DIABETES_FUNDING_PATH = '/liivv-health/diabetes-care/funding';
const diabetesFundingEntries = DIABETES_FR_REVIEWED.has('funding')
  ? [
      { path: DIABETES_FUNDING_PATH, locale: defaultLocale },
      { path: DIABETES_FUNDING_PATH, locale: 'fr' },
    ]
  : [{ path: DIABETES_FUNDING_PATH, locale: defaultLocale }];

/*
 * Sleep Apnea Care, after every Diabetes entry: nothing at all before launch.
 * Each page in English, and in French once its gate is open.
 */
const SLEEP_BASE = '/liivv-health/sleep-apnea-care';

const sleepEntry = (path: string, gate: SleepGateId) =>
  SLEEP_FR_REVIEWED.has(gate)
    ? [
        { path, locale: defaultLocale },
        { path, locale: 'fr' },
      ]
    : [{ path, locale: defaultLocale }];

const sleepEntries = SLEEP_APNEA_CARE_LIVE
  ? [
      ...sleepEntry(SLEEP_BASE, 'landing'),
      ...sleepEntry(`${SLEEP_BASE}/funding`, 'funding'),
      ...sleepEntry(`${SLEEP_BASE}/machine-guide`, 'machineGuide'),
      ...SLEEP_CHAPTER_META.flatMap(({ slug }) =>
        sleepEntry(`${SLEEP_BASE}/chapters/${slug}`, `chapter:${slug}`),
      ),
      ...SLEEP_PATH_META.flatMap(({ slug }) =>
        sleepEntry(`${SLEEP_BASE}/chapters/${slug}`, 'paths'),
      ),
    ]
  : [];

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
    ...SECTION_PATHS,
    ...CHAPTER_SLUGS.map((slug) => `/liivv-health/ostomy-care/chapters/${slug}`),
  ];

  const entries = [
    ...paths.map((path) => ({ path, locale: defaultLocale })),
    ...diabetesChapterEntries,
    ...diabetesPathEntries,
    ...diabetesFundingEntries,
    ...sleepEntries,
  ];

  const urls = await Promise.all(
    entries.map(async ({ path, locale }) => {
      const { canonical } = await getMetadataAlternates({
        path,
        locale,
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
