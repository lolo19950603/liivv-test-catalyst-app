/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — STRUCTURE
 * =============================================================================
 * Prose lives in messages/*.json under OstomyCare.chapters, so it can be
 * translated by scripts/fill-fr-messages.mjs like the rest of the Liivv copy.
 * This file holds only what is not language-dependent: slugs, image paths,
 * accents, and the outward URLs.
 *
 * Lists here are index-matched to the numbered keys in the message tree.
 * The content-review export checks the lengths line up and fails loudly if
 * they drift: `node core/scripts/export-content-review.mjs --check`.
 *
 * Keep this file free of value imports and non-erasable TypeScript: the export
 * loads it directly under Node's type stripping. Use statement-form
 * `import type` only.
 * =============================================================================
 */

import type { OstomyType } from './ostomy-types';
import type { SourceId } from './sources-meta';

const IMG = '/archive/ostomy-care';
const PHARMACIST_HREF = '/account/virtual-care';

/*
 * The language of the page an outward link opens. Every link out of a chapter
 * carries one, so the link text can say "(in English)" or "(en français)"
 * wherever it differs from the page a reader is on — the same treatment on the
 * resources shelf, on the who-to-ask lanes and in the pouch change walk-through,
 * because they send people to the same few pages.
 */
export type LinkLang = 'en' | 'fr';

/* The NSWOCC directory. For non-urgent questions; it says so on its own page. */
const FIND_NSWOC_HREF = 'https://membersnswoc.ca/find.phtml';

/* Ostomy Canada's own chapter and peer-visitor finder. Their site, their list. */
const PEER_FINDER_HREF = 'https://ostomycanada.ca/find-a-chapter-peer-support-group/';

/*
 * NSWOCC's listing page for the patient guides, never the PDFs themselves: the
 * guides may be reproduced only unmodified and with permission, and the listing
 * is where their current editions and French versions actually live.
 */
const NSWOCC_GUIDES_HREF = 'https://www.nswoc.ca/guides';

/* Santé Québec — Laurentides teaching videos. French page, French videos. */
const SANTE_LAURENTIDES_VIDEOS_HREF =
  'https://www.santelaurentides.gouv.qc.ca/soins-et-services/stomie/videos-stomie/';

/*
 * SickKids' AboutKidsHealth (C12). Their legal page encourages plain links and
 * prohibits framing and any suggestion of endorsement, so these are links and
 * nothing else: no embed, no copy of the instructions, no product beside them.
 *
 * The publisher maintains the two pages separately rather than as one page in
 * two languages — the English instructions were updated in December 2023, the
 * French overview in November 2013 — so they are two links, not one link with
 * an `hrefFr`, and the French one says how old it is in its own link text.
 */
const AKH_OSTOMY_CARE_HREF = 'https://www.aboutkidshealth.ca/ostomy-care-instructions';
const AKH_OSTOMY_OVERVIEW_FR_HREF = 'https://www.aboutkidshealth.ca/ostomy-overview?language=fr';

/*
 * A source backing a factual claim.
 *
 * The label is the document’s own title and never goes through the message
 * tree, because a translation pass would otherwise rename a published
 * document — the journal Inflammatory Bowel Diseases came back as "Maladies
 * inflammatoires de l’intestin", which is not a thing a reader can find.
 * Same rule as programName in funding-meta.ts.
 */
export interface CitationMeta {
  /** The title as its publisher prints it. Never translated. */
  label: string;
  /**
   * Official French title, only where the publisher actually publishes one.
   * Leave undefined and the English title shows in both locales, which is
   * honest: that is the language of the page the link opens.
   */
  labelFr?: string;
  href: string;
  /** Official French URL, only where the publisher maintains a separate one. */
  hrefFr?: string;
}

/*
 * Wordless line symbols. Every one is paired with a translated text label.
 * Drawings live in glyph-paths.ts.
 */
export type GlyphName =
  | 'nswoc'
  | 'team'
  | 'peer'
  | 'primaryCare'
  | 'service'
  | 'urgent'
  | 'phone'
  | 'text'
  | 'waist'
  | 'fold'
  | 'scar'
  | 'belt'
  | 'more'
  | 'print'
  | 'home'
  | 'bag'
  | 'shirt'
  | 'list'
  | 'hands'
  | 'food'
  | 'walk'
  | 'people'
  | 'book'
  | 'video'
  | 'pin'
  | 'calendar'
  | 'coin'
  | 'check';

/*
 * The pouching systems a walk-through sentence can apply to: one-piece,
 * two-piece, drainable, closed and urostomy. Structural, so a translation
 * cannot change which reader a sentence is for. Labels live in
 * `ui.chapter.changeRoutine.systems`.
 */
export type PouchSystem = 'one' | 'two' | 'drain' | 'closed' | 'uro';

/*
 * What a question is about, for the "Who to ask" lanes (C09). Topics, never
 * symptoms: nothing here describes a body, and no topic maps to a product.
 * Labels live under the card's `figure.topics` key in the message tree.
 */
export type LaneTopic = 'skin' | 'recovery' | 'peer' | 'product';

/*
 * The brand-free criteria the supply list (C02) is split into.
 *
 * An NSWOC approves the split and what each criterion means in generic terms —
 * "a wipe with no moisturisers or oils" — and nothing beyond that. Which
 * product or category answers a criterion is a merchandising judgement and
 * lives in supply-list-merchandising.ts, which imports this type.
 *
 * The dependency runs one way on purpose: the clinical structure must never
 * import the commercial record, or a change to what Liivv stocks could change
 * what the list says.
 */
export type CriterionKey =
  | 'pouchOne'
  | 'pouchTwo'
  | 'disposalBags'
  | 'skinProtectant'
  | 'dryWipes'
  | 'adhesiveRemover'
  | 'underwearLiner';

/*
 * A row's identity on the supply list.
 *
 * `pouch` is the row whose criterion follows the system the reader picks, and
 * `spareSystem` is the go-bag spare of that same system; neither resolves to a
 * criterion until a system is chosen. `powder` is text only — it can never
 * become a tick box, carry a link or reach the cart, because a product beside
 * it would sit next to skin problems an NSWOC should look at.
 */
export type SupplyItemKey = CriterionKey | 'pouch' | 'spareSystem' | 'powder';

/*
 * One row of the supply list, index-matched to `figure.supplies.<n>` or
 * `figure.goBagItems.<n>` in the message tree.
 *
 * `card` and `item` name the reviewed sentence the row was split out of, so
 * the content review can show where every row came from. They are review data:
 * nothing renders from them.
 */
export interface SupplyListItem {
  key: SupplyItemKey;
  card: number;
  item: number;
  /** The label carries a condition ("only if…"), shown inside the label. */
  conditional?: boolean;
  /** Plain text: no tick box, no link, no cart action, in any state. */
  textOnly?: boolean;
  /** Listed once, in the starter group, marked as also for the go-bag. */
  alsoGoBag?: boolean;
}

/*
 * A card figure: the visual shape given to a card's reviewed copy.
 *
 * Two relationships only. A figure either AUGMENTS the card — adds a visual
 * beside prose that stays exactly as it is — or RESTYLES it, carrying the
 * card's own item sentences word for word so nothing is paraphrased. Restyle
 * figures reference items by their number rather than copying the text, so
 * each reviewed sentence still has one source. Any short label a figure needs
 * lives under the card's `figure` key in the message tree, where the content
 * review export picks it up for review.
 *
 * Nothing here maps a symptom to a cause or a product, scores the reader, or
 * collapses urgent wording.
 */
