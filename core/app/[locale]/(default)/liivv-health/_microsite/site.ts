/*
 * =============================================================================
 * CARE MICROSITES — WHAT ONE SITE DOES DIFFERENTLY FROM ANOTHER
 * =============================================================================
 * The chapter engine in ./chapters is shared by every care site. What differs
 * between sites is held in one SiteConfig per site: the message namespace, where
 * the site lives, the localStorage keys it writes, the anchors other pages link
 * to, the furniture around its chapters, and the schema it declares.
 *
 * A config is data, plus the site's own French review gates as functions. It
 * reaches the engine through SiteProvider (./site-context), rendered by the
 * site's own 'use client' wrapper, and is never passed as a prop from a server
 * component: that would serialise it into the page's payload (the gates could
 * not be serialised at all), and the Ostomy payload is checked against a
 * baseline. Server code that composes a chapter (./chapters/route.ts) imports
 * the config itself.
 *
 * Erasable TypeScript and statement-form `import type` only, like the
 * chapters-meta files, so the content-review export can load this file under
 * Node's type stripping.
 * =============================================================================
 */

import type { Messages } from 'next-intl';

import type { EngineChapterMeta } from './chapters/types';
import type { SiteShop } from './shop/shelves';

/*
 * The care sites' own top-level message namespaces. Only names that are in
 * en.json count, so a config can never point the engine at a namespace the
 * message files do not have.
 */
export type SiteNs = Extract<keyof Messages, 'OstomyCare' | 'DiabetesCare'>;

/*
 * Everything a site keeps in a reader's browser, and the one window event that
 * keeps its text-size controls in step. Keys are `<prefix>-<name>`, spelled out
 * in full in each site's config. A site's keys are checked against
 * `SiteStorage<'its prefix'>`, which holds every one of them to that prefix, so
 * one site can never read or overwrite another's.
 *
 * `modules` is for interactive modules that remember something, one key each,
 * named `<prefix>-<module>-v1`. Bump the version when a module's stored shape
 * changes, so an old value is ignored rather than misread.
 *
 * Shared on purpose, because they are styling hooks and store nothing: the
 * `html[data-oc-text]` attribute, the `html.oc-printing` class, the
 * `data-oc-printing` and `data-oc-print-path` attributes (./print) and
 * `--oc-audio-bar-h`. A page belongs to one site, so both sites can use
 * them, and the same CSS.
 */
export interface SiteStorage<Prefix extends string = string> {
  textSize: `${Prefix}-text-size`;
  textSizeEvent: `${Prefix}-text-size-change`;
  /** Followed by the chapter slug. */
  continuePrefix: `${Prefix}-journey-continue:`;
  /** Followed by the chapter slug. */
  savedPrefix: `${Prefix}-journey-saved:`;
  audioRate: `${Prefix}-audio-rate`;
  audioAuto: `${Prefix}-audio-auto`;
  modules: Record<string, `${Prefix}-${string}`>;
}

/*
 * Ostomy's keys, letter for letter as its own files write them today:
 * text-size.ts, text-size-control.tsx, journey-memory.ts,
 * chapter-audio-player.tsx and supply-list.tsx. Changing one would forget the
 * text size, saved stops, place and audio settings of every returning reader.
 * When Ostomy moves onto the engine, those files read from here, and a literal
 * check on each key keeps it pinned.
 */
export const OSTOMY_STORAGE = {
  textSize: 'oc-text-size',
  textSizeEvent: 'oc-text-size-change',
  continuePrefix: 'oc-journey-continue:',
  savedPrefix: 'oc-journey-saved:',
  audioRate: 'oc-audio-rate',
  audioAuto: 'oc-audio-auto',
  modules: { supplyList: 'oc-supply-list-v1' },
} as const satisfies SiteStorage<'oc'>;

/*
 * Diabetes Care's keys, the same names under `dc-`. Nothing on the Diabetes
 * pages writes localStorage yet. The audio keys are reserved for when its
 * chapters can be listened to. A module that remembers something adds its key
 * here when it is built. Your Tools' sensor and pump pickers remember the
 * device picked for the rest of the tab, in sessionStorage only, so the choice
 * is gone when the tab closes; nothing else is kept, and the restock
 * calculator keeps nothing at all.
 */
export const DIABETES_STORAGE = {
  textSize: 'dc-text-size',
  textSizeEvent: 'dc-text-size-change',
  continuePrefix: 'dc-journey-continue:',
  savedPrefix: 'dc-journey-saved:',
  audioRate: 'dc-audio-rate',
  audioAuto: 'dc-audio-auto',
  modules: { sensorPicker: 'dc-sensor-picker-v1', pumpPicker: 'dc-pump-picker-v1' },
} as const satisfies SiteStorage<'dc'>;

