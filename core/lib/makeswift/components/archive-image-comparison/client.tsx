'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  AccentSplitWordsHeading,
  ScrollReveal,
  useInViewAnimate,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  resolveSectionBackgroundChannels,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import {
  appendHighlightToSectionCss,
  resolveAccentColors,
} from '~/lib/makeswift/utils/heading-accent-color';
import { resolveArchiveHighlightChannels } from '~/lib/makeswift/utils/archive-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import {
  toImageObjectPosition,
  type ImageAlignX,
  type ImageAlignY,
} from '~/lib/makeswift/utils/image-object-position';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  ARCHIVE_IMAGE_COMPARISON_DEFAULT_BACKGROUND,
  ARCHIVE_IMAGE_COMPARISON_SECTION_ID,
  ARCHIVE_IMAGE_COMPARISON_VARS,
} from './archive-styles';

export type ComparisonImageProps = {
  image?: unknown;
  imageAlt?: string;
  imageAlignX?: ImageAlignX;
  imageAlignY?: ImageAlignY;
};

export interface ArchiveImageComparisonProps {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingWithHighlightProps;
  /** Popover group, or legacy flat image value from older instances. */
  beforeImage?: ComparisonImageProps | unknown;
  /** @deprecated Legacy flat alt; use `beforeImage.imageAlt`. */
  beforeImageAlt?: string;
  afterImage?: ComparisonImageProps | unknown;
  /** @deprecated Legacy flat alt; use `afterImage.imageAlt`. */
  afterImageAlt?: string;
  /** Initial divider position (0–100). Defaults to 50. */
  initialPosition?: number;
  /** Height as % of width on desktop. Defaults to 40 (wide banner). */
  desktopRatioPercent?: number;
  /** Height as % of width on mobile. Defaults to match desktop. */
  mobileRatioPercent?: number;
  roundedTop?: boolean;
}

const DEFAULT_POSITION = 50;
const DEFAULT_RATIO = 40;
const KEYBOARD_STEP = 2;
/** Delay after scroll-into-view before the divider sweeps to its resting position. */
const DIVIDER_ENTRANCE_DELAY_MS = 180;
/** Matches `.image-comparison--entrance` transition duration in archive-styles. */
const DIVIDER_ENTRANCE_DURATION_MS = 1100;
const DEFAULT_SECTION_HEADING = 'Support at every stage of your journey';
const DEFAULT_ACCENT_PHRASE = 'every stage';
const DEFAULT_HEADING_FONT_DESKTOP = 50;
const DEFAULT_HEADING_FONT_MOBILE = 32;

function resolveImageComparisonHeadingFontSize(
  desktopPx?: number,
  mobilePx?: number,
): string | undefined {
  const desktop =
    desktopPx == null ? DEFAULT_HEADING_FONT_DESKTOP : desktopPx > 0 ? desktopPx : undefined;
  const mobile =
    mobilePx == null || mobilePx <= 0 ? DEFAULT_HEADING_FONT_MOBILE : mobilePx;

  return resolveHeadingFontSizeCss(desktop, mobile);
}

function splitHeadingAroundAccent(
  fullText: string,
  accentPhrase: string,
): { lead: string; emphasis: string; trail: string } {
  const text = fullText.trim();
  const phrase = accentPhrase.trim();

  if (text.length === 0) {
    return { lead: '', emphasis: '', trail: '' };
  }

  if (phrase.length === 0) {
    return { lead: '', emphasis: '', trail: text };
  }

  const start = text.toLowerCase().indexOf(phrase.toLowerCase());

  if (start === -1) {
    return { lead: '', emphasis: '', trail: text };
  }

  return {
    lead: text.slice(0, start),
    emphasis: text.slice(start, start + phrase.length),
    trail: text.slice(start + phrase.length),
  };
}

function clampPercent(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, value));
}

function clampRatio(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return fallback;
  }

  return Math.min(200, Math.max(20, value));
}

function readComparisonImage(
  value?: ComparisonImageProps | unknown,
  legacyAlt?: string,
): ComparisonImageProps {
  if (value != null && typeof value === 'object' && 'image' in value) {
    return value as ComparisonImageProps;
  }

  return {
    image: value,
    imageAlt: legacyAlt,
  };
}

function comparisonImageObjectPosition(image?: ComparisonImageProps): string {
  return toImageObjectPosition(image?.imageAlignX, image?.imageAlignY);
}