type FigureKindMeta =
  /* 9-8-8, verbatim from ui.chapter.crisis. Augments; never collapsible. */
  | { kind: 'crisis' }
  /* Parallel routes to different kinds of help, all shown at once. Augments. */
  | { kind: 'routes'; routes: Array<{ glyphs: GlyphName[] }> }
  /* What something weighs, as labelled symbols. Augments; no body drawing. */
  | { kind: 'criteria'; glyphs: GlyphName[] }
  /* The card's own list as a printable card to take to an appointment. Restyles. */
  | { kind: 'takeIn' }
  /* Items grouped under short headings. Restyles. `neutral` sits beneath. */
  | { kind: 'columns'; columns: number[][]; neutral?: number[] }
  /* Where things go. Restyles; generic symbols, never products. */
  | {
      kind: 'containers';
      containers: Array<{ glyph: GlyphName; items: Array<{ item: number; glyph: GlyphName }> }>;
    }
  /*
   * Who answers what, side by side and unranked. Restyles.
   *
   * `item` is the card's own reviewed sentence. A lane without one is new text
   * from `figure.lanes.<n>.body`, and so is any `href`'s `linkLabel`: both wait
   * on the `finder` French gate, so on /fr the card keeps exactly the lanes its
   * French review covered (review-gates.ts, and the filter below).
   *
   * `topics` is what a lane can answer, for the optional topic filter. Ticking
   * a topic marks the lanes that fit and nothing else: no lane is reordered,
   * hidden or scored, and a service lane can only ever match 'product'.
   * `topicKeys` is the order the tick boxes are shown in, index-matched to
   * `figure.topics.<n>.label`.
   *
   * `sources` backs a lane's own new text and `linkSources` the page its link
   * opens. A lane that shows one of the card's sentences needs neither: that
   * sentence is already backed by the chapter's own citations. Review only;
   * neither renders.
   */
  | {
      kind: 'lanes';
      lanes: Array<{
        glyph: GlyphName;
        item?: number;
        service?: boolean;
        topics: LaneTopic[];
        href?: string;
        /** The language of the page `href` opens. Required wherever `href` is set. */
        hrefLang?: LinkLang;
        sources?: SourceId[];
        linkSources?: SourceId[];
      }>;
      topicKeys: LaneTopic[];
    }
  /* Onward links to the page that covers each item. Restyles. */
  | { kind: 'doors'; doors: Array<{ glyph: GlyphName; item: number; chapter: string }> }
  /*
   * "My supply list" (C02), in the card's own labelled shop band. AUGMENTS:
   * the card's reviewed sentences stay in its body exactly as they are, and
   * the list is a shopping tool split out of them — never an instruction.
   *
   * `system` names the reviewed sentence the one-piece / two-piece question
   * comes from. `items` is the starter group and `goBagItems` the go-bag
   * group, each index-matched to `figure.supplies.<n>` and
   * `figure.goBagItems.<n>`. Nothing is ticked for the reader, no row is
   * ranked, and no row shows a price, a brand or an image.
   */
  | {
      kind: 'supplyList';
      system: { item: number };
      items: SupplyListItem[];
      goBagItems: SupplyListItem[];
    }
  /*
   * The go-bag card's band: one same-page link to the list above, which
   * already carries the go-bag rows. Augments. There is one list, so a reader
   * never keeps two.
   */
  | { kind: 'goBag' }
  /*
   * The gap between a barrier's opening and the stoma, as three static panels
   * side by side: touching, a small gap, a large gap. AUGMENTS the card — its
   * reviewed sentences stay exactly as they are, and the panels carry only the
   * figure's own labels from `figure.panels`.
   *
   * Deliberately not a slider and not a gap a reader can set. Canadian guides
   * disagree on the number (NSWOCC 1–2 mm, KHSC about 3 mm), so a control with
   * a "right" zone would pick one answer for a reader whose nurse taught the
   * other; on-screen millimetres would invite measuring a real stoma against a
   * screen. Nothing here is marked correct, nothing is highlighted, and the
   * drawings say "not to scale" above them.
   *
   * The only control is a round / oval pair that redraws the same three panels,
   * because not every stoma is round. It changes the shape and nothing else.
   *
   * `sources` backs the panel captions and the two notes. Review only; it never
   * renders.
   */
  | { kind: 'gapCompare'; sources: SourceId[] }
  /*
   * The parts of a pouching system (C08) on Chapter 02 card 3: an abstract line
   * drawing beside a list of terms. AUGMENTS the card — its three sections of
   * reviewed sentences stay exactly as they are — and the drawing carries no
   * words at all. It is aria-hidden; the `figure.terms` list is the content, and
   * the terms never repeat a card sentence in full.
   *
   * Two view pairs redraw the same parts: one-piece / two-piece, and drainable /
   * closed / urostomy. They swap drawn shapes and nothing else. Every term and
   * definition is in the server HTML at once, so no control can change a word,
   * and with JavaScript off the drawing and the whole list are already there.
   *
   * Deliberately not drawn: convexity, which stays a sentence on this card
   * because it is an assessment rather than a shape; any coupling mechanism,
   * click ring or tab; and anything carrying a brand's outline or trade dress.
   * The join is a dashed outline and a caption, nothing more.
   *
   * `sources` backs the four definitions. Review only; it never renders.
   */
  | { kind: 'partsOfSystem'; sources: SourceId[] }
  /*
   * The bowel reference still (C04): normal small and large intestine, seen
   * from the front, with numbered markers over it and the part names beside it.
   * AUGMENTS the card — its reviewed sentences stay exactly as they are — and
   * the picture itself carries no words at all, so every label translates.
   *
   * It is one flat image rendered ahead of time from two openly licensed
   * models (`core/scripts/render-bowel-reference.mjs`), not a 3D viewer: no
   * WebGL, no model download, no control. Marker positions and the credit are
   * in anatomy-meta.ts.
   *
   * Deliberately not drawn: any stoma, any pouch, any exit, and any shading
   * that says a part was removed. A colostomy can be made at several points
   * along the colon and an ileostomy may or may not leave the colon in place,
   * so one picture cannot be any particular reader's anatomy — which is what
   * the caption beside it says. It is never introduced as "your" bowel.
   *
   * Placed only on cards with no product band, so nothing is for sale beside a
   * picture of a body.
   *
   * `sources` backs the caption and the credit. Review only; it never renders.
   */
  | { kind: 'bowelReference'; sources: SourceId[] }
  /*
   * The lower-fibre clocks (C11) on Chapter 03 card 3. One row per ostomy type:
   * a label, a sentence from `figure.clocks.<n>.body`, and a bar that fades out
   * instead of ending. AUGMENTS the card — its three reviewed sentences stay
   * exactly as they are — and it renders the card's own note above the rows, so
   * "your surgical team's call" is read before any duration.
   *
   * `fadeFromWeek` is where the bar stops being solid and `fadeToWeek` where it
   * has faded to nothing: the two ends of the range the guides give, drawn as a
   * gradient rather than a stop. Nothing here is a date, no row is marked
   * finished, and each row's weeks are in its own sentence in words, so the
   * drawing is never the only place a duration appears. The bars are
   * aria-hidden for that reason.
   *
   * There is no urostomy row. No Canadian source gives a lower-fibre period
   * after urostomy surgery, and a third bar drawn for symmetry would invent one.
   *
   * `sources` backs the rows and the signpost. Review only; it never renders.
   */
  | {
      kind: 'fibreClocks';
      rows: Array<{ type: OstomyType; fadeFromWeek: number; fadeToWeek: number }>;
      sources: SourceId[];
    }
  /*
   * The pouch change as numbered steps, readable whole or one step at a time.
   * Restyles: each of the card's items is the lead of one step, by number.
   *
   * `key` is the step's stable key under `figure.steps` in the message tree;
   * the number a reader sees is its position here. If the NSWOC cuts a step,
   * delete its entry here only, and no other key renumbers.
   *
   * `continues`, `nswocDecides` and `sources` are for the content review and
   * never render. A conditional sentence names the systems it applies to; the
   * system filter hides sentences, never a step. `gap` links one step to the
   * card that shows the gap around the stoma.
   */
  | {
      kind: 'changeRoutine';
      steps: Array<{
        key: number;
        lead?: number;
        continues?: number;
        nswocDecides?: boolean;
        conditional?: Array<{ sentence: number; systems: PouchSystem[] }>;
        sources: SourceId[];
      }>;
      /* Sources for the lines above the steps and the tell-your-NSWOC list. Review only. */
      framingSources: SourceId[];
      tellSources: SourceId[];
      findNswocHref: string;
      /** The language of the page `findNswocHref` opens. */
      findNswocHrefLang: LinkLang;
      gap: { chapter: string; card: number; step: number };
    };

