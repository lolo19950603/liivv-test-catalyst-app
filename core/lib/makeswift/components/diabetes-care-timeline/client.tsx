'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { scanShopifyButtonFillHover } from '~/lib/archived-pages/init-shopify-button-fill-hover';
import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ArchiveHighlightedText } from '~/lib/makeswift/components/diabetes-care-faq/archive-highlighted-text';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import { resolveButtonTheme } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { cssColorWithOpacity, toArchiveRgbChannels } from '~/lib/makeswift/utils/archive-color';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';
import {
  isHighlightOverrideEnabled,
  resolvePlainTextColor,
  resolveSectionHighlightChannels,
} from '~/lib/makeswift/utils/heading-accent-color';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';

import { TIMELINE_ROUNDED_TOP_CSS, timelineSectionLayoutCss } from './archive-styles';

export const DIABETES_CARE_TIMELINE_SECTION_ID =
  'shopify-section-template--26520397447459__timeline_nyTDKQ';
export const DIABETES_CARE_TIMELINE_resolvedSliderId = 'Slider-template--26520397447459__timeline_nyTDKQ';

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

/** Archive timeline dots: split multi-word labels across two lines. */
function formatTimelineStepLabelLines(text: string): ReactNode {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return trimmed;
  }

  const firstLineCount = Math.ceil(words.length / 2);

  return (
    <>
      {words.slice(0, firstLineCount).join(' ')}
      <br />
      {words.slice(firstLineCount).join(' ')}
    </>
  );
}

