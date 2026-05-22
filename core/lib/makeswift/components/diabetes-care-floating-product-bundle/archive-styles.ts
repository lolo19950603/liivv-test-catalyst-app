import { diabetesCareMinimalProductScrollbarCss } from '~/lib/makeswift/utils/diabetes-care-minimal-scrollbar';

/** Stable id aligned with `floating_product_bundle_mYaf43` in `diabetes-care.html`. */
export const FLOATING_PRODUCT_BUNDLE_SECTION_ID =
  'shopify-section-template--26520397447459__floating_product_bundle_mYaf43';

/** Scrollable product rows only (desktop-static keeps overflow visible, no bar). */
const BFB_PRODUCT_SCROLL_STRIP =
  '.bfb-product-strip--peek-carousel:not(.bfb-product-strip--desktop-static)';

export const FLOATING_PRODUCT_BUNDLE_VARS =
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:142 165 141;--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-highlight:142 165 141;--color-button-text:255 255 255;--color-overlay:23 23 23;--overlay-opacity:0.4;--bfb-desktop-height:550px}`;

/**
 * Single banner frame: image + overlay fill the frame; content sits on top.
 * Phone: aspect-ratio frame. Desktop: fixed height.
 */
export const FLOATING_PRODUCT_BUNDLE_BANNER_CSS =
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.bfb-has-banner-image,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.bfb-has-banner-image .section,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.bfb-has-banner-image .bfb-banner{background-color:transparent}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.bfb-has-banner-image{--color-background:0 0% 0 / 0}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner{position:relative;width:100%;overflow:hidden}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__media{position:absolute!important;inset:0!important;z-index:0;width:100%!important;height:100%!important;min-height:0!important;display:block!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__media .media,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__media picture{position:absolute!important;inset:0!important;width:100%!important;height:100%!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__media img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center center!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__overlay{position:absolute!important;inset:0!important;z-index:1;display:block!important;width:100%!important;height:100%!important;background:rgb(var(--color-overlay)/var(--overlay-opacity))}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image .banner__content{position:relative!important;z-index:2;width:100%!important;height:auto!important;overflow:visible!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image{display:flex;flex-direction:column;justify-content:center;min-height:min(100vw,420px);height:auto}` +
  `@media screen and (min-width:768px){#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner--has-image{min-height:var(--bfb-desktop-height);aspect-ratio:unset}}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}:not(.bfb-has-banner-image) .bfb-banner .banner__content{position:relative}`;

