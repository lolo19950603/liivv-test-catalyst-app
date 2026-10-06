/* Twin of ostomy-care/chapters/chapters-meta.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * MICROSITE CHAPTERS — SHARED STRUCTURE
 * =============================================================================
 * The structural types every care site's chapters-meta.ts is written in. They
 * are Ostomy's, from ostomy-care/chapters/chapters-meta.ts, cut down to what
 * the shared engine draws and made generic over what each site names for
 * itself. The comments there give the clinical reason for each rule, and those
 * reasons hold here too.
 *
 * A site fills in four names:
 *   Src     — the ids in its source register (sources-meta.ts)
 *   Ask     — who a card can send a reader to
 *   Glyph   — its symbol names (glyph-paths.ts), which must include EngineGlyph
 *   SiteFig — its own figure kinds, which the engine hands back to the site to
 *             draw (SiteFigureRegistry in ../site-context)
 * and may fill in two more, which default to none:
 *   Topic   — the topics of the who-to-ask lanes
 *   Hold    — the decisions a figure or a shelf link can be held for
 *
 * What stays with one site is not here: Ostomy's supply list, gap comparison,
 * recovery map and the rest of its own figures. The products under a card are
 * not chapter structure: they are the site's merchandising record
 * (../shop/shelves.ts).
 *
 * Types only. A site's chapters-meta.ts reaches this file with statement-form
 * `import type`, and the content-review export loads that file under Node's
 * type stripping, so nothing here may exist at run time.
 * =============================================================================
 */

/* The language of the page an outward link opens. See LinkLang in Ostomy's meta. */
export type LinkLang = 'en' | 'fr';

/*
 * The symbols the engine draws by name rather than from a site's meta: the
 * crisis strip's call and text, the take-in card's print button, a lane's
 * "fits" badge, the "and more" criterion and the emergency signpost. Every
 * site's Glyph union includes these, and its glyph-paths.ts draws them.
 */
export type EngineGlyph = 'phone' | 'text' | 'print' | 'check' | 'more' | 'urgent';

/*
 * A source backing a factual claim. The label is the document's own title and
 * never goes through the message tree, so a translation pass cannot rename a
 * published document.
 */
export interface CitationMeta {
  /** The title as its publisher prints it. Never translated. */
  label: string;
  /** Official French title, only where the publisher actually publishes one. */
  labelFr?: string;
  href: string;
  /** Official French URL, only where the publisher maintains a separate one. */
  hrefFr?: string;
}

/*
 * One number on the crisis strip. The number is structural, so a translation
 * can never change what a reader dials; the words around it come from
 * `ui.chapter.crisis` in the site's messages. `sms` offers tap-to-text on the
 * same number. `emergency` marks emergency services (9-1-1) rather than a
 * crisis line (9-8-8), so the strip can word the two differently.
 */
export interface CrisisLine {
  /** Digits only, dialled exactly as written. */
  tel: string;
  sms?: true;
  kind?: 'emergency';
  /*
   * How the number is printed, where the site writes it some other way than
   * the strip's default, which hyphenates a three-digit number (9-8-8).
   * Diabetes Care writes its emergency number as 911. Display only: `tel` is
   * still what is dialled. Engine-only so far: Ostomy's twin has none.
   */
  written?: string;
}

/*
 * One lane of the who-to-ask figure. `item` is the card's own reviewed
 * sentence; a lane without one is new text from `figure.lanes.<n>.body`.
 * `topics` is what the lane can answer, for the optional topic filter.
 * `sources` backs a lane's own new text and `linkSources` the page its link
 * opens. Review only; neither renders. `contact` marks a lane that reaches the
 * site's specialist service directly: under its words it shows the site's
 * whole `contact` (phone, email, hours and About page, SpecialistContact) in
 * place of a single link, so it takes no `href`.
 */
export interface LaneMeta<Src extends string, Glyph extends string, Topic extends string = never> {
  glyph: Glyph;
  item?: number;
  service?: boolean;
  contact?: boolean;
  topics: Topic[];
  href?: string;
  /** The language of the page `href` opens. Required wherever `href` is set. */
  hrefLang?: LinkLang;
  /*
   * The publisher's own French page, opened from /fr in place of `href` (and
   * then in French), only where the publisher maintains one. Engine-only so
   * far: Ostomy's twin has none.
   */
  hrefFr?: string;
  sources?: Src[];
  linkSources?: Src[];
}

