/* Twin of ostomy-care/chapters/chapters-data.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * MICROSITE CHAPTERS — TYPES AND ASSEMBLY
 * =============================================================================
 * Ostomy's composer (ostomy-care/chapters/chapters-data.ts), for any site. Prose
 * lives in messages/*.json under `<site ns>.chapters`, structure in the site's
 * chapters-meta.ts, and this joins the two for one locale. Everything Ostomy's
 * composer wrote in — the landing, the red-flag anchor, the review gates, the
 * byline — is read from the SiteConfig instead.
 *
 * Lists in the message tree use numbered keys ("1", "2", ...) rather than
 * arrays, because the FR script walks objects and skips arrays, and because
 * en.json contains no arrays anywhere.
 *
 * Only the kinds the engine draws itself are composed into `figureText`. A
 * site's own figure reads its words from `figureWords`, the card's `figure`
 * messages as they are, so the engine never has to know their shape.
 *
 * Left with Ostomy: the recovery map and the supply list's rows. The products
 * under a card are not composed here: the site's merchandising record
 * (SiteConfig.shop) names them and ../shop draws them.
 *
 * Layout: ./chapter-page.tsx (search "SECTION N —" in Ostomy's twin)
 * =============================================================================
 */

import type { Messages } from 'next-intl';

import type { GovernancePerson, SiteConfig, SiteNs } from '../site';

import { chapterHref, localeHref } from './hrefs';
import type {
  BandLinkMeta,
  CardLinkMeta,
  EngineCategoryMeta,
  EngineChapterMeta,
  EngineFigureMeta,
  ShelfLinkMeta,
  StartHere,
} from './types';

export interface CategorySection {
  heading: string;
  items: string[];
  note?: string;
}

/* The composer's own view of a site: what it reads, and nothing it does not. */
type ComposeSite = Pick<SiteConfig, 'anchors' | 'basePath' | 'chapters' | 'gates' | 'governance'>;

export interface CategoryCard {
  title: string;
  image: string;
  /** Who this card refers you to. Structural — never comes from the message tree. */
  ask?: string;
  /** Carries a same-day, emergency or crisis line, so it always renders open. */
  urgentContent?: boolean;
  /** 1-based position in the chapter, for the in-page anchor `#card-<n>`. */
  number: number;
  /** Visual shapes for this card's copy, from the site's chapters-meta.ts. */
  figures?: EngineFigureMeta[];
  /** The short labels the engine's own figures need, from `categories.<n>.figure`. */
  figureText?: FigureText;
  /*
   * The same `figure` messages, untouched, for a site's own figure to read its
   * own keys from. Present only where `figureText` is.
   */
  figureWords?: FigureMessages;
  /**
   * A module that carried the chapter's emergency signpost was dropped by this
   * locale's review gate, so the card prints that signpost itself. Set by
   * `composeCardFigures`, never authored. See `exitWhenGated` in Ostomy's
   * chapters-meta.ts.
   */
  exitFallback?: true;
  /** Keep the closing note outside the collapsible region. */
  noteVisible?: boolean;
  items?: string[];
  sections?: CategorySection[];
  note?: string;
  group?: string;
  badge?: string;
  /** Links inside the card's own sentences (meta `links`), resolved for this locale. */
  links?: CardLink[];
}

/*
 * A link inside one of a card's own sentences. `text` is the sentence exactly
 * as the card shows it, with its `<link>` tags taken out, which is how a
 * renderer finds the link that belongs to the sentence it is drawing; the link
 * covers `length` characters from `start`, or the whole sentence.
 */
export interface CardLink {
  text: string;
  start: number;
  length: number;
  href: string;
}