export type TimelineTypographyProps = {
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type TimelineNavTextColorProps = {
  activeTextColor?: string;
  activeTextColorHex?: string;
};

export type TimelineStepNavigationProps = TimelineNavTextColorProps;
export type TimelineArrowNavigationProps = TimelineNavTextColorProps & {
  hoverTextColor?: string;
  hoverTextColorHex?: string;
};

const TIMELINE_NAV_INACTIVE_OPACITY = 0.25;

function resolveTimelineNavTextColorStyle(
  colors: TimelineNavTextColorProps | null | undefined,
  prefix: 'step' | 'arrow',
  options?: { includeChannels?: boolean },
): CSSProperties | undefined {
  const active = resolvePlainTextColor({
    textColor: colors?.activeTextColor,
    textColorHex: colors?.activeTextColorHex,
  });

  if (active == null) {
    return undefined;
  }

  const muted =
    cssColorWithOpacity(active, TIMELINE_NAV_INACTIVE_OPACITY) ??
    `color-mix(in srgb, ${active} ${TIMELINE_NAV_INACTIVE_OPACITY * 100}%, transparent)`;
  const activeChannels =
    options?.includeChannels === true ? toArchiveRgbChannels(active) : null;

  return {
    [`--timeline-${prefix}-active-color`]: active,
    [`--timeline-${prefix}-inactive-color`]: muted,
    ...(prefix === 'step' ? { '--timeline-step-connector-color': muted } : {}),
    ...(activeChannels != null
      ? { [`--timeline-${prefix}-active-channels`]: activeChannels }
      : {}),
  } as CSSProperties;
}

function resolveTimelineStepNavigationStyle(
  stepNavigation?: TimelineStepNavigationProps | null,
): CSSProperties | undefined {
  return resolveTimelineNavTextColorStyle(stepNavigation, 'step');
}

function resolveTimelineArrowNavigationStyle(
  arrowNavigation?: TimelineArrowNavigationProps | null,
  stepNavigation?: TimelineStepNavigationProps | null,
): CSSProperties | undefined {
  const active =
    resolvePlainTextColor({
      textColor: arrowNavigation?.activeTextColor,
      textColorHex: arrowNavigation?.activeTextColorHex,
    }) ??
    resolvePlainTextColor({
      textColor: stepNavigation?.activeTextColor,
      textColorHex: stepNavigation?.activeTextColorHex,
    });

  const hoverTextOnly = resolvePlainTextColor({
    textColor: arrowNavigation?.hoverTextColor,
    textColorHex: arrowNavigation?.hoverTextColorHex,
  });

  if (active == null && hoverTextOnly == null) {
    return undefined;
  }

  const resolvedActive = active ?? hoverTextOnly;
  const resolvedHoverText = hoverTextOnly ?? resolvedActive;
  const muted =
    cssColorWithOpacity(resolvedActive, TIMELINE_NAV_INACTIVE_OPACITY) ??
    `color-mix(in srgb, ${resolvedActive} ${TIMELINE_NAV_INACTIVE_OPACITY * 100}%, transparent)`;
  const activeChannels = toArchiveRgbChannels(resolvedActive);

  return {
    '--timeline-arrow-active-color': resolvedActive,
    '--timeline-arrow-inactive-color': muted,
    '--timeline-arrow-hover-text-color': resolvedHoverText,
    ...(activeChannels != null ? { '--timeline-arrow-active-channels': activeChannels } : {}),
  } as CSSProperties;
}

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
  button?: ArchiveButtonProps;
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

/** Per-slide heading: font size + swash scoped to this `h2` via `--color-highlight`. */
function timelineSectionHeadingUsesSwash(heading?: TimelineSectionHeadingProps | null): boolean {
  return isHighlightOverrideEnabled(heading?.useCustomHighlightColor);
}

function timelineSectionHeadingStyle(
  heading?: TimelineSectionHeadingProps | null,
): CSSProperties | undefined {
  const typography = timelineTypographyStyle(heading);
  const highlightChannels = timelineSectionHeadingUsesSwash(heading)
    ? resolveSectionHighlightChannels(heading)
    : null;

  if (typography == null && highlightChannels == null) {
    return undefined;
  }

  return {
    ...typography,
    ...(highlightChannels != null ? { '--color-highlight': highlightChannels } : {}),
  };
}

function timelineMainHeadingStyle(
  heading?: TimelineMainHeadingProps | null,
): CSSProperties | undefined {
  const highlightChannels = resolveSectionHighlightChannels(heading);

  return highlightChannels != null
    ? ({ '--color-highlight': highlightChannels } as CSSProperties)
    : undefined;
}

export type TimelineMainHeadingProps = HeadingWithHighlightProps & {
  before?: string;
  emphasis?: string;
  after?: string;
};

const DEFAULT_TIMELINE_HEADING_LEAD = 'Your Care Journey,';
const DEFAULT_TIMELINE_HEADING_EMPHASIS = 'Simp(liivv)fied';

function resolveTimelineMainHeading(props: {
  heading?: TimelineMainHeadingProps;
  /** @deprecated Use `heading` (before / emphasis / after). */
  primaryHeading?: HeadingTypographyProps;
  /** @deprecated Use `heading.emphasis`. */
  secondaryHeading?: HeadingWithHighlightProps;
}): {
  lead: string;
  emphasis: string;
  trail: string;
  accentColors: HeadingWithHighlightProps | undefined;
  leadColor?: string;
  leadFontSize?: string;
  emphasisFontSize?: string;
} {
  const { heading, primaryHeading, secondaryHeading } = props;

  if (heading != null) {
    const leadResolved = resolveHeadingTypography({
      text: heading.before,
      textColor: heading.textColor,
      textColorHex: heading.textColorHex,
      fontSize: heading.fontSize,
      fontSizeMobile: heading.fontSizeMobile,
    });
    const emphasisResolved = resolveHeadingTypography({
      text: heading.emphasis,
      textColor: heading.textColor,
      textColorHex: heading.textColorHex,
      fontSize: heading.fontSize,
      fontSizeMobile: heading.fontSizeMobile,
    });
    const trailResolved = resolveHeadingTypography({
      text: heading.after,
      textColor: heading.textColor,
      textColorHex: heading.textColorHex,
      fontSize: heading.fontSize,
      fontSizeMobile: heading.fontSizeMobile,
    });

    return {
      lead: leadResolved.text,
      emphasis: emphasisResolved.text,
      trail: trailResolved.text,
      accentColors: heading,
      leadColor: leadResolved.color,
      leadFontSize: leadResolved.fontSize,
      emphasisFontSize: emphasisResolved.fontSize,
    };
  }

  if (primaryHeading != null || secondaryHeading != null) {
    const leadResolved = resolveHeadingTypography(primaryHeading);
    const emphasisResolved = resolveHeadingTypography(secondaryHeading);

    return {
      lead:
        leadResolved.text.length > 0 ? leadResolved.text : DEFAULT_TIMELINE_HEADING_LEAD,
      emphasis:
        emphasisResolved.text.length > 0
          ? emphasisResolved.text
          : DEFAULT_TIMELINE_HEADING_EMPHASIS,
      trail: '',
      accentColors: secondaryHeading,
      leadColor: leadResolved.color,
      leadFontSize: leadResolved.fontSize,
      emphasisFontSize: emphasisResolved.fontSize,
    };
  }

  return {
    lead: DEFAULT_TIMELINE_HEADING_LEAD,
    emphasis: DEFAULT_TIMELINE_HEADING_EMPHASIS,
    trail: '',
    accentColors: undefined,
    leadColor: undefined,
    leadFontSize: undefined,
    emphasisFontSize: undefined,
  };
}

export type DiabetesCareTimelineProps = {
  className?: string;
  /** Override Shopify section id when multiple timelines share a page. */
  sectionDomId?: string;
  /** Override slider `id` / `aria-controls` target. Defaults from section id when omitted. */
  sliderDomId?: string;
  background?: SectionBackgroundProps;
  heading?: TimelineMainHeadingProps;
  smallHeading?: TimelineTextBlockProps;
  /** @deprecated Use `heading.before`. */
  primaryHeading?: HeadingTypographyProps;
  /** @deprecated Use `heading.emphasis`. */
  secondaryHeading?: HeadingWithHighlightProps;
  sections?: DiabetesCareTimelineSection[];
  roundedTop?: boolean;
  /** When true, all slides show image left and copy right at md+ (omits `grid-row-reverse`). */
  layoutReverse?: boolean;
  stepNavigation?: TimelineStepNavigationProps;
  arrowNavigation?: TimelineArrowNavigationProps;
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
  layoutReverse: boolean;
  setSlideEl: (el: HTMLDivElement | null, i: number) => void;
}

function TimelineSlide({
  section,
  index,
  isSelected,
  layoutReverse,
  setSlideEl,
}: TimelineSlideProps) {
  const content = section.slideContent;
  const categoryLabel = content?.categoryLabel?.text?.trim() ?? '';
  const sectionHeadingBlock = content?.sectionHeading;
  const sectionHeading = sectionHeadingBlock?.text?.trim() ?? '';
  const sectionHeadingUsesSwash = timelineSectionHeadingUsesSwash(sectionHeadingBlock);
  const sectionBodyHtml = content?.sectionBody?.html?.trim() ?? '';
  const slideButton = resolveArchiveButton(section.button, {
    defaultText: 'Get Started',
    requireHref: false,
  });
  const inactiveButtonTheme = useMemo(
    () => resolveButtonTheme(slideButton.colors, { scopeId: `timeline-inactive-${index}`, variant: 'primary' }),
    [index, slideButton.colors],
  );
  const imageSrc = resolveMakeswiftImageSrc(section.image?.imageSrc);
  return (
    <div
      className={clsx('timeline__item card relative', isSelected && 'selected')}
      {...(!isSelected ? { inert: true } : {})}
      ref={(el) => {
        setSlideEl(el, index);
      }}
    >
      <div
        className={clsx(
          'timeline-slide-layout flex flex-col overflow-hidden',
          !layoutReverse && 'md:grid-row-reverse',
        )}
      >
        <picture className="media media--portrait mobile:media--wide relative block overflow-hidden">
          {imageSrc.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element -- Makeswift image URL
            <img
              alt={section.image?.imageAlt ?? ''}
              className="block h-full w-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              src={imageSrc}
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
              {sectionHeadingUsesSwash ? (
                <ArchiveHighlightedText
                  color={resolvePlainTextColor(sectionHeadingBlock)}
                  highlightStyle="half_text"
                >
                  {sectionHeading}
                </ArchiveHighlightedText>
              ) : (
                sectionHeading
              )}
            </h2>
          ) : null}

          {sectionBodyHtml.length > 0 ? (
            <div
              className="rte text-opacity text-base lg:text-lg"
              dangerouslySetInnerHTML={{ __html: sectionBodyHtml }}
              style={timelineTypographyStyle(content?.sectionBody)}
            />
          ) : null}

          {slideButton.visible ? (
            <p>
              {isSelected ? (
                <ArchiveShopifyButton
                  className="button--primary button--md icon-with-text"
                  colors={slideButton.colors}
                  href={slideButton.href}
                  rel={slideButton.rel}
                  target={slideButton.target}
                >
                  {slideButton.text}
                  <IconArrowRight />
                </ArchiveShopifyButton>
              ) : (
                <span
                  aria-hidden="true"
                  className="button button--primary button--md icon-with-text pointer-events-none"
                  style={inactiveButtonTheme.style}
                >
                  <span className="btn-fill" data-fill />
                  <span className="btn-text">
                    {slideButton.text}
                    <IconArrowRight />
                  </span>
                </span>
              )}
            </p>
          ) : null}
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
  heading,
  smallHeading,
  primaryHeading,
  secondaryHeading,
  sections,
  roundedTop = true,
  layoutReverse = false,
  stepNavigation,
  arrowNavigation,
}: DiabetesCareTimelineProps) {
  const resolvedSectionId =
    sectionDomId?.trim().length ? sectionDomId.trim() : DIABETES_CARE_TIMELINE_SECTION_ID;
  const resolvedSliderId =
    sliderDomId?.trim().length
      ? sliderDomId.trim()
      : resolvedSectionId.replace(/^shopify-section-/, 'Slider-');
  const mainHeading = resolveTimelineMainHeading({
    heading,
    primaryHeading,
    secondaryHeading,
  });
  const smallHeadingText = smallHeading?.text?.trim() ?? '';
  const list = useMemo(() => sections ?? [], [sections]);
  const count = list.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const indicatorsRef = useRef<HTMLDivElement | null>(null);

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

  const prevDisabled = count === 0 || safeIndex === 0;
  const nextDisabled = count === 0 || safeIndex >= count - 1;

  useEffect(() => {
    const indicators = indicatorsRef.current;

    if (indicators == null || count === 0) {
      return;
    }

    scanShopifyButtonFillHover(indicators);
  }, [count, prevDisabled, nextDisabled]);
  const activeStepLabel =
    count > 0 ? timelineStepLabel(list[safeIndex] ?? {}, safeIndex) : '';
  const stepNavigationStyle = resolveTimelineStepNavigationStyle(stepNavigation);
  const arrowNavigationStyle = resolveTimelineArrowNavigationStyle(
    arrowNavigation,
    stepNavigation,
  );
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: timelineSectionLayoutCss(resolvedSectionId, count),
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const sectionBackgroundStyle: CSSProperties | undefined =
    sectionStyle['--color-background'] != null
      ? ({
          '--color-background': sectionStyle['--color-background'],
          backgroundColor: `rgb(${String(sectionStyle['--color-background'])})`,
        } as CSSProperties)
      : undefined;
  const mainHeadingStyle = timelineMainHeadingStyle(mainHeading.accentColors);

  return (
    <div className={clsx('diabetes-care-timeline', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div
        className="shopify-section"
        id={resolvedSectionId}
        style={{ ...sectionStyle, ...stepNavigationStyle }}
      >
        {roundedTop ? (
          <style dangerouslySetInnerHTML={{ __html: TIMELINE_ROUNDED_TOP_CSS }} />
        ) : null}
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx(
            'section section--padding relative',
            roundedTop && 'section--rounded overflow-hidden',
          )}
          style={roundedTop ? sectionBackgroundStyle : undefined}
        >
          <div className="page-width relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper z-1 relative flex flex-row flex-wrap items-end justify-between gap-4 text-left leading-none lg:gap-8">
              <div className="grid min-w-0 flex-1 gap-4">
                {smallHeadingText.length > 0 ? (
                  <p
                    className="heading subtext-lg font-medium normal-case leading-none tracking-none"
                    style={timelineTypographyStyle(smallHeading)}
                  >
                    {smallHeadingText}
                  </p>
                ) : null}
                <h2 className="heading title-md" style={mainHeadingStyle}>
                  <AccentSplitWordsHeading
                    accentColors={mainHeading.accentColors}
                    emphasis={mainHeading.emphasis}
                    emphasisFontSize={mainHeading.emphasisFontSize}
                    lead={mainHeading.lead}
                    leadColor={mainHeading.leadColor}
                    leadFontSize={mainHeading.leadFontSize}
                    trail={mainHeading.trail}
                  />
                </h2>
              </div>

              {count > 0 ? (
                <div
                  className="indicators gap-2d5 flex shrink-0"
                  ref={indicatorsRef}
                  style={arrowNavigationStyle}
                >
                  <button
                    aria-controls={resolvedSliderId}
                    aria-label="Previous"
                    className="button button--secondary"
                    disabled={prevDisabled}
                    onClick={goPrev}
                    type="button"
                  >
                    <span className="btn-fill" data-fill />
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
                        layoutReverse={layoutReverse}
                        section={section}
                        setSlideEl={setSlideEl}
                      />
                    ))}
                  </div>
                </div>

                <div className="scroll-area">
                    <div
                      aria-live="polite"
                      className="timeline-dots-mobile mb-4 min-w-0 lg:hidden"
                      style={stepNavigationStyle}
                    >
                      <p className="timeline-dots-mobile__label heading text-left text-lg font-bold leading-snug tracking-tight">
                        {formatTimelineStepLabelLines(activeStepLabel)}
                      </p>
                      <p className="text-opacity mt-1 text-sm tabular-nums">
                        {safeIndex + 1} of {count}
                        <span className="text-opacity/80"> · Swipe the card above to explore</span>
                      </p>
                    </div>

                    <div
                      aria-label="Journey timeline"
                      className="timeline-dots timeline-dots--desktop gap-2d5 max-lg:hidden"
                      role="tablist"
                      style={
                        {
                          gridTemplateColumns: `repeat(${String(count)}, minmax(0, 1fr))`,
                          ...stepNavigationStyle,
                        } as CSSProperties
                      }
                    >
                      {list.map((section, index) => {
                        const label = timelineStepLabel(section, index);
                        const isActive = index === safeIndex;

                        return (
                          <button
                            aria-controls={resolvedSliderId}
                            aria-current={isActive ? 'true' : 'false'}
                            className="heading flex items-center gap-2d5 text-left text-lg"
                            data-index={index + 1}
                            key={`dot-${index}`}
                            onClick={() => {
                              setActiveIndex(index);
                              scrollSlideIntoView(index);
                            }}
                            type="button"
                          >
                            <span className="timeline-dots__label">
                              {formatTimelineStepLabelLines(label)}
                            </span>
                          </button>
                        );
                      })}
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
