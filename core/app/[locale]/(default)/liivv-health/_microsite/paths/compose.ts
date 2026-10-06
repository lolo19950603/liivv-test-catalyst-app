/*
 * =============================================================================
 * MICROSITE PATH PAGES — ASSEMBLY
 * =============================================================================
 * Joins a site's path structure (its paths-meta.ts) with its messages for one
 * locale: the path's own words under `paths.<slug>`, and, for every entry in
 * the reading list, the card's title and the chapter's number and title as
 * that chapter's own messages hold them. Nothing a path lists is retyped.
 *
 * An entry whose card, chapter or reason is missing from this locale's
 * messages is dropped rather than rendered half-empty, as the chapter
 * composer drops a link with no URL; the content-review export reports it.
 *
 * Plain functions with no client or server dependency, like ../chapters/hrefs.
 * =============================================================================
 */

import { type ChapterMessages, type Numbered, ordered } from '../chapters/compose';
import { cardHref, chapterHref, localeHref } from '../chapters/hrefs';
import type { SiteConfig } from '../site';

import type { PathMeta, PathStage, PathWords } from './types';

/* One card in the reading list, in the page locale. */
export interface PathEntry {
  /** 1-based, across the whole list. */
  number: number;
  title: string;
  chapterNum: string;
  chapterTitle: string;
  reason: string;
  href: string;
}

/* A run of consecutive entries at the same stage. */
export interface PathGroup {
  stage: PathStage;
  /* The section id, so a reader can be sent to a stage. */
  id: string;
  entries: PathEntry[];
}

/* Another of the site's paths, for the rail at the foot of the page. */
export interface PathRailEntry {
  slug: string;
  title: string;
  href: string;
  current: boolean;
}

export interface ComposedPath {
  slug: string;
  title: string;
  heroBody: string;
  heroImage: string;
  accent: string;
  intro: { eyebrow: string; heading: string; body: string[] };
  list: { heading: string; intro: string; groups: PathGroup[] };
  funding: { heading: string; body: string; cta: string };
  rail: PathRailEntry[];
  /** The site's emergency list, which every path signposts. */
  safetyHref: string;
}

type ComposeSite = Pick<SiteConfig, 'anchors' | 'basePath' | 'chapters'>;

/* Entries, then runs of the same stage in list order: a stage can come back on purpose. */
function groupByRun(entries: Array<PathEntry & { stage: PathStage }>, idPrefix: string) {
  const groups: PathGroup[] = [];

  entries.forEach(({ stage, ...entry }) => {
    const last = groups[groups.length - 1];

    if (last && last.stage === stage) {
      last.entries.push(entry);

      return;
    }

    groups.push({ stage, id: `${idPrefix}stage-${groups.length + 1}`, entries: [entry] });
  });

  return groups;
}

export function composePath({
  site,
  metas,
  slug,
  words,
  chapters,
  locale,
  idPrefix,
}: {
  site: ComposeSite;
  metas: readonly PathMeta[];
  slug: string;
  /** The site's `paths` messages, by slug. */
  words: Readonly<Record<string, PathWords | undefined>>;
  /** The site's `chapters` messages (siteChapterMessages). */
  chapters: Numbered<ChapterMessages>;
  locale: string;
  idPrefix: string;
}): ComposedPath | undefined {
  const meta = metas.find((item) => item.slug === slug);
  const own = words[slug];

  if (!meta || !own) return undefined;

  const reasons = own.list.reasons;
  const listed = meta.entries.flatMap((entry, index) => {
    const chapterMeta = site.chapters.find((item) => item.slug === entry.chapter);
    const chapter = chapters[entry.chapter];
    const card = chapter?.categories[String(entry.card)];
    const reason = reasons[String(index + 1)];

    if (!chapterMeta || !chapter || !card || reason === undefined) return [];

    return [
      {
        stage: entry.stage,
        number: 0,
        title: card.title,
        chapterNum: chapterMeta.num,
        chapterTitle: chapter.title,
        reason,
        href: localeHref(cardHref(site, entry.chapter, entry.card), locale),
      },
    ];
  });

  /* Numbered after the drop, so the list never skips a number. */
  const numbered = listed.map((entry, index) => ({ ...entry, number: index + 1 }));
  const { redFlags } = site.anchors;

  return {
    slug: meta.slug,
    title: own.title,
    heroBody: own.heroBody,
    heroImage: meta.heroImage,
    accent: meta.accent,
    intro: {
      eyebrow: own.intro.eyebrow,
      heading: own.intro.heading,
      body: ordered(own.intro.body),
    },
    list: {
      heading: own.list.heading,
      intro: own.list.intro,
      groups: groupByRun(numbered, idPrefix),
    },
    funding: own.funding,
    rail: metas.flatMap((item) => {
      const title = words[item.slug]?.title;

      return title === undefined
        ? []
        : [
            {
              slug: item.slug,
              title,
              href: localeHref(chapterHref(site, item.slug), locale),
              current: item.slug === meta.slug,
            },
          ];
    }),
    safetyHref: localeHref(`${chapterHref(site, redFlags.chapter)}#${redFlags.id}`, locale),
  };
}

/* Every source a path names, once each, in page order: the intro, the reading list, the door. */
export function pathSourceIds<Src extends string>(meta: PathMeta<string, string, Src>): Src[] {
  return [
    ...new Set([
      ...meta.introSources.flat(),
      ...meta.entries.flatMap((entry) => entry.sources ?? []),
      ...meta.fundingSources,
    ]),
  ];
}