/* Figure labels, ordered. Every list is present so renderers never guard. */
export interface FigureText {
  heading?: string;
  /* The crisis strip's own sentence, where a card words it for itself. */
  body?: string;
  more?: string;
  items: string[];
  captions: string[];
  routes: Array<{ prompt: string; detail?: string; chips: string[] }>;
  containers: string[];
  columns: string[];
  /*
   * Lanes. `body` is only for a lane with no reviewed card sentence of its
   * own; `linkLabel` names where its link goes, and the link opens in the
   * same tab.
   */
  lanes: Array<{ label: string; scope?: string; body?: string; linkLabel?: string }>;
  /* The optional topic filter over those lanes: its legend, its tick boxes,
   * the badge on a lane that fits, and the status lines. The two "fits" lines
   * are one sentence in two plural forms, counted in lanes-topics.tsx. */
  legend?: string;
  topics: string[];
  fits?: string;
  statusFitsOne?: string;
  statusFitsMany?: string;
  statusNone?: string;
  doors: string[];
  /* The take-in card's blank write-in lines, by label (`figure.fields`). */
  fields: string[];
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

/*
 * The resources shelf, composed for the page locale. Held links and any group
 * left empty by a hold are gone before the component sees them, so the page
 * never renders an empty shelf group or a "coming soon" placeholder.
 */
export interface ShelfLink {
  title: string;
  /** The publisher, from chapters-meta.ts. Never from the message tree. */
  org: string;
  body: string;
  /** Where a direct file link states its type and size. */
  note?: string;
  href: string;
  /** Language of the page the link opens, named in the link text where it differs. */
  hrefLang: 'en' | 'fr';
}

export interface ShelfGroup {
  glyph: string;
  heading: string;
  links: ShelfLink[];
}

/*
 * A plain link under a referral-band card, composed for the page locale. Links
 * the page locale does not show, and links whose label is missing from this
 * locale's message file, are gone before the component sees them.
 */
export interface BandLink {
  label: string;
  href: string;
  /** Language of the page the link opens, named in the link text where it differs. */
  hrefLang: 'en' | 'fr';
}

export interface Shelf {
  heading: string;
  groups: ShelfGroup[];
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
 * Clinical governance. Rendered on every chapter. Author and reviewer gate
 * independently; see SiteGovernance in ../site.ts.
 */
export interface Governance {
  author: GovernancePerson;
  reviewer: GovernancePerson;
  /** ISO date (YYYY-MM-DD) of the clinical review. */
  reviewedOn: string;
  /** Whether this page carries the commercial disclosure (`ui.governance.disclosure`). */
  disclosure: boolean;
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
  /* Whether the intro heading renders in the first band's callout (meta `introHeading`). */
  introHeading: boolean;
  /* The card whose title links to it inside the intro body (meta `introCard`). */
  introCard?: number;
  categories: CategoryCard[];
  programsBand?: {
    heading?: string;
    /* `card`: the chapter card whose title links to it in the body (meta `programsBandCards`). */
    cards: Array<{ heading: string; body: string; links?: BandLink[]; card?: number }>;
  };
  /** Outward links after the band slot; absent where French-gated or fully held. */
  shelf?: Shelf;
  resources?: ResourceGroup[];
  urgent?: UrgentCallout;
  citations?: Citation[];
  governance: Governance;
  pharmacist: {
    eyebrow: string;
    heading: string;
    body: string;
    /* The request button's label; empty for a site that shows its direct contact instead. */
    cta: string;
    href: string;
    image: string;
  };
  closing: { heading: string; body: string };
  /** Whether the group jump links render. */
  rail: boolean;
  /** Each group is a full page section with a large heading. */
  majorSections: boolean;
  /** A map of two of the chapter's groups, each listing its cards. Exactly two, by type. */
  startHere?: StartHere<string>;
  /** A signpost to a chapter's emergency list. */
  urgentExit?: { lead: string; link: string; href: string };
}

/*
 * The link to a chapter's emergency list, in the page locale. Where the chapter
 * signposts its own list this is a bare same-document fragment, because the
 * wording ("further up this page" / "plus haut sur cette page") promises the
 * page the reader is on.
 */
function urgentExitHref(site: ComposeSite, fromSlug: string, toSlug: string, locale: string) {
  const fragment = `#${site.anchors.redFlags.id}`;

  if (toSlug === fromSlug) return fragment;

  return localeHref(`${chapterHref(site, toSlug)}${fragment}`, locale);
}

/*
 * A card, or an anchor, in one of the site's chapters, in the page locale. Into
 * the reader's own chapter it is a bare fragment, as the signpost's is. A card
 * opened in one of its figure's views carries it as `?view=` before the
 * fragment (CardLinkMeta).
 */
function chapterPlaceHref(
  site: ComposeSite,
  fromSlug: string,
  to: CardLinkMeta['to'],
  locale: string,
) {
  if ('page' in to) return localeHref(`${site.basePath}/${to.page}`, locale);

  /* An outward page from the register: its French address on /fr where there is one. */
  if ('source' in to) return locale === 'fr' && to.hrefFr ? to.hrefFr : to.href;

  const fragment = 'card' in to ? `#card-${to.card}` : `#${to.anchor}`;
  const view = 'card' in to && to.view ? `?view=${encodeURIComponent(to.view)}` : '';

  if (to.chapter === fromSlug) return `${view}${fragment}`;

  return localeHref(`${chapterHref(site, to.chapter)}${view}${fragment}`, locale);
}

/*
 * The only rich-text tags a card's sentences may carry: `<link>…</link>`
 * around the words a CardLinkMeta turns into its link. They are taken out of
 * every sentence as the card is composed, so no renderer, print sheet or
 * schema ever shows them, whether or not the meta names a link there.
 */
const LINK_TAGS = /<\/?link>/g;
const OPEN_TAG = '<link>';

const untagged = (text: string) => text.replace(LINK_TAGS, '');

/*
 * The card's links (meta `links`), each found in its sentence. Where the
 * sentence tags a phrase, the link is that phrase; otherwise it is the whole
 * sentence. Only the first tagged phrase counts, so the tag's position in the
 * message is its position in the untagged text. A link whose sentence is
 * missing in this locale is dropped, as a shelf link with no wording is.
 */
function composeCardLinks(
  site: ComposeSite,
  slug: string,
  structure: EngineCategoryMeta | undefined,
  card: CategoryMessages,
  locale: string,
): CardLink[] {
  return (structure?.links ?? []).flatMap((link) => {
    const raw = link.at === 'note' ? card.note : card.items?.[link.at.slice('items.'.length)];

    if (raw === undefined) return [];

    const text = untagged(raw);
    const open = raw.indexOf(OPEN_TAG);
    const close = raw.indexOf('</link>');
    const tagged = open >= 0 && close > open;
    const length = tagged ? close - open - OPEN_TAG.length : text.length;

    if (length <= 0) return [];

    return [
      {
        text,
        start: tagged ? open : 0,
        length,
        href: chapterPlaceHref(site, slug, link.to, locale),
      },
    ];
  });
}

/* ---------------------------------------------------------------------------
 * Message shapes, mirroring the numbered-key structure in messages/*.json.
 * ------------------------------------------------------------------------- */

export type Numbered<T> = Record<string, T>;

/*
 * A card's `figure` messages. The keys the engine's own figures read are typed;
 * anything else belongs to a site's own figure, which reads it from
 * `figureWords` and checks its shape there.
 */
export interface FigureMessages {
  [siteKey: string]: unknown;
  heading?: string;
  body?: string;
  more?: string;
  items?: Numbered<string>;
  captions?: Numbered<string>;
  routes?: Numbered<{ prompt: string; detail?: string; chips: Numbered<string> }>;
  containers?: Numbered<{ label: string }>;
  columns?: Numbered<{ heading: string }>;
  lanes?: Numbered<{ label: string; scope?: string; body?: string; linkLabel?: string }>;
  legend?: string;
  topics?: Numbered<{ label: string }>;
  fits?: string;
  statusFitsOne?: string;
  statusFitsMany?: string;
  statusNone?: string;
  doors?: Numbered<{ label: string }>;
  fields?: Numbered<string>;
}

interface CategoryMessages {
  title: string;
  badge?: string;
  note?: string;
  items?: Numbered<string>;
  sections?: Numbered<{ heading: string; note?: string; items: Numbered<string> }>;
  figure?: FigureMessages;
}

export interface ChapterMessages {
  title: string;
  heroBody: string;
  focus: string;
  vibe: string;
  categoriesIntro: { eyebrow: string; heading: string; body: string };
  categories: Numbered<CategoryMessages>;
  programsBand?: {
    heading?: string;
    cards: Numbered<{ heading: string; body: string; links?: Numbered<{ label: string }> }>;
  };
  shelf?: {
    heading: string;
    groups: Numbered<{
      heading: string;
      links: Numbered<{ title: string; body: string; note?: string }>;
    }>;
  };
  resources?: Numbered<{
    eyebrow: string;
    heading: string;
    body?: string;
    links: Numbered<{ title: string; org: string; body: string; note?: string }>;
  }>;
  urgent?: { heading: string; intro: string; action: string; signs: Numbered<string> };
  /* `cta` only where the panel has a request button: a site with a direct contact has none. */
  pharmacist: { eyebrow: string; heading: string; body: string; cta?: string };
  closing: { heading: string; body: string };
  governance: { disclaimer: string };
  startHere?: { heading?: string; pivot: string; segments: Numbered<{ label: string }> };
  urgentExit?: { lead: string; link: string };
}

/*
 * A site's `chapters` messages, or none. Read through `in` because a site's
 * namespace can exist before its first chapter does. Each site's chapters are
 * checked against ChapterMessages here, from the shape en.json gives them.
 */
export function siteChapterMessages(tree: Messages[SiteNs]): Numbered<ChapterMessages> {
  return 'chapters' in tree ? tree.chapters : {};
}

/* Numbered-key object back into an ordered array. */
export function ordered<T>(node: Numbered<T> | undefined): T[] {
  if (!node) return [];

  return Object.keys(node)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => node[key])
    .filter((value): value is T => value !== undefined);
}

/*
 * Walk-through steps keep their message key, because meta names a step by key
 * and a cut step leaves a gap in the numbering rather than renumbering the rest.
 * For a site's own stepper figure.
 */
export function keyedSteps(
  steps: Numbered<{ title: string; items?: Numbered<string> }> | undefined,
): Array<{ key: number; title: string; items: string[] }> {
  return Object.keys(steps ?? {})
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((key) => {
      const step = steps?.[String(key)];

      return step ? [{ key, title: step.title, items: ordered(step.items) }] : [];
    });
}

function composeFigureText(figure: FigureMessages | undefined): FigureText {
  return {
    ...(figure?.heading === undefined ? {} : { heading: figure.heading }),
    ...(figure?.body === undefined ? {} : { body: figure.body }),
    ...(figure?.more === undefined ? {} : { more: figure.more }),
    items: ordered(figure?.items),
    captions: ordered(figure?.captions),
    routes: ordered(figure?.routes).map((route) => ({
      prompt: route.prompt,
      ...(route.detail === undefined ? {} : { detail: route.detail }),
      chips: ordered(route.chips),
    })),
    containers: ordered(figure?.containers).map((c) => c.label),
    columns: ordered(figure?.columns).map((c) => c.heading),
    lanes: ordered(figure?.lanes).map((lane) => ({
      label: lane.label,
      ...(lane.scope === undefined ? {} : { scope: lane.scope }),
      ...(lane.body === undefined ? {} : { body: lane.body }),
      ...(lane.linkLabel === undefined ? {} : { linkLabel: lane.linkLabel }),
    })),
    ...(figure?.legend === undefined ? {} : { legend: figure.legend }),
    topics: ordered(figure?.topics).map((topic) => topic.label),
    ...(figure?.fits === undefined ? {} : { fits: figure.fits }),
    ...(figure?.statusFitsOne === undefined ? {} : { statusFitsOne: figure.statusFitsOne }),
    ...(figure?.statusFitsMany === undefined ? {} : { statusFitsMany: figure.statusFitsMany }),
    ...(figure?.statusNone === undefined ? {} : { statusNone: figure.statusNone }),
    doors: ordered(figure?.doors).map((door) => door.label),
    fields: ordered(figure?.fields),
  };
}

/*
 * A published title and link in the page locale. The French title or file is
 * used only where the publisher issues one; otherwise the English stands in
 * both locales, which matches the page the link actually opens.
 */
function localizedTitle(
  source: { label: string; labelFr?: string; href: string; hrefFr?: string },
  locale: string,
) {
  const french = locale === 'fr';

  return {
    label: french && source.labelFr ? source.labelFr : source.label,
    href: french && source.hrefFr ? source.hrefFr : source.href,
  };
}

/*
 * The figures a card keeps in this locale.
 *
 * A held figure goes first and goes everywhere: `held` means the figure is built
 * but not allowed to render until a named decision is recorded, in either
 * locale, so it never reaches a page, a print sheet or a schema. Then on /fr a
 * module whose French is not yet reviewed is dropped (the site's
 * review-gates.ts). A card left with no figures falls back to its plain,
 * reviewed list, because rowLayout then sees no restyle.
 */
function gateFigures(
  site: ComposeSite,
  structure: EngineCategoryMeta | undefined,
  locale: string,
): EngineFigureMeta[] {
  if (!structure?.figures) return [];

  return structure.figures.filter(
    (figure) => figure.held === undefined && site.gates.keepsFigure(figure, structure, locale),
  );
}

/*
 * Figures and their labels, spread into the card only when any survive the
 * gates.
 *
 * `exitFallback` is the one thing a dropped figure leaves behind: a module
 * marked `exitWhenGated` renders the chapter's emergency signpost and points at
 * a list on another page, so when this locale's gate drops it the card prints
 * that signpost in its place (`needsCardExit` in figures.tsx).
 *
 * A held figure is not a gate: it is absent in both locales and leaves nothing
 * behind, because there is no reviewed module for the card to stand in for.
 */
function composeCardFigures(
  site: ComposeSite,
  structure: EngineCategoryMeta | undefined,
  figure: FigureMessages | undefined,
  locale: string,
): Pick<CategoryCard, 'exitFallback' | 'figures' | 'figureText' | 'figureWords'> {
  if (structure?.figures === undefined) return {};

  const figures = gateFigures(site, structure, locale);
  const gatedExit = structure.figures.some(
    (candidate) =>
      candidate.exitWhenGated === true &&
      candidate.held === undefined &&
      !figures.includes(candidate),
  );

  return {
    ...(figures.length
      ? {
          figures,
          figureText: composeFigureText(figure),
          ...(figure === undefined ? {} : { figureWords: figure }),
        }
      : {}),
    ...(gatedExit ? { exitFallback: true as const } : {}),
  };
}

type ShelfMessages = NonNullable<ChapterMessages['shelf']>;
type ShelfLinkMessages = ShelfMessages['groups'][string]['links'][string];

/*
 * One shelf link in the page locale. The publisher's French page is used only
 * where it maintains one, and its French name only where the organisation uses
 * one; otherwise the English stands in both locales, which is what the link
 * actually opens onto. A link whose wording is missing in translation is
 * dropped rather than rendered as a bare URL.
 */
function composeShelfLink(
  link: ShelfLinkMeta<string, string>,
  words: ShelfLinkMessages | undefined,
  locale: string,
): ShelfLink[] {
  if (!words?.title) return [];

  const french = locale === 'fr';

  return [
    {
      title: words.title,
      org: french && link.orgFr ? link.orgFr : link.org,
      body: words.body,
      ...(words.note === undefined ? {} : { note: words.note }),
      href: french && link.hrefFr ? link.hrefFr : link.href,
      /*
       * The publisher's French page is French, whatever the English link is.
       * Fixed here 2026-10-06 for Everyday Liivving's shelf; Ostomy's twin
       * (chapters-data.ts) has no shelf link with an `hrefFr` yet, and takes
       * this fix when it moves onto the engine.
       */
      hrefLang: french && link.hrefFr ? 'fr' : link.hrefLang,
    },
  ];
}

/*
 * The resources shelf, or nothing where the chapter has none or its French is
 * not yet reviewed (the site's `features.shelf` gate). Held links are dropped
 * here, and a group left with no links — or with no heading — goes with them,
 * so the page can never render an empty group, a blank heading or a
 * placeholder for something we are not showing.
 */
function composeShelf(
  site: ComposeSite,
  meta: EngineChapterMeta,
  messages: ChapterMessages,
  locale: string,
): Shelf | undefined {
  const words = messages.shelf;

  if (!meta.shelf || !words || site.gates.isFrGated(site.gates.features.shelf, locale)) {
    return undefined;
  }

  const groups = meta.shelf.groups.flatMap((group, index) => {
    const groupWords = words.groups[String(index + 1)];
    const links = group.links.flatMap((link, linkIndex) =>
      link.heldUntil
        ? []
        : composeShelfLink(link, groupWords?.links[String(linkIndex + 1)], locale),
    );

    /*
     * No heading means no group: a headed list of links with a blank heading
     * above it reads as a rendering fault, and the reader cannot tell what the
     * links have in common.
     */
    const heading = groupWords?.heading;

    return links.length && heading ? [{ glyph: group.glyph, heading, links }] : [];
  });

  return groups.length ? { heading: words.heading, groups } : undefined;
}

type BandCardMessages = NonNullable<ChapterMessages['programsBand']>['cards'][string];

/*
 * The plain links under one referral-band card, for the page locale.
 *
 * A link is dropped where this page locale is not one it is offered in, and
 * where its label is missing from this locale's message file — a bare URL is
 * not something a reader can judge before following it.
 *
 * The whole set waits on the site's `features.bandLinks` French gate, because
 * the labels are new French. The card's own reviewed sentence is not gated and
 * stays, so /fr loses a link rather than the referral.
 */
function composeBandLinks(
  site: ComposeSite,
  links: Array<BandLinkMeta<string>> | undefined,
  words: BandCardMessages['links'],
  locale: string,
): BandLink[] {
  if (!links || site.gates.isFrGated(site.gates.features.bandLinks, locale)) return [];

  return links.flatMap((link, index) => {
    const label = words?.[String(index + 1)]?.label;

    if (!label || !link.locales.some((offered) => offered === locale)) return [];

    /* A Liivv page: in the page locale, and in the page's own language. */
    if (link.href.startsWith('/')) {
      return [
        { label, href: localeHref(link.href, locale), hrefLang: locale === 'fr' ? 'fr' : 'en' },
      ];
    }

    /* The publisher's French page on /fr, where it has one. */
    if (locale === 'fr' && link.hrefFr) return [{ label, href: link.hrefFr, hrefLang: 'fr' }];

    return [{ label, href: link.href, hrefLang: link.hrefLang }];
  });
}

/*
 * The referral band, with the links under its cards. The band's own wording is
 * never gated; a card with no surviving links carries no `links` key at all, so
 * the renderer cannot wrap an empty list around nothing.
 */
function composeProgramsBand(
  site: ComposeSite,
  meta: EngineChapterMeta,
  messages: ChapterMessages,
  locale: string,
): Chapter['programsBand'] {
  const words = messages.programsBand;

  if (!words) return undefined;

  return {
    ...(words.heading === undefined ? {} : { heading: words.heading }),
    cards: ordered(words.cards).map((card, index) => {
      const links = composeBandLinks(site, meta.programsBandLinks?.[index], card.links, locale);
      const target = meta.programsBandCards?.[index];

      return {
        heading: card.heading,
        body: card.body,
        ...(links.length ? { links } : {}),
        ...(typeof target === 'number' ? { card: target } : {}),
      };
    }),
  };
}

/*
 * Citations come from the meta rather than the messages, so a translation pass
 * cannot rename a published document. A French title is used only where the
 * publisher issues one; otherwise the English title stands in both locales,
 * which matches the page the link actually opens. One entry per link.
 *
 * A card's `sources` are for the content review and never render; the
 * governance block lists the chapter's `citations` only, as Ostomy does.
 */
function composeCitations(meta: EngineChapterMeta, locale: string): Citation[] | undefined {
  const all = meta.citations.map((citation) => localizedTitle(citation, locale));
  const citations = all.filter(
    (citation, index) => all.findIndex((other) => other.href === citation.href) === index,
  );

  return citations.length ? citations : undefined;
}

/*
 * The start-here map: each of the two groups' cards in page order, so the map
 * and the page can never disagree about what is where. Built side by side
 * rather than mapped, so the result keeps the meta's exactly-two shape.
 */
function composeStartHere(
  meta: EngineChapterMeta,
  messages: ChapterMessages,
  categories: CategoryCard[],
): StartHere<string> | undefined {
  const words = messages.startHere;

  if (!meta.startHere || !words) return undefined;

  const labels = ordered(words.segments);
  const segment = (groupKey: string, segmentIndex: number) => ({
    label: labels[segmentIndex]?.label ?? '',
    cards: categories
      .filter((_, cardIndex) => meta.categories[cardIndex]?.group === groupKey)
      .map((card) => ({
        number: card.number,
        title: card.title,
        ...(card.ask === undefined ? {} : { ask: card.ask }),
      })),
  });
  const [before, after] = meta.startHere.groups;

  return {
    ...(words.heading === undefined ? {} : { heading: words.heading }),
    pivot: words.pivot,
    segments: [segment(before, 0), segment(after, 1)],
  };
}

/*
 * Compose a chapter from its structure and its translated prose.
 *
 * Images and outward URLs are index-matched to the numbered message keys. If a
 * translation adds or drops a list entry the two sides drift, so a link with no
 * URL is dropped rather than rendered as a dead card, and a missing category
 * image falls back to the chapter hero rather than rendering `undefined`.
 */
function composeChapter(
  site: ComposeSite,
  meta: EngineChapterMeta,
  messages: ChapterMessages,
  locale: string,
  groupLabels: Record<string, string>,
): Chapter {
  const categories: CategoryCard[] = ordered(messages.categories).map((card, index) => {
    const structure = meta.categories[index];
    const links = composeCardLinks(site, meta.slug, structure, card, locale);

    return {
      title: card.title,
      number: index + 1,
      image: structure?.image ?? meta.heroImage,
      ...composeCardFigures(site, structure, card.figure, locale),
      ...(structure?.noteVisible ? { noteVisible: true } : {}),
      ...(structure?.ask === undefined ? {} : { ask: structure.ask }),
      ...(structure?.urgentContent ? { urgentContent: true } : {}),
      ...(structure?.group === undefined
        ? {}
        : { group: groupLabels[structure.group] ?? structure.group }),
      ...(card.badge === undefined ? {} : { badge: card.badge }),
      ...(card.note === undefined ? {} : { note: untagged(card.note) }),
      ...(card.items === undefined ? {} : { items: ordered(card.items).map(untagged) }),
      ...(card.sections === undefined
        ? {}
        : {
            sections: ordered(card.sections).map((section) => ({
              heading: section.heading,
              items: ordered(section.items).map(untagged),
              ...(section.note === undefined ? {} : { note: untagged(section.note) }),
            })),
          }),
      ...(links.length ? { links } : {}),
    };
  });

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

  const programsBand = composeProgramsBand(site, meta, messages, locale);
  const shelf = composeShelf(site, meta, messages, locale);
  const citations = composeCitations(meta, locale);
  const startHere = composeStartHere(meta, messages, categories);

  const urgentExit =
    meta.urgentExit && messages.urgentExit
      ? {
          lead: messages.urgentExit.lead,
          link: messages.urgentExit.link,
          href: urgentExitHref(site, meta.slug, meta.urgentExit.chapter, locale),
        }
      : undefined;

  return {
    slug: meta.slug,
    num: meta.num,
    chapterWord: meta.chapterWord,
    rail: meta.rail ?? true,
    majorSections: meta.majorSections === true,
    introHeading: meta.introHeading !== false,
    ...(meta.introCard === undefined ? {} : { introCard: meta.introCard }),
    ...(startHere === undefined ? {} : { startHere }),
    ...(urgentExit === undefined ? {} : { urgentExit }),
    heroImage: meta.heroImage,
    accent: meta.accent,
    title: messages.title,
    heroBody: messages.heroBody,
    focus: messages.focus,
    vibe: messages.vibe,
    categoriesIntro: messages.categoriesIntro,
    categories,
    ...(programsBand === undefined ? {} : { programsBand }),
    ...(shelf === undefined ? {} : { shelf }),
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
      author: site.governance.author,
      reviewer: site.governance.reviewer,
      reviewedOn: site.governance.reviewedOn,
      disclosure: site.governance.disclosure,
      disclaimer: messages.governance.disclaimer,
    },
    pharmacist: {
      eyebrow: messages.pharmacist.eyebrow,
      heading: messages.pharmacist.heading,
      body: messages.pharmacist.body,
      cta: messages.pharmacist.cta ?? '',
      href: localeHref(meta.pharmacistHref, locale),
      image: meta.pharmacistImage,
    },
    closing: messages.closing,
  };
}

/*
 * Pass the site's `chapters` messages (siteChapterMessages) and its
 * `ui.chapter.groups`, from `useMessages()` / `getMessages()`. Group labels are
 * resolved here so every card in a cluster shows the same name. A chapter
 * listed in the meta but missing from the messages is skipped rather than
 * rendered half-empty.
 */
export function buildChapters(
  site: ComposeSite,
  raw: Numbered<ChapterMessages>,
  locale = 'en',
  groupLabels: Record<string, string> = {},
): Chapter[] {
  return site.chapters.flatMap((meta) => {
    const messages = raw[meta.slug];

    return messages ? [composeChapter(site, meta, messages, locale, groupLabels)] : [];
  });
}

export function chapterSlugs(site: Pick<SiteConfig, 'chapters'>) {
  return site.chapters.map((meta) => meta.slug);
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
