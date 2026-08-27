/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — TYPES AND ASSEMBLY
 * =============================================================================
 * Prose lives in messages/*.json under `OstomyCare.chapters`, matching how the
 * rest of the Liivv copy is handled (Auth.Login.Olivia.*, Account.Dashboard.*)
 * so scripts/fill-fr-messages.mjs can translate it.
 *
 * Structure lives in ./chapters-meta.ts — slugs, images, accents, outward URLs.
 *
 * Lists in the message tree use numbered keys ("1", "2", ...) rather than
 * arrays, because the FR script walks objects and skips arrays, and because
 * en.json contains no arrays anywhere.
 *
 * Layout: ./chapter-page.tsx (search "SECTION N —" there)
 * =============================================================================
 */

import { CHAPTER_META, type ChapterMeta } from './chapters-meta';

export interface CategorySection {
  heading: string;
  items: string[];
  note?: string;
}

export interface CategoryCard {
  title: string;
  image: string;
  items?: string[];
  sections?: CategorySection[];
  note?: string;
  group?: string;
  badge?: string;
}

/*
 * An outside resource we point at. We link; we never reproduce.
 * `org` is required so attribution is structural, not something a writer can forget.
 */
export interface ResourceLink {
  title: string;
  org: string;
  body: string;
  href: string;
  note?: string;
}

export interface ResourceGroup {
  eyebrow: string;
  heading: string;
  body?: string;
  links: ResourceLink[];
}

/** A source backing a factual claim made in this chapter. */
export interface Citation {
  label: string;
  href: string;
}

/*
 * Red-flag callout for anything symptom-adjacent. Deliberately separate from
 * `note` copy so it can never be styled as an ordinary tip.
 */
export interface UrgentCallout {
  heading: string;
  intro: string;
  signs: string[];
  action: string;
}

/*
 * Clinical governance. Rendered on every chapter.
 *
 * `reviewedBy` and `reviewedOn` are intentionally allowed to be empty, and the
 * byline is omitted entirely when they are — an unreviewed chapter must never
 * display a reviewer it does not have.
 */
export interface Governance {
  /** Register-exact name. Empty suppresses the byline entirely. */
  name: string;
  /** Only credentials actually held and documentable. */
  credential: string;
  /** CNO registration number, shown so the byline is verifiable. */
  registration: string;
  registryUrl: string;
  /** ISO date (YYYY-MM-DD). */
  reviewedOn: string;
  /** Commercial relationship. Rendered with the byline, never without it. */
  disclosure: string;
  disclaimer: string;
}

export interface Chapter {
  slug: string;
  num: string;
  chapterWord: string;
  title: string;
  heroBody: string;
  focus: string;
  vibe: string;
  heroImage: string;
  accent: string;
  categoriesIntro: { eyebrow: string; heading: string; body: string };
  categories: CategoryCard[];
  programsBand?: { heading?: string; cards: Array<{ heading: string; body: string }> };
  resources?: ResourceGroup[];
  urgent?: UrgentCallout;
  citations?: Citation[];
  governance: Governance;
  pharmacist: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
    href: string;
    image: string;
  };
  closing: { heading: string; body: string };
  nextLabel: string;
}

/*
 * The named clinical reviewer.
 *
 * Every field starts empty on purpose, including the credential. An earlier
 * version shipped `credential: 'RN, NSWOC'` before anyone had been named, which
 * is backwards: inappropriate use of a title is an enumerated act of
 * professional misconduct in Ontario (O. Reg. 799/93 s.1 para 16), and NSWOC is
 * a specific credential requiring graduation from a WCET-recognized program. It
 * is not an adjective for "ostomy nurse". Publish only what the person holds and
 * can document.
 *
 * `name` must match the College's public register exactly — no shortened first
 * name, no invented seniority label. `registration` links the byline to Find a
 * Nurse so the claim is verifiable rather than asserted.
 *
 * `disclosure` is required alongside the name: the byline does not render
 * without it. A clinical-review credit on a page published by a company that
 * sells the products is a commercial relationship, and the College's framing is
 * avoidance and transparency rather than disclose-and-proceed.
 */
export const CLINICAL_REVIEWER = {
  name: '',
  credential: '',
  registration: '',
  registryUrl: '',
} as const;

/*
 * Fixed wording, deliberately not a free-text field. The second sentence —
 * review is not endorsement — is the one a later copy edit would be most likely
 * to soften, so it lives in code rather than in the message tree.
 */
export const COMMERCIAL_DISCLOSURE =
  'Liivv sells ostomy supplies. Clinical review means the information on this page was checked for accuracy against published sources. It is not an endorsement of any product Liivv sells, and it is not a recommendation to buy from Liivv.';

const LANDING = '/liivv-health/ostomy-care';

export const LANDING_HREF = LANDING;
export const SHOP_OSTOMY_HREF = `${LANDING}/shop-ostomy-care`;
export const FUNDING_HREF = `${LANDING}/funding`;

export const CHAPTER_SLUGS = CHAPTER_META.map((c) => c.slug);

export function chapterHref(slug: string) {
  return `${LANDING}/chapters/${slug}`;
}

/* ---------------------------------------------------------------------------
 * Message shapes, mirroring the numbered-key structure in messages/*.json.
 * `t.raw()` returns `any`, so callers pass it straight in without a cast.
 * ------------------------------------------------------------------------- */

type Numbered<T> = Record<string, T>;

interface CategoryMessages {
  title: string;
  group?: string;
  badge?: string;
  note?: string;
  items?: Numbered<string>;
  sections?: Numbered<{ heading: string; note?: string; items: Numbered<string> }>;
}

