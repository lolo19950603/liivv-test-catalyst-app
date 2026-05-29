'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ArchiveHighlightedText } from '~/lib/makeswift/components/diabetes-care-faq/archive-highlighted-text';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import {
  resolveAccentColors,
  resolvePlainTextColor,
} from '~/lib/makeswift/utils/heading-accent-color';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';

export const DIABETES_CARE_TIMELINE_SECTION_ID =
  'shopify-section-template--26520397447459__timeline_nyTDKQ';
export const DIABETES_CARE_TIMELINE_resolvedSliderId = 'Slider-template--26520397447459__timeline_nyTDKQ';

/**
 * Section-scoped CSS: export vars, desktop two-column grid for each slide, horizontal strip with
 * scroll-snap (center). Snap uses `scroll-behavior: auto` so corrections are instant — `smooth` on
 * the scroller fights mandatory snap + trackpad deltas and reads as a laggy “snap back then forward”.
 * @param {number} blockCount - `--section-blocks-count` for `.timeline-dots`.
 * @returns {string} Inline `<style>` payload.
 */
function timelineSectionCss(sectionDomId: string, blockCount: number): string {
  const id = `#${sectionDomId}`;
  /** Instant snap; arrows/dots still use `scrollIntoView({ behavior: 'smooth' })`. */
  const strip = `${id} .timeline-react-strip{display:flex;flex-flow:row nowrap;gap:clamp(16px,2.5vw,40px);overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-behavior:auto;-webkit-overflow-scrolling:touch;padding-block:var(--sp-2,8px);scrollbar-width:none;-ms-overflow-style:none}`;
  const stripScrollbar = `${id} .timeline-react-strip::-webkit-scrollbar{display:none;width:0;height:0}`;

  const mobileDots = `@media screen and (max-width:1023px){${id} .timeline-dots--desktop{display:none}${id} .timeline-dots-mobile{display:block}${id} .scroll-area{overflow:visible;scroll-snap-type:none}${id} .scroll-area .scroll-area__inner{overflow:visible}${id} .slider.slider--tablet{overflow:visible;padding-inline:0;margin-inline:0;padding-block-end:0;scroll-snap-type:none}${id} .timeline-react-strip{overflow-x:auto!important;overflow-y:hidden;touch-action:pan-x pinch-zoom;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;scroll-padding-inline:1rem;overscroll-behavior-x:contain}}`;

  return `${id}{--section-padding-top:72px;--section-padding-bottom:72px;--section-blocks-count:${String(blockCount)}}@media screen and (min-width:768px){${id} .timeline__item>.timeline-slide-layout.flex{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}${strip}${stripScrollbar}${id} .timeline-react-strip .timeline__item{flex:0 0 min(92%,1120px);max-width:100%;width:auto;scroll-snap-align:center;transition:opacity .28s ease}${id} .timeline-react-strip .timeline__item:not(.selected){opacity:.48}${id} .timeline-react-strip .timeline__item.selected{opacity:1}@media (prefers-reduced-motion:reduce){${id} .timeline-react-strip .timeline__item{transition:none}}${mobileDots}`;
}

function timelineStepLabel(section: DiabetesCareTimelineSection, index: number): string {
  const category = timelineCategoryLabel(section);

  if (category.length > 0) {
    return category;
  }

  const heading = section.slideContent?.sectionHeading?.text?.trim() ?? '';

  if (heading.length > 0) {
    return heading;
  }

  return `Step ${index + 1}`;
}

