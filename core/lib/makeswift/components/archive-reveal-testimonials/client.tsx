'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate/split-words-heading';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  ARCHIVE_REVEAL_TESTIMONIALS_BACKGROUND,
  ARCHIVE_REVEAL_TESTIMONIALS_SECTION_ID,
  ARCHIVE_REVEAL_TESTIMONIALS_VARS,
} from './archive-styles';

export type ArchiveTestimonialItemProps = {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: unknown;
  parallaxStartPx?: number;
  parallaxStopPx?: number;
};

export interface ArchiveRevealTestimonialsProps {
  className?: string;
  background?: SectionBackgroundProps;
  primaryHeading?: HeadingWithHighlightProps;
  secondaryHeading?: HeadingWithHighlightProps;
  items?: ArchiveTestimonialItemProps[];
  disableParallax?: boolean;
  roundedTop?: boolean;
  /** @deprecated Legacy single heading; split into line 1 + line 2 when set. */
  heading?: HeadingWithHighlightProps;
}

const DEFAULT_LINE_1 = 'What people';
const DEFAULT_LINE_2 = 'are saying';
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

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

    setProgress(Math.min(1, Math.max(0, raw)));
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

function resolveTitleLines(props: ArchiveRevealTestimonialsProps): {
  line1: string;
  line2: string;
} {
  const legacy = props.heading?.text?.trim();

  if (legacy != null && legacy.length > 0) {
    const lower = legacy.toLowerCase();
    const splitAt = lower.indexOf(' are ');

    if (splitAt > 0) {
      return {
        line1: legacy.slice(0, splitAt).trim(),
        line2: legacy.slice(splitAt + 1).trim(),
      };
    }
  }

  const line1 = props.primaryHeading?.text?.trim();
  const line2 = props.secondaryHeading?.text?.trim();

  return {
    line1: line1 != null && line1.length > 0 ? line1 : DEFAULT_LINE_1,
    line2: line2 != null && line2.length > 0 ? line2 : DEFAULT_LINE_2,
  };
}

function TestimonialsSplitTitle({
  line1,
  line2,
  line1Resolved,
  line2Resolved,
}: {
  line1: string;
  line2: string;
  line1Resolved: ReturnType<typeof resolveHeadingTypography>;
  line2Resolved: ReturnType<typeof resolveHeadingTypography>;
}) {
  return (
    <span
      className="split-words heading title-lg tracking-heading words splitting md:flex md:w-full md:justify-between"
      data-animate="fade-up-large"
    >
      <SplitWordsHeading
        animate="fade-up-large"
        className="inline"
        leadColor={line1Resolved.color}
        leadFontSize={line1Resolved.fontSize}
        text={line1}
      />
      {line2.length > 0 ? (
        <>
          <span aria-hidden className="whitespace inline-block" />
          <SplitWordsHeading
            animate="fade-up-large"
            className="inline"
            leadColor={line2Resolved.color}
            leadFontSize={line2Resolved.fontSize}
            text={line2}
          />
        </>
      ) : null}
    </span>
  );
}

function TestimonialCard({
  item,
  disableParallax,
}: {
  item: ArchiveTestimonialItemProps;
  disableParallax: boolean;
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
  };

  return (
    <div className="testimonial with-quote w-full" ref={ref} style={cardStyle}>
      <blockquote>
        {(author.length > 0 || avatarSrc.length > 0) && (
          <div className="flex items-center gap-4 md:gap-6">
            {avatarSrc.length > 0 ? (
              <figure className="m-0 shrink-0">
                <img
                  alt={author.length > 0 ? author : ''}
                  className="block h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
                  decoding="async"
                  loading="lazy"
                  src={avatarSrc}
                />
              </figure>
            ) : null}
            {author.length > 0 ? (
              <cite className="text-base-2xl grow shrink not-italic">{author}</cite>
            ) : null}
          </div>
        )}
        {role.length > 0 ? <p className="m-0 text-sm opacity-80 md:text-base">{role}</p> : null}
        {quote.length > 0 ? <p>{quote}</p> : null}
      </blockquote>
    </div>
  );
}

export function ArchiveRevealTestimonials({
  className,
  background,
  primaryHeading,
  secondaryHeading,
  heading,
  items,
  disableParallax = false,
  roundedTop = true,
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
    defaultBackgroundChannels: ARCHIVE_REVEAL_TESTIMONIALS_BACKGROUND,
  });

  const { line1, line2 } = resolveTitleLines({ heading, primaryHeading, secondaryHeading });
  const line1Resolved = resolveHeadingTypography(primaryHeading ?? heading);
  const line2Resolved = resolveHeadingTypography(secondaryHeading);

  const sectionBackgroundStyle: CSSProperties | undefined =
    sectionStyle['--color-background'] != null
      ? ({
          '--color-background': sectionStyle['--color-background'],
          backgroundColor: `rgb(${String(sectionStyle['--color-background'])})`,
        } as CSSProperties)
      : undefined;

  const showTitle = line1.length > 0 || line2.length > 0;

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
        <div
          className={clsx('section section--padding', roundedTop && 'section--rounded')}
          style={sectionBackgroundStyle}
        >
          <div className="page-width relative">
            {showTitle ? (
              <h2 className="testimonials-title title-wrapper">
                <TestimonialsSplitTitle
                  line1={line1}
                  line1Resolved={line1Resolved}
                  line2={line2}
                  line2Resolved={line2Resolved}
                />
              </h2>
            ) : null}
            <div className="flex justify-center">
              <div className="reveal-testimonials relative z-1 grid gap-4 md:gap-10 rte">
                {resolvedItems.map((item, index) => (
                  <TestimonialCard
                    disableParallax={disableParallax}
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
