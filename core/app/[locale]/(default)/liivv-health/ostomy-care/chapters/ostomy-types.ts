/*
 * The ostomy types a line of chapter content can apply to: colostomy,
 * ileostomy and urostomy. Structural, so a translation cannot change which
 * reader a line is for. Labels live in `ui.chapter.recoveryMap.types`.
 *
 * Shared by the recovery map (C03) and the fibre clocks on Chapter 03 (C11).
 *
 * No imports and erasable TypeScript only: chapters-meta.ts takes the type
 * from here, and the content-review export loads that file under Node's type
 * stripping.
 */

export const OSTOMY_TYPES = ['colo', 'ileo', 'uro'] as const;

export type OstomyType = (typeof OSTOMY_TYPES)[number];
