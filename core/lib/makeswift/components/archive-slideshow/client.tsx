'use client';

import { clsx } from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import { ARCHIVE_SLIDESHOW_SECTION_ID, ARCHIVE_SLIDESHOW_VARS } from './archive-styles';

type ImageAlignX = 'left' | 'center' | 'right';
type ImageAlignY = 'top' | 'center' | 'bottom';

export type ArchiveSlideshowSlide = {
  image?: unknown;
  imageAlt?: string;
  imageAlignX?: ImageAlignX;
  imageAlignY?: ImageAlignY;
};

export interface ArchiveSlideshowProps {
  className?: string;
  background?: SectionBackgroundProps;
  slides?: ArchiveSlideshowSlide[];
  autoplay?: boolean;
  interval?: number;
  desktopHeight?: number;
  mobileHeight?: number;
  showArrows?: boolean;
  showPausePlay?: boolean;
  /**
   * Renamed from the original `showDots` after legacy snapshots persisted
   * `showDots: false` and refused to honour code-side defaults. Using a fresh
   * prop name lets the new default (`true`) actually apply.
   */
  paginationVisible?: boolean;
}

/**
 * Fixed per-side peek of the next/previous slide, expressed as a fraction of
 * the carousel width. 2.5 % per side shows a thin sliver of the neighbour
 * without intruding on the active slide.
 */
const FIXED_PEEK_FRACTION = 0.025;

type ResolvedSlide = {
  src: string;
  alt: string;
  objectPosition: string;
};

function clampPx(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function toObjectPosition(alignX: ImageAlignX | undefined, alignY: ImageAlignY | undefined): string {
  const x = alignX === 'left' || alignX === 'right' ? alignX : 'center';
  const y = alignY === 'top' || alignY === 'bottom' ? alignY : 'center';

  return `${x} ${y}`;
}

function resolveSlides(slides: ArchiveSlideshowSlide[] | undefined): ResolvedSlide[] {
  if (slides == null) {
    return [];
  }

  return slides.flatMap((slide) => {
    const src = resolveMakeswiftImageSrc(slide.image);

    if (src.length === 0) {
      return [];
    }

    return [
      {
        src,
        alt: slide.imageAlt?.trim() ?? '',
        objectPosition: toObjectPosition(slide.imageAlignX, slide.imageAlignY),
      },
    ];
  });
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      className={clsx('h-4 w-4 md:h-5 md:w-5', direction === 'left' && 'rotate-180')}
      fill="none"
      role="presentation"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
      role="presentation"
      viewBox="0 0 12 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="14" rx="1" width="3" x="0" />
      <rect height="14" rx="1" width="3" x="8" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
      role="presentation"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 1.2v11.6c0 .9 1 1.5 1.8 1L13 7.9c.7-.4.7-1.5 0-1.9L3.8.2C3 -.2 2 .3 2 1.2z" />
    </svg>
  );
}

/**
 * Pagination dots, rendered with inline styles so:
 *  - Tailwind PurgeCSS / arbitrary value compilation can never strip them.
 *  - The exact pixel sizes are independent of the surrounding strip layout.
 *  - High-contrast colours (solid white active + dark glass inactive +
 *    drop shadow) survive any underlying image without needing a backdrop.
 */
function SlideshowDots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <div
      aria-label="Slideshow pagination"
      className="flex items-center"
      role="tablist"
      style={{ columnGap: 10 }}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = activeIndex === index;
        // Active = hollow ring at 8 px, inactive = smaller solid pellets at
        // 5 px. Flex `items-center` on the parent keeps them vertically
        // centred despite the size delta.
        const size = isActive ? 8 : 5;

        return (
          <button
            aria-label={`Go to slide ${String(index + 1)}`}
            aria-selected={isActive}
            key={index}
            onClick={() => onSelect(index)}
            role="tab"
            style={{
              display: 'block',
              width: size,
              height: size,
              padding: 0,
              border: isActive ? '2px solid rgb(255 255 255)' : 'none',
              borderRadius: '9999px',
              background: isActive ? 'transparent' : 'rgb(255 255 255)',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, width 0.2s ease, height 0.2s ease',
            }}
            type="button"
          />
        );
      })}
    </div>
  );
}