/* Fragments that the engine links to, on the chapter pages and on the landing. */
export interface SiteAnchors {
  /*
   * The site's emergency list: the chapter that prints it and the id of its
   * section. A chapter with no list of its own signposts this one.
   */
  redFlags: { chapter: string; id: string };
  /* The landing section a reader goes back to after the last chapter. */
  whereAreYou: string;
}

/* What the chapter's MedicalWebPage schema and its page title say about the site. */
export interface SiteSchema {
  /** The MedicalCondition the chapters are about, such as 'Ostomy'. */
  about: string;
  /** The Patient audience, in a sentence. */
  audience: string;
  /*
   * Follows the chapter title after a space, such as '| Ostomy Care | Liivv',
   * in every locale. Only for a site whose messages have no
   * `ui.chapter.titleSuffix`: that one is in the page locale, and wins.
   * Diabetes Care words its suffix in its messages and leaves this out.
   */
  titleSuffix?: string;
}

/*
 * The help and discovery bands around a chapter. Outward links are absolute;
 * the pharmacist link is a storefront path and gets the /fr prefix like any
 * other plain <a>.
 */
export interface SiteFurniture {
  /** The site's own door in HEALTH_HUB_DOORS, left out of its discovery band. */
  hubDoorId: string;
  /** The outward directory of the specialist nurses or educators the site sends readers to. */
  directoryHref: string;
  /*
   * The prefix of that directory card's words in `ui.help`: `<key>Title`,
   * `<key>Org` and `<key>Body`, such as 'nswoc' or 'educator'. The specialist
   * is named differently on each site, so the key is too.
   */
  directoryKey: string;
  /*
   * The outward finder for local peer groups, where the site has one. Without
   * it the help band leaves the group card out rather than link nowhere.
   */
  peerFinderHref?: string;
  pharmacistHref: string;
}

/*
 * The site's specialist service, reached directly: a general phone line, and
 * where the site sets them an email address and the service's own About page,
 * worded in `ui.contact`. Where a site sets it, every pharmacist panel the
 * engine draws (the chapters', the paths' and the landing's care band) shows
 * these instead of a request button, and the chapter panel carries the
 * `#chapter-cde` anchor that the hero's "ask" button and the lanes open. A
 * general contact only: never a named person. Ostomy has none, so nothing
 * changes there. The email and About lines render only when set: Diabetes
 * sets the phone alone, because its service is presented as Liivv's own
 * (owner note 5, 2026-10-07).
 */
export interface SiteContact {
  /** The `tel:` target: digits with the country code, such as '+18445611254'. */
  tel: string;
  /** Rendered only when set. */
  email?: string;
  /** The service's About page, absolute, and its French page where the service has one. Rendered only when set. */
  aboutHref?: string;
  aboutHrefFr?: string;
}

/*
 * Who wrote a site's chapters, and who checked them: two people, gated
 * independently. The reasoning, and why every field starts empty, is at
 * GovernancePerson in ostomy-care/chapters/chapters-data.ts. A name must match
 * the College's public register exactly.
 */
export interface GovernancePerson {
  name: string;
  credential: string;
  registration: string;
  registryUrl: string;
}

export interface SiteGovernance {
  /** The clinician who writes the content. An empty name suppresses the written-by line. */
  author: GovernancePerson;
  /** The clinician who reviews it. An empty name suppresses the review line. */
  reviewer: GovernancePerson;
  /** ISO date (YYYY-MM-DD) of the clinical review; empty until there is one. */
  reviewedOn: string;
  /*
   * Whether the pages carry the commercial disclosure, worded in
   * `ui.governance.disclosure`. A byline renders only where this is true.
   */
  disclosure: boolean;
}

/*
 * The site's French review gates (its own review-gates.ts), handed to the
 * engine as functions because that file may not be imported by value from
 * anywhere the content-review export loads. Declared as methods so a site's
 * own functions, typed over its own GateId, still fit.
 *
 * `features` names the gate each piece of engine-drawn new French waits on,
 * since every site names its gates for itself. Each is required: a site
 * decides what gates them rather than having them ship ungated by omission.
 *   shelf       the resources shelf
 *   laneExtras  the who-to-ask lanes' new text: link labels, a lane with no
 *               card sentence of its own, and the topic filter. The lanes that
 *               carry a card's own sentence are never gated.
 *   bandLinks   the plain links under the referral band's cards
 *   doors       the situation doors on the landing page. The urgent door's
 *               route is never gated: while the gate is closed the landing
 *               shows that one route on its own (../landing/situation-doors).
 *   landing     the landing page's own French. Its prose ships on /fr, as a
 *               chapter's does, flagged as machine translated; the gate
 *               decides the draft marker on previews.
 */
