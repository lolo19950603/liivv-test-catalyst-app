'use client';

import { clsx } from 'clsx';
import { type CSSProperties, type KeyboardEventHandler, useId, useRef } from 'react';

import {
  DC_CAROUSEL_HOST_CLASS,
  DC_MOBILE_CAROUSEL_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  isHighlightOverrideEnabled,
  type HeadingAccentColorProps,
} from '~/lib/makeswift/utils/heading-accent-color';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

import { COLLECTION_LIST_SECTION_ID, COLLECTION_LIST_VARS } from './archive-styles';

export interface DiabetesCareCollectionListCardProps {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  cardLink?: { href?: string; target?: string };
  ariaLabel?: string;
}

/** @deprecated Flat combined heading; use `heading.primaryHeading` + `heading.secondaryHeading`. */
export type CollectionListHeadingProps = HeadingTypographyProps &
  HeadingAccentColorProps & {
    accentText?: string;
    accentTextColor?: string;
    accentTextColorHex?: string;
    accentFontSize?: number;
    accentFontSizeMobile?: number;
  };

export type CollectionListHeadingGroupProps = {
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
};

export type CollectionListBodyProps = BodyTextProps & {
  descriptionHtml?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type DiabetesCareCollectionListProps = {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: CollectionListHeadingGroupProps | CollectionListHeadingProps;
  /** @deprecated Use `heading.primaryHeading`. */
  primaryHeading?: HeadingTypographyProps;
  /** @deprecated Use `heading.secondaryHeading`. */
  secondaryHeading?: HeadingWithHighlightProps;
  /** @deprecated Use `heading.primaryHeading`. */
  headingLine1?: HeadingTypographyProps;
  /** @deprecated Use `heading.secondaryHeading`. */
  headingLine2?: CollectionListHeadingProps;
  body?: CollectionListBodyProps;
  cards?: DiabetesCareCollectionListCardProps[];
  /** @deprecated Use `body` text color and font size. */
  bodyText?: BodyTextProps;
};

/** Opt-in custom `--color-highlight` for the line 2 swash (archive always uses `half_text`). */
function line2UsesCustomHighlightColor(heading?: HeadingAccentColorProps | null): boolean {
  return isHighlightOverrideEnabled(heading?.useCustomHighlightColor);
}

function isNestedHeadingGroup(
  heading: CollectionListHeadingGroupProps | CollectionListHeadingProps,
): heading is CollectionListHeadingGroupProps {
  return 'primaryHeading' in heading || 'secondaryHeading' in heading;
}

function resolveCollectionListHeading(props: {
  heading?: CollectionListHeadingGroupProps | CollectionListHeadingProps;
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
  headingLine1?: HeadingTypographyProps;
  headingLine2?: CollectionListHeadingProps;
}): {
  line1: ReturnType<typeof resolveHeadingTypography>;
  line2: ReturnType<typeof resolveHeadingTypography>;
  headingAccent: HeadingWithHighlightProps | null;
  useLine2CustomHighlight: boolean;
} {
  const nested = props.heading;

  if (nested != null && typeof nested === 'object' && isNestedHeadingGroup(nested)) {
    const line1 = resolveHeadingTypography(nested.primaryHeading);
    const line2 = resolveHeadingTypography(nested.secondaryHeading);
    const headingAccent = nested.secondaryHeading ?? null;

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.emphasisColor ?? line2.color },
      headingAccent,
      useLine2CustomHighlight: line2UsesCustomHighlightColor(headingAccent),
    };
  }

  if (props.primaryHeading != null || props.secondaryHeading != null) {
    const line1 = resolveHeadingTypography(props.primaryHeading);
    const line2 = resolveHeadingTypography(props.secondaryHeading);
    const headingAccent = props.secondaryHeading ?? null;

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.emphasisColor ?? line2.color },
      headingAccent,
      useLine2CustomHighlight: line2UsesCustomHighlightColor(headingAccent),
    };
  }

  const combined = props.heading as CollectionListHeadingProps | undefined;

  if (combined != null && typeof combined === 'object' && !isNestedHeadingGroup(combined)) {
    const line1 = resolveHeadingTypography({
      text: combined.text,
      textColor: combined.textColor,
      textColorHex: combined.textColorHex,
      fontSize: combined.fontSize,
      fontSizeMobile: combined.fontSizeMobile,
    });
    const line2 = resolveHeadingTypography({
      text: combined.accentText,
      textColor: combined.accentTextColor,
      textColorHex: combined.accentTextColorHex,
      fontSize: combined.accentFontSize,
      fontSizeMobile: combined.accentFontSizeMobile,
    });

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.color },
      headingAccent: combined,
      useLine2CustomHighlight: line2UsesCustomHighlightColor(combined),
    };
  }

  if (props.headingLine1 != null || props.headingLine2 != null) {
    const line1 = resolveHeadingTypography(props.headingLine1);
    const line2 = resolveHeadingTypography({
      text: props.headingLine2?.text,
      textColor: props.headingLine2?.textColor,
      textColorHex: props.headingLine2?.textColorHex,
      fontSize: props.headingLine2?.fontSize,
      fontSizeMobile: props.headingLine2?.fontSizeMobile,
    });
    const headingAccent = props.headingLine2 ?? null;

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.color },
      headingAccent,
      useLine2CustomHighlight: line2UsesCustomHighlightColor(headingAccent),
    };
  }

  return {
    line1: resolveHeadingTypography(undefined),
    line2: resolveHeadingTypography(undefined),
    headingAccent: null,
    useLine2CustomHighlight: false,
  };
}

