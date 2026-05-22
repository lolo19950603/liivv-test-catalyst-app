import { diabetesCareMinimalProductScrollbarCss } from '~/lib/makeswift/utils/diabetes-care-minimal-scrollbar';

/** Stable id aligned with `collection_list_n3fDJ6` in `diabetes-care.html`. */
export const COLLECTION_LIST_SECTION_ID =
  'shopify-section-template--26520397447459__collection_list_n3fDJ6';

export const COLLECTION_LIST_VARS = `#${COLLECTION_LIST_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px}`;

/**
 * Archive scrolls `.slider--desktop`, not the inner `.card-grid`. Keep one horizontal scroller
 * and fixed card widths so prev/next arrows move the strip.
 */
export const COLLECTION_LIST_CAROUSEL_CSS =
  `@media screen and (min-width:1024px){` +
  `#${COLLECTION_LIST_SECTION_ID} .slider--desktop.dcl-collection-slider{overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}` +
  `#${COLLECTION_LIST_SECTION_ID} .slider--desktop.dcl-collection-slider .card-grid{--card-grid-per-row:unset!important;--card-grid-template:auto/auto-flow minmax(0,288px)!important;--slider-grid:var(--card-grid-template)!important;grid:var(--card-grid-template)!important;width:max-content;max-width:none;min-width:100%}` +
  `#${COLLECTION_LIST_SECTION_ID} .slider--desktop.dcl-collection-slider .card-grid>*{scroll-snap-align:start}` +
  diabetesCareMinimalProductScrollbarCss(
    COLLECTION_LIST_SECTION_ID,
    '.slider--desktop.dcl-collection-slider',
  ) +
  `}`;
