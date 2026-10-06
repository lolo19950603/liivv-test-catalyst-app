/*
 * =============================================================================
 * MICROSITE LANDING — WHAT THE SERVER WORKS OUT FOR THE PAGE
 * =============================================================================
 * The parts of a landing page that depend on the site's structure rather than
 * on its words: which chapters the rail shows, where a chip or a linked phrase
 * goes, and which published sources a fact names, all in the page locale.
 * A site's route calls these and hands the results to ./landing-page.tsx as
 * data (./types.ts).
 *
 * Ostomy's landing does the rail on the client, from `buildChapters`; it has
 * no chips, facts or sourced answers. Here the rail is built on the server,
 * from the chapters' titles alone, so the landing does not carry the chapter
 * composer into its bundle.
 * =============================================================================
 */

import type { Messages } from 'next-intl';

import { siteChapterMessages } from '../chapters/compose';
import { chapterHref, localeHref } from '../chapters/hrefs';
import type { SiteConfig, SiteNs } from '../site';

import type { LandingChapterCard, LandingCitation } from './types';

/* One entry of a site's source register (its sources-meta.ts), as far as a page needs it. */
export interface RegisterEntry {
  label: string;
  labelFr?: string;
  href: string;
  hrefFr?: string;
  hrefLang: 'en' | 'fr';
}

/*
 * Published titles and links in the page locale. The French title or file is
 * used only where the publisher issues one, as on the chapters; a link to a
 * French file says so. An id missing from the register is dropped here and
 * reported by the content-review export.
 */
export function landingCitations(
  register: Readonly<Record<string, RegisterEntry>>,
  ids: readonly string[],
  locale: string,
): LandingCitation[] {
  const french = locale === 'fr';

  return ids.flatMap((id) => {
    const source = register[id];

    if (!source) return [];

    const fromFr = french && Boolean(source.hrefFr);

    return [
      {
        label: french && source.labelFr ? source.labelFr : source.label,
        href: fromFr && source.hrefFr ? source.hrefFr : source.href,
        hrefLang: fromFr ? 'fr' : source.hrefLang,
      },
    ];
  });
}

/* Every source a page names, once each, in the order first named. */
export function uniqueCitations(lists: ReadonlyArray<readonly LandingCitation[]>) {
  const seen = new Set<string>();

  return lists.flat().filter((citation) => {
    if (seen.has(citation.href)) return false;

    seen.add(citation.href);

    return true;
  });
}

/* Whether the engine serves this chapter: it is in the site's CHAPTER_META. */
export function isEngineChapter(site: Pick<SiteConfig, 'chapters'>, slug: string) {
  return site.chapters.some((meta) => meta.slug === slug);
}

/* A place on one of the site's chapters, in the page locale. */
export function chapterPlace(
  site: Pick<SiteConfig, 'basePath'>,
  locale: string,
  slug: string,
  anchor?: string,
) {
  return localeHref(`${chapterHref(site, slug)}${anchor ? `#${anchor}` : ''}`, locale);
}

/*
 * The chapter rail: every chapter the engine serves, in reading order, with
 * its number in words in the page language. The ordinal is structural
 * ('one'..'six') and is read through the site's `ui.chapter.words`, as the
 * chapter page's own kicker is, or the French rail would say "Chapitre one".
 */
export function landingChapters(
  site: Pick<SiteConfig, 'basePath' | 'chapters' | 'ns'>,
  messages: Messages,
  locale: string,
): LandingChapterCard[] {
  const tree: Messages[SiteNs] = messages[site.ns];
  const chapters = siteChapterMessages(tree);
  const words: Record<string, string> = tree.ui.chapter.words;

  return site.chapters.flatMap((meta) => {
    const chapter = chapters[meta.slug];

    if (!chapter) return [];

    return [
      {
        slug: meta.slug,
        num: meta.num,
        word: words[meta.chapterWord] ?? meta.chapterWord,
        title: chapter.title,
        blurb: chapter.vibe,
        href: chapterPlace(site, locale, meta.slug),
        image: meta.heroImage,
      },
    ];
  });
}
