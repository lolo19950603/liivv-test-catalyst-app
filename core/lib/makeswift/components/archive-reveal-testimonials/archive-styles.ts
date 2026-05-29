/** Section id for the archive testimonials carousel. */
export const ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID = 'archive-reveal-testimonials-section';

/** Sage band matching archive `reveal_testimonials` sections. */
export const ARCHIVE_REVEAL_TESTIMONIALS_BACKGROUND = '142 165 141';

/**
 * Section vars + layout CSS from archive `reveal_testimonials` (see liivv-home-page.html).
 * Cards use theme `.reveal-testimonials` grid + staggered alignment, not a plain flex column.
 */
export const ARCHIVE_REVEAL_TESTIMONIALS_VARS =
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;` +
  `--color-background:${ARCHIVE_REVEAL_TESTIMONIALS_BACKGROUND};` +
  `--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;` +
  `--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;` +
  `--color-highlight:49 47 47;--color-button-background:245 242 237;` +
  `--color-button-border:245 242 237;--color-button-text:255 255 255}` +
  `@media screen and (max-width:767px){#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID}{` +
  `--section-padding-top:48px;--section-padding-bottom:48px}}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials blockquote{text-align:unset;padding-block:0;display:grid;gap:var(--sp-10)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials blockquote:before{content:none}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials blockquote p{font-size:clamp(var(--text-lg),1.053vw,var(--text-xl))}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials :is(figure,cite){margin-block:0}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial{padding:var(--sp-6);border-radius:var(--rounded-block);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial:nth-child(2n){justify-self:flex-start;background-color:color-mix(in srgb,rgb(var(--color-foreground)/0.25) 25%,rgb(var(--color-base-background)) 70%)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial:nth-child(odd){justify-self:flex-end;background-color:rgb(var(--color-base-background)/0.75)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial:is(:first-child,:last-child){justify-self:center}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .testimonials-title .split-words+.whitespace{width:0.2em}` +
  `@media screen and (min-width:768px){#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials{padding-block-start:clamp(var(--sp-8),2.526vw,var(--sp-12));width:calc(clamp(340px,30vw,480px)*2 - var(--sp-20))}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial{width:clamp(340px,30vw,480px)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .testimonials-title{position:sticky;inset-block-start:50%;transform:translateY(-50%)}` +
  `#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .testimonials-title .split-words~.split-words{transform:translateY(100%)}}` +
  `@media screen and (min-width:1024px){#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials .testimonial{padding-inline:var(--sp-8)}}`;
