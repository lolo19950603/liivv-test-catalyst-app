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
} from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate/split-words-heading';
import {
  buildSectionTheme,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  ARCHIVE_IMAGE_COMPARISON_SECTION_ID,
  ARCHIVE_IMAGE_COMPARISON_VARS,
} from './archive-styles';

export interface ArchiveImageComparisonProps {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingWithHighlightProps;
  beforeImage?: unknown;
  beforeImageAlt?: string;
  beforeLabel?: string;
  afterImage?: unknown;
  afterImageAlt?: string;
  afterLabel?: string;
  /** Initial divider position (0–100). Defaults to 50. */
  initialPosition?: number;
  /** Aspect ratio (height ÷ width × 100) on desktop. Defaults to ~56.25 (16:9). */
  desktopRatioPercent?: number;
  /** Aspect ratio on mobile. Defaults to match desktop. */
  mobileRatioPercent?: number;
  /** Show before/after pill labels (default true). */
  showLabels?: boolean;
}

const DEFAULT_POSITION = 50;
const DEFAULT_RATIO = 56.25;
const KEYBOARD_STEP = 2;

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

function DragIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 6l-4 6 4 6" />
      <path d="M15 6l4 6-4 6" />
    </svg>
  );
}

export function ArchiveImageComparison({
  className,
  background,
  heading,
  beforeImage,
  beforeImageAlt,
  beforeLabel = 'Before',
  afterImage,
  afterImageAlt,
  afterLabel = 'After',
  initialPosition,
  desktopRatioPercent,
  mobileRatioPercent,
  showLabels = true,
}: ArchiveImageComparisonProps) {
  const [position, setPosition] = useState(() => clampPercent(initialPosition, DEFAULT_POSITION));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const handleId = useId().replace(/:/g, '');

  const beforeSrc = resolveMakeswiftImageSrc(beforeImage);
  const afterSrc = resolveMakeswiftImageSrc(afterImage);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: ARCHIVE_IMAGE_COMPARISON_SECTION_ID,
    sectionCss: ARCHIVE_IMAGE_COMPARISON_VARS,
    background,
    highlight: heading,
    defaultBackgroundChannels: '168 156 148',
  });

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

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
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

      updateFromClientX(event.clientX);
    },
    [updateFromClientX],
  );

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
  }, []);

  useEffect(() => {
    setPosition(clampPercent(initialPosition, DEFAULT_POSITION));
  }, [initialPosition]);

  const hasImages = beforeSrc.length > 0 && afterSrc.length > 0;
  const headingText = heading?.text?.trim() ?? '';

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
        <div className="section section--padding">
          <div className="page-width relative">
            {headingText.length > 0 ? (
              <h2 className="title-wrapper mb-8 text-center md:mb-12">
                <SplitWordsHeading
                  accentPhrase={heading?.accentPhrase}
                  animate="fade-up-large"
                  className="heading title-sm tracking-heading inline-block"
                  emphasisColor={heading?.textColorHex}
                  text={headingText}
                />
              </h2>
            ) : null}
            <div
              ref={containerRef}
              aria-label="Image comparison"
              className="image-comparison relative w-full overflow-hidden rounded-2xl select-none"
              onPointerDown={handleContainerPointerDown}
              role="group"
              style={
                {
                  ...positionStyle,
                  paddingBottom: 'var(--ratio-percent,56.25%)',
                  touchAction: 'pan-y',
                } as CSSProperties
              }
            >
              {/* Before (base) image */}
              <picture className="absolute inset-0 block h-full w-full">
                <img
                  alt={beforeImageAlt?.trim() ?? ''}
                  className="block h-full w-full object-cover"
                  decoding="async"
                  draggable={false}
                  loading="lazy"
                  src={beforeSrc}
                />
              </picture>

              {/* After image, clipped from the left to expose the before image. */}
              <picture
                aria-hidden="true"
                className="absolute inset-0 block h-full w-full"
                style={afterClipStyle}
              >
                <img
                  alt={afterImageAlt?.trim() ?? ''}
                  className="block h-full w-full object-cover"
                  decoding="async"
                  draggable={false}
                  loading="lazy"
                  src={afterSrc}
                />
              </picture>

              {showLabels ? (
                <>
                  <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white md:left-4 md:top-4 md:text-sm">
                    {beforeLabel}
                  </span>
                  <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white md:right-4 md:top-4 md:text-sm">
                    {afterLabel}
                  </span>
                </>
              ) : null}

              {/* Vertical divider line. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 z-10 block h-full w-px -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                style={dividerStyle}
              />

              {/* Drag handle button. */}
              <button
                aria-controls={`archive-image-comparison-${handleId}`}
                aria-label="Drag to compare images"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={Math.round(position)}
                className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 cursor-ew-resize items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg ring-1 ring-black/5 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/0 focus:ring-neutral-700 active:scale-95 md:h-14 md:w-14"
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
                <DragIcon className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