/*
 * The figure kinds the engine draws itself, on any site. Each one either
 * AUGMENTS its card, adding a visual beside prose that stays exactly as it is,
 * or RESTYLES it, carrying the card's own item sentences by number so nothing
 * is paraphrased. Which kinds do what is in ./kinds.ts.
 */
export type BaseFigureMeta<Src extends string, Glyph extends string, Topic extends string = never> =
  /* The site's crisis and emergency numbers. Augments; never collapsible, never gated. */
  | { kind: 'crisis'; numbers: readonly [CrisisLine, ...CrisisLine[]] }
  /* Parallel routes to different kinds of help, all shown at once. Augments. */
  | { kind: 'routes'; routes: Array<{ glyphs: Glyph[] }> }
  /* What something weighs, as labelled symbols. Augments; no body drawing. */
  | { kind: 'criteria'; glyphs: Glyph[] }
  /*
   * The card's own list as a printable card to take to an appointment. Restyles.
   * `fields` adds that many blank write-in lines after the list, each labelled
   * from `figure.fields.<n>`: a plan the reader fills in with their team, such
   * as a sick-day plan. The count is structural, so a translation can neither
   * add a line to fill in nor drop one.
   */
  | { kind: 'takeIn'; fields?: number }
  /*
   * Items grouped under short headings. Restyles. `lead` sits above the
   * columns (a line the columns depend on, such as a definition), `neutral`
   * beneath. Engine-only so far: Ostomy's twin has no `lead`.
   */
  | { kind: 'columns'; columns: number[][]; lead?: number[]; neutral?: number[] }
  /* Where things go. Restyles; generic symbols, never products. */
  | {
      kind: 'containers';
      containers: Array<{ glyph: Glyph; items: Array<{ item: number; glyph: Glyph }> }>;
    }
  /*
   * Who answers what, side by side and unranked. Restyles. `topicKeys` is the
   * order the topic tick boxes are shown in, index-matched to
   * `figure.topics.<n>.label`.
   */
  | { kind: 'lanes'; lanes: Array<LaneMeta<Src, Glyph, Topic>>; topicKeys: Topic[] }
  /*
   * Onward links to the chapter that covers each item. Restyles. `card` opens
   * that chapter at one of its cards (`#card-<n>`) rather than at its top.
   * Engine-only so far: Ostomy's twin has no `card`.
   */
  | {
      kind: 'doors';
      doors: Array<{ glyph: Glyph; item: number; chapter: string; card?: number }>;
    };

export type BaseFigureKind = BaseFigureMeta<string, string, string>['kind'];

/*
 * Never behind a French review gate, on any site: the crisis strip and the
 * routes to help. A site's review-gates.ts excludes these from its gated kinds.
 */
export type UngateableKind = Extract<BaseFigureKind, 'crisis' | 'routes'>;

/* What a site's own figure kind has to look like to share a card with the engine's. */
export interface SiteFigureBase {
  kind: string;
}

/*
 * A figure kind, able to carry a hold or keep the chapter's emergency signpost
 * when a review gate drops it. Distributed over the union rather than
 * intersected with it whole, so `Extract<…, { kind: 'lanes' }>` still narrows
 * to a single kind. With no Hold given, nothing can be held.
 */
export type Holdable<T, Hold extends string = never> = T extends unknown
  ? T & { exitWhenGated?: true; held?: Hold }
  : never;

export type FigureMeta<
  Src extends string,
  Glyph extends string,
  SiteFig extends SiteFigureBase = never,
  Topic extends string = never,
  Hold extends string = never,
> = Holdable<BaseFigureMeta<Src, Glyph, Topic> | SiteFig, Hold>;