function resolveCollectionListBody(props: {
  body?: CollectionListBodyProps;
  bodyText?: BodyTextProps;
}): { html: string; style: CSSProperties | undefined } {
  const group = props.body;

  if (group != null && typeof group === 'object') {
    const html = group.descriptionHtml?.trim() ?? '';
    const color = resolveBodyTextColor(group) ?? resolveBodyTextColor(props.bodyText);
    const fontSize = resolveHeadingFontSizeCss(group.fontSize, group.fontSizeMobile);

    return {
      html,
      style:
        color != null || fontSize != null
          ? {
              ...(color != null ? { color } : {}),
              ...(fontSize != null ? { fontSize } : {}),
            }
          : undefined,
    };
  }

  const legacyColor = resolveBodyTextColor(props.bodyText);

  return {
    html: '',
    style: legacyColor != null ? { color: legacyColor } : undefined,
  };
}

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

function cardHasMedia(c: DiabetesCareCollectionListCardProps): boolean {
  return (
    String(c.cardLink?.href ?? '').trim().length > 0 &&
    String(c.imageSrc ?? '').trim().length > 0 &&
    String(c.title ?? '').trim().length > 0
  );
}

export function DiabetesCareCollectionList({
  className,
  background,
  headingLine1,
  headingLine2,
  heading,
  primaryHeading,
  secondaryHeading,
  body,
  cards,
  bodyText,
}: DiabetesCareCollectionListProps) {
  const { line1, line2, headingAccent, useLine2CustomHighlight } = resolveCollectionListHeading({
    heading,
    primaryHeading,
    secondaryHeading,
    headingLine1,
    headingLine2,
  });
  const bodyResolved = resolveCollectionListBody({ body, bodyText });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: COLLECTION_LIST_SECTION_ID,
    sectionCss: COLLECTION_LIST_VARS,
    background,
    highlight: useLine2CustomHighlight ? headingAccent : null,
  });
  const reactId = useId().replace(/:/g, '');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const line1Text = line1.text.length > 0 ? line1.text : 'Care Designed for';
  const line2Text = line2.text.length > 0 ? line2.text : 'Every Stage of Health';
  const desc = bodyResolved.html;

  const list = cards != null ? cards.filter(cardHasMedia) : [];

  const slide = (direction: -1 | 1) => {
    const el = scrollerRef.current;

    if (el == null) {
      return;
    }

    const delta = Math.max(260, Math.floor(el.clientWidth * 0.85)) * direction;

    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const onKeyNav: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      slide(-1);
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      slide(1);
    }
  };

  const sliderDomId = `dcl-carousel-${reactId}`;

  return (
    <div className={clsx('diabetes-care-collection-list', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={COLLECTION_LIST_SECTION_ID} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding">
          <div className="page-width relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4 leading-none">
                <h2 className="heading title-md leading-none">
                  <AccentSplitWordsHeading
                    accentColors={useLine2CustomHighlight ? (headingAccent ?? undefined) : undefined}
                    emphasis={line2Text}
                    emphasisColor={line2.emphasisColor ?? line2.color}
                    emphasisFontSize={line2.fontSize}
                    highlightStyle="half_text"
                    lead={line1Text}
                    leadColor={line1.color}
                    leadFontSize={line1.fontSize}
                  />
                </h2>
                {desc.length > 0 ? (
                  <div
                    className="description rte subtext-md leading-normal"
                    dangerouslySetInnerHTML={{ __html: desc }}
                    style={bodyResolved.style}
                  />
                ) : null}
              </div>
              <div className="indicators gap-2d5 hidden lg:flex">
                <button
                  aria-controls={sliderDomId}
                  aria-label="Previous"
                  className="button button--secondary"
                  disabled={list.length <= 1}
                  onClick={() => {
                    slide(-1);
                  }}
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
                  aria-controls={sliderDomId}
                  aria-label="Next"
                  className="button button--secondary"
                  disabled={list.length <= 1}
                  onClick={() => {
                    slide(1);
                  }}
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
            </div>

            <div
              aria-label="Collection carousel"
              className={clsx(
                'slider slider--desktop slider--tablet mt-10 grid lg:mt-14',
                DC_CAROUSEL_HOST_CLASS,
              )}
              id={sliderDomId}
              onKeyDown={list.length > 0 ? onKeyNav : undefined}
              role="region"
              tabIndex={list.length > 0 ? 0 : undefined}
            >
              <ScrollReveal delayMs={100}>
                <div
                  className={clsx(
                    'motion-list initialized card-grid grid max-w-full',
                    'mobile:card-grid--1 gap-8 lg:gap-12',
                    'card-grid--4',
                    DC_MOBILE_CAROUSEL_CLASS,
                    'lg:[--card-grid-template:auto/auto-flow_minmax(0,288px)] lg:overflow-x-auto lg:overscroll-contain lg:scroll-smooth lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden',
                  )}
                  ref={scrollerRef}
                >
                  {list.length === 0 ? (
                    <p className="subtext-md col-span-full py-8 text-center text-contrast-500">
                      Add collections in Makeswift (image, title, and link).
                    </p>
                  ) : (
                    list.map((c, i) => {
                      const href = c.cardLink?.href?.trim() ?? '#';
                      const src = c.imageSrc?.trim() ?? '';
                      const cardTitle = c.title?.trim() ?? '';
                      const label =
                        (c.ariaLabel?.trim() ?? cardTitle).length > 0
                          ? (c.ariaLabel?.trim() ?? cardTitle)
                          : undefined;

                      return (
                        <div
                          className="card media-card media-card--card shrink-0"
                          key={`dcc-${reactId}-${String(i)}`}
                        >
                          <a
                            aria-label={label}
                            className="media-card__link relative flex h-full w-full flex-col"
                            href={href}
                            rel={c.cardLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                            target={c.cardLink?.target}
                          >
                            <div className="media media--wide mobile:media--wide relative overflow-hidden">
                              <img
                                alt={c.imageAlt?.trim() ?? cardTitle}
                                className="aspect-[4/3] w-full object-cover md:aspect-[4/3]"
                                decoding="async"
                                height={800}
                                loading="lazy"
                                src={src}
                                width={1000}
                              />
                            </div>
                            <div className="media-card__info flex justify-between gap-3 p-6">
                              <p className="grow">
                                <span className="heading reversed-link text-lg-md font-medium leading-tight">
                                  {cardTitle}
                                </span>
                              </p>
                            </div>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
