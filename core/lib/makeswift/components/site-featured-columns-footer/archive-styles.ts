/**
 * Stable id for the global "site featured columns footer" component. The
 * `shopify-section-template--*` prefix is kept so any archive CSS that scopes
 * itself to that template id continues to apply uniformly across the site.
 */
export const SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID =
  'shopify-section-template--26520397447459__site_featured_columns_footer_global';

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
  `--color-background:255 255 255;--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--color-highlight:224 165 128;--color-button-background:255 255 255;--color-button-border:255 255 255;` +
  `--color-button-text:23 23 23}` +
  `@media screen and (max-width:767px){#${SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID}` +
  `{--section-padding-top:40px;--section-padding-bottom:24px}}`;
