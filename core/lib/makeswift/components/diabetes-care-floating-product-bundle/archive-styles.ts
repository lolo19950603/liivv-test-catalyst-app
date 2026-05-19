/** Stable id aligned with `floating_product_bundle_mYaf43` in `diabetes-care.html`. */
export const FLOATING_PRODUCT_BUNDLE_SECTION_ID =
  'shopify-section-template--26520397447459__floating_product_bundle_mYaf43';

export const FLOATING_PRODUCT_BUNDLE_VARS = `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:142 165 141;--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-highlight:142 165 141;--color-button-text:255 255 255;--color-overlay:23 23 23;--overlay-opacity:0.4}`;

/**
 * Layout overrides from archived floating bundle.
 * `position: static` on banner content is mobile/tablet only (max-width 1023px).
 */
export const FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS = `@media screen and (max-width:1023px){#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.compact-product-bundle-section .banner{height:unset}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.compact-product-bundle-section .banner .banner__content{position:static;overflow:visible}}@media screen and (min-width:1024px){#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .banner .compact-product-bundle-wrapper{grid-template-columns:minmax(0,.45fr) minmax(0,1fr)}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .banner .compact-product-bundle-wrapper .product-card--promo{background-color:transparent}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .banner .compact-product-bundle-wrapper .product-card--promo .product-card__content{padding:0}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .banner .compact-product-bundle-wrapper .compact-product-bundle{width:fit-content;max-width:100%;margin-inline:auto;justify-self:center}}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .banner .compact-product-bundle .product-grid{width:auto;max-width:100%;justify-content:center;margin-inline:auto}`;
