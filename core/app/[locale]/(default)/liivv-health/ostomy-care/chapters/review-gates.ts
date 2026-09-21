/*
 * =============================================================================
 * FRENCH REVIEW GATES
 * =============================================================================
 * New interactive modules ship in English first. On /fr each one stays hidden
 * until a named francophone reviewer has signed off its French, and the card
 * falls back to the plain, already-reviewed list it had before the module.
 *
 * Only the owner opens a gate, by adding its id to FR_REVIEWED after that
 * sign-off. Nothing else in the code base should add to it.
 *
 * Preview: on local development and on Vercel preview deployments every gate
 * counts as open, so the reviewer can read the French in context. A module
 * shown that way must carry the small visible draft marker from
 * `ui.chapter.frDraft` (fr: « Brouillon — révision en français à venir »);
 * `showsFrDraftMarker` says when. Production never opens a gate this way.
 *
 * Never gateable: the 9-8-8 crisis strip, the routes to help, and every figure
 * on a card that carries a same-day, emergency or crisis line. A module that
 * renders an urgentExit signpost may be gated only where the fallback still
 * shows that signpost.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { FigureMeta } from './chapters-meta';

/* Every module or chapter-level section that ships behind a French gate. */
export type GateId =
  | 'changeRoutine'
  | 'supplyList'
  | 'recoveryMap'
  | 'finder'
  | 'shelf'
  | 'gapCompare'
  | 'partsOfSystem'
  | 'fibreClocks'
  | 'bowelReference'
  | 'childLinks'
  | 'doors';

/* Gates whose French has been signed off. Owner-only; empty until reviews happen. */
export const FR_REVIEWED: ReadonlySet<GateId> = new Set<GateId>([]);

type UngateableKind = 'crisis' | 'routes';

/*
 * Figure kinds that can be dropped on /fr, and the gate each waits on. A kind
 * missing from this map is never dropped, and the type refuses the crisis
 * strip and the routes to help outright.
 */
export const GATED_KINDS: Partial<Record<Exclude<FigureMeta['kind'], UngateableKind>, GateId>> = {
  /*
   * C01 on Chapter 01 card 7. Its urgentExit line repeats the chapter's own
   * signpost, which still renders at the top of the page on /fr.
   */
  changeRoutine: 'changeRoutine',
  /*
   * C02 on Chapter 01 cards 8 and 9. Both wait on the same gate, so /fr can
   * never show card 9's link to a list that is not there. Either way both
   * cards keep their own reviewed sentences, and the sales notes are gone from
   * both locales, so nothing a reader needs is behind this gate.
   */
  supplyList: 'supplyList',
  goBag: 'supplyList',
  /*
   * C07 on Chapter 02 card 9. It augments the card, so on /fr the card keeps
   * all three of its own reviewed sentences and its note; only the panels and
   * the two new lines wait. The figure signposts the chapter's emergency list,
   * but that list is a section of this same page and always renders in both
   * locales, so gating the figure hides no urgent wording.
   */
  gapCompare: 'gapCompare',
  /*
   * C08 on Chapter 02 card 3. It is also HELD in chapters-meta.ts, so today it
   * renders nowhere at all; this gate is what its French waits on once the
   * written ruling lifts the hold, so the two never have to be remembered
   * together. It augments a card of three plain glossary lists with no urgent
   * line, so on /fr the card is exactly what its French review covered.
   */
  partsOfSystem: 'partsOfSystem',
  /*
   * C04 on Chapter 02 card 1, and on Chapter 03 card 2, where it is also HELD
   * in chapters-meta.ts and so renders nowhere at all today. It augments a card
   * of three plain sentences with no urgent line, so on /fr the card is exactly
   * what its French review covered. What waits is the alt text, the caption and
   * the eight part names — every word a reader would meet, since the picture
   * itself carries none. The credit beside it is fixed English in both locales
   * and is not what this gate is about (anatomy-meta.ts).
   */
  bowelReference: 'bowelReference',
  /*
   * C11 on Chapter 03 card 3. It augments the card, so on /fr the card keeps
   * all three of its own reviewed sentences and its note. The clocks signpost
   * Chapter 02's emergency list, which is on another page, so the figure is
   * marked `exitWhenGated` in chapters-meta.ts: this gate takes the clocks and
   * leaves the signpost, printed by the card itself in the clocks' place. The
   * French waiting on review is the clocks' own wording, never the pointer to
   * an emergency list.
   */
  fibreClocks: 'fibreClocks',
};

/*
 * NEXT_PUBLIC_VERCEL_ENV rather than VERCEL_ENV: the chapter is composed on the
 * server and again in the browser, and only the public variable is inlined
 * into the client bundle. Reading VERCEL_ENV would open the gates in server
 * HTML and close them on hydration.
 *
 * The name is not one Vercel guarantees — the NEXT_PUBLIC_ twin of a system
 * variable exists only when the project happens to have "Automatically expose
 * System Environment Variables" switched on. `core/next.config.ts` therefore
 * derives it from VERCEL_ENV, which is always present, so this cannot quietly
 * read `undefined` on the preview built for the francophone reviewer and leave
 * every gate shut with nothing to show that it had.
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
