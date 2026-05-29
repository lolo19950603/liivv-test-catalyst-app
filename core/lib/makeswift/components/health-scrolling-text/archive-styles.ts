export const HEALTH_SCROLLING_TEXT_SECTION_ID =
  'shopify-section-template--26491503870243__scrolling_text_4nanNc';

export const HEALTH_SCROLLING_TEXT_VARS =
  `#${HEALTH_SCROLLING_TEXT_SECTION_ID}{--section-padding-top:0px;--section-padding-bottom:0px;--color-background:245 242 237;--color-highlight:142 165 141;--section-grid-gap:50px}`;

export function healthScrollingTextMarqueeCss(sectionDomId: string, durationSeconds: number): string {
  const root = `#${sectionDomId}`;

  return (
    `${root} .health-scroll-marquee-track{display:flex;width:max-content;animation:health-scroll-marquee ${String(durationSeconds)}s linear infinite}` +
    `${root} .health-scroll-marquee-track:hover{animation-play-state:paused}` +
    `@keyframes health-scroll-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}` +
    `@media (prefers-reduced-motion:reduce){${root} .health-scroll-marquee-track{animation:none}}`
  );
}