export type TimelineTypographyProps = {
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type TimelineTextBlockProps = TimelineTypographyProps & {
  text?: string;
};

export type TimelineSectionHeadingProps = TimelineTypographyProps &
  HeadingAccentColorProps & {
    text?: string;
  };

export type TimelineSectionBodyProps = TimelineTypographyProps & {
  html?: string;
};

export interface DiabetesCareTimelineSlideContent {
  categoryLabel?: TimelineTextBlockProps;
  sectionHeading?: TimelineSectionHeadingProps;
  sectionBody?: TimelineSectionBodyProps;
}

export interface DiabetesCareTimelineSection {
  slideContent?: DiabetesCareTimelineSlideContent;
  button?: ButtonColorProps & {
    buttonText?: string;
    buttonLink?: { href?: string; target?: string };
  };
  image?: {
    imageSrc?: string;
    imageAlt?: string;
  };
}

function timelineTypographyStyle(
  typography?: TimelineTypographyProps | null,
): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: typography?.textColor,
    textColorHex: typography?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(typography?.fontSize, typography?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function timelineCategoryLabel(section: DiabetesCareTimelineSection): string {
  return section.slideContent?.categoryLabel?.text?.trim() ?? '';
}

/** Per-slide heading: font size + optional custom swash via `--color-highlight`. */
function timelineSectionHeadingStyle(
  heading?: TimelineSectionHeadingProps | null,
): CSSProperties | undefined {
  const typography = timelineTypographyStyle(heading);
  const { highlightChannels } = resolveAccentColors(heading);

  if (typography == null && highlightChannels == null) {
    return undefined;
  }

  return {
    ...typography,
    ...(highlightChannels != null ? { '--color-highlight': highlightChannels } : {}),
  };
}

export type DiabetesCareTimelineProps = {
  className?: string;
  /** Override Shopify section id when multiple timelines share a page. */
  sectionDomId?: string;
  /** Override slider `id` / `aria-controls` target. Defaults from section id when omitted. */
  sliderDomId?: string;
  background?: SectionBackgroundProps;
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
  sections?: DiabetesCareTimelineSection[];
  roundedTop?: boolean;
};

function IconChevronLeft() {
  return (
    <svg
      className="icon icon-chevron-left icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 6L8 12L14 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      className="icon icon-chevron-right icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 6L16 12L10 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H18M18 10L12.1667 4.16675M18 10L12.1667 15.8334"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface TimelineSlideProps {
  section: DiabetesCareTimelineSection;
  index: number;
  isSelected: boolean;
  setSlideEl: (el: HTMLDivElement | null, i: number) => void;
}

function TimelineSlide({ section, index, isSelected, setSlideEl }: TimelineSlideProps) {
  const content = section.slideContent;
  const categoryLabel = content?.categoryLabel?.text?.trim() ?? '';
  const sectionHeadingBlock = content?.sectionHeading;
  const sectionHeading = sectionHeadingBlock?.text?.trim() ?? '';
  const sectionHeadingAccent = resolveAccentColors(sectionHeadingBlock);
  const sectionBodyHtml = content?.sectionBody?.html?.trim() ?? '';
  const buttonHref = section.button?.buttonLink?.href ?? '#';
  const buttonLabel = section.button?.buttonText?.trim() || 'Get Started';

  return (
    <div
      className={clsx('timeline__item card relative', isSelected && 'selected')}
      ref={(el) => {
        setSlideEl(el, index);
      }}
    >
      <div className="timeline-slide-layout md:grid-row-reverse flex flex-col overflow-hidden">
        <picture className="media media--portrait mobile:media--wide relative block overflow-hidden">
          {section.image?.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- Makeswift image URL
            <img
              alt={section.image.imageAlt ?? ''}
              loading={index === 0 ? 'eager' : 'lazy'}
              src={section.image.imageSrc}
            />
          ) : null}
        </picture>

        <div className="timeline__item-content flex flex-col gap-4">
          {categoryLabel.length > 0 ? (
            <p
              className="text-opacity text-base font-bold tracking-tight lg:text-lg"
              style={timelineTypographyStyle(content?.categoryLabel)}
            >
              {categoryLabel}
            </p>
          ) : null}

          {sectionHeading.length > 0 ? (
            <h2
              className="heading text-2xl leading-none tracking-tight lg:text-3xl"
              style={timelineSectionHeadingStyle(sectionHeadingBlock)}
            >
              <ArchiveHighlightedText
                color={resolvePlainTextColor(sectionHeadingBlock)}
                highlightStyle={sectionHeadingAccent.highlightStyle}
              >
                {sectionHeading}
              </ArchiveHighlightedText>
            </h2>
          ) : null}

          {sectionBodyHtml.length > 0 ? (
            <div
              className="rte text-opacity text-base lg:text-lg"
              dangerouslySetInnerHTML={{ __html: sectionBodyHtml }}
              style={timelineTypographyStyle(content?.sectionBody)}
            />
          ) : null}

          <p>
            <ArchiveShopifyButton
              className="button--primary button--md icon-with-text"
              colors={section.button}
              href={buttonHref}
              rel={
                section.button?.buttonLink?.target === '_blank' ? 'noopener noreferrer' : undefined
              }
              target={section.button?.buttonLink?.target}
            >
              {buttonLabel}
              <IconArrowRight />
            </ArchiveShopifyButton>
          </p>
        </div>
      </div>
    </div>
  );
}

export function DiabetesCareTimeline({
  className,
  sectionDomId,
  sliderDomId,
  background,
  primaryHeading,
  secondaryHeading,
  sections,
  roundedTop = true,
}: DiabetesCareTimelineProps) {
  const resolvedSectionId =
    sectionDomId?.trim().length ? sectionDomId.trim() : DIABETES_CARE_TIMELINE_SECTION_ID;
  const resolvedSliderId =
    sliderDomId?.trim().length
      ? sliderDomId.trim()
      : resolvedSectionId.replace(/^shopify-section-/, 'Slider-');
  const primaryResolved = resolveHeadingTypography(primaryHeading);
  const secondaryResolved = resolveHeadingTypography(secondaryHeading);
  const list = useMemo(() => sections ?? [], [sections]);
  const count = list.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const safeIndex = Math.min(activeIndex, Math.max(0, count - 1));

  const setSlideEl = useCallback((el: HTMLDivElement | null, i: number) => {
    slideRefs.current[i] = el;
  }, []);

  const resolveIndexFromScroll = useCallback(() => {
    const strip = scrollRef.current;

    if (!strip || count === 0) {
      return;
    }

    const center = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i += 1) {
      const slide = slideRefs.current[i];

      if (slide) {
        const mid = slide.offsetLeft + slide.offsetWidth / 2;
        const d = Math.abs(center - mid);

        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
    }

    setActiveIndex(best);
  }, [count]);

  useEffect(() => {
    setActiveIndex((i) => {
      if (count <= 0) {
        return 0;
      }

      return Math.min(i, count - 1);
    });
  }, [count]);

  /** After scroll / snap finishes: sync dots + opacity. Avoid resolving during motion — the
   *  viewport center can sit between slides for a frame while inertia moves, which toggled
   *  `.selected` and felt like a bounce. (No vertical→horizontal wheel mapping: it used
   *  `preventDefault()` and blocked normal page scroll over the strip; horizontal scrolling uses
   *  native `overflow-x` + trackpad `deltaX`, touch drag, or Shift+wheel where the OS supports it.) */
  useEffect(() => {
    const strip = scrollRef.current;

    if (!strip || count === 0) {
      return;
    }

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
      resolveIndexFromScroll();
    };

    const onScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 220);
    };

    const onScrollEnd = () => {
      finish();
    };

    strip.addEventListener('scroll', onScroll, { passive: true });
    strip.addEventListener('scrollend', onScrollEnd);

    return () => {
      clearTimeout(idleTimer);
      strip.removeEventListener('scroll', onScroll);
      strip.removeEventListener('scrollend', onScrollEnd);
    };
  }, [count, resolveIndexFromScroll]);

  const scrollSlideIntoView = useCallback((index: number) => {
    const slide = slideRefs.current[index];

    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  const goPrev = useCallback(() => {
    const next = Math.max(0, safeIndex - 1);

    setActiveIndex(next);
    scrollSlideIntoView(next);
  }, [safeIndex, scrollSlideIntoView]);

  const goNext = useCallback(() => {
    const next = Math.min(count - 1, safeIndex + 1);

    setActiveIndex(next);
    scrollSlideIntoView(next);
  }, [count, safeIndex, scrollSlideIntoView]);

  const primaryText =
    primaryResolved.text.length > 0 ? primaryResolved.text : 'Your Care Journey,';
  const secondaryText =
    secondaryResolved.text.length > 0 ? secondaryResolved.text : 'Simp(liivv)fied';
  const prevDisabled = count === 0 || safeIndex === 0;
  const nextDisabled = count === 0 || safeIndex >= count - 1;
  const activeStepLabel =
    count > 0 ? timelineStepLabel(list[safeIndex] ?? {}, safeIndex) : '';
  const activeStepStyle =
    count > 0
      ? timelineTypographyStyle(list[safeIndex]?.slideContent?.categoryLabel)
      : undefined;
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: timelineSectionCss(resolvedSectionId, count),
    background,
    highlight: secondaryHeading,
  });

  return (
    <div className={clsx('diabetes-care-timeline', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper z-1 relative flex flex-row flex-wrap items-end justify-between gap-4 text-left leading-none lg:gap-8">
              <div className="grid min-w-0 flex-1 gap-4">
                <h2 className="heading title-md">
                  <AccentSplitWordsHeading
                    accentColors={secondaryHeading}
                    emphasis={secondaryText}
                    emphasisFontSize={secondaryResolved.fontSize}
                    lead={primaryText}
                    leadColor={primaryResolved.color}
                    leadFontSize={primaryResolved.fontSize}
                  />
                </h2>
              </div>

              {count > 0 ? (
                <div className="indicators gap-2d5 flex shrink-0">
                  <button
                    aria-controls={resolvedSliderId}
                    aria-label="Previous"
                    className="button button--secondary"
                    disabled={prevDisabled}
                    onClick={goPrev}
                    type="button"
                  >
                    <span className="btn-fill sf-hidden" data-fill />
                    <span className="btn-text">
                      <IconChevronLeft />
                    </span>
                    <span className="btn-loader">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                  <button
                    aria-controls={resolvedSliderId}
                    aria-label="Next"
                    className="button button--secondary"
                    disabled={nextDisabled}
                    onClick={goNext}
                    type="button"
                  >
                    <span className="btn-fill" data-fill />
                    <span className="btn-text">
                      <IconChevronRight />
                    </span>
                    <span className="btn-loader">
                      <span />
                      <span />
                      <span />
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            {count === 0 ? (
              <div className="rte text-opacity mt-8 text-base lg:text-lg">
                <p>
                  Add journey sections in the left panel. Each section can include category label,
                  heading, HTML body, a button link, and an image. The bottom timeline label matches
                  the category label.
                </p>
              </div>
            ) : (
              <>
                <ScrollReveal delayMs={100}>
                <div
                  aria-label={`Journey carousel, slide ${safeIndex + 1} of ${count}. Swipe left or right to change steps.`}
                  aria-roledescription="carousel"
                  className="slider slider--desktop slider--tablet grid"
                  id={resolvedSliderId}
                  role="region"
                >
                  <div
                    className="timeline timeline-react-strip touch-pan-x overscroll-x-contain"
                    ref={scrollRef}
                  >
                    {list.map((section, index) => (
                      <TimelineSlide
                        index={index}
                        isSelected={index === safeIndex}
                        key={`slide-${index}`}
                        section={section}
                        setSlideEl={setSlideEl}
                      />
                    ))}
                  </div>
                </div>

                <div className="scroll-area">
                  <div className="scroll-area__inner">
                    <div
                      aria-live="polite"
                      className="timeline-dots-mobile mb-4 min-w-0 lg:hidden"
                    >
                      <p
                        className="heading text-left text-lg font-bold leading-snug tracking-tight"
                        style={activeStepStyle}
                      >
                        {activeStepLabel}
                      </p>
                      <p className="text-opacity mt-1 text-sm tabular-nums">
                        {safeIndex + 1} of {count}
                        <span className="text-opacity/80"> · Swipe the card above to explore</span>
                      </p>
                    </div>

                    <div
                      aria-label="Journey timeline"
                      className="timeline-dots timeline-dots--desktop hidden gap-2d5 lg:grid"
                      role="tablist"
                    >
                      {list.map((section, index) => {
                        const label = timelineStepLabel(section, index);
                        const isActive = index === safeIndex;

                        return (
                          <button
                            aria-controls={resolvedSliderId}
                            aria-current={isActive ? 'true' : 'false'}
                            className="heading gap-2d5 flex items-center text-left text-lg"
                            data-index={index + 1}
                            key={`dot-${index}`}
                            onClick={() => {
                              setActiveIndex(index);
                              scrollSlideIntoView(index);
                            }}
                            type="button"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                </ScrollReveal>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
