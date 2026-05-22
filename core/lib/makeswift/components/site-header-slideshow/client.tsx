'use client';

import { clsx } from 'clsx';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';

type ContentWidth = 'small' | 'medium' | 'large' | 'full';
type ImageAlignX = 'left' | 'center' | 'right';
type ImageAlignY = 'top' | 'center' | 'bottom';

export type SiteHeaderSlideshowSlide = {
  image?: string;
  imageAlt?: string;
  imageAlignX?: ImageAlignX;
  imageAlignY?: ImageAlignY;
  /** @deprecated Nested image group from earlier registration. */
  imageMedia?: {
    image?: string;
    imageAlt?: string;
    imageAlignX?: ImageAlignX;
    imageAlignY?: ImageAlignY;
  };
};

export interface SiteHeaderSlideshowProps {
  className?: string;
  slides?: SiteHeaderSlideshowSlide[];
  autoplay?: boolean;
  interval?: number;
  desktopHeight?: number;
  desktopContentWidth?: ContentWidth;
  mobileLayout?: {
    mobileHeight?: number;
    mobileContentWidth?: ContentWidth;
  };
}

const MOBILE_CONTENT_WIDTH_CLASS: Record<ContentWidth, string> = {
  small: 'max-md:mx-auto max-md:max-w-[45rem]',
  medium: 'max-md:mx-auto max-md:max-w-[64rem]',
  large: 'max-md:mx-auto max-md:max-w-[80rem]',
  full: '',
};

const DESKTOP_CONTENT_WIDTH_CLASS: Record<ContentWidth, string> = {
  small: 'md:mx-auto md:max-w-[45rem]',
  medium: 'md:mx-auto md:max-w-[64rem]',
  large: 'md:mx-auto md:max-w-[80rem]',
  full: '',
};

function parseContentWidth(value: ContentWidth | undefined, fallback: ContentWidth): ContentWidth {
  if (
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'full'
  ) {
    return value;
  }

  return fallback;
}

function parseHeightPx(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value <= 0) {
    return fallback;
  }

  return Math.round(value);
}

function toObjectPosition(
  alignX: ImageAlignX | undefined,
  alignY: ImageAlignY | undefined,
): string {
  const x = alignX === 'left' || alignX === 'right' ? alignX : 'center';
  const y = alignY === 'top' || alignY === 'bottom' ? alignY : 'center';

  return `${x} ${y}`;
}

function normalizeSlide(slide: SiteHeaderSlideshowSlide): SiteHeaderSlideshowSlide | null {
  const image = slide.image?.trim() ?? slide.imageMedia?.image?.trim() ?? '';

  if (image.length === 0) {
    return null;
  }

  return {
    image,
    imageAlt: slide.imageAlt ?? slide.imageMedia?.imageAlt,
    imageAlignX: slide.imageAlignX ?? slide.imageMedia?.imageAlignX,
    imageAlignY: slide.imageAlignY ?? slide.imageMedia?.imageAlignY,
  };
}

export function SiteHeaderSlideshow({
  className,
  slides = [],
  autoplay = true,
  interval = 5,
  desktopHeight = 450,
  desktopContentWidth = 'large',
  mobileLayout,
}: SiteHeaderSlideshowProps) {
  const validSlides = slides.map(normalizeSlide).filter((slide): slide is SiteHeaderSlideshowSlide => slide != null);
  const desktopPx = parseHeightPx(desktopHeight, 450);
  const mobilePx = parseHeightPx(mobileLayout?.mobileHeight, 200);
  const desktopWidthKey = parseContentWidth(desktopContentWidth, 'large');
  const mobileWidthKey = parseContentWidth(mobileLayout?.mobileContentWidth, 'full');
  const intervalMs = Math.max(1, interval) * 1000;
  const hasMultiple = validSlides.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultiple, duration: 20 },
    hasMultiple
      ? [Autoplay({ delay: intervalMs, active: autoplay }), Fade()]
      : [],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedSnap());
  }, [emblaApi]);

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

  const sectionStyle = {
    '--site-header-slideshow-height-mobile': `${String(mobilePx)}px`,
    '--site-header-slideshow-height-desktop': `${String(desktopPx)}px`,
  } as CSSProperties;

  if (validSlides.length === 0) {
    return null;
  }

  const slideTrack = validSlides.map((slide, index) => (
    <div
      className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
      key={`${slide.image}-${index}`}
    >
      <img
        alt={slide.imageAlt?.trim() ?? ''}
        className="absolute inset-0 block h-full w-full object-cover"
        decoding="async"
        fetchPriority={index === 0 ? 'high' : 'auto'}
        loading={index === 0 ? 'eager' : 'lazy'}
        src={slide.image}
        style={{ objectPosition: toObjectPosition(slide.imageAlignX, slide.imageAlignY) }}
      />
    </div>
  ));

  const trackWidthClass = clsx(
    MOBILE_CONTENT_WIDTH_CLASS[mobileWidthKey],
    DESKTOP_CONTENT_WIDTH_CLASS[desktopWidthKey],
  );

  return (
    <section
      className={clsx(
        'site-header-slideshow w-full min-w-0 overflow-hidden bg-neutral-950',
        'h-[var(--site-header-slideshow-height-mobile)] md:h-[var(--site-header-slideshow-height-desktop)]',
        className,
      )}
      style={sectionStyle}
    >
      <div className={clsx('relative h-full w-full', trackWidthClass)}>
        {hasMultiple ? (
          <div className="h-full w-full overflow-hidden" ref={emblaRef}>
            <div className="flex h-full w-full">{slideTrack}</div>
          </div>
        ) : (
          <div className="relative h-full w-full">{slideTrack[0]}</div>
        )}

        {hasMultiple ? (
          <div
            aria-label="Slideshow pagination"
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2"
            role="tablist"
          >
            {validSlides.map((_, index) => (
              <button
                aria-label={`Go to slide ${index + 1}`}
                aria-selected={selectedIndex === index}
                className={clsx(
                  'h-2 w-2 rounded-full transition-opacity',
                  selectedIndex === index ? 'bg-white opacity-100' : 'bg-white/50 hover:bg-white/75',
                )}
                key={index}
                onClick={() => emblaApi?.goTo(index)}
                role="tab"
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