export interface SiteGates<Id extends string = string> {
  features: { shelf: Id; laneExtras: Id; bandLinks: Id; doors: Id; landing: Id };
  isFrGated(id: Id, locale: string): boolean;
  showsFrDraftMarker(id: Id, locale: string): boolean;
  keepsFigure(figure: { kind: string }, card: { urgentContent?: boolean }, locale: string): boolean;
}

/*
 * The site's own figure kinds, by what each does to its card. The engine
 * starts from the generic sets in ./chapters/kinds.ts and adds these. A site
 * kind listed in none of them is drawn as a figure that augments its card.
 */
export interface SiteKinds<Kind extends string = string> {
  /** Interactive modules: the card renders open with no toggle. */
  module?: readonly Kind[];
  /** Figures that carry the card's own sentences, so the plain list is not repeated. */
  restyle?: readonly Kind[];
  /** Modules that render the chapter's emergency signpost themselves. */
  exitCarrying?: readonly Kind[];
  /** Modules the row itself signposts. */
  rowExit?: readonly Kind[];
  /** Figures that render the card's closing note themselves. */
  noteCarrying?: readonly Kind[];
  /*
   * Figures that draw the whole card body themselves: its sections and its
   * closing note, wherever the meta keeps the note, so the row prints neither.
   * When a review gate drops the figure, the card falls back to its plain
   * sections and note, and `noteVisible` decides where the note sits.
   */
  wholeCard?: readonly Kind[];
  /** Figures that take the full row. */
  fullWidth?: readonly Kind[];
  /** Journey entries that stay figure-led and full-stage. */
  journeyModule?: readonly Kind[];
}

export interface SiteConfig<Kind extends string = string> {
  /** The site's top-level message namespace. */
  ns: SiteNs;
  /** The landing page. Chapters live under `${basePath}/chapters/<slug>`. */
  basePath: `/liivv-health/${string}`;
  /*
   * The chapter root's id. Every site uses the same one, because every rule in
   * the shared stylesheet (ostomy-care/chapters/chapter-page.css) is scoped
   * under it, and a chapter with any other id would render unstyled.
   */
  rootId: 'oc-chapter';
  /*
   * Rendered as `data-site` on the chapter root, so a site's own CSS can be
   * scoped under `#oc-chapter[data-site='…']`. Leave it out and no attribute
   * renders, which is how the Ostomy HTML stays as it is.
   */
  rootAttr?: string;
  /** Prefix for the ids the engine generates, such as group sections and symbols. */
  idPrefix: `${string}-`;
  storage: SiteStorage;
  anchors: SiteAnchors;
  schema: SiteSchema;
  furniture: SiteFurniture;
  kinds: SiteKinds<Kind>;
  /** The site's chapters, in reading order (its chapters-meta.ts). */
  chapters: readonly EngineChapterMeta[];
  /*
   * The site's symbol drawings by name (its glyph-paths.ts), drawn once per
   * page into a sprite whose symbol ids start with `idPrefix`.
   */
  glyphs: Readonly<Record<string, string>>;
  gates: SiteGates;
  governance: SiteGovernance;
  /*
   * The who-to-ask topics a lane for Liivv's own service may ever be marked
   * for, whatever the meta says, so a lane that sells can never answer a
   * clinical topic. Ostomy's is the product topic alone.
   */
  serviceLaneTopics: readonly string[];
  /** The specialist service's general contact (SiteContact). Leave it out for none. */
  contact?: SiteContact;
  /*
   * The emergency number as the red-flag block's `action` line prints it, and
   * what a tap on it dials. Where a site sets it, that number in the line
   * becomes a tel: link. Engine-only: Ostomy's twin has none.
   */
  emergency?: { tel: string; written: string };
  /** Whether the chapters offer Listen. Off until a site's audio has its own storage path. */
  audio: boolean;
  /*
   * The site's merchandising record (its chapters/chapter-shop.ts): which card
   * shows which products, and the one switch that turns every placement off.
   * Leave it out and no chapter card places a product. The products themselves
   * reach a page through ShopProvider (./shop/shop-context.tsx), read from the
   * catalogue on the server.
   */
  shop?: SiteShop;
}
