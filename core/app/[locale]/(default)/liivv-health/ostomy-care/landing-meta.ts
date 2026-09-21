/*
 * =============================================================================
 * OSTOMY CARE LANDING — STRUCTURE
 * =============================================================================
 * What the landing page is made of, apart from the words. Prose lives in
 * messages/*.json under `OstomyCare.ui.landingPage`, the same way the chapters
 * and the funding page hold theirs.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping, exactly as it loads
 * chapters-meta.ts, so it can check every door's target before a reader finds
 * a link to an anchor that is not there.
 * =============================================================================
 */

import type { GlyphName } from './chapters/chapters-meta';

/*
 * C13 — the situation doors.
 *
 * Five plain links, in the order the approved review page has them, each named
 * after where the reader is rather than after a section of this site. The
 * numbered keys under `ui.landingPage.doors.items` pair with this array by
 * position, so a door added here without a label, or a label with no door, is
 * a structure problem the export reports.
 *
 * A door points at a chapter (`chapter`, optionally an `anchor` on it) or at
 * the funding page (`funding`). It never points into a disclosure, a collapsed
 * row or a filtered lane: `#red-flags` is its own section of Chapter 02 and
 * `#card-N` is the card article itself, both of which render open, in both
 * locales, with no hidden ancestor.
 */
export type SituationDoorId = 'surgeryAhead' | 'justHome' | 'notRight' | 'money' | 'helping';

export interface SituationDoor {
  id: SituationDoorId;
  glyph: GlyphName;
  /** A chapter slug from CHAPTER_META. Exactly one of `chapter` and `funding`. */
  chapter?: string;
  /** A fragment on that chapter: `red-flags`, or `card-<n>` for a card. */
  anchor?: string;
  funding?: true;
  /** Emergency wording. Marked in text and symbol, never in colour alone. */
  urgent?: true;
  /** The quieter second link under a door, for the reader whose case is not urgent. */
  secondary?: { chapter: string; anchor: string };
}

export const SITUATION_DOORS: SituationDoor[] = [
  /* Chapter 01 from the top: the whole chapter is about the run-up to surgery. */
  { id: 'surgeryAhead', glyph: 'calendar', chapter: 'new-to-the-journey' },
  /* Chapter 01 card 6, "First Week Basics". */
  { id: 'justHome', glyph: 'home', chapter: 'new-to-the-journey', anchor: 'card-6' },
  /*
   * Straight to Chapter 02's emergency list, never to a directory and never to
   * a card that has to be opened first. The secondary link below it is Chapter
   * 01 card 10, "Who to Ask", for the reader whose worry is not an emergency —
   * so the urgent door does not have to carry both jobs.
   */
  {
    id: 'notRight',
    glyph: 'urgent',
    chapter: 'get-to-know-your-stoma',
    anchor: 'red-flags',
    urgent: true,
    secondary: { chapter: 'new-to-the-journey', anchor: 'card-10' },
  },
  { id: 'money', glyph: 'coin', funding: true },
  /* Chapter 01 card 5, "If you are supporting someone". */
  { id: 'helping', glyph: 'hands', chapter: 'new-to-the-journey', anchor: 'card-5' },
];
