export const HEALTH_HIGHLIGHT_TEXT_SECTION_ID =
  'shopify-section-template--26491503870243__highlight_text_rxEJiC';

const ROUNDED_RADIUS = 'var(--border-radius,1.5rem)';

/** Archive `highlight_text_rxEJiC` section variables + layout (pill row + inline highlights). */
export function healthHighlightTextSectionCss(sectionId: string): string {
  return (
    `#${sectionId}{--section-padding-top:32px;--section-padding-bottom:32px;--border-radius:1.5rem;--color-background:245 242 237;--color-highlight:142 165 141}` +
    `#${sectionId} .section{background-color:rgb(var(--color-background,245 242 237))}` +
    `#${sectionId} .section.section--rounded{overflow:hidden!important;background-color:rgb(var(--color-background,245 242 237))!important;border-start-end-radius:${ROUNDED_RADIUS}!important;border-start-start-radius:${ROUNDED_RADIUS}!important}` +
    `#${sectionId} .health-highlight-pill-row{display:flex;flex-wrap:nowrap;align-items:center;justify-content:center;gap:var(--sp-2,0.5rem);width:100%;max-width:100%;margin-inline:auto}` +
    `#${sectionId} .health-highlight-pill-row .media{flex:0 0 auto;margin-inline:0;border-radius:var(--rounded-full,9999px);overflow:hidden;transform:none;box-sizing:border-box;width:min(200px,calc((100% - 4 * var(--sp-2,0.5rem))/5));height:auto;aspect-ratio:200/90;max-height:90px}` +
    `#${sectionId} .highlighted-text[data-style=text]{font-weight:inherit;color:rgb(var(--color-highlight))}` +
    `#${sectionId} .highlighted-text[data-style=text] strong{font-weight:inherit}` +
    `#${sectionId} .health-highlight-pill-row .media img{width:100%;height:100%;object-fit:cover;display:block}` +
    `@media screen and (max-width:767px){#${sectionId} .health-highlight-pill-row .media{width:min(90px,calc((100% - 4 * var(--sp-2,0.5rem))/5));max-height:50px;aspect-ratio:90/50}}` +
    `@media screen and (max-width:767px){#${sectionId}{--section-padding-top:24px;--section-padding-bottom:24px}}`
  );
}

export const HEALTH_HIGHLIGHT_TEXT_VARS = healthHighlightTextSectionCss(
  HEALTH_HIGHLIGHT_TEXT_SECTION_ID,
);
