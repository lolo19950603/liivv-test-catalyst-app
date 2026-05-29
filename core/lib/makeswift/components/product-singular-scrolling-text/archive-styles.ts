export const PRODUCT_SINGULAR_SCROLLING_TEXT_SECTION_ID =
  'shopify-section-template--26374736773411__scrolling_text_GXJMrM';

export const PRODUCT_SINGULAR_SCROLLING_TEXT_VARS =
  `#${PRODUCT_SINGULAR_SCROLLING_TEXT_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:245 242 237;--color-highlight:142 165 141;--section-grid-gap:50px}`;

export function productSingularScrollingTextMarqueeCss(
  sectionDomId: string,
  durationSeconds: number,
): string {
  const root = `#${sectionDomId}`;

  return (
    `${root} .product-singular-scroll-marquee-track{display:flex;width:max-content;animation:product-singular-scroll-marquee ${String(durationSeconds)}s linear infinite}` +
    `${root} .product-singular-scroll-marquee-track:hover{animation-play-state:paused}` +
    `@keyframes product-singular-scroll-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}` +
    `@media (prefers-reduced-motion:reduce){${root} .product-singular-scroll-marquee-track{animation:none}}`
  );
}
