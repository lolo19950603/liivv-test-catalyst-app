'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ComponentPropsWithoutRef, type RefObject } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  ScrollReveal,
  SplitWordsHeading,
  useInViewAnimate,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingTypographyProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

type VideoElementProps = ComponentPropsWithoutRef<'video'>;

function DeferredVideo(props: VideoElementProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 block h-full w-full bg-black object-cover object-center"
        suppressHydrationWarning
      />
    );
  }

  return <video {...props} suppressHydrationWarning />;
}

export const DIABETES_CARE_DEFAULT_VIDEO_URL =
  'https://liivv.ca/cdn/shop/videos/c/vp/2e66f0d8b94242388f3b690c1c727817/2e66f0d8b94242388f3b690c1c727817.HD-1080p-7.2Mbps-83428254.mp4?v=0';

export const VIDEO_HERO_SECTION_ID =
  'shopify-section-template--26520397447459__video_with_text_overlay_RnWXxE';

export type VideoSettingsProps = {
  url?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  showControls?: boolean;
};

export type OverlayBodyProps = BodyTextProps & {
  subheading?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export interface DiabetesCareVideoHeroProps {
  className?: string;
  /** Override Shopify section id (required when multiple heroes appear on one page). */
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  video?: VideoSettingsProps;
  heading?: HeadingTypographyProps;
  overlayBody?: OverlayBodyProps;
}

export function DiabetesCareVideoHero({
  className,
  sectionDomId,
  background,
  roundedTop = true,
  video,
  heading,
  overlayBody,
}: DiabetesCareVideoHeroProps) {
  const resolvedSectionId =
    sectionDomId?.trim().length ? sectionDomId.trim() : VIDEO_HERO_SECTION_ID;
  const headingResolved = resolveHeadingTypography(heading);
  const bodyColor = resolveBodyTextColor(overlayBody);
  const bodyFontSize = resolveHeadingFontSizeCss(
    overlayBody?.fontSize,
    overlayBody?.fontSizeMobile,
  );
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: '',
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const [clientReady, setClientReady] = useState(false);
  const { ref: mediaRef, animated: mediaAnimated } = useInViewAnimate({ disabled: !clientReady });

  useEffect(() => {
    setClientReady(true);
  }, []);

  const autoplay = video?.autoplay ?? true;
  const muted = video?.muted ?? true;
  const loop = video?.loop ?? true;
  const playsInline = video?.playsInline ?? true;
  const showControls = video?.showControls ?? false;
  const src =
    video?.url != null && video.url.trim().length > 0
      ? video.url.trim()
      : DIABETES_CARE_DEFAULT_VIDEO_URL;
  const poster = video?.poster?.trim().length ? video.poster.trim() : undefined;
  const effectiveMuted = autoplay ? true : Boolean(muted);
  const headingText = headingResolved.text;
  const subheadingText = overlayBody?.subheading?.trim() ?? '';
  const hasOverlay = headingText.length > 0 || subheadingText.length > 0;
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const bodyStyle =
    bodyColor != null || bodyFontSize != null
      ? {
          ...(bodyColor != null ? { color: bodyColor } : {}),
          ...(bodyFontSize != null ? { fontSize: bodyFontSize } : {}),
        }
      : undefined;

  return (
    <div
      className={clsx(
        'diabetes-care-video-hero shopify-section w-full min-w-0 max-w-full',
        DC_SECTION_ROOT_CLASS,
        '[--color-foreground:255_255_255] [--color-overlay:23_23_23] [--overlay-opacity:0.7]',
        roundedTop && 'section section--rounded overflow-hidden',
        className,
      )}
      id={resolvedSectionId}
      style={sectionStyle}
    >
      {sectionCss.length > 0 ? (
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
      ) : null}
      <div className="relative w-full [--section-padding-bottom:0px] [--section-padding-top:0px]">
        <div className="video-hero relative mx-auto w-full max-w-full">
          <div
            ref={mediaRef as RefObject<HTMLDivElement>}
            className={clsx(
              'dc-video-hero-media relative mx-auto w-full max-w-full overflow-hidden bg-black [aspect-ratio:16/9] md:[aspect-ratio:1.775/1]',
              mediaAnimated && 'dc-animated',
            )}
            {...(clientReady ? { 'data-animate': 'zoom-out' as const } : {})}
            suppressHydrationWarning
          >
            {clientReady ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <DeferredVideo
                  autoPlay={autoplay}
                  className="absolute inset-0 block h-full w-full object-cover object-center"
                  controls={showControls}
                  loop={loop}
                  muted={effectiveMuted}
                  playsInline={playsInline}
                  poster={poster}
                  preload="metadata"
                  src={src}
                />
                {hasOverlay ? (
                  <div
                    className={clsx(
                      'pointer-events-none absolute inset-0 flex flex-col justify-end',
                      'bg-gradient-to-t from-[rgb(0_0_0/0.75)] via-[rgb(0_0_0/0.25)] to-transparent',
                      'p-6 text-white md:p-10 lg:p-12',
                    )}
                  >
                    {headingText.length > 0 ? (
                      <h2
                        className="heading max-w-4xl text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl"
                        style={headingStyle}
                      >
                        <SplitWordsHeading text={headingText} />
                      </h2>
                    ) : null}
                    {subheadingText.length > 0 ? (
                      <ScrollReveal delayMs={120}>
                        <p
                          className="heading mt-3 max-w-3xl text-pretty text-base leading-relaxed text-white/90 md:text-lg"
                          style={bodyStyle}
                        >
                          {subheadingText}
                        </p>
                      </ScrollReveal>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div aria-hidden className="absolute inset-0 bg-black" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