/*
 * A link from one of a card's own sentences to a card or a section of another
 * chapter, made without changing a word of the sentence. `at` names the
 * message: the card's `note`, or one of its items by number (`items.<n>`).
 * Where that message wraps a phrase in `<link>…</link>` (next-intl's rich-text
 * form; the tags go around words already there and add none), the phrase is
 * the link; otherwise the whole sentence is. The composer takes the tags out
 * of the text, so nothing else ever shows them.
 *
 * `to` is a chapter of the same site, opened at one of its cards by number
 * (`#card-<n>`) or at an anchor it renders, such as its red-flag list. A link
 * into the reader's own chapter is a bare fragment. Navigation only: it adds
 * no words, so no French review gate holds it back.
 *
 * `view` opens the card's figure in one of its own views, as
 * `?view=<view>#card-<n>`, such as Diabetes Care's Rule of 15 with the
 * amounts for a child showing (`'child'`). The figure's controls read it on
 * load, for their own card only; a figure without that view, a gated one and
 * a page with JavaScript off all ignore it and show the card as usual.
 */
export interface CardLinkMeta {
  at: 'note' | `items.${number}`;
  /*
   * A chapter card, a chapter anchor, or one of the site's own pages under its
   * base path (`page: 'funding'` → <basePath>/funding), each in the page locale.
   * Or an outward page the site's register lists (`source`), written out as
   * its address, and its French address for /fr where the publisher has one,
   * because a chapters-meta.ts may not import the register by value. The
   * content-review export checks both against the register entry. Engine-only
   * so far: Ostomy's twin has none.
   */
  to:
    | { chapter: string; card: number; view?: string }
    | { chapter: string; anchor: string }
    | { page: string }
    | { source: string; href: string; hrefFr?: string };
}

/*
 * Per-card structure. Index-matched to the numbered keys under `categories`
 * in the message tree.
 */
export interface CategoryMeta<
  Src extends string,
  Ask extends string,
  Glyph extends string,
  SiteFig extends SiteFigureBase = never,
  Topic extends string = never,
  Hold extends string = never,
> {
  image: string;
  /** Which cluster this card belongs to, as a key into `ui.chapter.groups`. */
  group?: string;
  /**
   * Who this card sends you to. Drives the ask chip, labelled from
   * `ui.chapter.ask.<role>`. Structural, so a translation cannot change who a
   * reader is told to consult. 'assessment' and 'urgent' render in the warning
   * tone on every site.
   */
  ask?: Ask;
  /**
   * The card carries a same-day, emergency or crisis line. It renders open,
   * cannot be collapsed, and keeps every figure in every locale.
   */
  urgentContent?: boolean;
  /** Visual shapes for this card's copy, in render order. */
  figures?: Array<FigureMeta<Src, Glyph, SiteFig, Topic, Hold>>;
  /** The register entries backing this card's own sentences, for the content review. */
  sources?: Src[];
  /** Keep the card's closing note outside the collapsible region. */
  noteVisible?: boolean;
  /*
   * Links from the card's own sentences to other chapters' cards
   * (CardLinkMeta). Engine-only so far: Ostomy's twin has none.
   */
  links?: CardLinkMeta[];
}

/*
 * One outward link on the resources shelf. We link; we never embed a video,
 * frame a page or reproduce a guide. `org` is structural, like a citation
 * label. `heldUntil` keeps the link off the page in both locales until the
 * named decision is recorded, and the export lists it as held.
 */
export interface ShelfLinkMeta<Src extends string, Hold extends string = never> {
  org: string;
  orgFr?: string;
  href: string;
  /** Official French page, only where the publisher maintains a separate one. */
  hrefFr?: string;
  hrefLang: LinkLang;
  heldUntil?: Hold;
  /** The link downloads a file; its `note` message must give the type and size. */
  fileNote?: boolean;
  /** The register entries this link is, or is backed by. Review only. */
  sources: Src[];
}

/** The shelf: one group per kind of help, index-matched to `shelf.groups.<n>`. */
export interface ShelfMeta<Src extends string, Glyph extends string, Hold extends string = never> {
  groups: Array<{ glyph: Glyph; links: Array<ShelfLinkMeta<Src, Hold>> }>;
}

/*
 * A plain link under a card of the referral band. `locales` is the page
 * languages that show it; `hrefLang` is the language of the page it opens.
 */
