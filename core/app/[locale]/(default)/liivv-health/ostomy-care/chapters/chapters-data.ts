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

import { defaultLocale } from '~/i18n/locales';

import {
  type BandLinkMeta,
  type CategoryMeta,
  CHAPTER_META,
  type ChapterMeta,
  type FigureMeta,
  type GlyphName,
  type RecoveryLane,
  type RecoveryStageMeta,
  type ShelfLinkMeta,
} from './chapters-meta';
import type { OstomyType } from './ostomy-types';
import { isFrGated, keepsFigure } from './review-gates';
import { SOURCE_META, type SourceId } from './sources-meta';

export interface CategorySection {
  heading: string;
  items: string[];
  note?: string;
}

export type AskRole = NonNullable<CategoryMeta['ask']>;

export interface CategoryCard {
  title: string;
  image: string;
  /** Who this card refers you to. Structural — never comes from the message tree. */
  ask?: AskRole;
  /** BigCommerce product ids to show beneath the card, in their own band. */
  productIds?: number[];
  /** Carries a same-day, emergency or crisis line, so it always renders open. */
  urgentContent?: boolean;
  /** 1-based position in the chapter, for the in-page anchor `#card-<n>`. */
  number: number;
  /** Visual shapes for this card's copy, from chapters-meta.ts. */
  figures?: FigureMeta[];
  /** The short labels those figures need, from `categories.<n>.figure`. */
  figureText?: FigureText;
  /**
   * A module that carried the chapter's emergency signpost was dropped by this
   * locale's review gate, so the card prints that signpost itself. Set by
   * `composeCardFigures`, never authored. See `exitWhenGated` in chapters-meta.ts.
   */
  exitFallback?: true;
  /** Keep the closing note outside the collapsible region. */
  noteVisible?: boolean;
  items?: string[];
  sections?: CategorySection[];
  note?: string;
  group?: string;
  badge?: string;
}

/*
 * One row of the supply list (C02). `labelOne` and `labelTwo` are the same row
 * named for the system the reader picked — a one-piece pouch and a two-piece
 * barrier are not the same thing to buy — and `condition` is the "only if…"
 * clause, which belongs inside the row's own label and nowhere else.
 */
export interface SupplyRowText {
  label: string;
  labelOne?: string;
  labelTwo?: string;
  condition?: string;
}

/* Figure labels, ordered. Every field is present so renderers never guard. */
export interface FigureText {
  heading?: string;
  more?: string;
  items: string[];
  captions: string[];
  routes: Array<{ prompt: string; detail?: string; chips: string[] }>;
  containers: string[];
  columns: string[];
  /*
   * Lanes (C09). `body` is only for a lane with no reviewed card sentence of
   * its own; `linkLabel` names where its link goes, and the link opens in the
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
  /*
   * Supply list (C02). `supplies` is the starter group and `goBagItems` the
   * go-bag group; `intro`, the two group headings and `alsoGoBag` are the only
   * other words the list adds. `goBagLink` belongs to the go-bag card, whose
   * band is one link back to this list.
   */
  intro?: string;
  systemLegend?: string;
  starterHeading?: string;
  goBagHeading?: string;
  alsoGoBag?: string;
  goBagLink?: string;
  supplies: SupplyRowText[];
  goBagItems: SupplyRowText[];
  /*
   * Opening gap comparison (C07). `panels` is the three captions, in the order
   * they are drawn; `notToScale` sits above the drawings and `mouldable` below
   * them. No panel is marked correct, so nothing here ranks them.
   */
  panels: Array<{ title: string; body: string }>;
  notToScale?: string;
  mouldable?: string;
  /*
   * Parts of a pouching system (C08). Four terms and their definitions, in the
   * order they are listed. This list is the figure's only words: the drawing
   * beside it is aria-hidden and carries no labels, and no view control rewrites
   * any of these strings.
   */
  terms: Array<{ term: string; def: string }>;
  /*
   * Lower-fibre clocks (C11). `clocks` is one sentence per row, index-matched
   * to the rows in chapters-meta.ts; the row labels are the shared ostomy-type
   * names, not new wording. `axis` is the two ends of the scale under the bars.
   */
  clocks: string[];
  axis?: { start: string; end: string };
  /* Change-routine walk-through: lines above the steps. */
  framing: string[];
  /* Steps with the stable message key each meta step names, in key order. */
  steps: Array<{ key: number; title: string; items: string[] }>;
  gapLink?: string;
  tell?: { heading: string; items: string[] };
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
 * The resources shelf (C14), composed for the page locale. Held links and any
 * group left empty by a hold are gone before the component sees them, so the
 * page never renders an empty shelf group or a "coming soon" placeholder.
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
  glyph: GlyphName;
  heading: string;
  links: ShelfLink[];
}

