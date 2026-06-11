import {
  ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  ARCHIVE_CREAM_BACKGROUND_HEX,
  ARCHIVE_CREAM_BACKGROUND_HSL,
} from '~/lib/makeswift/utils/diabetes-care-archive-theme';

/** Section id for the archive image-comparison block. */
export const ARCHIVE_IMAGE_COMPARISON_SECTION_ID = 'archive-image-comparison-section';

/**
 * Section vars. Aspect ratio is exposed via `--ratio-percent` so it can be
 * overridden per-instance via inline style. Foreground is dark for the title on
 * the cream band; the drag handle uses its own white pill styles on the image.
 */

/** @deprecated Use {@link ARCHIVE_CREAM_BACKGROUND_HEX}. */
export const ARCHIVE_IMAGE_COMPARISON_BACKGROUND_HEX = ARCHIVE_CREAM_BACKGROUND_HEX;
/** @deprecated Use {@link ARCHIVE_CREAM_BACKGROUND_CHANNELS}. */
export const ARCHIVE_IMAGE_COMPARISON_DEFAULT_BACKGROUND = ARCHIVE_CREAM_BACKGROUND_CHANNELS;
/** @deprecated Use {@link ARCHIVE_CREAM_BACKGROUND_HSL}. */
export const ARCHIVE_IMAGE_COMPARISON_BACKGROUND_HSL = ARCHIVE_CREAM_BACKGROUND_HSL;

export const ARCHIVE_IMAGE_COMPARISON_VARS =
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{--section-padding-top:20px;--section-padding-bottom:52px;` +
  `--color-background:${ARCHIVE_IMAGE_COMPARISON_DEFAULT_BACKGROUND};` +
  `--color-foreground:49 47 47;--color-highlight:142 165 141;` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .highlighted-text[data-style=text]{font-weight:700;color:rgb(var(--color-highlight))}` +
  `--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--ratio-percent:40%}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} [data-dc-scroll-reveal]{overflow:hidden}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison{border-radius:1rem}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison__placeholder{` +
  `background:rgb(var(--color-foreground)/0.06);border:2px dashed rgb(var(--color-foreground)/0.15)}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison__placeholder-label{` +
  `color:rgb(var(--color-foreground)/0.45)}` +
  `@media (prefers-reduced-motion:no-preference){` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison.image-comparison--entrance .image-comparison__divider,` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison.image-comparison--entrance .image-comparison__handle{` +
  `transition:left 1.1s cubic-bezier(0.7,0,0.3,1)}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison.image-comparison--entrance picture[aria-hidden=true]{` +
  `transition:clip-path 1.1s cubic-bezier(0.7,0,0.3,1),-webkit-clip-path 1.1s cubic-bezier(0.7,0,0.3,1)}}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison__divider{width:2px;background:#fff}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison__handle{height:2.75rem;width:3.5rem;border-radius:9999px;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.12)}` +
  `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .image-comparison__grip span{height:1.25rem;width:1px;border-radius:1px;background:#9ca3af}` +
  `@media screen and (max-width:767px){#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{` +
  `--section-padding-top:16px;--section-padding-bottom:32px}}` +
  `@media screen and (max-width:767px){#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID} .title-wrapper.heading{` +
  `line-height:1.05;text-wrap:balance;letter-spacing:-0.02em}}`;