export interface BandLinkMeta<Src extends string> {
  /*
   * An outward https:// page, or a Liivv page as a site-absolute path, which
   * opens in the page locale (and in the page's language) whatever `hrefLang`
   * says.
   */
  href: string;
  /*
   * The publisher's own French page, opened from /fr in place of `href`
   * (and then in French), only where the publisher maintains one.
   */
  hrefFr?: string;
  /** The language of the page `href` opens. */
  hrefLang: LinkLang;
  /** The page locales that render it, in no particular order. */
  locales: LinkLang[];
  /** The register entries this link is, or is backed by. Review only. */
  sources: Src[];
}

/*
 * The start-here map: two of the chapter's groups, either side of a pivot
 * line. Exactly two, by type, because the map is drawn as a before and an
 * after. Labels come from `chapters.<slug>.startHere`.
 */
export interface StartHereMeta {
  groups: readonly [string, string];
}

/* One side of the start-here map, composed: its label and its cards in page order. */
export interface StartHereSegment<Ask extends string> {
  label: string;
  cards: Array<{ number: number; title: string; ask?: Ask }>;
}

/*
 * The start-here map as the page draws it. Still exactly two sides. `heading`
 * is the chapter's own, from `chapters.<slug>.startHere.heading`; a chapter
 * without one shows the site-wide `ui.chapter.startHere.heading`.
 */
export interface StartHere<Ask extends string> {
  heading?: string;
  pivot: string;
  segments: readonly [StartHereSegment<Ask>, StartHereSegment<Ask>];
}

export interface ChapterMeta<
  Src extends string,
  Ask extends string,
  Glyph extends string,
  SiteFig extends SiteFigureBase = never,
  Topic extends string = never,
  Hold extends string = never,
> {
  slug: string;
  num: string;
  chapterWord: string;
  heroImage: string;
  accent: string;
  /** One per numbered category in the message tree, in the same order. */
  categories: Array<CategoryMeta<Src, Ask, Glyph, SiteFig, Topic, Hold>>;
  pharmacistImage: string;
  pharmacistHref: string;
  /** One inner array per resource group, in message order. */
  resourceLinks: string[][];
  citations: CitationMeta[];
  /** Show the group filter rail. */
  rail?: boolean;
  /** Each group is its own page section, with a large heading. */
  majorSections?: boolean;
  /** A start-here map built from two of the chapter's groups, in order. */
  startHere?: StartHereMeta;
  /*
   * A one-line signpost to another chapter's emergency list, for chapters that
   * have none of their own. Wording from `chapters.<slug>.urgentExit`.
   */
  urgentExit?: { chapter: string };
  /*
   * `false` leaves the intro heading unrendered in the first band's callout;
   * the intro body still shows. Ostomy's Chapter 01 does this.
   */
  introHeading?: false;
  /*
   * A card whose title, where it appears in the intro body, becomes a link to
   * that card. Ostomy's Chapter 01 links First Week Basics this way.
   */
  introCard?: number;
  /*
   * Plain links under the referral band's cards: one inner array per band
   * card, index-matched to `programsBand.cards`, empty for a card with none.
   */
  programsBandLinks?: Array<Array<BandLinkMeta<Src>>>;
  /*
   * A chapter card each referral-band card points to, index-matched to
   * `programsBand.cards` (null for none). Where that card's title appears in
   * the band card's body, it becomes a link to the card, as `introCard` does
   * for the intro. Navigation only. Engine-only so far: Ostomy's twin has none.
   */
  programsBandCards?: Array<number | null>;
  /** The register entries backing the referral band's own sentences. Review only. */
  bandSources?: Src[];
  /** The resources shelf, between the band slot and the pharmacist panel. */
  shelf?: ShelfMeta<Src, Glyph, Hold>;
}

/*
 * The same shapes as the engine reads them: every name a plain string, and any
 * figure kind allowed. A site's own CHAPTER_META, written against its own
 * unions, is assignable to these, so the engine takes any site's chapters
 * without knowing its names.
 */
export type EngineFigureMeta = FigureMeta<string, string, SiteFigureBase, string, string>;

export type EngineCategoryMeta = CategoryMeta<
  string,
  string,
  string,
  SiteFigureBase,
  string,
  string
>;

export type EngineChapterMeta = ChapterMeta<string, string, string, SiteFigureBase, string, string>;

/* One of the kinds the engine draws itself, as the engine reads it. */
export type EngineBaseFigureMeta = Holdable<BaseFigureMeta<string, string, string>, string>;