/*
 * A plain link under a referral-band card (C12), composed for the page locale.
 * Links the page locale does not show, and links whose label is missing from
 * this locale's message file, are gone before the component sees them.
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

/** A register source resolved for the page locale. See sources-meta.ts. */
export interface ResolvedSource {
  id: SourceId;
  label: string;
  href: string;
  /** Language of the linked page or file, for the link's hrefLang. */
  hrefLang: 'en' | 'fr';
  /** Language of the title as shown, for a `lang` attribute where it differs from the page. */
  labelLang: 'en' | 'fr';
}

/*
 * The recovery map (C03), composed for the page locale. Stages keep the meta
 * order; empty lines (a message missing in translation) are dropped rather
 * than rendered blank.
 */
export interface RecoveryMap {
  heading: string;
  intro: string;
  stages: Array<{
    heading: string;
    qualifier?: string;
    anchor: RecoveryStageMeta['anchor'];
    lanes: Array<{
      lane: RecoveryLane;
      items: Array<{ text: string; types?: OstomyType[] }>;
    }>;
    sources: ResolvedSource[];
  }>;
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
 * Author and reviewer are separate people and gate independently: content can
 * carry a written-by line before it has been reviewed, but it must never carry
 * a review line it has not earned. Both are empty until filled, so an
 * unreviewed chapter cannot imply sign-off it does not have.
 */
export interface Governance {
  /** The RN who wrote it. Empty name suppresses the written-by line. */
  author: GovernancePerson;
  /** The NSWOC who reviewed it. Empty name suppresses the review line. */
  reviewer: GovernancePerson;
  /** ISO date (YYYY-MM-DD) of the clinical review. */
  reviewedOn: string;
  /**
   * Whether this page carries the commercial disclosure. The words themselves
   * are `ui.governance.disclosure.*` in the message files (see
   * DISCLOSES_COMMERCIAL_RELATIONSHIP below); a byline renders only where this
   * is true.
   */
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
  categories: CategoryCard[];
  programsBand?: {
    heading?: string;
    cards: Array<{ heading: string; body: string; links?: BandLink[] }>;
  };
  /** Replaces the programs band where present; absent where held or French-gated. */
  recoveryMap?: RecoveryMap;
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
    cta: string;
    href: string;
    image: string;
  };
  closing: { heading: string; body: string };
  /** Whether the group jump links render. Chapter 01 uses the start-here map instead. */
  rail: boolean;
  /** Each group is a full page section with a large heading. Chapter 01 only. */
  majorSections: boolean;
  /** A map of the chapter's groups, each listing its cards. */
  startHere?: {
    pivot: string;
    segments: Array<{
      label: string;
      cards: Array<{ number: number; title: string; ask?: AskRole }>;
    }>;
  };
  /** A signpost to another chapter's emergency list. */
  urgentExit?: { lead: string; link: string; href: string };
}

