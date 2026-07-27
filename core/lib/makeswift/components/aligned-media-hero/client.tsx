'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import {
  resolveTextAlign,
  textAlignClass,
  type TextAlign,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import { resolveCssColor } from '~/lib/makeswift/utils/archive-color';
import {
  type BodyTextProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

type VideoElementProps = ComponentPropsWithoutRef<'video'>;

function DeferredVideo(props: VideoElementProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div aria-hidden className="absolute inset-0 bg-black" suppressHydrationWarning />;
  }

  return <video {...props} suppressHydrationWarning />;
}

const MEDIA_COVER_CLASS = 'absolute inset-0 block h-full w-full object-cover';
const DEFAULT_BACKGROUND = '#43523f';

export type AlignedMediaHeroMediaProps = {
  image?: unknown;
  imageAlt?: string;
  objectPosition?: string;
  videoUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  showGradientOverlay?: boolean;
};

export type AlignedMediaHeroContentProps = BodyTextProps & {
  contentAlign?: string;
  eyebrow?: string;
  eyebrowTextColor?: string;
  eyebrowTextColorHex?: string;
  heading?: string;
  fontSize?: number;
  fontSizeMobile?: number;
  body?: string;
  bodyFontSize?: number;
  bodyFontSizeMobile?: number;
  bodyTextColor?: string;
  bodyTextColorHex?: string;
};

export type AlignedMediaHeroProps = {
  className?: string;
  roundedTop?: boolean;
  minHeightVh?: number;
  background?: SectionBackgroundProps;
  media?: AlignedMediaHeroMediaProps;
  content?: AlignedMediaHeroContentProps;
  primaryButton?: ArchiveButtonProps;
  secondaryButton?: ArchiveButtonProps;
};

function contentJustifyClass(align: TextAlign): string {
  if (align === 'left') {
    return 'justify-start';
  }

  if (align === 'right') {
    return 'justify-end';
  }

  return 'justify-center';
}

function contentBlockMarginClass(align: TextAlign): string {
  if (align === 'left') {
    return 'mr-auto';
  }

  if (align === 'right') {
    return 'ml-auto';
  }

  return 'mx-auto';
}

