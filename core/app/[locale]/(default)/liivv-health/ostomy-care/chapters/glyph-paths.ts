/*
 * Wordless line symbols as raw SVG markup on a 24×24 grid, stroke only.
 *
 * Kept out of figures.tsx (a client module) so a server component can draw a
 * symbol too. Every symbol is paired with a translated text label wherever it
 * is used, so meaning never depends on the drawing. The Record type makes tsc
 * flag a GlyphName with no drawing.
 */

import type { GlyphName } from './chapters-meta';

export const GLYPH_PATHS: Record<GlyphName, string> = {
  nswoc:
    '<circle cx="12" cy="7" r="3.2"/><path d="M5.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2"/><path d="M8.5 14.6c0 2.3 1.5 3.6 3.5 3.6s3.5-1.3 3.5-3.6"/><circle cx="12" cy="18.2" r="0.9"/>',
  /*
   * Two people, one a step behind: the surgeon-or-clinic lane on Chapter 01
   * card 10. Traced from `g-team` on the approved interactives review sprite,
   * which is what that lane was reviewed with. The clipboard this key used to
   * hold was never drawn on any approved sheet and nothing referenced it.
   */
  team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 19c.5-3.2 2.6-5 5.5-5s5 1.8 5.5 5"/><path d="M15 14.2c2.6-.3 4.9 1.3 5.5 4.8"/>',
  peer: '<circle cx="8.5" cy="8" r="2.6"/><circle cx="15.5" cy="8" r="2.6"/><path d="M3.5 19c0-2.9 2.2-5 5-5s5 2.1 5 5"/><path d="M11 14.6c1.2-.4 2.9-.6 4.5-.6 2.8 0 5 2.1 5 5"/>',
  primaryCare:
    '<circle cx="12" cy="6.5" r="3"/><path d="M6 20.5c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M9 14.9v3.1a3 3 0 0 0 6 0v-3.1"/>',
  service: '<path d="M4 6.5h16v9.5H9l-5 4z"/><path d="M8 10h8M8 12.8h5"/>',
  urgent:
    '<path d="M12 3.5 21 19.5H3z"/><path d="M12 9.5v4.6"/><circle cx="12" cy="16.8" r="0.9"/>',
  phone:
    '<path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>',
  text: '<path d="M4 5.5h16v10H10l-4.5 3.5V15.5H4z"/>',
  waist: '<path d="M3 10h18M3 14h18"/><rect x="10" y="9" width="4" height="6" rx="1"/>',
  fold: '<path d="M3 9c3 2 6 2 9 0s6-2 9 0"/><path d="M3 15c3 2 6 2 9 0s6-2 9 0"/>',
  scar: '<path d="M4 12h16"/><path d="M7 9.5v5M10.5 9.5v5M14 9.5v5M17.5 9.5v5"/>',
  belt: '<path d="M3 12h18"/><rect x="8" y="9.5" width="8" height="5" rx="1.2"/><path d="M12 9.5v5"/>',
  more: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  print:
    '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9.5h12V10"/>',
  bag: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  shirt: '<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="5" cy="7" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="17" r="1"/>',
  hands:
    '<path d="M4 14.5 8.5 10c1-1 2.6-1 3.5 0l1 1"/><path d="M20 14.5 15.5 10c-1-1-2.6-1-3.5 0l-4 4"/><path d="M4 14.5 9 19.5h6l5-5"/>',
  food: '<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M9 5c0 2 2 2 2 4M13 5c0 2 2 2 2 4"/>',
  walk: '<circle cx="13" cy="4.5" r="2"/><path d="M11 9l-3 4 3 1 1 6"/><path d="M11 9l3 2 3-1"/><path d="M12 14l3 6"/>',
  people:
    '<circle cx="7" cy="9" r="2.4"/><circle cx="17" cy="9" r="2.4"/><circle cx="12" cy="7" r="2.4"/><path d="M3 19c0-2.5 1.8-4.5 4-4.5M21 19c0-2.5-1.8-4.5-4-4.5M7.5 19c0-2.8 2-5 4.5-5s4.5 2.2 4.5 5"/>',
  /* From the approved interactives review sprite (g-book, g-video, g-pin, g-calendar, g-coin). */
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2c-1 0-2-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>',
  /* Beside the "fits what you ticked" badge, so the mark is never colour alone. */
  check: '<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>',
};
