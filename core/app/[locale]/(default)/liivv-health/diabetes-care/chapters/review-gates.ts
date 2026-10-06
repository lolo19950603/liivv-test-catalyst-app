/* Twin of ostomy-care/chapters/review-gates.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * FRENCH REVIEW GATES — DIABETES CARE
 * =============================================================================
 * The same rule as Ostomy's, for Diabetes Care's own modules; the reasoning is
 * in ../../ostomy-care/chapters/review-gates.ts. New interactive modules ship
 * in English first. On /fr each one stays hidden until a named francophone
 * reviewer has signed off its French, and the card falls back to the plain,
 * already-reviewed list it has without the module. A whole chapter's French
 * can wait the same way, under `chapter:<slug>`, which the chapter route checks
 * before it renders any of that chapter in French.
 *
 * The gate ids are this site's own. Ostomy's live in its own file, so 'shelf'
 * here and 'shelf' there are two gates, and opening one never opens the other.
 * The functions below and the preview rule are Ostomy's, letter for letter;
 * they are copied rather than imported because this file may not import a
 * value.
 *
 * Only the owner opens a gate, by adding its id to FR_REVIEWED after that
 * sign-off. Nothing else in the code base should add to it.
 *
 * Preview: on local development and on Vercel preview deployments every gate
 * counts as open, so the reviewer can read the French in context. A module
 * shown that way must carry the small visible draft marker from
 * `ui.chapter.frDraft`; `showsFrDraftMarker` says when. Production never opens
 * a gate this way.
 *
 * Never gateable: the 9-8-8 crisis strip, the routes to help, and every figure
 * on a card that carries a same-day, emergency or crisis line — on this site
 * that includes the red-flag signs of a severe low and of DKA. A module that
 * renders an urgentExit signpost may be gated only where the fallback still
 * shows that signpost.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { UngateableKind } from '../../_microsite/chapters/types';

import type { ChapterSlug, FigureMeta } from './chapters-meta';

/* Every module or chapter-level section that ships behind a French gate. */
export type GateId =
  /* The target-range ruler (New to the Journey card 3). */
  | 'glucoseRange'
  /* The Rule of 15 stepper, the site's one place that teaches treating a low. */
  | 'ruleOf15'
  /* The ketone ladder: what to do at each blood and urine ketone reading. */
  | 'ketoneLadder'
  /* The meter picker (Your Tools card 2; held). */
  | 'meterMatch'
  /* The sensor picker (Your Tools card 4). */
  | 'sensorPicker'
  /* The "My pump" picker (Your Tools card 13). */
  | 'pumpPicker'
  /* The sensor restock calculator (Your Tools card 6). */
  | 'restockCalc'
  /* The injection rotation map (Your Tools card 10). */
  | 'rotationMap'
  /* The printable sick-day plan. */
  | 'sickDayPlan'
  /* The clues checklist and its printable questions (Know Your Type card 6). */
  | 'cluesChecklist'
  /* The test names in plain words (Know Your Type card 6). */
  | 'testGlossary'
  /* The printable family diabetes tree (Know Your Type card 8). */
  | 'familyTree'
  /* The resources shelf on a chapter page. */
  | 'shelf'
  /*
   * The who-to-ask lanes' new text: link labels, a lane with no card sentence
   * of its own (Liivv's pharmacist CDE) and the topic filter. The lanes that
   * carry a card's own sentence are never gated. The engine's `laneExtras`.
   */
  | 'laneExtras'
  /* The plain links under the referral band's cards. The engine's `bandLinks`. */
  | 'bandLinks'
  /*
   * The situation doors on the landing page. While it is closed, /fr keeps
   * the urgent door's route on its own (_microsite/landing/situation-doors).
   */
  | 'doors'
  /*
   * The landing page's own French (DiabetesCare.ui.landingPage). Its prose
   * ships on /fr as a chapter's does, flagged as machine translated by the
   * governance block; this gate decides the draft marker on previews.
   */
  | 'landing'
  /*
   * The Funding & Coverage page's own French (DiabetesCare.funding and
   * ui.funding*). Its prose ships on /fr as the landing's does, flagged as
   * machine translated; this gate decides the draft marker on previews, and
   * whether the page's /fr URL joins the sitemap.
   */
  | 'funding'
  /*
   * The funding checker (its questions, answers and result cards). While it is
   * closed, /fr shows a plain list of each province's programs instead, each
   * linked to its official page with the date it was checked
   * (FundingProvinceList in ../funding/funding-checker.tsx). The federal programs, the urgent
   * signpost and every other section of the page are never behind it.
   */
  | 'fundingChecker'
  /*
   * The five path pages' own French (DiabetesCare.paths and ui.path). Their
   * prose ships on /fr as the funding page's does, flagged as machine
   * translated; this gate decides the draft marker on previews, and whether
   * the paths' /fr URLs join the sitemap. A path has no module to hold back,
   * and its emergency signpost is never behind a gate.
   */
  | 'paths'
  /* A whole chapter's French. */
  | `chapter:${ChapterSlug}`;

