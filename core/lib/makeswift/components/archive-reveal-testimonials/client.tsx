'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate/scroll-reveal';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate/split-words-heading';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID,
  ARCHIVE_REVEAL_TESTIMONIALS_VARS,
} from './archive-styles';

export type ArchiveTestimonialItemProps = {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: unknown;
  /** Parallax start offset (px). Positive values translate the card downward at scroll start. */
  parallaxStartPx?: number;
  /** Parallax stop offset (px). Negative values translate upward as the user scrolls past. */
  parallaxStopPx?: number;
};

export interface ArchiveRevealTestimonialsProps {
  className?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingWithHighlightProps;
  bodyText?: BodyTextProps;
  items?: ArchiveTestimonialItemProps[];
  /** Max width of the testimonials column (px). Defaults to 720. */
  columnMaxWidthPx?: number;
  /** Vertical gap between cards on desktop (px). Defaults to 40. */
  desktopGapPx?: number;
  /** Vertical gap on mobile (px). Defaults to 16. */
  mobileGapPx?: number;
  /** Disable parallax (defaults to enabled). Useful for accessibility / preview. */
  disableParallax?: boolean;
}

const DEFAULT_HEADING = 'What people are saying';
const DEFAULT_QUOTES: ArchiveTestimonialItemProps[] = [
  {
    quote: 'Add customer reviews and testimonials to showcase your store’s happy customers.',
    author: 'Author’s name',
    parallaxStartPx: 0,
    parallaxStopPx: 0,
  },
  {
    quote: 'Add customer reviews and testimonials to showcase your store’s happy customers.',
    author: 'Author’s name',
    parallaxStartPx: 60,
    parallaxStopPx: -40,
  },
  {
    quote: 'Add customer reviews and testimonials to showcase your store’s happy customers.',
    author: 'Author’s name',
    parallaxStartPx: 40,
    parallaxStopPx: -20,
  },
  {
    quote: 'Add customer reviews and testimonials to showcase your store’s happy customers.',
    author: 'Author’s name',
    parallaxStartPx: 0,
    parallaxStopPx: 0,
  },
];

function clampPx(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value < 0) {
    return fallback;
  }

  return Math.round(value);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Hook: returns a per-element scroll progress (0–1) where 0 = card top hits
 * viewport bottom and 1 = card bottom leaves viewport top. Throttled with rAF
 * for smoothness. SSR-safe (returns 0 server-side and on first paint).
 */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);

  const update = useCallback(() => {
    frameRef.current = null;
    const el = ref.current;

    if (el == null || typeof window === 'undefined') {
      return;
    }

    const rect = el.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const total = rect.height + viewport;
    const elapsed = viewport - rect.top;
    const raw = total > 0 ? elapsed / total : 0;
    const clamped = Math.min(1, Math.max(0, raw));

    setProgress(clamped);
  }, [ref]);

  const schedule = useCallback(() => {
    if (frameRef.current != null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);

      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [schedule]);

  return progress;
}

function TestimonialCard({
  item,
  index,
  disableParallax,
  bodyColor,
}: {
  item: ArchiveTestimonialItemProps;
  index: number;
  disableParallax: boolean;
  bodyColor: string | undefined;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const progress = useScrollProgress(ref);
  const start = item.parallaxStartPx ?? 0;
  const stop = item.parallaxStopPx ?? 0;
  const translateY = disableParallax ? 0 : lerp(start, stop, progress);
  const avatarSrc = resolveMakeswiftImageSrc(item.avatar);
  const quote = item.quote?.trim() ?? '';
  const author = item.author?.trim() ?? '';
  const role = item.role?.trim() ?? '';

  if (quote.length === 0 && author.length === 0) {
    return null;
  }

  const cardStyle: CSSProperties = {
    transform: `translate3d(0, ${translateY.toFixed(2)}px, 0)`,
    willChange: disableParallax ? undefined : 'transform',
    color: bodyColor,
  };

  return (
    <ScrollReveal
      animate="fade-up"
      className="testimonial with-quote w-full"
      delayMs={index * 80}
    >
      <div ref={ref} style={cardStyle}>
        <blockquote className="m-0 rounded-2xl bg-white/85 p-6 backdrop-blur-sm md:p-8 shadow-sm">
          {(author.length > 0 || avatarSrc.length > 0) && (
            <div className="mb-4 flex items-center gap-4 md:gap-6">
              {avatarSrc.length > 0 ? (
                <img
                  alt={author.length > 0 ? author : ''}
                  className="block h-12 w-12 shrink-0 rounded-full object-cover md:h-16 md:w-16"
                  decoding="async"
                  loading="lazy"
                  src={avatarSrc}
                />
              ) : null}
              <div className="flex grow flex-col">
                {author.length > 0 ? (
                  <cite className="not-italic text-base md:text-2xl font-medium leading-tight">
                    {author}
                  </cite>
                ) : null}
                {role.length > 0 ? (
                  <span className="text-sm opacity-70 md:text-base">{role}</span>
                ) : null}
              </div>
            </div>
          )}
          {quote.length > 0 ? (
            <p className="m-0 text-base leading-relaxed md:text-lg">{quote}</p>
          ) : null}
        </blockquote>
      </div>
    </ScrollReveal>
  );
}

export function ArchiveRevealTestimonials({
  className,
  background,
  heading,
  bodyText,
  items,
  columnMaxWidthPx,
  desktopGapPx,
  mobileGapPx,
  disableParallax = false,
}: ArchiveRevealTestimonialsProps) {
  const resolvedItems = useMemo(() => {
    const trimmed = (items ?? []).filter((item) => {
      const q = item.quote?.trim() ?? '';
      const a = item.author?.trim() ?? '';

      return q.length > 0 || a.length > 0;
    });

    return trimmed.length > 0 ? trimmed : DEFAULT_QUOTES;
  }, [items]);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID,
    sectionCss: ARCHIVE_REVEAL_TESTIMONIALS_VARS,
    background,
    highlight: heading,
    defaultBackgroundChannels: '142 165 141',
  });

  const headingText = heading?.text?.trim() ?? DEFAULT_HEADING;
  const bodyColor = resolveBodyTextColor(bodyText);
  const columnMaxWidth = clampPx(columnMaxWidthPx, 720);
  const desktopGap = clampPx(desktopGapPx, 40);
  const mobileGap = clampPx(mobileGapPx, 16);

  return (
    <div
      className={clsx('archive-reveal-testimonials', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div
        className="shopify-section"
        id={ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding">
          <div className="page-width relative">
            {headingText.length > 0 ? (
              <h2 className="testimonials-title title-wrapper mb-10 md:mb-14 text-center">
                <SplitWordsHeading
                  accentPhrase={heading?.accentPhrase}
                  animate="fade-up-large"
                  className="heading title-lg tracking-heading inline-block"
                  emphasisColor={heading?.textColorHex}
                  text={headingText}
                />
              </h2>
            ) : null}
            <div className="flex justify-center">
              <div
                className="reveal-testimonials rte relative z-1 flex w-full flex-col"
                style={
                  {
                    maxWidth: `${String(columnMaxWidth)}px`,
                    rowGap: `${String(mobileGap)}px`,
                  } as CSSProperties
                }
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `@media screen and (min-width:768px){#${ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID} .reveal-testimonials{row-gap:${String(desktopGap)}px}}`,
                  }}
                />
                {resolvedItems.map((item, index) => (
                  <TestimonialCard
                    bodyColor={bodyColor}
                    disableParallax={disableParallax}
                    index={index}
                    item={item}
                    key={`testimonial-${String(index)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
