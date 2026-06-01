/** Matches archive `scrolling_text_4nanNc`: logo, five labels, logo, five labels, … */
export const SCROLLING_TEXT_LOGO_INTERVAL = 5;

export type ScrollingTextMarqueeItem = {
  kind?: 'text' | 'image';
  text?: string;
  image?: unknown;
  imageAlt?: string;
};

/** Inserts the repeating logo at the start and after every {@link SCROLLING_TEXT_LOGO_INTERVAL} labels. */
export function buildScrollingTextMarqueeSequence<T extends ScrollingTextMarqueeItem>(
  items: T[],
  iconImage: unknown,
  iconSrc: string,
  iconAlt: string,
): T[] {
  const textItems = items.filter(
    (item) => item.kind !== 'image' && (item.text?.trim().length ?? 0) > 0,
  );

  if (textItems.length === 0) {
    return [];
  }

  const sequence: T[] = [];
  const logoItem = {
    kind: 'image' as const,
    image: iconImage,
    imageAlt: iconAlt,
  };

  if (iconSrc.length > 0) {
    sequence.push(logoItem as T);
  }

  textItems.forEach((item, index) => {
    sequence.push(item);

    const isGroupEnd = (index + 1) % SCROLLING_TEXT_LOGO_INTERVAL === 0;
    const hasMoreLabels = index + 1 < textItems.length;

    if (iconSrc.length > 0 && isGroupEnd && hasMoreLabels) {
      sequence.push(logoItem as T);
    }
  });

  return sequence;
}

/** Archive scrolling-text layout + marquee track animation (health page `scrolling_text_4nanNc`). */
export function scrollingTextMarqueeCss(
  sectionDomId: string,
  durationSeconds: number,
  trackClass: string,
  keyframesName: string,
): string {
  const root = `#${sectionDomId}`;

  return (
    `${root}{--duration:${String(durationSeconds)}s}` +
    `.scrolling-text-section{overflow:hidden}` +
    `@supports (overflow:clip){.scrolling-text-section{overflow-x:clip;overflow-y:visible}}` +
    `${root} .scrolling-text{--grid-gap:calc(var(--section-grid-gap)/2);display:flex;align-items:center;overflow:hidden}` +
    `${root} .scrolling-text .marquee{padding-inline:calc(var(--grid-gap)/2);display:flex;align-items:center;flex-shrink:0;white-space:nowrap;gap:var(--grid-gap);width:max-content}` +
    `${root} .scrolling-text__item{display:flex;align-items:center;flex-shrink:0;gap:var(--grid-gap)}` +
    `${root} .scrolling-text__item.with-text+.scrolling-text__item.with-text:before{content:"";display:block;width:var(--sp-5,1.25rem);height:var(--sp-5,1.25rem);border:1px solid currentColor;border-radius:var(--rounded-full,9999px);flex-shrink:0}` +
    `${root} .scrolling-text__item.with-text{font-size:max(12px,calc(var(--font-size,12px)*.6))}` +
    `${root} .scrolling-text__item.with-text p{margin:0}` +
    `${root} .scrolling-text__item.with-media>:is(img,svg){max-width:100%;width:auto;height:calc(var(--image-height)*.75)}` +
    `@media screen and (min-width:1024px){${root} .scrolling-text{--grid-gap:var(--section-grid-gap)}${root} .scrolling-text__item.with-text{font-size:calc(var(--font-size,12px)*.75)}${root} .scrolling-text__item.with-media>:is(img,svg){height:var(--image-height)}}` +
    `@media screen and (min-width:1280px){${root} .scrolling-text__item.with-text{font-size:var(--font-size,12px)}}` +
    `${root} .${trackClass}{display:flex;width:max-content;animation:${keyframesName} var(--duration) linear infinite}` +
    `@media screen and (pointer:fine){${root} .scrolling-text:hover .${trackClass}{animation-play-state:paused}}` +
    `@keyframes ${keyframesName}{from{transform:translateX(0)}to{transform:translateX(-50%)}}` +
    `@keyframes ${keyframesName}-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}` +
    `${root} .scrolling-text--right .${trackClass}{animation-name:${keyframesName}-right}` +
    `@media (prefers-reduced-motion:reduce){${root} .${trackClass}{animation:none}}` +
    `${root} .scrolling-text--no-icon{padding-block:clamp(0.75rem,2.5vw,1.25rem)}` +
    `${root} .scrolling-text--no-icon .marquee{padding-inline:var(--grid-gap)}`
  );
}
