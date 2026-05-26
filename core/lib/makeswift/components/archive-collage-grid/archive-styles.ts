/**
 * Stable id for the archive collage grid section. Hardcoded so multiple
 * instances on the same page would share scoped vars; in practice collage
 * grids are placed once per page so the duplicate-id risk is moot.
 */
export const ARCHIVE_COLLAGE_GRID_SECTION_ID = 'archive-collage-grid-section';

/**
 * Section vars + tokens. The collage uses a 12-column responsive grid with a
 * configurable row height (set via `--row-height`) and per-block overlay
 * opacity (set via `--overlay-opacity` on each item). Tokens mirror what the
 * source Shopify `collage_grid` section sets so the existing archive CSS
 * (`.collage`, `.collage__item`, `.banner__overlay`) picks them up unchanged.
 */
export const ARCHIVE_COLLAGE_GRID_VARS =
  `#${ARCHIVE_COLLAGE_GRID_SECTION_ID}{--section-padding-top:32px;--section-padding-bottom:32px;` +
  `--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--color-overlay:49 47 47;--overlay-opacity:0.4;--row-height:150px}` +
  `@media screen and (min-width:768px){#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage.with-grid{` +
  `grid-template-columns:repeat(12,minmax(0,1fr))}}` +
  `@media screen and (pointer:fine){#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage__item.with-image:hover .banner__overlay{` +
  `opacity:var(--overlay-opacity-hover,0.1)}}`;