/*
 * Who wrote it, and who checked it — deliberately two people.
 *
 * The author is an RN. The clinical reviewer is an NSWOC, which is a distinct
 * credential requiring graduation from a WCET-recognized program and is not a
 * synonym for "ostomy nurse". Keeping the roles separate is both the honest
 * description of how this content is produced and the stronger governance
 * position: the person who wrote it is not the person who signs it off.
 *
 * Every field starts empty, including the credentials. An earlier version
 * shipped `credential: 'RN, NSWOC'` with no name attached — a credential
 * written before the person — and inappropriate use of a title is an enumerated
 * act of professional misconduct in Ontario (O. Reg. 799/93 s.1 para 16).
 * Publish only what each person actually holds and can document.
 *
 * `name` must match the College's public register exactly — no shortened first
 * name, no invented seniority label. `registration` and `registryUrl` make the
 * claim verifiable against Find a Nurse rather than merely asserted.
 */
export interface GovernancePerson {
  name: string;
  credential: string;
  registration: string;
  registryUrl: string;
}

const NOBODY: GovernancePerson = {
  name: '',
  credential: '',
  registration: '',
  registryUrl: '',
};

/** The RN who writes and maintains the content. Credential: 'RN'. */
export const CONTENT_AUTHOR: GovernancePerson = { ...NOBODY };

/**
 * The NSWOC who reviews it before publication. Credential: 'RN, NSWOC', or
 * whatever that individual actually holds. Filling this in is what makes the
 * review line appear — leaving it empty is the correct state until a review
 * has genuinely happened.
 */
export const CLINICAL_REVIEWER: GovernancePerson = { ...NOBODY };

/*
 * =============================================================================
 * THE COMMERCIAL DISCLOSURE
 * =============================================================================
 * Every chapter page and the funding page say that Liivv sells the products the
 * page is about, and that a clinical review is not an endorsement of them. This
 * flag says the page carries that; the sentences are
 * `ui.governance.disclosure.*` in en.json and fr.json, and GovernanceBlock
 * picks which ones to render.
 *
 * IT USED TO BE A CODE CONSTANT, AND THAT COST MORE THAN IT BOUGHT
 * -----------------------------------------------------------------------------
 * It was one hardcoded English string, deliberately outside the message tree so
 * that a copy edit could not soften the sentence a reader most needs. Two
 * things were wrong with that.
 *
 * It was English on every French page. The one sentence on this site whose
 * whole job is to protect the reader from the publisher's commercial interest
 * was unreadable to the reader it protects — on a site that, under the Charter
 * of the French Language, sells in Quebec, and on pages Health Canada's
 * advertising guidance would already read as closer to promotional because they
 * are not written by an independent party.
 *
 * And its second sentence asserted, in the present tense and about "this page",
 * that the information had been checked against published sources — on pages
 * where CLINICAL_REVIEWER above is deliberately empty because no review has
 * happened. The byline and the schema were both correctly gated on a review
 * existing; this paragraph was not, so the strongest claim on the page was the
 * one thing nothing checked.
 *
 * The tamper-resistance is now an assertion instead of an obstacle:
 * `core/scripts/export-content-review.mjs` fails if either locale's disclosure
 * loses the clause that says Liivv sells these products, or the clause that
 * says nothing here is an endorsement or a recommendation to buy. A check
 * catches a softened sentence in English AND in French, which the old constant
 * could never do.
 * =============================================================================
 */
export const DISCLOSES_COMMERCIAL_RELATIONSHIP = true;

const LANDING = '/liivv-health/ostomy-care';

export const LANDING_HREF = LANDING;
export const SHOP_OSTOMY_HREF = `${LANDING}/shop-ostomy-care`;
export const FUNDING_HREF = `${LANDING}/funding`;

export const CHAPTER_SLUGS = CHAPTER_META.map((c) => c.slug);

export function chapterHref(slug: string) {
  return `${LANDING}/chapters/${slug}`;
}