/*
 * Why a built figure is not allowed to render yet.
 *
 * A hold is not a French review gate. A gated module ships in English and waits
 * for a francophone reviewer; a held one renders on NO page, in EITHER locale,
 * until the decision named here is recorded. `gateFigures` in chapters-data.ts
 * drops it before anything else looks at it, so deleting the figure's `held`
 * line is the whole switch — there is no environment variable, no flag and no
 * second place to change.
 *
 * - `writtenRuling` — the owner and the NSWOC have to rule in writing that an
 *   unbranded schematic is not "product imagery in an explanatory figure"
 *   (C08 on Chapter 02 card 3). IP counsel checks the drawing for trade dress.
 * - `nswocSignoff` — an NSWOC has to sign off what the figure shows clinically.
 * - `ch03Card2Rewrite` — waits on the rewrite of Chapter 03 card 2's second
 *   sentence, which the figure beside it would otherwise contradict.
 *
 * The content-review export reads this list out of this file and refuses a
 * reason it cannot explain to a reviewer, so a new one cannot ship unlabelled.
 */
export type FigureHold = 'writtenRuling' | 'nswocSignoff' | 'ch03Card2Rewrite';

/*
 * A figure kind, able to carry a hold. Distributed over the union rather than
 * intersected with it whole, so `Extract<FigureMeta, { kind: 'lanes' }>` still
 * narrows to a single kind everywhere it is used.
 *
 * `exitWhenGated` is for a module that renders the chapter's emergency signpost
 * and points at a list on ANOTHER page. On /fr in production a review gate drops
 * the module, and without this the only copy of that signpost left on the
 * chapter is the one the band after the cards prints — which on Chapter 03 puts
 * "high-roughage foods can cause a blockage" immediately above a band about how
 * four provinces pay for supplies. The approved sheets put the signpost inside
 * the module that needs it, so with this flag the card keeps it where the module
 * would have been and the band never has to stand in (`exitFallback` in
 * chapters-data.ts, `needsCardExit` in figures.tsx).
 *
 * It is per figure, not per kind: the same kind on a chapter whose emergency
 * list is a section of that same page needs nothing, because the page always
 * renders it.
 */
type Holdable<T> = T extends unknown
  ? T & { exitWhenGated?: true; held?: FigureHold }
  : never;

export type FigureMeta = Holdable<FigureKindMeta>;

/*
 * Per-category structure. Index-matched to the numbered keys under
 * `categories` in the message tree.
 */
export interface CategoryMeta {
  image: string;
  /**
   * Which cluster this card belongs to, as a key into `ui.chapter.groups`.
   * A key rather than a label so a translation cannot split one group into
   * two by rendering its name inconsistently in different cards.
   */
  group?: string;
  /**
   * Who this card sends you to. Drives the ask chip. The label is
   * translated from `ui.chapter.ask.<role>`; the role itself is structural,
   * so a translation cannot change who a reader is told to consult.
   */
  ask?:
    | 'nswoc'
    | 'team'
    | 'primaryCare'
    | 'pharmacist'
    | 'dietitian'
    | 'gi'
    | 'peer'
    | 'assessment'
    | 'urgent';
  /**
   * Products shown beneath this card. Empty on any card where the copy
   * argues against buying something — see the blocklist in the generator
   * comment. Commerce sits in its own labelled band, never inside the
   * clinical list.
   */
  products?: number[];
  /**
   * The card carries a same-day, emergency or crisis line — 9-8-8, an
   * emergency department, a call-today threshold. Such a card renders open
   * and cannot be collapsed, so that line is never behind a disclosure.
   *
   * Rows used to start closed unless they led their group, which hid the
   * 9-8-8 line on chapter 04 and the Mitrofanoff emergency rule on chapter
   * 02 until a reader happened to expand the card.
   */
  urgentContent?: boolean;
  /** Visual shapes for this card's copy, in render order. */
  figures?: FigureMeta[];
  /**
   * Keep the card's closing note outside the collapsible region. For notes a
   * reader should not have to expand to find, such as siting applying to
   * emergency surgery too.
   */
  noteVisible?: boolean;
}

/*
 * The rows a recovery-map stage can hold. Labels live in
 * `ui.chapter.recoveryMap.lanes`. `fit` ("Stoma and fit") counts from surgery;
 * `homeFit` ("Fit") sits under "After you go home" and counts from discharge, so
 * the two carry different labels.
 */
export type RecoveryLane =
  | 'routine'
  | 'supplies'
  | 'fit'
  | 'food'
  | 'activity'
  | 'driving'
  | 'work'
  | 'fitCheck'
  | 'settling'
  | 'followUp'
  | 'homeFit';

/*
 * One stage of the recovery map, index-matched to
 * `chapters.<slug>.recoveryMap.stages.<n>` in the message tree.
 *
 * `anchor` is the clock the stage counts from: surgery, going home
 * (discharge), or neither. No item mixes the two clocks.
 *
 * Each lane's items are index-matched to `lanes.<m>.items.<k>`. An item with
 * `types` shows only for those ostomy types when a reader filters; an item
 * without applies to everyone and never hides. A `cardRef` item has no message
 * of its own: it is that card's reviewed sentence, so the wording has one
 * source, and its message key is left out.
 *
 * `sources` backs every item in the stage, and shows as one "Sources for this
 * stage" list.
 */
export interface RecoveryStageMeta {
  anchor: 'surgery' | 'discharge' | 'none';
  lanes: Array<{
    lane: RecoveryLane;
    items: Array<{ types?: OstomyType[]; cardRef?: { card: number; item: number } }>;
  }>;
  sources: SourceId[];
}

