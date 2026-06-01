import { SCROLL_BANNER_TOP_GAP_PX } from './scroll-banner-motion';
export const HEALTH_SCROLLING_BANNER_SECTION_ID =
  'shopify-section-template--26491503870243__scrolling_banner_Ven7gC';

/** ~650px per panel in archive `--scrolling-height`. */
export const HEALTH_SCROLLING_BANNER_SEGMENT_PX = 650;

export function healthScrollingBannerSectionVars(sectionDomId: string): string {
  return `#${sectionDomId}{--section-padding-top:72px;--section-padding-bottom:72px;--color-button-background:168 156 148;--color-button-border:168 156 148;--color-button-text:255 255 255;--scroll-banner-top-gap:${String(SCROLL_BANNER_TOP_GAP_PX)}px;--scroll-banner-grid-gap:clamp(40px,5vw,60px)}`;
}

export function healthScrollingBannerLayoutCss(sectionDomId: string): string {
  const root = `#${sectionDomId}`;

  return (
    `@keyframes health-scroll-banner-content-in{from{opacity:0;transform:translate3d(0,1.25rem,0)}to{opacity:1;transform:translate3d(0,0,0)}}` +
    `${root} .scrolling-banner{position:relative}` +
    `${root} .scrolling-banner__track{min-height:var(--scrolling-height,3200px)}` +
    `${root} .with-scrolling{align-items:stretch;padding-block-start:var(--scroll-banner-top-gap,40px);position:sticky;top:var(--scroll-banner-inset,160px);z-index:1}` +
    `${root} .with-scrolling>.image-with-text__item{flex:1 1 50%;max-width:50%;width:50%}` +
    `${root} .with-scrolling>.image-with-text__item:first-child{flex:0 0 50%;max-width:50%}` +
    `${root} .with-scrolling .image-with-text__media{height:100%}` +
    `${root} .with-scrolling .image-with-text__image{border-radius:var(--rounded-block,1rem);overflow:hidden;position:relative}` +
    `${root} .with-scrolling .image-with-text__image .media img{display:block;width:100%;height:100%;object-fit:cover}` +
    `${root} .with-scrolling .image-with-text__image-layer{will-change:clip-path}` +
    `${root} .with-scrolling .image-with-text__content-col{position:relative;min-height:inherit}` +
    `${root} .with-scrolling .image-with-text__content-col .rich-text{padding-inline-start:var(--scroll-banner-grid-gap,clamp(40px,5vw,60px))}` +
    `${root} .with-scrolling .image-with-text__content-layer{opacity:0;visibility:hidden;pointer-events:none}` +
    `${root} .with-scrolling .image-with-text__content-layer--revealed{opacity:1;visibility:visible}` +
    `${root} .with-scrolling .health-scroll-banner-content-enter{width:100%}` +
    `${root} .with-scrolling .health-scroll-banner-content-enter--animate{animation:health-scroll-banner-content-in .35s cubic-bezier(.3,1,.3,1) both}` +
    `${root} .with-scrolling .rich-text>*+*:not(.spacing-section){margin-block-start:var(--sp-6,1.5rem)}` +
    `${root} .with-scrolling .rich-text .button{margin-block-start:var(--sp-6,1.5rem)}` +
    `@media screen and (min-width:1024px){${root} .with-scrolling .image-with-text__image{height:650px;max-height:min(650px,calc(100vh - var(--scroll-banner-inset,160px) - var(--scroll-banner-top-gap,40px)))}${root} .with-scrolling .image-with-text__content-col{min-height:650px;max-height:min(650px,calc(100vh - var(--scroll-banner-inset,160px) - var(--scroll-banner-top-gap,40px)))}}` +
    `@media screen and (min-width:1536px){${root} .with-scrolling .image-with-text__content-col .rich-text{padding-inline-start:15%}}` +
    `@media screen and (max-width:1023px){${root} .health-scroll-banner-mobile .image-with-text__image{aspect-ratio:16/10}${root} .health-scroll-banner-mobile .image-with-text__image .media img{height:100%}}` +
    `@media (prefers-reduced-motion:reduce){${root} .with-scrolling .image-with-text__image-layer{will-change:auto}${root} .with-scrolling .health-scroll-banner-content-enter--animate{animation:none}}`
  );
}
