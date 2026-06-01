import { scrollingTextMarqueeCss } from '~/lib/makeswift/utils/scrolling-text-marquee';

export const HEALTH_SCROLLING_TEXT_SECTION_ID =
  'shopify-section-template--26491503870243__scrolling_text_4nanNc';

export const HEALTH_SCROLLING_TEXT_TRACK_CLASS = 'health-scroll-marquee-track';

export const HEALTH_SCROLLING_TEXT_VARS =
  `#${HEALTH_SCROLLING_TEXT_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:255 255 255;--color-highlight:142 165 141;--section-grid-gap:50px}`;

export function healthScrollingTextMarqueeCss(sectionDomId: string, durationSeconds: number): string {
  return scrollingTextMarqueeCss(
    sectionDomId,
    durationSeconds,
    HEALTH_SCROLLING_TEXT_TRACK_CLASS,
    'health-scroll-marquee',
  );
}
