/** Stable id for the global site footer bottom bar (matches site-footer pattern). */
export const SITE_FOOTER_BOTTOM_BAR_SECTION_ID =
  'shopify-section-template--26520397447459__site_footer_bottom_bar_global';

const R = 'var(--border-radius,1.5rem)';
const WHITE = '#ffffff';
const INLINE_PADDING = 'clamp(1rem,2vw,1.5rem)';

/** Fixed white bottom bar — square top (tucks under dark footer), rounded page bottom only. */
export const SITE_FOOTER_BOTTOM_BAR_CSS =
  `#${SITE_FOOTER_BOTTOM_BAR_SECTION_ID}{--border-radius:1.5rem}` +
  `.site-footer-reveal-bottom{background-color:${WHITE}!important}` +
  `.site-footer-bottom-bar__shell{background-color:${WHITE}!important}` +
  `#${SITE_FOOTER_BOTTOM_BAR_SECTION_ID} .site-footer-bottom-bar--rounded-bottom,` +
  `.site-footer-bottom-bar__shell .site-footer-bottom-bar--rounded-bottom{` +
  `position:relative;z-index:1;background-color:${WHITE}!important;` +
  `border-end-end-radius:${R}!important;border-end-start-radius:${R}!important;` +
  `border-bottom-right-radius:${R}!important;border-bottom-left-radius:${R}!important;` +
  `overflow:hidden!important}` +
  `.site-footer-bottom-bar__inner{width:100%!important;max-width:100%!important;` +
  `padding-inline:${INLINE_PADDING}!important}`;
