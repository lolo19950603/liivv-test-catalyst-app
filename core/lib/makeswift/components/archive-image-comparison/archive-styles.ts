/** Section id for the archive image-comparison block. */
export const ARCHIVE_IMAGE_COMPARISON_SECTION_ID = 'archive-image-comparison-section';

/**
 * Section vars. Aspect ratio is exposed via `--ratio-percent` so it can be
 * overridden per-instance via inline style. Foreground stays light (white) so
 * the drag handle reads against either image; cream → dark transition is
 * common in the source.
 */
export const ARCHIVE_IMAGE_COMPARISON_VARS =
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{--section-padding-top:20px;--section-padding-bottom:52px;` +
  `--color-foreground:245 242 237;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--ratio-percent:56.25%}` +
  `@media screen and (max-width:767px){#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{` +
  `--section-padding-top:16px;--section-padding-bottom:32px}}`;
