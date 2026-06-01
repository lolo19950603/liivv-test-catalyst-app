import { scrollingTextMarqueeCss } from '~/lib/makeswift/utils/scrolling-text-marquee';

export const PRODUCT_SINGULAR_SCROLLING_TEXT_SECTION_ID =
  'shopify-section-template--26374736773411__scrolling_text_GXJMrM';

export const PRODUCT_SINGULAR_SCROLLING_TEXT_TRACK_CLASS = 'product-singular-scroll-marquee-track';

export const PRODUCT_SINGULAR_SCROLLING_TEXT_VARS =
  `#${PRODUCT_SINGULAR_SCROLLING_TEXT_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:245 242 237;--color-highlight:142 165 141;--section-grid-gap:50px}`;

export function productSingularScrollingTextMarqueeCss(
  sectionDomId: string,
  durationSeconds: number,
): string {
  return scrollingTextMarqueeCss(
    sectionDomId,
    durationSeconds,
    PRODUCT_SINGULAR_SCROLLING_TEXT_TRACK_CLASS,
    'product-singular-scroll-marquee',
  );
}
