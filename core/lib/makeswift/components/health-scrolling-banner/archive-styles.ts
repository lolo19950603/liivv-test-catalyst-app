export const HEALTH_SCROLLING_BANNER_SECTION_ID =
  'shopify-section-template--26491503870243__scrolling_banner_Ven7gC';

export const HEALTH_SCROLLING_BANNER_VARS =
  `#${HEALTH_SCROLLING_BANNER_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;--color-button-background:168 156 148;--color-button-border:168 156 148}`;

export function healthScrollingBannerLayoutCss(sectionDomId: string): string {
  const root = `#${sectionDomId}`;

  return (
    `${root} .health-scroll-banner-stack{position:relative}` +
    `${root} .health-scroll-banner-panel{min-height:min(85vh,720px);position:sticky;top:0;display:flex;align-items:center}` +
    `${root} .health-scroll-banner-panel .image-with-text__media{min-height:320px}` +
    `@media screen and (max-width:1023px){${root} .health-scroll-banner-panel{position:relative;min-height:auto;padding-block:3rem}}`
  );
}
