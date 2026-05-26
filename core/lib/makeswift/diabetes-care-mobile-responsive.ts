import { COLLECTION_LIST_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-collection-list/archive-styles';
import { FAQ_FIRST_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-faq-first/archive-styles';
import { FAQ_SECOND_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-faq-second/archive-styles';
import { FEATURED_COLLECTIONS_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-featured-collections/archive-styles';
import { FLOATING_PRODUCT_BUNDLE_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-floating-product-bundle/archive-styles';
import { IMAGE_TEXT_OVERLAY_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-image-text-overlay/archive-styles';
import { RICH_TEXT_LOWER_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-rich-text-lower/archive-styles';
import { MULTICOLUMN_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-multicolumn/client';
import { VIDEO_HERO_SECTION_ID } from '~/lib/makeswift/components/diabetes-care-video-hero/client';

const TIMELINE_SECTION_ID = 'shopify-section-template--26520397447459__timeline_nyTDKQ';

/** Phone + small tablet — matches archive `mobile:` utilities (767px). */
const MOBILE = '@media screen and (max-width: 767px)';

/** Through archive `slider--tablet` breakpoint (1023px). */
const MOBILE_TABLET = '@media screen and (max-width: 1023px)';

function mobileSectionPadding(sectionId: string, top = '48px', bottom = '48px'): string {
  return `${MOBILE}{#${sectionId}{--section-padding-top:${top};--section-padding-bottom:${bottom}}}`;
}

/**
 * Shared mobile layout for Specialized page sections.
 * - Stacks multi-column blocks vertically (no peek/carousel cut-off)
 * - Tunes intentional carousels (wider cards, safe padding, snap)
 * - Neutralizes archive slider negative margins that clip content
 */
export const DIABETES_CARE_MOBILE_RESPONSIVE_CSS = [
  '/*! specialized-page mobile v2 */',

  /* --- Global: avoid cut-off from overflow-x-hidden + slider bleed --- */
  `.dc-section-root{max-width:100%}`,
  `${MOBILE_TABLET}{.dc-section-root{overflow-x:clip;overflow-y:visible}}`,
  `@media screen and (min-width:1024px){.dc-section-root{overflow-x:clip;overflow-y:visible}}`,
  `${MOBILE_TABLET}{.dc-section-root .section--rounded,.dc-section-root .section{overflow:visible}}`,
  `${MOBILE_TABLET}{.dc-section-root .page-width{padding-inline:max(1rem,env(safe-area-inset-left,0px)) max(1rem,env(safe-area-inset-right,0px))}}`,

  /* Archive `mobile:media--auto` (missing from sections.css) */
  `${MOBILE}{.mobile\\:media--auto{height:auto}}`,
  `${MOBILE}{.mobile\\:media--auto .banner__media,.mobile\\:media--auto .media--height{position:relative;aspect-ratio:16/9;min-height:200px;height:auto}}`,
  `${MOBILE}{.mobile\\:media--auto .banner__media img,.mobile\\:media--auto .media--height img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}}`,

  /* Vertical stack: multicolumn, number counters, blog collage (no 36vw peek strip) */
  `${MOBILE_TABLET}{.dc-mobile-stack.slider--tablet,.dc-mobile-stack.slider,.dc-mobile-stack .slider--tablet,.dc-mobile-stack .slider,slider-element.dc-mobile-stack{overflow:visible!important;padding-inline:0!important;margin-inline:0!important;padding-block-end:0!important;scroll-snap-type:none!important}}`,
  `${MOBILE_TABLET}{.dc-mobile-stack .card-grid,.dc-mobile-stack.slider--tablet .card-grid,.dc-mobile-stack .blog-grid{--slider-item-width:100%!important;--slider-grid:unset!important;--card-grid-per-row:1!important;grid-template-columns:minmax(0,1fr)!important;grid-auto-flow:row!important;overflow:visible!important;display:grid!important;gap:clamp(1.5rem,4vw,2.5rem)!important;width:100%!important;max-width:100%!important}}`,
  `${MOBILE_TABLET}{.dc-mobile-stack .blog-collage>.article-card{grid-column:1/-1!important;flex-direction:column!important}}`,
  `${MOBILE_TABLET}{.diabetes-care-blog-posts-collage{width:100%!important;max-width:100%!important;margin:0!important}}`,
  `${MOBILE_TABLET}{.dc-mobile-stack .card-grid>*,.dc-mobile-stack .blog-grid>*{width:100%!important;max-width:100%!important;min-width:0!important;flex:none!important;scroll-snap-align:unset!important}}`,
  `${MOBILE_TABLET}{.dc-mobile-stack .multicolumn-card,.dc-mobile-stack .counter-card,.dc-mobile-stack .article-card{min-width:0}}`,

  /* Horizontal carousel: collection list, featured products, timeline, bundle products */
  `${MOBILE_TABLET}{.dc-mobile-carousel{display:flex!important;flex-flow:row nowrap!important;align-items:stretch!important;overflow-x:auto!important;overflow-y:visible!important;scroll-snap-type:x mandatory!important;scroll-behavior:smooth;scroll-padding-inline:max(1rem,env(safe-area-inset-left,0px));-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;-ms-overflow-style:none;gap:clamp(0.75rem,3vw,1.25rem)!important;padding-block-end:0.25rem}}`,
  `${MOBILE_TABLET}{.dc-mobile-carousel::-webkit-scrollbar{display:none;height:0;width:0}}`,
  `${MOBILE_TABLET}{.dc-mobile-carousel>*{flex:0 0 min(88vw,22rem)!important;width:min(88vw,22rem)!important;max-width:100%!important;min-width:0!important;scroll-snap-align:start!important}}`,
  `${MOBILE_TABLET}{.dc-mobile-carousel .product-card,.dc-mobile-carousel .media-card,.dc-mobile-carousel .card{height:auto}}`,
  /* Parent slider wrapper must not clip carousel or apply negative margins */
  `${MOBILE_TABLET}{.dc-carousel-host.slider--tablet,.slider--tablet.dc-carousel-host{overflow:visible!important;padding-inline:0!important;margin-inline:0!important;padding-block-end:0!important}}`,
  `${MOBILE_TABLET}{.dc-carousel-host .dc-mobile-carousel{--card-grid-template:unset!important;--slider-grid:unset!important}}`,

  /* 01 — Video hero */
  `${MOBILE}{#${VIDEO_HERO_SECTION_ID} .dc-video-hero-media{aspect-ratio:16/9!important}}`,
  `${MOBILE}{#${VIDEO_HERO_SECTION_ID} .video-hero [class*="p-"]{padding:1rem!important}}`,

  /* 02 — Custom band */
  mobileSectionPadding('shopify-section-template--26520397447459__custom_section_WpXaJg', '24px', '24px'),
  `${MOBILE}{#shopify-section-template--26520397447459__custom_section_WpXaJg .media-card__media{max-width:min(100%,280px)}}`,

  /* 03 — Number counters */
  mobileSectionPadding('shopify-section-template--26520397447459__number_counter_dTAx7w', '28px', '32px'),
  `${MOBILE_TABLET}{#shopify-section-template--26520397447459__number_counter_dTAx7w .page-width{overflow:visible}}`,

  /* 04 — Timeline */
  mobileSectionPadding(TIMELINE_SECTION_ID),
  `${MOBILE_TABLET}{#${TIMELINE_SECTION_ID} .timeline-react-strip .timeline__item{flex:0 0 min(92vw,24rem)!important}}`,
  `${MOBILE_TABLET}{#${TIMELINE_SECTION_ID} .slider--tablet{overflow:visible;padding-inline:0;margin-inline:0}}`,
  `${MOBILE_TABLET}{#${TIMELINE_SECTION_ID} .scroll-area{overflow:visible;scroll-snap-type:none}}`,
  `${MOBILE_TABLET}{#${TIMELINE_SECTION_ID} .timeline-dots-mobile{margin-block-start:var(--sp-6)}}`,
  `${MOBILE_TABLET}{#${TIMELINE_SECTION_ID} .timeline-react-strip{touch-action:pan-x pinch-zoom}}`,

  /* 05 — Multicolumn */
  mobileSectionPadding(MULTICOLUMN_SECTION_ID),
  `${MOBILE}{#${MULTICOLUMN_SECTION_ID} .multicolumn .media img{aspect-ratio:16/9!important;height:auto!important;object-fit:cover}}`,

  /* 06 — Reveal + story (scroll-driven headline; shorter runway than desktop 120vh) */
  `${MOBILE_TABLET}{[id^="dcrift-"] .splitting-banner .reveal-banner__scroller{position:sticky!important;top:0!important;height:100lvh!important;max-height:100dvh!important;overflow:hidden!important;padding-inline:0!important;margin-inline:0!important}}`,
  `${MOBILE_TABLET}{[id^="dcrift-"] .reveal-banner__tracker{inset-block-start:12%!important;height:72lvh!important}}`,
  `${MOBILE_TABLET}{[id^="dcrift-"] .reveal-banner .banner{height:100%!important;min-height:100%!important}}`,
  `${MOBILE}{[id^="dcrift-reveal"] .reveal-banner .banner__content{padding-block:2rem}}`,
  `${MOBILE}{[id^="dcrift-rich"]{--section-padding-top:48px;--section-padding-bottom:56px}}`,
  `${MOBILE}{[id^="dcrift-reveal"] .page-width--narrow,[id^="dcrift-rich"] .page-width--narrow{padding-inline:max(1rem,env(safe-area-inset-left,0px)) max(1rem,env(safe-area-inset-right,0px))}}`,
  `${MOBILE}{[id^="dcrift-"] [data-dc-scroll-reveal].section--padding{padding-block:var(--sp-8)}}`,
  `@media screen and (max-width:500px){[id^="dcrift-reveal"] .reveal-banner .banner__content .page-width{max-width:100%}}`,
  `@media screen and (max-width:500px){[id^="dcrift-reveal"] .reveal-banner .banner__box{max-width:100%;margin-inline:auto}}`,
  `@media screen and (max-width:500px){[id^="dcrift-reveal"] .reveal-banner .splitting-wrapper h2.title-xl{font-size:clamp(1.625rem,6.5vw,2rem)!important;line-height:1.05!important;letter-spacing:-0.02em;text-wrap:balance}}`,
  `${MOBILE_TABLET}{[id^="dcrift-reveal"] .dcrift-reveal-media>img{aspect-ratio:unset!important;object-fit:contain!important}}`,
  `${MOBILE_TABLET}{[id^="dcrift-reveal"] .dcrift-reveal-media.mobile\\:media--wide>img{aspect-ratio:unset!important}}`,

  /* 07 — Blog collage */
  `${MOBILE}{[id^="dccbpc-"]{--section-padding-top:48px;--section-padding-bottom:48px}}`,
  `${MOBILE_TABLET}{[id^="dccbpc-"] .slider .blog-collage.with-only3,[id^="dccbpc-"] .blog-collage.with-only3{--card-grid-per-row:1!important}}`,
  `${MOBILE_TABLET}{[id^="dccbpc-"] .blog-collage .article-card:nth-child(1){grid-column:1/-1!important}}`,
  `${MOBILE}{[id^="dccbpc-"] .blog-collage .article-card:not(:nth-child(1)) .article-card__image{aspect-ratio:16/9}}`,

  /* 08 — Logo list */
  mobileSectionPadding('shopify-section-template--26520397447459__logo_list_BznDid'),
  `${MOBILE}{#shopify-section-template--26520397447459__logo_list_BznDid{--section-grid-gap:40px}}`,
  `${MOBILE}{#shopify-section-template--26520397447459__logo_list_BznDid .dcll-marquee-slot img{max-height:min(var(--dcll-logo-max-h,48px),40px)!important}}`,

  /* 09 — Featured collections */
  mobileSectionPadding(FEATURED_COLLECTIONS_SECTION_ID),
  `${MOBILE_TABLET}{#${FEATURED_COLLECTIONS_SECTION_ID} .scroll-shadow{overflow:visible}}`,
  `${MOBILE_TABLET}{#${FEATURED_COLLECTIONS_SECTION_ID} .fc-tab-strip{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding-block-end:0.25rem}}`,
  `${MOBILE_TABLET}{#${FEATURED_COLLECTIONS_SECTION_ID} .fc-tab-strip::-webkit-scrollbar{display:none}}`,
  `${MOBILE}{#${FEATURED_COLLECTIONS_SECTION_ID} .fc-product-card .fc-product-card-media :is(img,svg,video-media){object-fit:cover!important;object-position:center!important}}`,

  /* 11 — Floating product bundle */
  `${MOBILE_TABLET}{#${FLOATING_PRODUCT_BUNDLE_SECTION_ID} .compact-product-bundle .product-grid.swipe-on-mobile.dc-mobile-carousel{display:unset!important}}`,

  /* 12 — Rich text lower */
  `${MOBILE}{#${RICH_TEXT_LOWER_SECTION_ID}{--section-padding-top:40px;--section-padding-bottom:40px}}`,
  `${MOBILE}{#${RICH_TEXT_LOWER_SECTION_ID} .button--lg{width:100%;max-width:100%;justify-content:center}}`,

  /* 13 — Collection list */
  mobileSectionPadding(COLLECTION_LIST_SECTION_ID),
  `${MOBILE_TABLET}{#${COLLECTION_LIST_SECTION_ID} .slider--tablet{overflow:visible;margin-inline:0;padding-inline:0}}`,

  /* 10–14 — FAQ */
  mobileSectionPadding(FAQ_FIRST_SECTION_ID),
  mobileSectionPadding(FAQ_SECOND_SECTION_ID),

  /* 15 — Image overlay (banner layout: component `IMAGE_TEXT_OVERLAY_BANNER_CSS`) */
  `${MOBILE}{#${IMAGE_TEXT_OVERLAY_SECTION_ID} .banner__box{padding-bottom:1.5rem}}`,

  /* 16 — Feature columns footer mobile padding lives in its own archive-styles (cascade-safe) */
].join('');
