/* Diabetes Care's drawings (../../diabetes-care/chapters/glyph-paths.ts) for every name Sleep shares */

/*
 * Wordless line symbols as raw SVG markup on a 24×24 grid, stroke only.
 *
 * Kept out of the figure components (client modules) so a server component
 * (the landing's situation doors) can draw a symbol too. Every symbol is
 * paired with a translated text label wherever it is used, so meaning never
 * depends on the drawing. The Record type makes tsc flag a GlyphName with no
 * drawing.
 *
 * The shared symbols are copied unchanged, so the sites read as one family.
 * Sleep's own five at the end (mask, plane, shield, refresh, question) are
 * drawn in the same weight: plain outlines of a generic object, never a
 * product's shape.
 */

import type { GlyphName } from './chapters-meta';

export const GLYPH_PATHS: Record<GlyphName, string> = {
  /* Two people, one a step behind: a care team. */
  team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.5-3.2 2.6-5 5.5-5s5 1.8 5.5 5"/><path d="M15 14.2c2.6-.3 4.9 1.3 5.5 4.8"/>',
  primaryCare:
    '<circle cx="12" cy="6.5" r="3"/><path d="M6 20.5c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M9 14.9v3.1a3 3 0 0 0 6 0v-3.1"/>',
  service: '<path d="M4 6.5h16v9.5H9l-5 4z"/><path d="M8 10h8M8 12.8h5"/>',
  urgent:
    '<path d="M12 3.5 21 19.5H3z"/><path d="M12 9.5v4.6"/><circle cx="12" cy="16.8" r="0.9"/>',
  phone:
    '<path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  text: '<path d="M4 5.5h16v10H10l-4.5 3.5V15.5H4z"/>',
  more: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  print:
    '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9.5h12V10"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="17" r="1"/>',
  hands:
    '<path d="M4 14.5 8.5 10c1-1 2.6-1 3.5 0l1 1"/><path d="M20 14.5 15.5 10c-1-1-2.6-1-3.5 0l-4 4"/><path d="M4 14.5 9 19.5h6l5-5"/>',
  people:
    '<circle cx="7" cy="9" r="2.4"/><circle cx="17" cy="9" r="2.4"/><circle cx="12" cy="7" r="2.4"/><path d="M3 19c0-2.5 1.8-4.5 4-4.5M21 19c0-2.5-1.8-4.5-4-4.5M7.5 19c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2c-1 0-2-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>',
  /* Beside a "fits" badge, so the mark is never colour alone. */
  check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',

  /* A soft mask cushion with its two straps and a short tube below. */
  mask: '<path d="M12 4.5c-3.3 0-5.5 3.2-5.5 7.2 0 3.6 2.4 6.8 5.5 6.8s5.5-3.2 5.5-6.8c0-4-2.2-7.2-5.5-7.2z"/><path d="M6.5 10.5H3M17.5 10.5H21"/><path d="M12 18.5v2.5"/>',
  /* An aeroplane seen from above. */
  plane:
    '<path d="M21 15.5 13.5 11V5.5a1.5 1.5 0 0 0-3 0V11L3 15.5v2l7.5-2.5v4L8 20.5V22l4-1 4 1v-1.5L13.5 19v-4l7.5 2.5z"/>',
  /* A shield with a tick: a safety check. */
  shield:
    '<path d="M12 3.5 19.5 6v5.5c0 4.5-3.2 7.8-7.5 9-4.3-1.2-7.5-4.5-7.5-9V6z"/><path d="M9 12l2 2 4-4"/>',
  /* A circular arrow: replace, renew. */
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5V9H15"/>',
  /* A question mark in a circle. */
  question:
    '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.6"/><circle cx="12" cy="16.8" r="0.9"/>',
};
