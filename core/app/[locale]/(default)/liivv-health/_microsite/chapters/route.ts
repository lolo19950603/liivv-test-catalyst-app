/* Twin of ostomy-care/chapters/[slug]/page.tsx and text-size.ts @3b343c6e — port fixes both ways until Phase 2 */

import 'server-only';

import type { Metadata } from 'next';
import type { Messages } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { MedicalWebPage, WithContext } from 'schema-dts';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import type { SiteConfig, SiteNs } from '../site';

import { buildChapters, type Chapter, chapterSlugs, siteChapterMessages } from './compose';
import { chapterHref } from './hrefs';

/*
 * =============================================================================
 * MICROSITE CHAPTERS — WHAT A CHAPTER ROUTE NEEDS ON THE SERVER
 * =============================================================================
 * The pieces of Ostomy's `chapters/[slug]/page.tsx` that do not depend on the
 * site: the static params, the metadata, the MedicalWebPage schema and the
 * text-size pre-paint script. A site's own route calls these with its config
 * and renders its own 'use client' chapter wrapper.
 *
 * No products and no supply list: nothing here fetches the catalogue. A
 * site's route loads the products its shelves name itself
 * (../shop/get-placement-items.ts) and hands them to its wrapper.
 * =============================================================================
 */

type RouteSite = Pick<
  SiteConfig,
  'anchors' | 'basePath' | 'chapters' | 'gates' | 'governance' | 'ns' | 'schema' | 'storage'
>;

export function chapterStaticParams(site: Pick<SiteConfig, 'chapters'>) {
  const slugs = chapterSlugs(site);

  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

/* Compose the chapter for this locale so metadata and JSON-LD match the page. */
export async function getLocalizedChapter(
  site: RouteSite,
  locale: string,
  slug: string,
): Promise<Chapter | undefined> {
  const messages = await getMessages({ locale });

  return buildChapters(site, siteChapterMessages(messages[site.ns]), locale).find(
    (chapter) => chapter.slug === slug,
  );
}

/*
 * What follows a chapter's title in the page title, in the page locale: the
 * site's own `ui.chapter.titleSuffix` where its messages have one, otherwise
 * the fixed suffix in its config, otherwise nothing.
 */
function titleSuffix(site: RouteSite, messages: Messages[SiteNs]) {
  const words = messages.ui.chapter;

  return 'titleSuffix' in words ? words.titleSuffix : site.schema.titleSuffix;
}

export async function chapterMetadata(
  site: RouteSite,
  locale: string,
  slug: string,
): Promise<Metadata> {
  const chapter = await getLocalizedChapter(site, locale, slug);

  if (!chapter) {
    return { title: 'Chapter not found' };
  }

  const suffix = titleSuffix(site, (await getMessages({ locale }))[site.ns]);

  return {
    title: suffix ? `${chapter.title} ${suffix}` : chapter.title,
    description: chapter.heroBody,
    alternates: await getMetadataAlternates({ path: chapterHref(site, slug), locale }),
  };
}

/*
 * MedicalWebPage rather than Article: this is reference material about a health
 * condition, and the type lets us declare the review status honestly — an
 * unreviewed chapter simply omits `reviewedBy` instead of claiming sign-off.
 */
export function chapterSchema(
  site: Pick<SiteConfig, 'schema'>,
  chapter: Chapter,
  url: string,
  locale: string,
): WithContext<MedicalWebPage> {
  const { governance } = chapter;

  // Gated identically to the visible byline, including the English-only rule.
  // This asserts clinical review machine-readably and indexably, so it must
  // never outlive or overreach what the page itself says.
  const disclosed = Boolean(governance.disclosure) && locale === 'en';
  const authored = disclosed && Boolean(governance.author.name);
  const reviewed = disclosed && Boolean(governance.reviewer.name) && Boolean(governance.reviewedOn);

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: chapter.title,
    description: chapter.heroBody,
    url,
    inLanguage: locale === 'fr' ? 'fr-CA' : 'en-CA',
    audience: {
      '@type': 'Patient',
      name: site.schema.audience,
    },
    about: {
      '@type': 'MedicalCondition',
      name: site.schema.about,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Liivv',
    },
    ...(authored && {
      author: {
        '@type': 'Person',
        name: governance.author.name,
        ...(governance.author.credential && { honorificSuffix: governance.author.credential }),
      },
    }),
    ...(reviewed && {
      lastReviewed: governance.reviewedOn,
      reviewedBy: {
        '@type': 'Person',
        name: governance.reviewer.name,
        ...(governance.reviewer.credential && {
          honorificSuffix: governance.reviewer.credential,
        }),
      },
    }),
  };
}

/*
 * Inlined by the server page so a saved size applies before paint instead of
 * jumping the layout after hydration. Mirrors applyTextSize in
 * ./text-size-control.tsx. The `data-oc-text` hook is shared by every site
 * (../site.ts); only the key it reads is the site's own, a literal from its
 * config, so for Ostomy this is letter for letter its TEXT_SIZE_PRE_PAINT.
 */
export function textSizePrePaint(site: Pick<SiteConfig, 'storage'>) {
  return `try{var s=localStorage.getItem('${site.storage.textSize}');if(s==='lg'||s==='xl')document.documentElement.dataset.ocText=s;}catch(e){}`;
}
