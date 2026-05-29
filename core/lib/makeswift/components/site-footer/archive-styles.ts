/**
 * Stable id for the global site footer component (matches featured-columns footer pattern).
 */
export const SITE_FOOTER_SECTION_ID =
  'shopify-section-template--26520397447459__site_footer_global';

const R = 'var(--border-radius,1.5rem)';
const INLINE_PADDING = 'clamp(1rem,2vw,1.5rem)';

export const SITE_FOOTER_VARS =
  `#${SITE_FOOTER_SECTION_ID}{--border-radius:1.5rem;--section-padding-top:0px;--section-padding-bottom:0px}`;

/** Full-width content with small side padding (matches archive page-width gutters). */
export const SITE_FOOTER_CONTENT_LAYOUT_CSS =
  `#${SITE_FOOTER_SECTION_ID} footer.site-footer-makeswift__panel>div{` +
  `width:100%!important;max-width:100%!important;` +
  `padding-inline:${INLINE_PADDING}!important}`;

/** Rounded bottom on the dark footer panel (same explicit radii pattern as featured-columns footer). */
export const SITE_FOOTER_ROUNDED_BOTTOM_CSS =
  `${SITE_FOOTER_VARS}` +
  `${SITE_FOOTER_CONTENT_LAYOUT_CSS}` +
  `#${SITE_FOOTER_SECTION_ID} footer.site-footer-makeswift__panel--rounded,` +
  `.js #${SITE_FOOTER_SECTION_ID} footer.site-footer-makeswift__panel--rounded,` +
  `.site-footer-makeswift footer.site-footer-makeswift__panel--rounded,` +
  `.js .site-footer-makeswift footer.site-footer-makeswift__panel--rounded{` +
  `position:relative;z-index:1;` +
  `background:var(--footer-background,rgb(49 47 48))!important;` +
  `border-end-end-radius:${R}!important;border-end-start-radius:${R}!important;` +
  `border-bottom-right-radius:${R}!important;border-bottom-left-radius:${R}!important;` +
  `overflow:hidden!important}`;