export function ArchiveImageComparison({
  className,
  background,
  roundedTop = true,
  heading,
  beforeImage: beforeImageProp,
  beforeImageAlt,
  afterImage: afterImageProp,
  afterImageAlt,
  initialPosition,
  desktopRatioPercent,
  mobileRatioPercent,
}: ArchiveImageComparisonProps) {
  const targetPosition = clampPercent(initialPosition, DEFAULT_POSITION);
  const [position, setPosition] = useState(0);
  const [isEntranceAnimating, setIsEntranceAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const entranceDoneRef = useRef(false);
  const userAdjustedRef = useRef(false);
  const handleId = useId().replace(/:/g, '');
  const { ref: inViewRef, animated: inView } = useInViewAnimate();

  const setComparisonContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    inViewRef.current = node;
  }, [inViewRef]);

  const beforeImage = readComparisonImage(beforeImageProp, beforeImageAlt);
  const afterImage = readComparisonImage(afterImageProp, afterImageAlt);
  const beforeSrc = resolveMakeswiftImageSrc(beforeImage.image);
  const afterSrc = resolveMakeswiftImageSrc(afterImage.image);
  const beforeObjectPosition = comparisonImageObjectPosition(beforeImage);
  const afterObjectPosition = comparisonImageObjectPosition(afterImage);

  const backgroundChannels = resolveSectionBackgroundChannels(
    background,
    ARCHIVE_IMAGE_COMPARISON_DEFAULT_BACKGROUND,
  );
  const accentHighlightChannels = resolveArchiveHighlightChannels(
    heading?.accentTextColorHex,
    heading?.accentTextColor,
  );
  const { sectionCss: baseSectionCss, sectionStyle: baseSectionStyle } = buildSectionTheme({
    sectionId: ARCHIVE_IMAGE_COMPARISON_SECTION_ID,
    sectionCss: ARCHIVE_IMAGE_COMPARISON_VARS,
    background,
    highlight: heading,
    defaultBackgroundChannels: ARCHIVE_IMAGE_COMPARISON_DEFAULT_BACKGROUND,
  });
  const sectionCss =
    accentHighlightChannels != null
      ? appendHighlightToSectionCss(
          baseSectionCss,
          ARCHIVE_IMAGE_COMPARISON_SECTION_ID,
          accentHighlightChannels,
        )
      : baseSectionCss;
  const sectionStyle =
    accentHighlightChannels != null
      ? { ...baseSectionStyle, '--color-highlight': accentHighlightChannels }
      : baseSectionStyle;
  const sectionBackgroundStyle: CSSProperties | undefined = backgroundChannels
    ? ({
        '--color-background': backgroundChannels,
        backgroundColor: `rgb(${backgroundChannels})`,
      } as CSSProperties)
    : undefined;

  const desktopRatio = clampRatio(desktopRatioPercent, DEFAULT_RATIO);
  const mobileRatio = clampRatio(mobileRatioPercent, desktopRatio);

  const ratioVarsCss =
    `#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{--ratio-percent:${desktopRatio.toFixed(4)}%}` +
    `@media screen and (max-width:767px){#${ARCHIVE_IMAGE_COMPARISON_SECTION_ID}{` +
    `--ratio-percent:${mobileRatio.toFixed(4)}%}}`;

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;

    if (el == null) {
      return;
    }

    const rect = el.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const raw = ((clientX - rect.left) / rect.width) * 100;

    setPosition(Math.min(100, Math.max(0, raw)));
  }, []);

  const cancelEntranceAnimation = useCallback(() => {
    userAdjustedRef.current = true;
    entranceDoneRef.current = true;
    setIsEntranceAnimating(false);
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      cancelEntranceAnimation();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(event.clientX);
    },
    [cancelEntranceAnimation, updateFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!draggingRef.current) {
        return;
      }

      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
  );

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    draggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleContainerPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLButtonElement) {
        return;
      }

      cancelEntranceAnimation();
      updateFromClientX(event.clientX);
    },
    [cancelEntranceAnimation, updateFromClientX],
  );

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      cancelEntranceAnimation();
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setPosition((prev) => Math.max(0, prev - KEYBOARD_STEP));

      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setPosition((prev) => Math.min(100, prev + KEYBOARD_STEP));

      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setPosition(0);

      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setPosition(100);
    }
  }, [cancelEntranceAnimation]);

  useEffect(() => {
    if (entranceDoneRef.current || userAdjustedRef.current) {
      setPosition(targetPosition);
    }
  }, [targetPosition]);

  useEffect(() => {
    if (!inView || entranceDoneRef.current || userAdjustedRef.current) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || targetPosition <= 0) {
      setPosition(targetPosition);
      entranceDoneRef.current = true;

      return;
    }

    setIsEntranceAnimating(true);

    const completeEntrance = () => {
      entranceDoneRef.current = true;
      setIsEntranceAnimating(false);
    };

    const startId = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setPosition(targetPosition);
      });
    }, DIVIDER_ENTRANCE_DELAY_MS);

    const completeId = window.setTimeout(
      completeEntrance,
      DIVIDER_ENTRANCE_DELAY_MS + DIVIDER_ENTRANCE_DURATION_MS,
    );

    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(completeId);
    };
  }, [inView, targetPosition]);

  const handleDividerTransitionEnd = useCallback(
    (event: ReactTransitionEvent<HTMLSpanElement>) => {
      if (event.propertyName !== 'left' || !isEntranceAnimating) {
        return;
      }

      if (entranceDoneRef.current) {
        return;
      }

      entranceDoneRef.current = true;
      setIsEntranceAnimating(false);
    },
    [isEntranceAnimating],
  );

  const hasImages = beforeSrc.length > 0 && afterSrc.length > 0;
  const headingText =
    heading?.text != null ? heading.text.trim() : DEFAULT_SECTION_HEADING;
  const accentPhrase =
    heading?.accentPhrase != null ? heading.accentPhrase.trim() : DEFAULT_ACCENT_PHRASE;
  const accentColors = resolveAccentColors(heading);
  const headingResolved = {
    ...resolveHeadingTypography({ ...heading, text: headingText }),
    fontSize: resolveImageComparisonHeadingFontSize(
      heading?.fontSize,
      heading?.fontSizeMobile,
    ),
    emphasisColor: accentColors.emphasisColor,
  };
  const headingParts = splitHeadingAroundAccent(headingText, accentPhrase);

  if (!hasImages) {
    return null;
  }

  const positionStyle = {
    '--comparison-position': `${position.toFixed(2)}%`,
  } as CSSProperties;

  const afterClipStyle: CSSProperties = {
    clipPath: `inset(0 0 0 ${position.toFixed(2)}%)`,
    WebkitClipPath: `inset(0 0 0 ${position.toFixed(2)}%)`,
  };

  const dividerStyle: CSSProperties = {
    left: `${position.toFixed(2)}%`,
  };

  return (
    <div
      className={clsx('archive-image-comparison', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div
        className="shopify-section"
        id={ARCHIVE_IMAGE_COMPARISON_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <style dangerouslySetInnerHTML={{ __html: ratioVarsCss }} />
        <div
          className={clsx('section section--padding', roundedTop && 'section--rounded')}
          style={sectionBackgroundStyle}
        >
          <div className="page-width relative">
            {headingText.length > 0 ? (
              <h2 className="title-wrapper heading tracking-heading mb-8 text-center md:mb-12">
                <AccentSplitWordsHeading
                  accentColors={heading}
                  animate="fade-up-large"
                  emphasis={headingParts.emphasis}
                  emphasisColor={headingResolved.emphasisColor}
                  emphasisFontSize={headingResolved.fontSize}
                  highlightStyle="text"
                  lead={headingParts.lead}
                  leadColor={headingResolved.color}
                  leadFontSize={headingResolved.fontSize}
                  trail={headingParts.trail}
                />
              </h2>
            ) : null}
            <ScrollReveal delayMs={100}>
              <div
                ref={setComparisonContainerRef}
                aria-label="Image comparison"
                className={clsx(
                  'image-comparison relative w-full overflow-hidden select-none',
                  isEntranceAnimating && 'image-comparison--entrance',
                )}
                onPointerDown={handleContainerPointerDown}
                role="group"
                style={
                  {
                    ...positionStyle,
                    paddingBottom: 'var(--ratio-percent,40%)',
                    touchAction: 'pan-y',
                  } as CSSProperties
                }
              >
              {/* Before (base) image */}
              <picture className="absolute inset-0 block h-full w-full">
                <img
                  alt={beforeImage?.imageAlt?.trim() ?? ''}
                  className="block h-full w-full object-cover"
                  decoding="async"
                  draggable={false}
                  loading="lazy"
                  src={beforeSrc}
                  style={{ objectPosition: beforeObjectPosition }}
                />
              </picture>

              {/* After image, clipped from the left to expose the before image. */}
              <picture
                aria-hidden="true"
                className="absolute inset-0 block h-full w-full"
                style={afterClipStyle}
              >
                <img
                  alt={afterImage?.imageAlt?.trim() ?? ''}
                  className="block h-full w-full object-cover"
                  decoding="async"
                  draggable={false}
                  loading="lazy"
                  src={afterSrc}
                  style={{ objectPosition: afterObjectPosition }}
                />
              </picture>

              <span
                aria-hidden="true"
                className="image-comparison__divider pointer-events-none absolute top-0 z-10 block h-full -translate-x-1/2"
                onTransitionEnd={handleDividerTransitionEnd}
                style={dividerStyle}
              />

              <button
                aria-controls={`archive-image-comparison-${handleId}`}
                aria-label="Drag to compare images"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(position)}
                className="image-comparison__handle absolute top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 active:scale-[0.98]"
                id={`archive-image-comparison-${handleId}`}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                role="slider"
                style={dividerStyle}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="image-comparison__grip flex items-center justify-center gap-[3px]"
                >
                  <span />
                  <span />
                  <span />
                </span>
              </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
