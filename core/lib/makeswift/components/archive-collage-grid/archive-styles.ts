/**
 * Stable id for the archive collage grid section. Hardcoded so multiple
 * instances on the same page would share scoped vars; in practice collage
 * grids are placed once per page so the duplicate-id risk is moot.
 */
export const ARCHIVE_COLLAGE_GRID_SECTION_ID = 'archive-collage-grid-section';

/**
 * Section vars + tokens. The collage uses a 12-column responsive grid with a
 * configurable row height (set via `--row-height`). Tokens mirror what the
 * source Shopify `collage_grid` section sets so the existing archive CSS
 * (`.collage`, `.collage__item`) picks them up unchanged.
 */
export const ARCHIVE_COLLAGE_GRID_VARS =
  `#${ARCHIVE_COLLAGE_GRID_SECTION_ID}{--section-padding-top:32px;--section-padding-bottom:32px;` +
  `--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--row-height:150px}` +
  `@media screen and (min-width:768px){#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage.with-grid{` +
  `grid-template-columns:repeat(12,minmax(0,1fr))}}`;

/** Bottom fade on image blocks — matches archive `collage_grid` Shopify section. */
export const ARCHIVE_COLLAGE_GRID_IMAGE_FADE_CSS =
  `#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage__item.with-image{--color-overlay:49 47 47;--overlay-opacity:1}` +
  `#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage .banner__overlay{position:absolute;inset:0;z-index:1;` +
  `pointer-events:none;width:100%;height:100%;` +
  `background:linear-gradient(180deg,rgb(var(--color-overlay)/0) 50%,rgb(var(--color-overlay)/var(--overlay-opacity)))}` +
  `#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage__item.group:hover .collage-item-title{` +
  `text-decoration-line:underline;text-decoration-color:var(--collage-primary-underline,currentColor);` +
  `text-underline-offset:4px}`;