/** Promo on top, products below (all breakpoints). */
export const FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS =
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner__inner{display:flex;width:100%;min-width:0;flex-direction:column;align-items:center;justify-content:center;gap:var(--sp-6);padding:var(--sp-8) var(--sp-5);text-align:center}` +
  `@media screen and (min-width:768px){#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-banner__inner{gap:var(--sp-8);padding-block:clamp(2rem,4vw,3rem);padding-inline:0}}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-promo{flex:0 0 auto;min-width:0;max-width:100%;color:rgb(var(--color-foreground));width:100%}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-promo .banner__title,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-promo .rte{max-width:42rem;overflow-wrap:anywhere;margin-inline:auto}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-products-col{flex:1 1 auto;min-width:0;max-width:100%;width:100%;display:flex;flex-direction:column;gap:var(--sp-6);align-items:center;overflow:visible}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-carousel-host{display:flex;flex-direction:column;align-items:center;width:100%;max-width:100%}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}.bfb-has-banner-image .bfb-products-col .button.button--secondary{--color-button-background:255 255 255;--color-button-border:255 255 255;--color-button-text:49 47 47}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID}:not(.bfb-has-banner-image) .bfb-products-col .button.button--secondary{--color-button-background:49 47 47;--color-button-border:49 47 47;--color-button-text:255 255 255}`;

/**
 * Horizontal product strip (same model as featured collections peek carousel).
 */
export const FLOATING_PRODUCT_BUNDLE_PRODUCTS_CSS =
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--peek-carousel{--bfb-peek-card:min(72vw,17.5rem);display:flex!important;flex-flow:row nowrap!important;align-items:center!important;justify-content:flex-start!important;gap:clamp(0.75rem,2.5vw,1rem)!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:x mandatory;scroll-padding-inline-start:0;scroll-padding-inline-end:0.5rem;touch-action:pan-x pinch-zoom;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;width:100%!important;max-width:100%!important}` +
  diabetesCareMinimalProductScrollbarCss(FLOATING_PRODUCT_BUNDLE_SECTION_ID, BFB_PRODUCT_SCROLL_STRIP) +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--peek-carousel>.bfb-product-slide{flex:0 0 var(--bfb-peek-card)!important;width:var(--bfb-peek-card)!important;max-width:var(--bfb-peek-card)!important;min-width:0!important;scroll-snap-align:start!important;height:auto!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--single{justify-content:center}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--single>.bfb-product-slide{flex:0 0 var(--bfb-peek-card)!important;width:var(--bfb-peek-card)!important;max-width:var(--bfb-peek-card)!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .product-card{width:100%!important;max-width:100%!important;margin-inline:0!important;display:flex!important;flex-direction:column!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .product-card__media{width:100%!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card-media{width:100%!important;max-width:100%!important;aspect-ratio:1/1!important;margin-inline:0!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .product-card__content{width:100%!important;max-width:100%!important;background-color:rgb(var(--color-base-background))}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card.product-card--card{overflow:hidden!important;border-radius:var(--card-radius,1.25rem)!important;background-color:rgb(var(--color-base-background))}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card :is(.product-card__media,.media,.fc-product-card-media,.product-card__content){border-radius:0!important}` +
  /* Section foreground is white for promo; cards must use base text on cream panels. */
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card .product-card__content{color:rgb(var(--color-base-text))!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .fc-product-card :is(.product-card__title,.product-card__title a,.price,.price__regular,.caption){color:rgb(var(--color-base-text))!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-carousel-host .text-opacity{color:rgb(var(--color-foreground))!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide .product-card__title{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:1!important;overflow:hidden!important;text-overflow:ellipsis;word-break:break-word;max-width:100%}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-promo .banner__title,#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-promo .rte{text-shadow:0 1px 14px rgb(0 0 0/.45)}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-bundle-plus{flex:0 0 auto;align-self:center;color:rgb(var(--color-foreground));width:1.25rem;z-index:3}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-slide{position:relative!important}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-carousel-host--peek{position:relative}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-carousel-host--peek::after{content:\"\";position:absolute;top:0;bottom:0;inset-inline-end:0;width:clamp(1rem,8vw,2rem);z-index:5;pointer-events:none;background:linear-gradient(to left,rgb(var(--color-overlay)/0.55) 0%,transparent 100%)}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip{--bfb-peek-card:min(72vw,17.5rem)}` +
  `@media screen and (min-width:768px){#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip{--bfb-peek-card:260px}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--peek-carousel{gap:var(--sp-10)!important}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--desktop-static.bfb-product-strip--peek-carousel{overflow-x:visible!important;overflow-y:visible!important;scroll-snap-type:none!important;justify-content:center!important;scrollbar-width:none!important;padding-block-end:0!important}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--desktop-static.bfb-product-strip--peek-carousel::-webkit-scrollbar{display:none}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--desktop-static>.bfb-product-slide{flex:1 1 0!important;width:auto!important;min-width:0!important;max-width:calc((100% - 2 * var(--sp-10))/3)!important;scroll-snap-align:unset!important}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--desktop-static.bfb-product-strip--single>.bfb-product-slide{max-width:var(--bfb-peek-card,260px)!important;flex:0 0 var(--bfb-peek-card,260px)!important;width:var(--bfb-peek-card,260px)!important}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--desktop-static:has(>.bfb-product-slide:nth-child(2):last-child)>.bfb-product-slide{max-width:calc((100% - var(--sp-10))/2)!important}#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-carousel-host--peek:not(.bfb-product-carousel-host--scroll)::after{display:none}}` +
  `#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .bfb-product-strip--single{display:flex!important;flex-flow:row nowrap!important;width:100%!important;justify-content:center!important;overflow:visible!important}`;
