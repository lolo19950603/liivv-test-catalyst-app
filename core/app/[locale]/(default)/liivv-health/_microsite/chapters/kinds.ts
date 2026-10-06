/* Twin of ostomy-care/chapters/figures.tsx @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * MICROSITE CHAPTERS — WHAT EACH GENERIC FIGURE KIND DOES TO ITS CARD
 * =============================================================================
 * Ostomy's kind sets, cut down to the kinds the engine draws itself. They come
 * from ostomy-care/chapters/figures.tsx, plus FULL_WIDTH_KINDS in its
 * chapter-page.tsx and the layout-only MODULE_KINDS in its journey-layout.tsx;
 * the comments there explain each set. Ostomy's own kinds (changeRoutine,
 * supplyList, goBag, gapCompare, fibreClocks, partsOfSystem, bowelReference)
 * are not here. A site adds its own kinds to each set through `site.kinds`
 * (../site.ts), and the engine uses the two together.
 *
 * Several sets are empty: every module Ostomy pins open, and the one row that
 * prints its own signpost, belong to Ostomy rather than to the engine.
 *
 * Plain arrays and `import type` only, so the content-review export can import
 * these under Node's type stripping instead of reading figures.tsx with a regex.
 * =============================================================================
 */

import type { BaseFigureKind } from './types';

/* Every kind the engine draws itself. Any other kind goes to the site's registry. */
export const BASE_FIGURE_KINDS = [
  'crisis',
  'routes',
  'criteria',
  'takeIn',
  'columns',
  'containers',
  'lanes',
  'doors',
] as const satisfies readonly BaseFigureKind[];

/* Figures that carry the card's own sentences, so the plain list is not repeated. */
export const BASE_RESTYLE_KINDS = [
  'takeIn',
  'columns',
  'containers',
  'lanes',
  'doors',
] as const satisfies readonly BaseFigureKind[];

/*
 * Interactive modules: a card carrying one renders open with no toggle. None of
 * the generic kinds is one.
 */
export const BASE_MODULE_KINDS = [] as const satisfies readonly BaseFigureKind[];

/* Modules that render the chapter's emergency signpost themselves. */
export const BASE_EXIT_CARRYING_KINDS = ['lanes'] as const satisfies readonly BaseFigureKind[];

/* Modules the row itself signposts. Only Ostomy's supply list is one. */
export const BASE_ROW_EXIT_KINDS = [] as const satisfies readonly BaseFigureKind[];

/* Figures that render the card's closing note themselves, so the row does not repeat it. */
export const BASE_NOTE_CARRYING_KINDS = ['takeIn'] as const satisfies readonly BaseFigureKind[];

/*
 * Figures that draw the card's sections and its note themselves, wherever the
 * meta keeps the note (`wholeCard` in ../site.ts). None of the generic kinds
 * does. Engine-only so far: Ostomy's twin has no such set.
 */
export const BASE_WHOLE_CARD_KINDS = [] as const satisfies readonly BaseFigureKind[];

/*
 * Figures that take the full row and must not wait on a fade (chapter-page.tsx
 * FULL_WIDTH_KINDS). Pinned cards take it too.
 */
export const BASE_FULL_WIDTH_KINDS = [
  'crisis',
  'lanes',
] as const satisfies readonly BaseFigureKind[];

/*
 * Journey entries that stay figure-led and full-stage rather than becoming a
 * framed shelf stop (journey-layout.tsx MODULE_KINDS, a layout-only set).
 */
export const BASE_JOURNEY_MODULE_KINDS = [
  'crisis',
  'lanes',
  'criteria',
] as const satisfies readonly BaseFigureKind[];