/*
 * One outward link on the resources shelf (C14). We link; we never embed a
 * video, frame a page or reproduce a guide.
 *
 * `org` is who publishes it. Like a citation label it is structural rather than
 * translated, so a translation pass cannot re-attribute someone's document;
 * `orgFr` is set only where the organisation itself uses a French name.
 *
 * `hrefLang` is the language of the page the link opens, so the shelf can say
 * so in the link text wherever it differs from the page language.
 *
 * `heldUntil: 'nswocViewed'` keeps a resource off the page in both locales
 * until an NSWOC has watched or read it and confirmed it. The wording stays in
 * the message tree and the content-review export lists the link as held, so a
 * hold is visible and reversible rather than a quiet deletion.
 *
 * `fileNote` marks a link that downloads a file instead of opening a page. The
 * link's own `note` message must then state the file type and size — the export
 * fails otherwise. Nothing on the shelf is a direct file today.
 */
export interface ShelfLinkMeta {
  org: string;
  orgFr?: string;
  href: string;
  /** Official French page, only where the publisher maintains a separate one. */
  hrefFr?: string;
  hrefLang: LinkLang;
  heldUntil?: 'nswocViewed';
  fileNote?: boolean;
  /** The register entries this link is, or is backed by. Review only. */
  sources: SourceId[];
}

/** The shelf: one group per kind of help, index-matched to `shelf.groups.<n>`. */
export interface ShelfMeta {
  groups: Array<{ glyph: GlyphName; links: ShelfLinkMeta[] }>;
}

/*
 * A plain link under a card of the referral band (C12).
 *
 * `locales` is the page languages that show the link, which is a different
 * question from `hrefLang`, the language of the page it opens. Chapter 04's
 * child card sends an English reader to SickKids' English instructions, and a
 * French reader to the same instructions — named as English in the link text —
 * plus the publisher's own French overview, which is much older. A page the
 * publisher does not maintain in a language is not offered to that language's
 * readers, and nothing here is translated by Liivv.
 *
 * Link only. No framing, no embedding, no product in the band beside it.
 */
export interface BandLinkMeta {
  href: string;
  /** The language of the page this opens. */
  hrefLang: LinkLang;
  /** The page locales that render it, in no particular order. */
  locales: LinkLang[];
  /** The register entries this link is, or is backed by. Review only. */
  sources: SourceId[];
}

export interface ChapterMeta {
  slug: string;
  num: string;
  chapterWord: string;
  heroImage: string;
  accent: string;
  /** One per numbered category in the message tree, in the same order. */
  categories: CategoryMeta[];
  pharmacistImage: string;
  pharmacistHref: string;
  /** One inner array per resource group, in message order. */
  resourceLinks: string[][];
  citations: CitationMeta[];
  /**
   * Show the group filter rail. Off where a chapter's groups are better shown
   * as a map than as filters — chapter 01 has two, and a surgery line says
   * more than two buttons.
   */
  rail?: boolean;
  /**
   * A start-here map built from the chapter's groups, in order. Labels come
   * from `chapters.<slug>.startHere`; each segment's referral line is
   * generated from the ask roles of the cards inside it.
   */
  startHere?: { groups: string[] };
  /**
   * A one-line signpost to another chapter's emergency list, for chapters that
   * have none of their own. Wording from `chapters.<slug>.urgentExit`.
   */
  urgentExit?: { chapter: string };
  /**
   * The recovery map (C03), in the band slot after the cards. Where it is held
   * or waiting for French review, the chapter's `programsBand` renders instead,
   * so keep those messages until the map is signed off in both locales.
   */
  recoveryMap?: { stages: RecoveryStageMeta[] };
  /**
   * Plain links under the referral band's cards (C12): one inner array per band
   * card, index-matched to the numbered `programsBand.cards` keys, and an empty
   * array for a card that has none. The link labels are new French, so they
   * wait on the `childLinks` gate; the band's own reviewed sentences do not.
   */
  programsBandLinks?: BandLinkMeta[][];
  /**
   * The resources shelf (C14), between the band slot and the pharmacist panel.
   * Outward links only, grouped by the kind of help they give.
   */
  shelf?: ShelfMeta;
}

