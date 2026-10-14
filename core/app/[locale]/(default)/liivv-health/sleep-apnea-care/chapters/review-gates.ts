/* Twin of ../../diabetes-care/chapters/review-gates.ts — functions letter for letter */

/*
 * =============================================================================
 * FRENCH REVIEW GATES — SLEEP APNEA CARE
 * =============================================================================
 * The same rule as Diabetes Care's and Ostomy's; the reasoning is in
 * ../../ostomy-care/chapters/review-gates.ts. New interactive modules ship in
 * English first. On /fr each one stays hidden until a named francophone
 * reviewer has signed off its French, and the card falls back to the plain
 * list it has without the module. A whole chapter's French can wait the same
 * way, under `chapter:<slug>`.
 *
 * The gate ids are this site's own: 'landing' here and 'landing' on Diabetes
 * are two gates, and opening one never opens the other.
 *
 * Only the owner opens a gate, by adding its id to FR_REVIEWED after that
 * sign-off. Nothing else in the code base should add to it.
 *
 * Preview: on local development and on Vercel preview deployments every gate
 * counts as open, so the reviewer can read the French in context, with the
 * draft marker (`ui.chapter.frDraft`). Production never opens a gate this way.
 *
 * Never gateable: the red-flag block (staying-safe#red-flags), every
 * `urgentExit` signpost, the path safety strip, the landing's urgent door
 * route, and every figure on a card that carries an emergency line
 * (`urgentContent`, so 01 card 4's checklist stays on /fr). Source chips and
 * the foot list are governance furniture, never gated. The docs' `service:*`,
 * `stock:*`, `page:funding` and `review:*` ids are not French gates.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { UngateableKind } from '../../_microsite/chapters/types';

import type { ChapterSlug, FigureMeta } from './chapters-meta';

/* Every module or chapter-level section that ships behind a French gate. */
export type GateId =
  /* The signs checklist and its printable questions (Is It Sleep Apnea? card 4). */
  | 'signsChecklist'
  /* The AHI scale (Is It Sleep Apnea? card 9). */
  | 'ahiScale'
  | 'licenceClasses'
  | 'followUpTimeline'
  | 'maskPicker'
  | 'usageExplainer'
  | 'troubleshootFinder'
  | 'resupplyPlanner'
  | 'tripList'
  /* The landing's French review gates (FR_REVIEWED starts empty, owner-only): `landing` covers the
  landing prose (served on /fr as a machine translation, draft marker on preview); `doors` covers the
  situation doors, whose closed-gate fallback on /fr keeps the urgent route (URGENT_EXIT_CHAPTER). */
  | 'landing'
  | 'doors'
  /*
   * The Funding & Coverage page's own French (SleepApneaCare.funding and ui.funding*). Its prose
   * ships on /fr as a machine translation, flagged by ui.governance.machineTranslated; this gate
   * decides the draft marker on previews, and whether the page's /fr URL joins the sitemap once
   * the section is live. The urgent exit (Chapter 02's red-flag block) is never behind it.
   */
  | 'funding'
  /*
   * The funding checker (its questions, answers and result cards). While it is closed, /fr shows
   * a plain list of each province's programs instead (as Diabetes' FundingProvinceList), each
   * linked to its official page with the date it was checked. The federal programs, the "Before
   * you buy a machine" card, the urgent exit and every other section are never behind it. Held
   * program words (ruling B1) stay held in every locale whatever this gate says.
   */
  | 'fundingChecker'
  /* Already in spec 3.5's union; listed so the guide's French gate is traceable. De-duplicate. */
  | 'machineGuide'
  /* The resources shelf on a chapter page (no Sleep chapter has one yet). */
  | 'shelf'
  /*
   * The who-to-ask lanes' new text: link labels and the topic filter. The lanes that
   * carry a card's own sentence are never gated. The engine's `laneExtras`.
   */
  | 'laneExtras'
  /* The plain links under the referral band's cards. The engine's `bandLinks`. */
  | 'bandLinks'
  /*
   * The six path pages' own French (SleepApneaCare.paths and ui.path). Their prose ships on /fr,
   * flagged as machine translated; the safety strip is never behind it.
   */
  | 'paths'
  /* Reserved for a Sleep shop page of its own; there is none (the store category serves). */
  | 'shop'
  /* A whole chapter's French. */
  | `chapter:${ChapterSlug}`;

/* Gates whose French has been signed off. Owner-only; empty until reviews happen. */
export const FR_REVIEWED: ReadonlySet<GateId> = new Set<GateId>([]);

/*
 * Figure kinds that can be dropped on /fr, and the gate each waits on, with
 * what /fr keeps without it. A kind missing from this map is never dropped,
 * and the type refuses the routes to help outright. None of the generic kinds
 * the engine draws is gated.
 */