function mergeStyle(
  ...parts: Array<CSSProperties | undefined>
): CSSProperties | undefined {
  const merged = parts.reduce<CSSProperties>((acc, part) => {
    if (part == null) {
      return acc;
    }

    return { ...acc, ...part };
  }, {});

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function AlignedMediaHero({
  className,
  roundedTop = true,
  minHeightVh = 92,
  background,
  media,
  content,
  primaryButton,
  secondaryButton,
}: AlignedMediaHeroProps) {
  const imageSrc = resolveMakeswiftImageSrc(media?.image);
  const videoUrl = media?.videoUrl?.trim() ?? '';
  const hasVideo = videoUrl.length > 0;
  const hasImage = imageSrc.length > 0;
  const hasMedia = hasVideo || hasImage;
  const imageAlt = media?.imageAlt?.trim() || '';
  const objectPosition = media?.objectPosition?.trim() || '50% 50%';
  const autoplay = media?.autoplay ?? true;
  const muted = media?.muted ?? true;
  const loop = media?.loop ?? true;
  const playsInline = media?.playsInline ?? true;
  const effectiveMuted = autoplay ? true : Boolean(muted);
  const showGradientOverlay = media?.showGradientOverlay ?? hasMedia;

  const backgroundColor =
    resolveCssColor(background?.colorHex, background?.color) ?? DEFAULT_BACKGROUND;

  const align = resolveTextAlign(content?.contentAlign, 'left');
  const eyebrow = content?.eyebrow?.trim() ?? '';
  const heading = content?.heading?.trim() ?? '';
  const body = content?.body?.trim() ?? '';
  const headingFontSize = resolveHeadingFontSizeCss(content?.fontSize, content?.fontSizeMobile);
  const bodyFontSize = resolveHeadingFontSizeCss(
    content?.bodyFontSize,
    content?.bodyFontSizeMobile,
  );
  const eyebrowColor = resolvePlainTextColor({
    textColor: content?.eyebrowTextColor,
    textColorHex: content?.eyebrowTextColorHex,
  });
  const headingColor = resolvePlainTextColor({
    textColor: content?.textColor,
    textColorHex: content?.textColorHex,
  });
  const bodyColor = resolvePlainTextColor({
    textColor: content?.bodyTextColor ?? content?.textColor,
    textColorHex: content?.bodyTextColorHex ?? content?.textColorHex,
  });

  const primary = resolveArchiveButton(primaryButton, {
    defaultText: 'Pre-order Clair',
    requireHref: false,
  });
  const secondary = resolveArchiveButton(secondaryButton, {
    defaultText: 'How Clair Works',
    requireHref: false,
  });

  const heightStyle = {
    minHeight: `${Math.max(40, Math.min(100, minHeightVh ?? 92))}vh`,
  } satisfies CSSProperties;

  const mediaStyle = { objectPosition } satisfies CSSProperties;

  return (
    <section
      className={clsx(
        'aligned-media-hero relative w-full min-w-0 max-w-full overflow-hidden',
        DC_SECTION_ROOT_CLASS,
        roundedTop && 'section section--rounded',
        className,
      )}
      style={headingColor != null ? ({ color: headingColor } as CSSProperties) : { color: '#fff' }}
    >
      <div className="relative flex w-full items-end" style={heightStyle}>
        <div className="absolute inset-0" style={{ backgroundColor }}>
          {hasVideo ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <DeferredVideo
                autoPlay={autoplay}
                className={MEDIA_COVER_CLASS}
                loop={loop}
                muted={effectiveMuted}
                playsInline={playsInline}
                poster={imageSrc || undefined}
                preload="metadata"
                src={videoUrl}
                style={mediaStyle}
              />
            </>
          ) : hasImage ? (
            <img
              alt={imageAlt}
              className={MEDIA_COVER_CLASS}
              decoding="async"
              height={1400}
              src={imageSrc}
              style={mediaStyle}
              width={2400}
            />
          ) : null}
          {showGradientOverlay ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top,' +
                  'rgba(20, 18, 16, 0.62) 0%,' +
                  'rgba(20, 18, 16, 0.42) 26%,' +
                  'rgba(20, 18, 16, 0.16) 48%,' +
                  'rgba(20, 18, 16, 0.04) 68%,' +
                  'transparent 82%)',
              }}
            />
          ) : null}
        </div>

        <div className="relative z-[1] mx-auto w-full max-w-[1180px] px-6 pb-[clamp(2.5rem,9vh,5.5rem)] pt-24 md:px-8">
          <div className={clsx('flex w-full', contentJustifyClass(align))}>
            <div
              className={clsx(
                'w-full max-w-[46rem]',
                contentBlockMarginClass(align),
                textAlignClass(align),
              )}
            >
              {eyebrow.length > 0 ? (
                <p
                  className={clsx(
                    'mb-3.5 text-[12px] font-medium uppercase tracking-[0.22em]',
                    eyebrowColor == null && 'text-white/80',
                  )}
                  style={eyebrowColor != null ? { color: eyebrowColor } : undefined}
                >
                  {eyebrow}
                </p>
              ) : null}

              {heading.length > 0 ? (
                <h1
                  className={clsx(
                    'max-w-[12ch] font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-normal leading-[1.1] tracking-tight',
                    headingColor == null && 'text-white',
                  )}
                  style={mergeStyle(
                    headingColor != null ? { color: headingColor } : undefined,
                    headingFontSize != null ? { fontSize: headingFontSize, maxWidth: 'none' } : undefined,
                    align === 'center'
                      ? { marginInline: 'auto' }
                      : align === 'right'
                        ? { marginLeft: 'auto' }
                        : undefined,
                  )}
                >
                  {heading}
                </h1>
              ) : null}

              {body.length > 0 ? (
                <p
                  className={clsx(
                    'mt-5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.25rem)] font-light leading-relaxed',
                    bodyColor == null && 'text-white/90',
                    align === 'center' && 'mx-auto',
                    align === 'right' && 'ml-auto',
                  )}
                  style={mergeStyle(
                    bodyColor != null ? { color: bodyColor } : undefined,
                    bodyFontSize != null ? { fontSize: bodyFontSize } : undefined,
                  )}
                >
                  {body}
                </p>
              ) : null}

              {primary.visible || secondary.visible ? (
                <div
                  className={clsx(
                    'mt-7 flex flex-wrap gap-3.5',
                    contentJustifyClass(align),
                  )}
                >
                  {primary.visible ? (
                    <ArchiveShopifyButton
                      colors={primary.colors}
                      href={primary.href || '#'}
                      rel={primary.rel}
                      target={primary.target}
                      variant="primary"
                    >
                      {primary.text}
                    </ArchiveShopifyButton>
                  ) : null}
                  {secondary.visible ? (
                    <ArchiveShopifyButton
                      colors={secondary.colors}
                      href={secondary.href || '#'}
                      rel={secondary.rel}
                      target={secondary.target}
                      variant="secondary"
                    >
                      {secondary.text}
                    </ArchiveShopifyButton>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
