/** Section id for the archive testimonials carousel. */
export const ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID = 'archive-reveal-testimonials-section';

/**
 * Section-level CSS for the testimonials block. Mirrors the source Shopify
 * `reveal_testimonials` section: sage background, dark foreground/highlight,
 * white-on-cream button (unused here but kept consistent for theme handoff).
 *
 * Per-card styles (border, padding, parallax transform) are applied inline by
 * the component so they cascade after these globals.
 */
export const ARCHIVE_REVEAL_TESTIMONIALS_VARS =
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;` +
  `--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--color-highlight:49 47 47;--color-button-background:245 242 237;` +
  `--color-button-border:245 242 237;--color-button-text:255 255 255}` +
  `@media screen and (max-width:767px){#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID}{` +
  `--section-padding-top:48px;--section-padding-bottom:48px}}`;