export const GATED_KINDS: Partial<Record<Exclude<FigureMeta['kind'], UngateableKind>, GateId>> = {
  /*
   * Is It Sleep Apnea? card 4. The card is `urgentContent` (its banner carries
   * the drowsy-driving signpost), so keepsFigure keeps the checklist in every
   * locale: this gate never drops it there, it only decides whether the French
   * draft marker shows. Wherever it is dropped, the card falls back to its own
   * three sections as plain lists with its note, the "Not a diagnostic tool"
   * banner, so every sign is still there. What waits is the tick boxes, their
   * legend, the printable questions and the print sheet.
   */
  signsChecklist: 'signsChecklist',
  /*
   * Is It Sleep Apnea? card 9. It augments the card, so on /fr the card keeps
   * its own seven sentences, which carry every AHI band (items 3 and 4), and
   * its note. What waits is the drawing, its zone labels and the two lines
   * under it (adults 19 and over; the sleep doctor also weighs symptoms and
   * health). Item 5 still says the AHI isn't the whole picture.
   */
  ahiScale: 'ahiScale',
  licenceClasses: 'licenceClasses', // 02 card 3. On /fr the card keeps its items 1-7 as a plain list and its visible note (which carries the "licensing measures, not health targets" line); the tabs, per-tab chips, measureNote and decides strip drop.
  /*
   * Starting CPAP card 1. It augments the card, so on /fr the card keeps its five sentences, which
   * carry the whole schedule, and its note (the basis line). What waits is the timeline drawing and
   * its six step labels.
   */
  followUpTimeline: 'followUpTimeline',
  /*
   * Starting CPAP card 3. On /fr the card keeps its five sentences (the three mask types, the
   * paediatric-mask line and the magnet warning, items.5) and its note ("try masks on with your
   * RT"). What waits is the tick boxes, the eight "may suit" reasons, the bilevel line and the
   * figure's own copy of the magnet note (the warning itself stays in items.5).
   */
  maskPicker: 'maskPicker',
  /*
   * Starting CPAP card 8. On /fr the card keeps its four sentences and its note ("not a health
   * target; your sleep team sets your goal"). What waits is the two licensing rows, their foot
   * lines and the line under them. The note's "below" then has nothing under it (notes.md).
   */
  usageExplainer: 'usageExplainer',
  /*
   * Starting CPAP card 9. On /fr the card falls back to its ten answers as a plain list (items
   * 1–10); answer 9 keeps "Don't change the pressure or settings yourself" and answer 10 still
   * names Driving & Staying Safe, whose block the chapter's urgent exit links. What waits is the
   * chips, the fixed line under every answer and the answer-10 link.
   */
  troubleshootFinder: 'troubleshootFinder',
  resupplyPlanner: 'resupplyPlanner', // 05 card 3: /fr keeps the card's seven items and its always-visible magnet note; no table
  tripList: 'tripList', // 05 card 8: /fr keeps the card's seven items as a plain list and its note
};

/*
 * NEXT_PUBLIC_VERCEL_ENV rather than VERCEL_ENV: the chapter is composed on the
 * server and again in the browser, and only the public variable is inlined
 * into the client bundle. `core/next.config.ts` derives it from VERCEL_ENV, so
 * it is never quietly undefined on a preview. Ostomy's file says why at length.
 */
const PREVIEW_OPENS_GATES =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

/* The production rule, with no preview override: is this still waiting for French review? */
export function awaitsFrReview(id: GateId, locale: string) {
  return locale === 'fr' && !FR_REVIEWED.has(id);
}

/* The rendering rule: hidden on /fr until reviewed, except on development and preview. */
export function isFrGated(id: GateId, locale: string) {
  return awaitsFrReview(id, locale) && !PREVIEW_OPENS_GATES;
}

/* A gated module is rendering only because of the preview override. */
export function showsFrDraftMarker(id: GateId, locale: string) {
  return awaitsFrReview(id, locale) && PREVIEW_OPENS_GATES;
}

/* The gate a figure kind waits on, if it has one. */
export function figureGate(kind: FigureMeta['kind']): GateId | undefined {
  if (kind === 'crisis' || kind === 'routes') return undefined;

  return GATED_KINDS[kind];
}

/*
 * Whether a card keeps a figure in this locale. `gated` defaults to the
 * rendering rule; the content-review export passes `awaitsFrReview` so its
 * checks describe production.
 */
export function keepsFigure(
  figure: Pick<FigureMeta, 'kind'>,
  card: { urgentContent?: boolean },
  locale: string,
  gated: (id: GateId, locale: string) => boolean = isFrGated,
) {
  if (card.urgentContent) return true;

  const gate = figureGate(figure.kind);

  return gate === undefined || !gated(gate, locale);
}