interface ChapterMessages {
  title: string;
  heroBody: string;
  focus: string;
  vibe: string;
  nextLabel: string;
  categoriesIntro: { eyebrow: string; heading: string; body: string };
  categories: Numbered<CategoryMessages>;
  programsBand?: { heading?: string; cards: Numbered<{ heading: string; body: string }> };
  resources?: Numbered<{
    eyebrow: string;
    heading: string;
    body?: string;
    links: Numbered<{ title: string; org: string; body: string; note?: string }>;
  }>;
  urgent?: { heading: string; intro: string; action: string; signs: Numbered<string> };
  citations?: Numbered<{ label: string }>;
  pharmacist: { eyebrow: string; heading: string; body: string; cta: string };
  closing: { heading: string; body: string };
  governance: { disclaimer: string };
}

/* Numbered-key object back into an ordered array. */
function ordered<T>(node: Numbered<T> | undefined): T[] {
  if (!node) return [];

  return Object.keys(node)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => node[key])
    .filter((value): value is T => value !== undefined);
}

/*
 * Compose a chapter from its structure and its translated prose.
 *
 * Images and outward URLs are index-matched to the numbered message keys. If a
 * translation adds or drops a list entry the two sides drift, so a link with no
 * URL is dropped rather than rendered as a dead card, and a missing category
 * image falls back to the chapter hero rather than rendering `undefined`.
 */
function composeChapter(meta: ChapterMeta, messages: ChapterMessages): Chapter {
  const categories: CategoryCard[] = ordered(messages.categories).map((card, index) => ({
    title: card.title,
    image: meta.categoryImages[index] ?? meta.heroImage,
    ...(card.group === undefined ? {} : { group: card.group }),
    ...(card.badge === undefined ? {} : { badge: card.badge }),
    ...(card.note === undefined ? {} : { note: card.note }),
    ...(card.items === undefined ? {} : { items: ordered(card.items) }),
    ...(card.sections === undefined
      ? {}
      : {
          sections: ordered(card.sections).map((section) => ({
            heading: section.heading,
            items: ordered(section.items),
            ...(section.note === undefined ? {} : { note: section.note }),
          })),
        }),
  }));

  const resources = messages.resources
    ? ordered(messages.resources).map((group, groupIndex) => ({
        eyebrow: group.eyebrow,
        heading: group.heading,
        ...(group.body === undefined ? {} : { body: group.body }),
        links: ordered(group.links)
          .map((link, linkIndex) => ({
            title: link.title,
            org: link.org,
            body: link.body,
            href: meta.resourceLinks[groupIndex]?.[linkIndex] ?? '',
            ...(link.note === undefined ? {} : { note: link.note }),
          }))
          .filter((link) => link.href !== ''),
      }))
    : undefined;

  const citations = messages.citations
    ? ordered(messages.citations)
        .map((citation, index) => ({
          label: citation.label,
          href: meta.citationHrefs[index] ?? '',
        }))
        .filter((citation) => citation.href !== '')
    : undefined;

  return {
    slug: meta.slug,
    num: meta.num,
    chapterWord: meta.chapterWord,
    heroImage: meta.heroImage,
    accent: meta.accent,
    title: messages.title,
    heroBody: messages.heroBody,
    focus: messages.focus,
    vibe: messages.vibe,
    nextLabel: messages.nextLabel,
    categoriesIntro: messages.categoriesIntro,
    categories,
    ...(messages.programsBand === undefined
      ? {}
      : {
          programsBand: {
            ...(messages.programsBand.heading === undefined
              ? {}
              : { heading: messages.programsBand.heading }),
            cards: ordered(messages.programsBand.cards),
          },
        }),
    ...(resources === undefined ? {} : { resources }),
    ...(messages.urgent === undefined
      ? {}
      : {
          urgent: {
            heading: messages.urgent.heading,
            intro: messages.urgent.intro,
            action: messages.urgent.action,
            signs: ordered(messages.urgent.signs),
          },
        }),
    ...(citations === undefined ? {} : { citations }),
    governance: {
      ...CLINICAL_REVIEWER,
      reviewedOn: '',
      disclosure: COMMERCIAL_DISCLOSURE,
      disclaimer: messages.governance.disclaimer,
    },
    pharmacist: {
      eyebrow: messages.pharmacist.eyebrow,
      heading: messages.pharmacist.heading,
      body: messages.pharmacist.body,
      cta: messages.pharmacist.cta,
      href: meta.pharmacistHref,
      image: meta.pharmacistImage,
    },
    closing: messages.closing,
  };
}

/*
 * Pass `messages.OstomyCare.chapters` from `useMessages()` / `getMessages()`.
 * A chapter listed in the meta but missing from the messages is skipped rather
 * than rendered half-empty.
 */
export function buildChapters(raw: Numbered<ChapterMessages>): Chapter[] {
  return CHAPTER_META.flatMap((meta) => {
    const messages = raw[meta.slug];

    return messages ? [composeChapter(meta, messages)] : [];
  });
}

export function getChapterNeighbors(chapters: Chapter[], slug: string) {
  const index = chapters.findIndex((c) => c.slug === slug);

  if (index < 0) return { prev: null, next: null, chapter: null };

  return {
    chapter: chapters[index] ?? null,
    prev: index > 0 ? (chapters[index - 1] ?? null) : null,
    next: index < chapters.length - 1 ? (chapters[index + 1] ?? null) : null,
  };
}
