export const HEALTH_IMAGES_WITH_TEXT_SECTION_ID =
  'shopify-section-template--26491503870243__images_with_text_dnY6gg';

/** Archive taupe band (`#a99c94`). */
export const HEALTH_IMAGES_WITH_TEXT_BACKGROUND_CHANNELS = '169 156 148';
export const HEALTH_IMAGES_WITH_TEXT_BACKGROUND_HSL = '23 11% 62%';

const SECTION_VARS =
  `--section-padding-top:72px;--section-padding-bottom:72px;--color-background:${HEALTH_IMAGES_WITH_TEXT_BACKGROUND_CHANNELS};--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-highlight:255 255 255;--color-button-background:255 255 255;--color-button-border:255 255 255;--color-button-text:49 47 47`;

/** Archive `images_with_text_dnY6gg` layout (overlapping square images + rich text spacing). */
export function healthImagesWithTextSectionCss(sectionId: string): string {
  const root = `#${sectionId}`;

  return (
    `${root}{${SECTION_VARS}}` +
    `${root} .image-with-text .rich-text>*+*:not(.spacing-section){margin-block-start:var(--sp-7d5,1.875rem)}` +
    `${root} .image-with-text .rich-text>.banner__subheading+.heading{margin-block-start:var(--sp-6,1.5rem)}` +
    `${root} .image-with-text__media.with-2nd-image{padding-inline:var(--page-padding,1.25rem)}` +
    `${root} .image-with-text__item .media:not(.media--rounded){border-radius:var(--rounded-block,1rem)}` +
    `${root} .image-with-text__media .media img{display:block;width:100%;height:auto;object-fit:cover}` +
    `${root} .image-with-text__media .media.media--square img{aspect-ratio:1/1}` +
    `${root} .image-with-text__image-second{inset-block-start:50%;width:35%;transform:translateY(-50%)}` +
    `${root} .image-with-text__image-second .media{transform:rotate(calc(-4deg*var(--transform-logical,1)))}` +
    `${root} .image-with-text__image-second+.image-with-text__image-first{transform:rotate(calc(3deg*var(--transform-logical,1)));width:75%;margin-inline-start:auto}` +
    `${root} .image-with-text__media:not(.with-2nd-image) .image-with-text__image-first{width:100%}` +
    `${root} .image-with-text__item.image-with-text__media-col{flex:0 0 50%;width:50%;max-width:50%}` +
    `${root} .image-with-text__item.image-with-text__content-col{flex:0 0 50%;width:50%;max-width:50%}` +
    `${root} .image-with-text--no-media{justify-content:center}` +
    `${root} .image-with-text--no-media .image-with-text__content-col{flex:0 0 100%;width:100%;max-width:42rem;margin-inline:auto}` +
    `@media screen and (max-width:1023px){${root} .image-with-text__item .rich-text{padding-block-start:var(--sp-10,2.5rem)}${root} .image-with-text--no-media .image-with-text__item .rich-text{padding-block-start:0}${root} .image-with-text__item.image-with-text__media-col{width:100%;max-width:100%;margin-inline:auto}${root} .image-with-text__item.image-with-text__content-col{width:100%;max-width:100%;flex-basis:100%}}` +
    `@media screen and (min-width:1024px){${root} .image-with-text{flex-direction:row;gap:0}${root} .image-with-text.image-with-text--reverse{flex-direction:row-reverse}${root} .image-with-text .rich-text>*+*:not(.spacing-section){margin-block-start:var(--sp-10,2.5rem)}${root} .image-with-text__item+.image-with-text__item .rich-text{padding-inline-start:var(--grid-gap,3rem)}${root} .image-with-text.image-with-text--reverse .image-with-text__item+.image-with-text__item .rich-text{padding-inline-start:0;padding-inline-end:var(--grid-gap,3rem)}${root} .image-with-text__media.with-2nd-image{padding-inline:calc(var(--grid-gap,3rem)/2)}${root} .image-with-text__image-second{width:40%}}`
  );
}

/** @deprecated Use {@link healthImagesWithTextSectionCss}. */
export const HEALTH_IMAGES_WITH_TEXT_VARS = healthImagesWithTextSectionCss(
  HEALTH_IMAGES_WITH_TEXT_SECTION_ID,
);