/* Gates whose French has been signed off. Owner-only; empty until reviews happen. */
export const FR_REVIEWED: ReadonlySet<GateId> = new Set<GateId>([]);

/*
 * Figure kinds that can be dropped on /fr, and the gate each waits on. A kind
 * missing from this map is never dropped, and the type refuses the crisis
 * strip and the routes to help outright.
 *
 * None of the generic kinds the engine draws is gated, on either site. Each of
 * Diabetes Care's own kinds is added here when it joins FigureMeta in
 * chapters-meta.ts, with a note on what /fr keeps without it, as Ostomy's
 * entries have.
 */
export const GATED_KINDS: Partial<Record<Exclude<FigureMeta['kind'], UngateableKind>, GateId>> = {
  /*
   * Staying Safe card 2. It restyles the card, so on /fr the card falls back
   * to its own four sentences as a plain list, with the driving note: the
   * whole Rule of 15 is still there. What waits is the walk-through, the
   * 15 g list, the children's amounts and the automated-system line.
   */
  ruleOf15: 'ruleOf15',
  /*
   * Staying Safe card 7. That card carries the emergency rung and the DKA
   * signs, so it is `urgentContent` and keepsFigure keeps the ladder in every
   * locale: this gate never drops it there, it only decides whether the
   * French draft marker shows. It is listed so the ladder waits on review on
   * any card that is not urgent.
   */
  ketoneLadder: 'ketoneLadder',
  /*
   * New to the Journey card 3. It augments the card, so on /fr the card keeps
   * its own five sentences, which carry every target number, and its printable
   * "My team's targets" card. What waits is the drawing, its zone labels, its
   * link to the Rule of 15 and the line under it.
   */
  glucoseRange: 'glucoseRange',
  /*
   * Know Your Type card 6. It draws the whole card, so on /fr the card falls
   * back to its own four sections as plain lists, with its note, which carries
   * the "Not a diagnostic tool" line and the insulin safety line. What waits is
   * the tick boxes, their legend, the printable questions and the print sheet.
   */
  cluesChecklist: 'cluesChecklist',
  /*
   * Know Your Type card 6. It augments the card, and its section 3 already
   * names and explains the tests, so /fr loses only the glossary's own
   * wording (the six terms and the line on international meanings).
   */
  testGlossary: 'testGlossary',
  /*
   * Know Your Type card 8. It augments the card, so on /fr the card keeps the
   * subtype columns and its note, which still asks the reader to note the
   * family's diabetes before an appointment. What waits is the table itself.
   */
  familyTree: 'familyTree',
  /*
   * Your Tools card 2. Held in both locales as well (`meterData`), so this
   * gate decides nothing until the hold is lifted. It augments the card, which
   * keeps its own five sentences either way.
   */
  meterMatch: 'meterMatch',
  /*
   * Your Tools card 4. It augments the card, so on /fr the card keeps its own
   * four sentences and its note (check with your team or a pharmacist CDE
   * before switching). What waits is the picker: the device names, the
   * pairings, who confirms each, the wear times and the notices.
   */
  sensorPicker: 'sensorPicker',
  /*
   * Your Tools card 13. It augments the card, so on /fr the card keeps its two
   * sentences and its note (have your pump's model ready and ask a Liivv
   * pharmacist CDE). What waits is the picker and its link to that request.
   */
  pumpPicker: 'pumpPicker',
  /*
   * Your Tools card 6. It augments the card, so on /fr the card keeps its
   * three sentences, which say how the sum works, and its note. What waits is
   * the calculator and its worked example.
   */
  restockCalc: 'restockCalc',
  /*
   * Your Tools card 10. It augments the card, whose seven sentences carry
   * every fact the drawing shows (5 cm from the belly button, 1 to 2 cm
   * apart, four zones, a week each). What waits is the drawing and its labels.
   */
  rotationMap: 'rotationMap',
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
