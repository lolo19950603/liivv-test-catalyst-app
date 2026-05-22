import { diabetesCareMinimalProductScrollbarCss } from '~/lib/makeswift/utils/diabetes-care-minimal-scrollbar';

/** Stable id aligned with `featured_collections_gQLnyz` in `diabetes-care.html`. */
export const FEATURED_COLLECTIONS_SECTION_ID =
  'shopify-section-template--26520397447459__featured_collections_gQLnyz';

const FC_PRODUCT_SCROLL_STRIP = '.fc-product-strip--scroll-row.fc-product-strip--peek-carousel';

/** Inline section vars from the SingleFile export `<style>` for this slice. */
export const FEATURED_COLLECTIONS_ARCHIVE_STYLE =
  `#${FEATURED_COLLECTIONS_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;--color-background:142 165 141}` +
  /* Archive `.tab-list .scroll-area { overflow-y: auto }` causes a vertical scrollbar on the tab strip. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .fc-tab-strip{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .fc-tab-strip::-webkit-scrollbar{display:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item{max-height:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-loader{display:none}` +
  /* Keep label above the circle fill; hover motion stays on `.btn-fill` via initShopifyButtonFillHover. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-text{position:relative;z-index:1}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-fill{z-index:0}` +
  /* Selected tab: archive used `disabled` so fill stayed hidden. Keep clickable in Makeswift but never show the white primary fill on hover. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true] .btn-fill{display:none !important}` +
  /* Primary tab uses dark `--color-button-background`; label must stay `--color-button-text` (not foreground). */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true],` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:hover,` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:focus-within{color:rgb(var(--color-button-text)) !important}` +
  `.js[data-button-hover=standard] #${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:hover:not([disabled],.self-button){color:rgb(var(--color-button-text)) !important;background-color:rgb(var(--color-button-background)) !important}` +
  /* Peek carousel: left-aligned first card, partial next card, right edge fade (all breakpoints). */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--scroll-row.fc-product-strip--peek-carousel{--fc-peek-card:min(72vw,17.5rem);display:flex!important;flex-flow:row nowrap!important;align-items:flex-start!important;gap:clamp(0.75rem,2.5vw,1rem)!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:x mandatory;scroll-padding-inline-start:max(1rem,env(safe-area-inset-left,0px));scroll-padding-inline-end:1rem;padding-inline-start:max(1rem,env(safe-area-inset-left,0px));padding-inline-end:1rem;touch-action:pan-x pinch-zoom;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}` +
  diabetesCareMinimalProductScrollbarCss(FEATURED_COLLECTIONS_SECTION_ID, FC_PRODUCT_SCROLL_STRIP) +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel>*{flex:0 0 var(--fc-peek-card)!important;width:var(--fc-peek-card)!important;max-width:var(--fc-peek-card)!important;min-width:0!important;scroll-snap-align:start!important;height:auto!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .fc-product-slide{display:flex!important;flex-direction:column!important;align-items:stretch!important;width:100%!important;height:auto!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .fc-product-card{width:100%!important;max-width:100%!important;margin-inline:0!important;height:auto!important;display:flex!important;flex-direction:column!important;align-items:stretch!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .fc-product-card .product-card__media{width:100%!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .fc-product-card-media{width:100%!important;max-width:100%!important;aspect-ratio:1/1!important;margin-inline:0!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .product-card__content{width:100%!important;max-width:100%!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host--peek{position:relative}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host--peek::before,#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host--peek::after{content:\"\";position:absolute;top:0;bottom:0;width:clamp(1.25rem,10vw,2.75rem);z-index:5;pointer-events:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host--peek::before{display:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host--peek::after{inset-inline-end:0;background:linear-gradient(to left,rgb(var(--color-background)) 0%,rgb(var(--color-background)/0.85) 35%,transparent 100%)}` +
  `@media screen and (max-width:1023px){#${FEATURED_COLLECTIONS_SECTION_ID} .fc-tab-strip{scroll-snap-type:x mandatory;scroll-padding-inline:0;gap:0;touch-action:pan-x pinch-zoom;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-tab-strip .tab__item{flex:0 0 100%;width:100%;max-width:100%;scroll-snap-align:center;justify-content:center}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--scroll-row:not(.fc-product-strip--peek-carousel){display:grid;overflow-y:visible}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--scroll-row:not(.fc-product-strip--peek-carousel)::-webkit-scrollbar{display:none;height:0;width:0}}` +
  /* Product row: horizontal scroll when needed; never clip card text vertically. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--scroll-row,#${FEATURED_COLLECTIONS_SECTION_ID} .slider--tablet .fc-product-strip--scroll-row{overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}` +
  /* Desktop: peek cards at fixed width; section clips horizontal overflow. */
  `@media screen and (min-width:1024px){#${FEATURED_COLLECTIONS_SECTION_ID}.featured-collections,#${FEATURED_COLLECTIONS_SECTION_ID} .section{overflow-x:clip;overflow-y:visible;max-width:100%}#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-carousel-host{overflow:visible}#${FEATURED_COLLECTIONS_SECTION_ID} .page-width,#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-panel{min-width:0;max-width:100%}#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-panel.slider--desktop{overflow:visible;margin-inline:0!important;padding-inline:0!important;padding-block-end:0.375rem}#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel{--fc-peek-card:288px;gap:1rem!important}}` +
  /* Product image: crop to fill square frame; card uses base theme surface (not section sage). */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card.product-card--card{overflow:hidden!important;border-radius:var(--card-radius,1.25rem)!important;background-color:rgb(var(--color-base-background))}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card :is(.product-card__media,.media,.fc-product-card-media,.product-card__content){border-radius:0!important}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card .product-card__content{background-color:rgb(var(--color-base-background))}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card .product-card__media{width:100%}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card .fc-product-card-media{position:relative;display:block;width:100%;aspect-ratio:1/1;overflow:hidden;background-color:rgb(var(--color-base-background))}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card .fc-product-card-media :is(img,svg,video-media){object-fit:cover!important;object-position:center center!important}` +
  `@media screen and (min-width:1024px){#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-strip--peek-carousel .fc-product-card-media{width:100%!important;max-width:100%!important;margin-inline:0!important}}` +
  /* Product name: single line with ellipsis when it overflows the card. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .product-card__content.text-center .product-card__details{min-width:0;width:100%}#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card-title{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:1!important;overflow:hidden!important;text-overflow:ellipsis;word-break:break-word;max-width:100%}`;