export const CHAPTER_META: ChapterMeta[] = [
  {
    slug: 'new-to-the-journey',
    num: '01',
    chapterWord: 'one',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    /* Approved on the Chapter 01 visual review, 2026-09-15. */
    rail: false,
    startHere: { groups: ['beforeSurgery', 'afterSurgery'] },
    urgentExit: { chapter: 'get-to-know-your-stoma' },
    categories: [
      {
        image: `${IMG}/chapter-new.png`,
        group: 'beforeSurgery',
        // The single peer chip undersold the NSWOC-and-doctor route for low
        // mood, so the routes figure replaces it and carries both.
        figures: [
          { kind: 'crisis' },
          { kind: 'routes', routes: [{ glyphs: ['nswoc', 'primaryCare'] }, { glyphs: ['peer'] }] },
        ],
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'beforeSurgery',
        ask: 'nswoc',
        noteVisible: true,
        figures: [{ kind: 'criteria', glyphs: ['waist', 'fold', 'scar', 'belt', 'more'] }],
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'beforeSurgery',
        ask: 'team',
        figures: [{ kind: 'takeIn' }],
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'beforeSurgery',
        ask: 'team',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'shirt' },
                  { item: 2, glyph: 'list' },
                ],
              },
              { glyph: 'home', items: [{ item: 3, glyph: 'hands' }] },
            ],
          },
        ],
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'beforeSurgery',
        ask: 'peer',
        figures: [{ kind: 'columns', columns: [[2], [1]], neutral: [3] }],
      },
      {
        image: `${IMG}/chapter-new.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
        // C01. Nine steps as approved on the interactives review; steps 2 and 6
        // wait on the NSWOC (see nswocDecides). Items 7.1–7.3 lead steps 1, 3, 5.
        figures: [
          {
            kind: 'changeRoutine',
            steps: [
              {
                key: 1,
                lead: 1,
                conditional: [{ sentence: 2, systems: ['uro'] }],
                // Sentence 4 is hand hygiene. The walk-through shipped without
                // it, in either locale, on the page a caregiver and a parent are
                // sent to from Chapter 04 — a nine-step procedure whose own
                // cited sources are nursing checklists that both open with it.
                // TRU Checklist 89 step 1 is "Perform hand hygiene", before
                // gathering supplies; CLWK's work instruction washes after the
                // workspace is set up and before the gloves go on. The two
                // orders differ, so the sentence says "before you start" and the
                // placement is in the export's open NSWOC decisions.
                sources: [
                  'nsh-one-piece-pouch-change-2023',
                  'ocs-changing-your-pouching-system',
                  'nswocc-ileostomy-guide-2022',
                  'nswocc-ileal-conduit-guide-2022',
                  'tru-clinical-procedures-ostomy-care',
                  'clwk-one-piece-pouch-change-2026',
                ],
              },
              {
                key: 2,
                nswocDecides: true,
                conditional: [
                  { sentence: 1, systems: ['drain', 'uro'] },
                  { sentence: 2, systems: ['closed'] },
                ],
                sources: [
                  'clwk-one-piece-pouch-change-2026',
                  'tru-clinical-procedures-ostomy-care',
                ],
              },
              {
                key: 3,
                lead: 2,
                sources: [
                  'nsh-one-piece-pouch-change-2023',
                  'ocs-changing-your-pouching-system',
                  'nswocc-ileostomy-guide-2022',
                  'wocn-basic-ostomy-skin-care-2024',
                ],
              },
              {
                key: 4,
                sources: [
                  'nsh-one-piece-pouch-change-2023',
                  'wounds-canada-professional-guide-2023',
                  'healthlinkbc-caring-for-your-ostomy',
                ],
              },
              {
                key: 5,
                lead: 3,
                sources: [
                  'nswocc-ileostomy-guide-2022',
                  'nswocc-ileal-conduit-guide-2022',
                  'nswocc-colostomy-guide-2022-alt',
                  'clwk-one-piece-pouch-change-2026',
                ],
              },
              {
                key: 6,
                nswocDecides: true,
                sources: [
                  'nswocc-ileostomy-guide-2022',
                  'wounds-canada-professional-guide-2023',
                  'wocn-basic-ostomy-skin-care-2024',
                ],
              },
              {
                key: 7,
                continues: 3,
                sources: [
                  'nswocc-ileostomy-guide-2022',
                  'nswocc-colostomy-guide-2022',
                  'khsc-ileostomy-care-2020',
                  'ocs-changing-your-pouching-system',
                  'clwk-one-piece-pouch-change-2026',
                  'ascn-stoma-care-guidelines-2016',
                ],
              },
              {
                key: 8,
                continues: 3,
                // Sentence 7 is the second half of the hand hygiene added to
                // step 1: TRU Checklist 89 performs it again at the end, and
                // CLWK's last line is "Remove gloves, PPE and wash hands".
                conditional: [
                  { sentence: 2, systems: ['one'] },
                  { sentence: 3, systems: ['two'] },
                  { sentence: 4, systems: ['drain'] },
                  { sentence: 5, systems: ['uro'] },
                ],
                sources: [
                  'nsh-one-piece-pouch-change-2023',
                  'nsh-two-piece-pouch-change-2023',
                  'ocs-changing-your-pouching-system',
                  'nswocc-ileal-conduit-guide-2022',
                  'clwk-one-piece-pouch-change-2026',
                  'tru-clinical-procedures-ostomy-care',
                ],
              },
              {
                key: 9,
                sources: [
                  'nswocc-ileostomy-guide-2022',
                  'nsh-one-piece-pouch-change-2023',
                  'ocs-routine-ostomy-care-colostomy',
                  'nswocc-find-an-nswoc',
                ],
              },
            ],
            framingSources: [
              'nswocc-ileostomy-guide-2022',
              'ascn-stoma-care-guidelines-2016',
              'nsh-one-piece-pouch-change-2023',
              'tru-clinical-procedures-ostomy-care',
              'nswocc-find-an-nswoc',
              'clwk-one-piece-pouch-change-2026',
              'nswocc-ileal-conduit-guide-2022',
              'cua-urinary-diversions-position-2022',
            ],
            tellSources: [
              'nswocc-ileostomy-guide-2022',
              'nswocc-colostomy-guide-2022',
              'wocn-basic-ostomy-skin-care-2024',
            ],
            findNswocHref: FIND_NSWOC_HREF,
            findNswocHrefLang: 'en',
            gap: { chapter: 'get-to-know-your-stoma', card: 9, step: 7 },
          },
        ],
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
        // C02. The two kit cards are gone (the kits wait on the K1 rebuild) and
        // the sales note with them; the band now holds one supply list split
        // out of cards 8 and 9, which the reader fills in and keeps.
        figures: [
          {
            kind: 'supplyList',
            system: { item: 1 },
            items: [
              { key: 'pouch', card: 8, item: 1 },
              { key: 'disposalBags', card: 8, item: 2, alsoGoBag: true },
              { key: 'skinProtectant', card: 8, item: 2, conditional: true },
              { key: 'powder', card: 8, item: 2, textOnly: true },
            ],
            goBagItems: [
              { key: 'spareSystem', card: 9, item: 1 },
              { key: 'dryWipes', card: 9, item: 1, conditional: true },
              { key: 'adhesiveRemover', card: 9, item: 2, conditional: true },
              { key: 'underwearLiner', card: 9, item: 3 },
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
        figures: [{ kind: 'goBag' }],
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'afterSurgery',
        ask: 'nswoc',
        // C09. The three reviewed lanes keep their numbers and their order; the
        // peer lane is appended as lane 4, and the topic filter only marks what
        // fits. Lane 4 and both link labels wait on the `finder` French gate.
        figures: [
          {
            kind: 'lanes',
            lanes: [
              {
                glyph: 'nswoc',
                item: 1,
                topics: ['skin', 'recovery'],
                href: FIND_NSWOC_HREF,
                hrefLang: 'en',
                linkSources: ['nswocc-find-an-nswoc'],
              },
              { glyph: 'team', item: 2, topics: ['recovery'] },
              { glyph: 'service', item: 3, service: true, topics: ['product'] },
              {
                glyph: 'peer',
                topics: ['peer'],
                href: PEER_FINDER_HREF,
                hrefLang: 'en',
                sources: ['ocs-find-a-chapter'],
                linkSources: ['ocs-find-a-chapter'],
              },
            ],
            topicKeys: ['skin', 'recovery', 'peer', 'product'],
          },
        ],
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'afterSurgery',
        ask: 'team',
        figures: [
          {
            kind: 'doors',
            doors: [
              { glyph: 'food', item: 1, chapter: 'everyday-liivving' },
              { glyph: 'walk', item: 2, chapter: 'get-to-know-your-stoma' },
              { glyph: 'people', item: 3, chapter: 'everyday-liivving' },
            ],
          },
        ],
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    // C03. Seven stages in the order approved on the interactives review. The
    // first six count from surgery; "After you go home" counts from discharge.
    recoveryMap: {
      stages: [
        {
          // Before you go home
          anchor: 'surgery',
          lanes: [
            { lane: 'routine', items: [{}] },
            { lane: 'supplies', items: [{}] },
          ],
          sources: [
            'nswocc-ileostomy-guide-2022',
            'tru-clinical-procedures-ostomy-care',
            'nswocc-colostomy-guide-2022',
          ],
        },
        {
          // Weeks 1 to 2
          anchor: 'surgery',
          lanes: [
            { lane: 'fit', items: [{}] },
            {
              lane: 'food',
              items: [{ types: ['colo'] }, { types: ['ileo'] }, { types: ['ileo'] }],
            },
            // Item 1 is card 6's own sentence (6.1), not a copy of it.
            { lane: 'activity', items: [{ cardRef: { card: 6, item: 1 } }, {}] },
          ],
          sources: [
            'nswocc-colostomy-guide-2022',
            'clwk-one-piece-pouch-change-2026',
            'ahs-eating-well-colostomy-2025',
            'ahs-eating-well-ileostomy-2025',
            'nswocc-ileostomy-guide-2022',
            'khsc-ileostomy-care-2020',
            'sunnybrook-eras-bowel-surgery',
          ],
        },
        {
          // Weeks 3 to 5
          anchor: 'surgery',
          lanes: [
            { lane: 'fit', items: [{}] },
            { lane: 'food', items: [{ types: ['colo'] }, { types: ['ileo'] }] },
            { lane: 'activity', items: [{}] },
          ],
          sources: [
            'ahs-eating-well-colostomy-2025',
            'ahs-eating-well-ileostomy-2025',
            'khsc-ileostomy-care-2020',
            'clwk-one-piece-pouch-change-2026',
          ],
        },
        {
          /*
           * Weeks 6 to 8.
           *
           * The food line is typed `ileo` because only the AHS ileostomy sheet
           * gives a six-to-eight-week fibre window. Fit and activity are
           * untyped, so a colostomy or urostomy reader sees them — which is
           * right, since both apply to any abdominal surgery — but the stage
           * used to be sourced from ileostomy documents alone. The NSWOCC
           * colostomy guide is added for the same reason it backs the colostomy
           * lines elsewhere, and the CUA position statement for urostomy, so a
           * reader who filters to their own type is not shown a line whose only
           * evidence is about somebody else's operation.
           */
          anchor: 'surgery',
          lanes: [
            { lane: 'fit', items: [{}] },
            { lane: 'food', items: [{ types: ['ileo'] }] },
            { lane: 'activity', items: [{}] },
          ],
          sources: [
            'nswocc-ileostomy-guide-2022',
            'nswocc-colostomy-guide-2022',
            'cua-urinary-diversions-position-2022',
            'clwk-one-piece-pouch-change-2026',
            'ahs-eating-well-ileostomy-2025',
            'khsc-ileostomy-care-2020',
          ],
        },
        {
          // About three months and later. Both lines are shown to every reader
          // and were sourced from two ileostomy documents; the NSWOCC colostomy
          // guide carries exercise guidance of its own (credited in part to
          // Coloplast Canada — see sources-review.ts), so it is named here too.
          anchor: 'surgery',
          lanes: [{ lane: 'activity', items: [{}, {}] }],
          sources: [
            'khsc-ileostomy-care-2020',
            'nswocc-ileostomy-guide-2022',
            'nswocc-colostomy-guide-2022',
          ],
        },
        {
          // Not on a calendar
          anchor: 'none',
          lanes: [
            { lane: 'driving', items: [{}] },
            { lane: 'work', items: [{}] },
            { lane: 'fitCheck', items: [{}] },
            { lane: 'settling', items: [{}] },
          ],
          sources: [
            'khsc-ileostomy-care-2020',
            'sunnybrook-eras-bowel-surgery',
            'nswocc-ileostomy-guide-2022',
            'nswocc-colostomy-guide-2022',
            'ocs-find-a-chapter',
          ],
        },
        {
          // After you go home
          anchor: 'discharge',
          lanes: [
            { lane: 'followUp', items: [{}, {}, { types: ['uro'] }] },
            { lane: 'homeFit', items: [{ types: ['uro'] }] },
          ],
          sources: [
            'tru-clinical-procedures-ostomy-care',
            'khsc-ileostomy-care-2020',
            'cua-urinary-diversions-position-2022',
          ],
        },
      ],
    },
    // C14. Four groups in the order approved on the interactives review. The
    // French videos are held until an NSWOC has watched them, so group 2 does
    // not render; its wording stays in the message tree and the content-review
    // export lists it as held.
    shelf: {
      groups: [
        {
          glyph: 'book',
          links: [
            {
              org: 'NSWOCC',
              href: NSWOCC_GUIDES_HREF,
              hrefLang: 'en',
              sources: ['nswocc-patient-guides', 'nswocc-colostomy-guide-2022'],
            },
          ],
        },
        {
          glyph: 'video',
          links: [
            {
              org: 'Santé Québec – Laurentides',
              href: SANTE_LAURENTIDES_VIDEOS_HREF,
              hrefLang: 'fr',
              heldUntil: 'nswocViewed',
              sources: ['sante-laurentides-stomie-videos'],
            },
          ],
        },
        {
          glyph: 'pin',
          links: [
            {
              org: 'NSWOCC',
              href: FIND_NSWOC_HREF,
              hrefLang: 'en',
              sources: ['nswocc-find-an-nswoc'],
            },
          ],
        },
        {
          glyph: 'peer',
          links: [
            {
              org: 'Ostomy Canada Society',
              orgFr: 'Société canadienne des personnes stomisées',
              href: PEER_FINDER_HREF,
              hrefLang: 'en',
              sources: ['ocs-find-a-chapter'],
            },
          ],
        },
      ],
    },
    citations: [
      {
        // The directory itself, which is what the chapter actually sends people to.
        label: 'NSWOCC — Find an NSWOC',
        href: FIND_NSWOC_HREF,
      },
      {
        label: 'NSWOCC — free patient guides (English and French)',
        href: NSWOCC_GUIDES_HREF,
      },
      {
        label: 'RNAO — Getting ready for ostomy surgery (patient fact sheet)',
        href: 'https://rnao.ca/bpg/guidelines/fact-sheets/getting-ready-ostomy-surgery-fact-sheet-adults',
      },
    ],
  },
  {
    slug: 'get-to-know-your-stoma',
    num: '02',
    chapterWord: 'two',
    heroImage: `${IMG}/chapter-stoma.png`,
    accent: '#f3c7be',
    /*
     * This chapter's own emergency list, one section up the same page. It is
     * here for the gap figure on card 9, which signposts it under the panels;
     * ChapterPage renders a chapter-level signpost only inside the start-here
     * map, which this chapter does not have, so there is no second copy.
     */
    urgentExit: { chapter: 'get-to-know-your-stoma' },
    categories: [
      {
        /*
         * Card 1 "Stoma Basics". The bowel reference still (C04) sits under the
         * card's first sentence: the chapter starts naming parts of the bowel
         * here, and this card places no products, so nothing is for sale beside
         * a picture of a body.
         */
        image: `${IMG}/chapter-stoma.png`,
        group: 'startHere',
        ask: 'nswoc',
        figures: [
          {
            kind: 'bowelReference',
            sources: [
              'hra-large-intestine-male-v1-3',
              'hra-small-intestine-male-v1-2',
              'datacite-hbm487-zksn-693',
              'datacite-hbm789-xtdk-794',
              'cc-by-4-0-legal-code',
              'nlm-terms-and-conditions',
              'nih3d-terms',
              'nswocc-colostomy-guide-2022',
              'nswocc-ileostomy-guide-2022',
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-chapters.png`,
        urgentContent: true,
        group: 'startHere',
        ask: 'team',
      },
      {
        /*
         * Card 3 "Words you will hear". The parts drawing (C08) is built and
         * HELD: it renders on no page, in either locale, until the owner and the
         * NSWOC rule in writing that an unbranded schematic is not product
         * imagery in an explanatory figure. Deleting the `held` line below is
         * the whole switch — the card is exactly its three lists until then, and
         * it places no products either way.
         */
        image: `${IMG}/care-chat-desk.png`,
        group: 'startHere',
        figures: [
          {
            kind: 'partsOfSystem',
            held: 'writtenRuling',
            sources: [
              'nswocc-ileostomy-guide-2022',
              'nswocc-colostomy-guide-2022',
              'nswocc-ileal-conduit-guide-2022',
              'nsh-one-piece-pouch-change-2023',
              'nsh-two-piece-pouch-change-2023',
              'ocs-changing-your-pouching-system',
              'clwk-one-piece-pouch-change-2026',
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'theBasics',
        ask: 'nswoc',
        // Card 4 "One-Piece vs Two-Piece". No band. The card weighs one system
        // against the other, and the three items beside it came from only two
        // manufacturers — a band on a choosing card needs three or more makers
        // or it reads as Liivv's recommendation. Merchandising can rebalance it.
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'theBasics',
        ask: 'nswoc',
        // Card 5 "Skin Comfort". No band. Stomahesive powder came off this card
        // (it is for weepy, broken skin, not for comfort), and what was left was
        // two items from a single manufacturer beside advice about skin, so the
        // whole band goes rather than a one-maker shelf.
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'theBasics',
        ask: 'nswoc',
      },
      {
        // Card 9 "Measure before you order". The gap figure lives here rather
        // than on card 7: this is the card Chapter 01's walk-through links to,
        // it is the card about measuring and cutting, and it places no products.
        image: `${IMG}/care-chat-desk.png`,
        group: 'theBasics',
        ask: 'nswoc',
        figures: [
          {
            kind: 'gapCompare',
            sources: [
              'ocs-changing-your-pouching-system',
              'nswocc-ileostomy-guide-2022',
              'nswocc-colostomy-guide-2022',
              'khsc-ileostomy-care-2020',
              'nsh-one-piece-pouch-change-2023',
              'clwk-one-piece-pouch-change-2026',
              'wocn-basic-ostomy-skin-care-2024',
              'ascn-stoma-care-guidelines-2016',
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'choosingASystem',
        ask: 'nswoc',
        // Card 10 "One-piece or two-piece". No band. All three items were from
        // one manufacturer, on the card that asks the reader to weigh the two
        // systems. Same guardrail as card 4: three or more makers, or no band.
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'choosingASystem',
        ask: 'assessment',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'accessories',
        ask: 'nswoc',
        // Card 12 "What accessories actually do". No band. Its own note says
        // that reaching for two or three accessories to make one system stay on
        // is "a fit review, not a shopping list" — a shelf of rings and pastes
        // beside that sentence argued the other way.
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'accessories',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'keepChecking',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
        // Card 17 "Ballooning and gas". No band. It held the last `products` key
        // anywhere in the four chapters: two filtered New Image pouches, one
        // manufacturer, on a symptom card rather than an equipment one. Same
        // guardrail as cards 4, 5 and 10 — three or more makers, or no band —
        // and worse than those, because the card's own first sentence tells the
        // reader a wetted-out filter is normal rather than a fault, so a band of
        // filtered pouches answered a sentence that says there is nothing to
        // answer. D15 deferred this card to "the Chapter 02 review"; that review
        // (W3-01) changed wording only, so the deferral expired unexamined.
        // The key is deleted, never set to [] — see Chapter 04 card 4 for why.
        // Merchandising may propose a band again, on an equipment card, with
        // three or more makers.
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'team',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'whenSomethingIsNotRight',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'bodyAndLife',
        ask: 'peer',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'bodyAndLife',
        // No band. This card used to place kit #8046, whose wipes are
        // moisturising — the opposite of what the card asks for. Every curated
        // kit is withheld from ostomy surfaces until K1 rebuilds it (oc-ids.ts).
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'bodyAndLife',
        ask: 'peer',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'bodyAndLife',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'bodyAndLife',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'bodyAndLife',
        ask: 'team',
        // No band. This card ("Getting back to activity") used to place two
        // ostomy support belts, #4226 and #4647. It renders directly beneath
        // "Hernias, lifting and your core", whose note says support wear has
        // not been shown to prevent a hernia and that an NSWOC has to measure
        // and fit one — so a belt band here reads as the recommendation that
        // card withholds. The card's own copy never asks for a belt either: it
        // mentions a stoma guard, which neither product is.
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citations: [
      {
        label: 'NSWOCC — free patient guides by ostomy type',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'Wounds Canada — Caring for a Person with an Ostomy',
        href: 'https://www.woundscanada.ca/',
      },
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
      {
        label: 'Ostomy Canada Society — finding an NSWOC and local support',
        href: 'https://www.ostomycanada.ca/',
      },
    ],
  },
  {
    slug: 'everyday-liivving',
    num: '03',
    chapterWord: 'three',
    heroImage: `${IMG}/chapter-everyday.png`,
    accent: '#8ea78b',
    /*
     * Chapter 02's emergency list. This chapter has no red-flag section of its
     * own, and the fibre clocks on card 3 point at one: high-roughage foods can
     * cause a blockage, and the signs are on the other page.
     *
     * It sits at chapter level rather than inside the figure because the figure
     * waits on a French review gate. Where the clocks are not rendering, the
     * programs band picks the signpost up (ChapterBand in chapter-page.tsx), so
     * on /fr — where the clocks are hidden until a francophone reviewer signs
     * them off — the pointer to that list is still on the page. Where they are
     * rendering, as on /en, the clocks are the only place it shows: the band is
     * about provincial funding, and a blockage warning does not belong at the
     * head of it.
     */
    urgentExit: { chapter: 'get-to-know-your-stoma' },
    categories: [
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'startHere',
        ask: 'peer',
      },
      {
        /*
         * Card 2 "What your surgery actually changed". The bowel reference
         * still (C04) is built here and HELD: it renders on no page, in either
         * locale, until this card's second sentence is rewritten. As it stands
         * that sentence says a colostomy "leaves most of that intact", which is
         * true of some colostomies and not of others, and a picture of the whole
         * colon beside it would illustrate the overgeneralisation rather than
         * the qualification. Deleting the `held` line below is the whole switch.
         */
        image: `${IMG}/chapter-stoma.png`,
        group: 'eatingAgain',
        ask: 'team',
        figures: [
          {
            kind: 'bowelReference',
            held: 'ch03Card2Rewrite',
            sources: [
              'hra-large-intestine-male-v1-3',
              'hra-small-intestine-male-v1-2',
              'datacite-hbm487-zksn-693',
              'datacite-hbm789-xtdk-794',
              'cc-by-4-0-legal-code',
              'nlm-terms-and-conditions',
              'nih3d-terms',
              'nswocc-colostomy-guide-2022',
              'nswocc-ileostomy-guide-2022',
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
        /*
         * C11. Two rows, no urostomy row: Alberta Health Services publishes a
         * lower-fibre period after colostomy (2–4 weeks) and after ileostomy
         * (6–8 weeks) and nothing of the kind after urostomy surgery.
         */
        figures: [
          {
            kind: 'fibreClocks',
            /*
             * The clocks carry the blockage signpost, and it points at Chapter
             * 02's list — another page. So when the French gate drops them, the
             * card keeps the signpost itself rather than leaving the funding
             * band to print it (see `exitWhenGated` above).
             */
            exitWhenGated: true,
            rows: [
              { type: 'colo', fadeFromWeek: 2, fadeToWeek: 4 },
              { type: 'ileo', fadeFromWeek: 6, fadeToWeek: 8 },
            ],
            sources: [
              'ahs-eating-well-colostomy-2025',
              'ahs-eating-well-ileostomy-2025',
              'nswocc-ileostomy-guide-2022',
              'khsc-ileostomy-care-2020',
            ],
          },
        ],
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'eatingAgain',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'eatingAgain',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'everydayEffects',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'everydayEffects',
        ask: 'dietitian',
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'everydayEffects',
        ask: 'pharmacist',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'gettingAroundCanada',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'gettingAroundCanada',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        group: 'gettingAroundCanada',
        // No band. Same kit, same reason as Chapter 02 card 22 (oc-ids.ts).
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'practicalCanada',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'practicalCanada',
      },
      {
        image: `${IMG}/door-care.png`,
        group: 'money',
      },
      {
        image: `${IMG}/door-shop.png`,
        group: 'money',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'community',
      },
      {
        image: `${IMG}/care-chat-moment.png`,
        group: 'community',
        ask: 'peer',
      },
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [
      [
        'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
        'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
        'https://www.nswoc.ca/',
        'https://www.ostomycanada.ca/camp/ostomy-canada-youth-camp/',
      ],
      [
        'https://www.hollister.ca/en-ca/securestartconsumer',
        'https://www.coloplast.ca/care-/',
        'https://www.convatec.com/en-ca/ostomy-care/me-plus-patient-support/',
      ],
      [
        'https://www.ostomycanada.ca/provincial-government-programs/',
        'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
        'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
      ],
      [
        'https://www.nswoc.ca/guides',
        'https://www.ostomy.org/new-ostomy-patient-guide/',
        'https://www.ostomycanada.ca/events/world-ostomy-day/',
      ],
    ],
    citations: [
      {
        label: 'Ostomy Canada Society — Ontario ADP grant and why $975 a year is not enough',
        href: 'https://www.ostomycanada.ca/blog/2025/ontario-adp-grant-why-975-a-year-isnt-enough/',
      },
      {
        label: 'Canada Revenue Agency — Disability Tax Credit, eliminating category',
        href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
      },
      {
        label: 'United Ostomy Associations of America — World Ostomy Day',
        href: 'https://www.ostomy.org/world-ostomy-day/',
      },
      {
        label: 'United Ostomy Associations of America — eating well after ostomy surgery',
        href: 'https://www.ostomy.org/practical-guidance-for-eating-well-after-ostomy-surgery/',
      },
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
    ],
  },
  {
    slug: 'this-might-be-you',
    num: '04',
    chapterWord: 'four',
    heroImage: `${IMG}/care-chat-moment.png`,
    accent: '#9a7f9e',
    /*
     * This was the one chapter with no emergency signpost, and the only one
     * whose cards are read by someone caring for another person: a parent on
     * card 1, a caregiver on card 5. Card 1 describes a child's stoma going
     * dusky and card 3 tells a pregnant reader that blockage is the commonest
     * stoma problem in pregnancy, and neither had a route to the list that says
     * what to do about either. It has no red flags of its own — deliberately,
     * because the ones that matter are not child-specific or pregnancy-specific
     * — so it points at Chapter 02's, in the same words Chapter 01 uses, naming
     * whose list it is.
     *
     * The chapter carries no exit-bearing module, so the referral band prints it
     * (`ChapterBand` in chapter-page.tsx).
     */
    urgentExit: { chapter: 'get-to-know-your-stoma' },
    categories: [
      {
        image: `${IMG}/chapter-new.png`,
        urgentContent: true,
        group: 'growingUp',
        ask: 'team',
      },
      {
        image: `${IMG}/door-chapters.png`,
        group: 'growingUp',
        ask: 'peer',
      },
      {
        image: `${IMG}/chapter-everyday.png`,
        urgentContent: true,
        group: 'bodiesThatChange',
        ask: 'gi',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        group: 'bodiesThatChange',
        ask: 'nswoc',
        // Card 4 "Later life, and managing more than one thing". No band. Both
        // flanges here were the same range from one manufacturer, and the card
        // is about a body and a life that have changed, not about what to buy.
        // The key is deleted, never set to [] — an empty array would still make
        // chapters-data.ts emit productIds and chapter-page.tsx wrap an empty,
        // hidden div around a band that renders nothing.
      },
      {
        image: `${IMG}/care-chat-main.png`,
        group: 'thePeopleAroundIt',
        ask: 'nswoc',
      },
      {
        image: `${IMG}/care-chat-desk.png`,
        urgentContent: true,
        group: 'thePeopleAroundIt',
        ask: 'urgent',
      },
    ],
    /*
     * C12. One inner array per referral-band card: the child card, then the
     * pregnancy and later-life cards, which carry no links.
     *
     * The band says who holds the referral. This adds the one place a Canadian
     * pediatric hospital has already written the instructions down, so Liivv
     * does not write child-specific steps of its own. A francophone reader gets
     * both pages honestly labelled — the current English one and the 2013
     * French one — rather than being sent to the older page alone.
     */
    programsBandLinks: [
      [
        {
          href: AKH_OSTOMY_CARE_HREF,
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['akh-ostomy-care-instructions', 'akh-legal-information'],
        },
        {
          href: AKH_OSTOMY_OVERVIEW_FR_HREF,
          hrefLang: 'fr',
          locales: ['fr'],
          sources: ['akh-stomie-overview-fr', 'akh-legal-information'],
        },
      ],
      [],
      [],
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_HREF,
    resourceLinks: [],
    citations: [
      {
        label: 'RNAO — Supporting Adults Who Anticipate or Live with an Ostomy, 2nd ed. (2019)',
        href: 'https://rnao.ca/bpg/guidelines/ostomy',
      },
      {
        label: 'NSWOCC — guides to living with an ostomy',
        href: 'https://www.nswoc.ca/guides',
      },
      {
        label: 'WOCN Society — Pediatric Ostomy Care: Best Practice for Clinicians',
        href: 'https://cdn.ymaws.com/member.wocn.org/resource/resmgr/document_library/PEDIATRIC_OSTOMY_CARE-_BEST_.pdf',
      },
      {
        label:
          'Acta Paediatrica — nutritional management of high-output ileostomies in paediatric patients',
        href: 'https://doi.org/10.1111/apa.17163',
      },
      {
        label:
          'ECCO — guidelines on sexuality, fertility, pregnancy and lactation in inflammatory bowel disease',
        href: 'https://doi.org/10.1093/ecco-jcc/jjac115',
      },
      {
        label:
          'Journal of the Canadian Association of Gastroenterology — IBD management in pregnancy',
        href: 'https://doi.org/10.1093/jcag/gwad056',
      },
      {
        label: 'Inflammatory Bowel Diseases — pregnancy with a stoma',
        href: 'https://doi.org/10.1093/ibd/izae301',
      },
      {
        label: 'Crohn’s and Colitis Canada — fertility and pregnancy in IBD',
        href: 'https://crohnsandcolitis.ca/About-Crohn-s-Colitis/IBD-Journey/Fertility-and-Pregnancy-in-IBD/Giving-Birth',
      },
      {
        label: 'Ostomy Canada Society — Youth Camp',
        href: 'https://www.ostomycanada.ca/camp/ostomy-canada-youth-camp/',
      },
      {
        label: 'Ostomy Canada Society — the Visitor Program',
        href: 'https://www.ostomycanada.ca/ostomy-canada-visitor-program/',
      },
      {
        label: 'Ostomy Canada Society — find a chapter or peer support group',
        href: 'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/',
      },
      {
        label: '9-8-8 — Canada’s Suicide Crisis Helpline',
        labelFr: '9-8-8 — Ligne d’aide en cas de crise de suicide',
        href: 'https://988.ca/',
        hrefFr: 'https://988.ca/fr',
      },
    ],
  },
];