/* A card on a chapter page, by its 1-based number (the `#card-<n>` anchor). */
export function cardHref(slug: string, card: number) {
  return `${chapterHref(slug)}#card-${card}`;
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

/*
 * The link to a chapter's emergency list, in the page locale. Where the chapter
 * signposts its own list this is a bare same-document fragment, because the
 * wording ("further up this page" / "plus haut sur cette page") promises the
 * page the reader is on.
 */
function urgentExitHref(fromSlug: string, toSlug: string, locale: string) {
  if (toSlug === fromSlug) return '#red-flags';

  return localeHref(`${chapterHref(toSlug)}#red-flags`, locale);
}

/* ---------------------------------------------------------------------------
 * Message shapes, mirroring the numbered-key structure in messages/*.json.
 * `t.raw()` returns `any`, so callers pass it straight in without a cast.
 * ------------------------------------------------------------------------- */

type Numbered<T> = Record<string, T>;

interface FigureMessages {
  heading?: string;
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
  intro?: string;
  systemLegend?: string;
  starterHeading?: string;
  goBagHeading?: string;
  alsoGoBag?: string;
  goBagLink?: string;
  supplies?: Numbered<SupplyRowText>;
  goBagItems?: Numbered<SupplyRowText>;
  panels?: Numbered<{ title: string; body: string }>;
  notToScale?: string;
  mouldable?: string;
  terms?: Numbered<{ term: string; def: string }>;
  clocks?: Numbered<{ body: string }>;
  axis?: { start: string; end: string };
  framing?: Numbered<string>;
  steps?: Numbered<{ title: string; items?: Numbered<string> }>;
  gapLink?: string;
  tell?: { heading: string; items?: Numbered<string> };
}

interface CategoryMessages {
  title: string;
  badge?: string;
  note?: string;
  items?: Numbered<string>;
  sections?: Numbered<{ heading: string; note?: string; items: Numbered<string> }>;
  figure?: FigureMessages;
}

interface ChapterMessages {
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
  recoveryMap?: {
    heading: string;
    intro: string;
    stages: Numbered<{
      heading: string;
      qualifier?: string;
      lanes?: Numbered<{ items?: Numbered<string> }>;
    }>;
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
  pharmacist: { eyebrow: string; heading: string; body: string; cta: string };
  closing: { heading: string; body: string };
  governance: { disclaimer: string };
  startHere?: { pivot: string; segments: Numbered<{ label: string }> };
  urgentExit?: { lead: string; link: string };
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
 * Walk-through steps keep their message key, because meta names a step by key
 * and a cut step leaves a gap in the numbering rather than renumbering the rest.
 */
function keyedSteps(steps: FigureMessages['steps']): FigureText['steps'] {
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
    framing: ordered(figure?.framing),
    steps: keyedSteps(figure?.steps),
    ...(figure?.gapLink === undefined ? {} : { gapLink: figure.gapLink }),
    ...(figure?.tell === undefined
      ? {}
      : { tell: { heading: figure.tell.heading, items: ordered(figure.tell.items) } }),
    ...(figure?.heading === undefined ? {} : { heading: figure.heading }),
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
    ...(figure?.intro === undefined ? {} : { intro: figure.intro }),
    ...(figure?.systemLegend === undefined ? {} : { systemLegend: figure.systemLegend }),
    ...(figure?.starterHeading === undefined ? {} : { starterHeading: figure.starterHeading }),
    ...(figure?.goBagHeading === undefined ? {} : { goBagHeading: figure.goBagHeading }),
    ...(figure?.alsoGoBag === undefined ? {} : { alsoGoBag: figure.alsoGoBag }),
    ...(figure?.goBagLink === undefined ? {} : { goBagLink: figure.goBagLink }),
    supplies: ordered(figure?.supplies),
    goBagItems: ordered(figure?.goBagItems),
    panels: ordered(figure?.panels),
    ...(figure?.notToScale === undefined ? {} : { notToScale: figure.notToScale }),
    ...(figure?.mouldable === undefined ? {} : { mouldable: figure.mouldable }),
    terms: ordered(figure?.terms),
    clocks: ordered(figure?.clocks).map((clock) => clock.body),
    ...(figure?.axis === undefined ? {} : { axis: figure.axis }),
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

/* Register sources, resolved for the page locale. A French file is always French. */
export function resolveSources(ids: readonly SourceId[], locale: string): ResolvedSource[] {
  return ids.map((id) => {
    const source = SOURCE_META[id];
    const frenchFile = locale === 'fr' && source.hrefFr !== undefined;
    const frenchTitle = locale === 'fr' && Boolean(source.labelFr);

    return {
      id,
      ...localizedTitle(source, locale),
      hrefLang: frenchFile ? 'fr' : source.hrefLang,
      // A title without an official translation is in the language of its own page.
      labelLang: frenchTitle ? 'fr' : source.hrefLang,
    };
  });
}

/*
 * The figures a card keeps in this locale.
 *
 * A held figure goes first and goes everywhere: `held` in chapters-meta.ts means
 * the figure is built but not allowed to render until a named decision is
 * recorded, in either locale, so it never reaches a page, a print sheet or a
 * schema. Then on /fr a module whose French is not yet reviewed is dropped
 * (review-gates.ts). A card left with no figures falls back to its plain,
 * reviewed list, because rowLayout then sees no restyle.
 */
function gateFigures(structure: CategoryMeta | undefined, locale: string): FigureMeta[] {
  if (!structure?.figures) return [];

  return structure.figures.filter(
    (figure) => figure.held === undefined && keepsFigure(figure, structure, locale),
  );
}

/*
 * Figures and their labels, spread into the card only when any survive the
 * gates.
 *
 * `exitFallback` is the one thing a dropped figure leaves behind: a module
 * marked `exitWhenGated` in chapters-meta.ts renders the chapter's emergency
 * signpost and points at a list on another page, so when this locale's gate
 * drops it the card prints that signpost in its place (`needsCardExit` in
 * figures.tsx). Without it the band after the cards is the only thing left
 * carrying the pointer, and on Chapter 03 that band is about funding.
 *
 * A held figure is not a gate: it is absent in both locales and leaves nothing
 * behind, because there is no reviewed module for the card to stand in for.
 */
function composeCardFigures(
  structure: CategoryMeta | undefined,
  figure: FigureMessages | undefined,
  locale: string,
): Pick<CategoryCard, 'exitFallback' | 'figures' | 'figureText'> {
  if (structure?.figures === undefined) return {};

  const figures = gateFigures(structure, locale);
  const gatedExit = structure.figures.some(
    (candidate) =>
      candidate.exitWhenGated === true &&
      candidate.held === undefined &&
      !figures.includes(candidate),
  );

  return {
    ...(figures.length ? { figures, figureText: composeFigureText(figure) } : {}),
    ...(gatedExit ? { exitFallback: true as const } : {}),
  };
}

type RecoveryMapMessages = NonNullable<ChapterMessages['recoveryMap']>;
type RecoveryStageMessages = RecoveryMapMessages['stages'][string];

/*
 * One recovery-map line. A `cardRef` line is that card's own reviewed sentence,
 * looked up in the composed cards, so it follows the card in every locale.
 */
function recoveryItemText(
  item: RecoveryStageMeta['lanes'][number]['items'][number],
  message: string | undefined,
  categories: CategoryCard[],
) {
  if (!item.cardRef) return message ?? '';

  return categories[item.cardRef.card - 1]?.items?.[item.cardRef.item - 1] ?? '';
}

function composeRecoveryStage(
  stage: RecoveryStageMeta,
  words: RecoveryStageMessages | undefined,
  locale: string,
  categories: CategoryCard[],
): RecoveryMap['stages'][number] {
  return {
    heading: words?.heading ?? '',
    ...(words?.qualifier === undefined ? {} : { qualifier: words.qualifier }),
    anchor: stage.anchor,
    lanes: stage.lanes.map((lane, laneIndex) => {
      const messages = words?.lanes?.[String(laneIndex + 1)]?.items;

      return {
        lane: lane.lane,
        items: lane.items
          .map((item, itemIndex) => ({
            text: recoveryItemText(item, messages?.[String(itemIndex + 1)], categories),
            ...(item.types === undefined ? {} : { types: item.types }),
          }))
          .filter((item) => item.text !== ''),
      };
    }),
    sources: resolveSources(stage.sources, locale),
  };
}

/*
 * The recovery map, or nothing where the chapter has none or its French is not
 * yet reviewed. Nothing here is the signal for the page to show the chapter's
 * programs band instead (review-gates.ts, gate `recoveryMap`).
 */
function composeRecoveryMap(
  meta: ChapterMeta,
  messages: ChapterMessages,
  locale: string,
  categories: CategoryCard[],
): RecoveryMap | undefined {
  const words = messages.recoveryMap;

  if (!meta.recoveryMap || !words || isFrGated('recoveryMap', locale)) return undefined;

  return {
    heading: words.heading,
    intro: words.intro,
    stages: meta.recoveryMap.stages.map((stage, index) =>
      composeRecoveryStage(stage, words.stages[String(index + 1)], locale, categories),
    ),
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
  link: ShelfLinkMeta,
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
      hrefLang: link.hrefLang,
    },
  ];
}

/*
 * The resources shelf (C14), or nothing where the chapter has none or its
 * French is not yet reviewed (review-gates.ts, gate `shelf`). Held links are
 * dropped here, and a group left with no links — or with no heading — goes with
 * them, so the page can never render an empty group, a blank heading or a
 * placeholder for something we are not showing.
 */
function composeShelf(
  meta: ChapterMeta,
  messages: ChapterMessages,
  locale: string,
): Shelf | undefined {
  const words = messages.shelf;

  if (!meta.shelf || !words || isFrGated('shelf', locale)) return undefined;

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
     * links have in common. The export names the group it dropped.
     */
    const heading = groupWords?.heading;

    return links.length && heading ? [{ glyph: group.glyph, heading, links }] : [];
  });

  return groups.length ? { heading: words.heading, groups } : undefined;
}

type BandCardMessages = NonNullable<ChapterMessages['programsBand']>['cards'][string];

/*
 * The plain links under one referral-band card (C12), for the page locale.
 *
 * A link is dropped where this page locale is not one it is offered in, and
 * where its label is missing from this locale's message file — a bare URL is
 * not something a reader can judge before following it.
 *
 * The whole set waits on the `childLinks` French gate, because the labels are
 * new French. The card's own reviewed sentence is not gated and stays, so /fr
 * loses a link rather than the referral.
 */
function composeBandLinks(
  links: BandLinkMeta[] | undefined,
  words: BandCardMessages['links'],
  locale: string,
): BandLink[] {
  if (!links || isFrGated('childLinks', locale)) return [];

  return links.flatMap((link, index) => {
    const label = words?.[String(index + 1)]?.label;

    if (!label || !link.locales.some((offered) => offered === locale)) return [];

    return [{ label, href: link.href, hrefLang: link.hrefLang }];
  });
}

/*
 * The referral band, with the links C12 puts under its cards. The band's own
 * wording is already reviewed in both locales and is never gated; a card with
 * no surviving links carries no `links` key at all, so the renderer cannot wrap
 * an empty list around nothing.
 */
function composeProgramsBand(
  meta: ChapterMeta,
  messages: ChapterMessages,
  locale: string,
): Chapter['programsBand'] {
  const words = messages.programsBand;

  if (!words) return undefined;

  return {
    ...(words.heading === undefined ? {} : { heading: words.heading }),
    cards: ordered(words.cards).map((card, index) => {
      const links = composeBandLinks(meta.programsBandLinks?.[index], card.links, locale);

      return {
        heading: card.heading,
        body: card.body,
        ...(links.length ? { links } : {}),
      };
    }),
  };
}

/*
 * Citations come from the meta rather than the messages, so a translation pass
 * cannot rename a published document. A French title is used only where the
 * publisher issues one; otherwise the English title stands in both locales,
 * which matches the page the link actually opens.
 *
 * The recovery map's stage sources join the list when the map renders, so the
 * governance block names every document the page leans on. One entry per link.
 */
function composeCitations(
  meta: ChapterMeta,
  locale: string,
  recoveryMap: RecoveryMap | undefined,
): Citation[] | undefined {
  const stageSources = (recoveryMap?.stages ?? []).flatMap((stage) =>
    stage.sources.map(({ label, href }) => ({ label, href })),
  );
  const all = [
    ...meta.citations.map((citation) => localizedTitle(citation, locale)),
    ...stageSources,
  ];
  const citations = all.filter(
    (citation, index) => all.findIndex((other) => other.href === citation.href) === index,
  );

  return citations.length ? citations : undefined;
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
  meta: ChapterMeta,
  messages: ChapterMessages,
  locale: string,
  groupLabels: Record<string, string>,
): Chapter {
  const categories: CategoryCard[] = ordered(messages.categories).map((card, index) => {
    const structure = meta.categories[index];

    return {
      title: card.title,
      number: index + 1,
      image: structure?.image ?? meta.heroImage,
      ...composeCardFigures(structure, card.figure, locale),
      ...(structure?.noteVisible ? { noteVisible: true } : {}),
      ...(structure?.ask === undefined ? {} : { ask: structure.ask }),
      ...(structure?.products === undefined ? {} : { productIds: structure.products }),
      ...(structure?.urgentContent ? { urgentContent: true } : {}),
      ...(structure?.group === undefined
        ? {}
        : { group: groupLabels[structure.group] ?? structure.group }),
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

  const programsBand = composeProgramsBand(meta, messages, locale);
  const recoveryMap = composeRecoveryMap(meta, messages, locale, categories);
  const shelf = composeShelf(meta, messages, locale);
  const citations = composeCitations(meta, locale, recoveryMap);

  /*
   * The start-here map lists each group's cards in page order, so the map and
   * the page can never disagree about what is where.
   */
  const startHere =
    meta.startHere && messages.startHere
      ? {
          pivot: messages.startHere.pivot,
          segments: meta.startHere.groups.map((groupKey, segmentIndex) => ({
            label: ordered(messages.startHere?.segments)[segmentIndex]?.label ?? '',
            cards: categories
              .filter((_, cardIndex) => meta.categories[cardIndex]?.group === groupKey)
              .map((card) => ({
                number: card.number,
                title: card.title,
                ...(card.ask === undefined ? {} : { ask: card.ask }),
              })),
          })),
        }
      : undefined;

  const urgentExit =
    meta.urgentExit && messages.urgentExit
      ? {
          lead: messages.urgentExit.lead,
          link: messages.urgentExit.link,
          href: urgentExitHref(meta.slug, meta.urgentExit.chapter, locale),
        }
      : undefined;

  return {
    slug: meta.slug,
    num: meta.num,
    chapterWord: meta.chapterWord,
    rail: meta.rail ?? true,
    majorSections: meta.majorSections === true,
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
    ...(recoveryMap === undefined ? {} : { recoveryMap }),
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
      author: CONTENT_AUTHOR,
      reviewer: CLINICAL_REVIEWER,
      reviewedOn: '',
      disclosure: DISCLOSES_COMMERCIAL_RELATIONSHIP,
      disclaimer: messages.governance.disclaimer,
    },
    pharmacist: {
      eyebrow: messages.pharmacist.eyebrow,
      heading: messages.pharmacist.heading,
      body: messages.pharmacist.body,
      cta: messages.pharmacist.cta,
      href: localeHref(meta.pharmacistHref, locale),
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
/*
 * Pass `messages.OstomyCare.chapters` and `messages.OstomyCare.ui.chapter.groups`.
 * Group labels are resolved here so every card in a cluster shows the same name.
 */
export function buildChapters(
  raw: Numbered<ChapterMessages>,
  locale = 'en',
  groupLabels: Record<string, string> = {},
): Chapter[] {
  return CHAPTER_META.flatMap((meta) => {
    const messages = raw[meta.slug];

    return messages ? [composeChapter(meta, messages, locale, groupLabels)] : [];
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