export function ArchiveSlideshow({
  className,
  background,
  slides,
  autoplay = true,
  interval = 5,
  desktopHeight = 500,
  mobileHeight = 360,
  showArrows = true,
  showPausePlay = false,
  paginationVisible = true,
}: ArchiveSlideshowProps) {
  const resolvedSlides = resolveSlides(slides);
  const desktopPx = clampPx(desktopHeight, 500);
  const mobilePx = clampPx(mobileHeight, 360);
  const intervalMs = Math.max(1, interval) * 1000;
  const hasMultiple = resolvedSlides.length > 1;
  const autoplayPluginRef = useRef(Autoplay({ delay: intervalMs }));

  // Embla v9's loop algorithm needs more than 2 slides to clone cleanly at
  // the edges; with exactly 2 it stalls / freezes. We duplicate the source
  // array so Embla sees 4 physical slides (A B A B), but the dot count + the
  // active dot index stay mapped to the 2 originals.
  const originalCount = resolvedSlides.length;
  const displaySlides =
    originalCount === 2 ? [...resolvedSlides, ...resolvedSlides] : resolvedSlides;

  // Per-side peek is fixed (no longer editor-tunable). Peek is applied only
  // when there are 3+ physical slides — which includes the duplicated
  // 2-original case — since Embla needs neighbours to peek into.
  const peekEligible = displaySlides.length >= 3;
  const peekFraction = peekEligible ? FIXED_PEEK_FRACTION : 0;
  const slideBasisPct = (1 - peekFraction * 2) * 100;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: hasMultiple,
      duration: 25,
      align: peekFraction > 0 ? 'center' : 'start',
      containScroll: peekFraction > 0 ? false : 'trimSnaps',
    },
    hasMultiple ? [autoplayPluginRef.current] : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    const physicalIndex = emblaApi.selectedSnap();
    // Map the duplicated-slide index back onto the 0..originalCount-1 range
    // so dots and ARIA stay correct for the user's perceived slide count.
    setSelectedIndex(originalCount > 0 ? physicalIndex % originalCount : 0);
  }, [emblaApi, originalCount]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect();
    emblaApi.on('select', onSelect).on('reinit', onSelect);

    return () => {
      emblaApi.off('select', onSelect).off('reinit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync autoplay state with the prop. Embla v9 starts the plugin
  // automatically on init, so we have to stop it explicitly when the
  // editor flips `autoplay` off. Gated on `hasMultiple` because the plugin
  // is only attached to the carousel for multi-slide mode — calling
  // `play()` / `stop()` on an unattached plugin reads from uninitialized
  // internal state and throws.
  useEffect(() => {
    if (!hasMultiple || emblaApi == null) {
      return;
    }

    const plugin = emblaApi.plugins().autoplay;

    if (plugin == null) {
      return;
    }

    if (autoplay) {
      plugin.play();
      setIsPlaying(true);
    } else {
      plugin.stop();
      setIsPlaying(false);
    }
  }, [autoplay, emblaApi, hasMultiple]);

  const onTogglePause = useCallback(() => {
    if (emblaApi == null) {
      return;
    }

    const plugin = emblaApi.plugins().autoplay;

    if (plugin == null) {
      return;
    }

    if (isPlaying) {
      plugin.stop();
      setIsPlaying(false);
    } else {
      plugin.play();
      setIsPlaying(true);
    }
  }, [emblaApi, isPlaying]);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: ARCHIVE_SLIDESHOW_SECTION_ID,
    sectionCss: ARCHIVE_SLIDESHOW_VARS,
    background,
    highlight: null,
    defaultBackgroundChannels: '0 0% 100%',
  });

  if (resolvedSlides.length === 0) {
    return null;
  }

  const heightVarsStyle = {
    '--archive-slideshow-height-mobile': `${String(mobilePx)}px`,
    '--archive-slideshow-height-desktop': `${String(desktopPx)}px`,
  } as CSSProperties;

  return (
    <div
      className={clsx(
        'archive-slideshow',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div
        className="shopify-section"
        id={ARCHIVE_SLIDESHOW_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding">
          <div style={heightVarsStyle}>
            <div
              aria-label="Slideshow"
              aria-roledescription="Carousel"
              className={clsx(
                // `relative` is on the slideshow region itself so absolutely
                // positioned controls below are anchored to the exact image
                // bounds — never to an outer wrapper that might pick up
                // section padding or other vertical bleed.
                'slideshow relative block w-full overflow-hidden',
                'h-[var(--archive-slideshow-height-mobile)] md:h-[var(--archive-slideshow-height-desktop)]',
              )}
              role="region"
            >
              <div className="h-full w-full" ref={emblaRef}>
                <div className="flex h-full w-full">
                  {displaySlides.map((slide, index) => {
                    const originalIndex =
                      originalCount > 0 ? index % originalCount : 0;
                    const isActive = selectedIndex === originalIndex;

                    return (
                      <div
                        aria-hidden={isActive ? undefined : true}
                        aria-label={`Slide ${String(originalIndex + 1)} of ${String(originalCount)}`}
                        className="banner media--500px relative h-full min-w-0 shrink-0 grow-0"
                        key={`${slide.src}-${index}`}
                        role="group"
                        // Horizontal padding on each slide produces a guaranteed
                        // visible gap between adjacent slides (16px between
                        // neighbours = 8px on each side). Using padding instead
                        // of flex `gap` keeps the spacing consistent across
                        // Embla's loop seam, where `gap` can collapse between
                        // the last duplicated slide and the wrapped clone.
                        style={{
                          flexBasis: `${slideBasisPct.toFixed(2)}%`,
                          ...(hasMultiple
                            ? { paddingInline: '8px', boxSizing: 'border-box' }
                            : null),
                        }}
                      >
                        <picture className="media media--height relative block h-full w-full overflow-hidden rounded-3xl">
                          <img
                            alt={slide.alt}
                            className="absolute inset-0 block h-full w-full object-cover"
                            decoding="async"
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            src={slide.src}
                            style={{ objectPosition: slide.objectPosition }}
                          />
                        </picture>
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasMultiple ? (
                <div
                  // Anchored to the slideshow region (which has the explicit
                  // image height + `overflow-hidden`), so the controls always
                  // render inside the image bounds regardless of any outer
                  // section padding. Side insets clear the `rounded-3xl`
                  // corner curve (24 px) and the 8 px per-slide padding.
                  className="pointer-events-none absolute bottom-6 left-0 right-0 z-10 px-10 md:bottom-10 md:px-14"
                  role="group"
                >
                  <div className="pointer-events-auto flex items-center justify-between gap-4 border-t border-white/80 py-3 md:py-4">
                    {showArrows ? (
                      <button
                        aria-controls={ARCHIVE_SLIDESHOW_SECTION_ID}
                        aria-label="Previous slide"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 md:h-10 md:w-10"
                        onClick={() => emblaApi?.goToPrev()}
                        type="button"
                      >
                        <ArrowIcon direction="left" />
                      </button>
                    ) : (
                      <span aria-hidden="true" className="h-8 w-8 md:h-10 md:w-10" />
                    )}

                    <div className="flex flex-1 items-center justify-center gap-3">
                      {paginationVisible ? (
                        <SlideshowDots
                          activeIndex={selectedIndex}
                          count={originalCount}
                          onSelect={(index) => emblaApi?.goTo(index)}
                        />
                      ) : null}
                      {showPausePlay ? (
                        <button
                          aria-controls={ARCHIVE_SLIDESHOW_SECTION_ID}
                          aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 md:h-9 md:w-9"
                          onClick={onTogglePause}
                          type="button"
                        >
                          {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                      ) : null}
                    </div>

                    {showArrows ? (
                      <button
                        aria-controls={ARCHIVE_SLIDESHOW_SECTION_ID}
                        aria-label="Next slide"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15 md:h-10 md:w-10"
                        onClick={() => emblaApi?.goToNext()}
                        type="button"
                      >
                        <ArrowIcon direction="right" />
                      </button>
                    ) : (
                      <span aria-hidden="true" className="h-8 w-8 md:h-10 md:w-10" />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
