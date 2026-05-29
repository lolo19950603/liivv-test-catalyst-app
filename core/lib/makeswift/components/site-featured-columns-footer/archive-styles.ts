/**
 * Stable id for the global "site featured columns footer" component. The
 * `shopify-section-template--*` prefix is kept so any archive CSS that scopes
 * itself to that template id continues to apply uniformly across the site.
 */
export const SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID =
  'shopify-section-template--26520397447459__site_featured_columns_footer_global';

/** Fallback when archive `diabetes-care-sections.css` tokens are unavailable (e.g. Makeswift). */
const FOOTER_ROUNDED_RADIUS = 'var(--border-radius,1.5rem)';

/**
 * Section vars + scoped color theme for the feature row. Carries the same
 * tokens that the archived `multicolumn-with-icons` footer used so icons +
 * typography render unchanged. Desktop padding is 60/28; mobile is overridden
 * inline below so rule order matches this component's own `<style>` block
 * (the global responsive sheet renders earlier in the DOM tree and would
 * otherwise lose the cascade).
 */
export const SITE_FEATURED_COLUMNS_FOOTER_VARS =
  `#${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID}{--section-padding-top:60px;--section-padding-bottom:28px;` +
  `--border-radius:1.5rem;` +
  `--color-background:245 242 237;--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--color-highlight:224 165 128;--color-button-background:255 255 255;--color-button-border:255 255 255;` +
  `--color-button-text:23 23 23}` +
  `@media screen and (max-width:767px){#${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID}` +
  `{--section-padding-top:40px;--section-padding-bottom:24px}}`;

/** Matches default site footer background (`#312f30`). */
export const SITE_FEATURED_COLUMNS_FOOTER_SHELL_CHANNELS = '49 47 48';

/**
 * Rounded cream panel over the dark footer shell. Uses archive `section--next-rounded`
 * plus explicit radii + `!important` so `.dc-section-root .section { overflow: visible }`
 * cannot erase corners after paint.
 */
export const SITE_FEATURED_COLUMNS_FOOTER_ROUNDED_BOTTOM_CSS =
  `.site-featured-columns-footer__shell{background-color:rgb(var(--site-footer-shell-bg,${SITE_FEATURED_COLUMNS_FOOTER_SHELL_CHANNELS}))}` +
  `#${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID} .site-featured-columns-footer__panel--rounded,` +
  `.js #${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID} .site-featured-columns-footer__panel--rounded{` +
  `position:relative;z-index:3;background-color:rgb(var(--color-background,245 242 237))!important;` +
  `border-end-end-radius:${FOOTER_ROUNDED_RADIUS}!important;` +
  `border-end-start-radius:${FOOTER_ROUNDED_RADIUS}!important;` +
  `border-bottom-right-radius:${FOOTER_ROUNDED_RADIUS}!important;` +
  `border-bottom-left-radius:${FOOTER_ROUNDED_RADIUS}!important;` +
  `overflow:hidden!important}` +
  `#${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID} .site-featured-columns-footer__panel--rounded:before,` +
  `.js #${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID} .site-featured-columns-footer__panel--rounded:before{` +
  `display:none!important}`;
