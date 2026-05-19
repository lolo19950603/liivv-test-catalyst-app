'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ComponentPropsWithoutRef } from 'react';

import {
  ScrollReveal,
  SplitWordsHeading,
  useInViewAnimate,
} from '~/lib/makeswift/diabetes-care-scroll-animate';

type VideoElementProps = ComponentPropsWithoutRef<'video'>;

/** Avoids Next.js hydration mismatches from `<video>` boolean attrs (autoplay, muted, etc.). */
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

/** Default MP4 from the archived `diabetes-care.html` hero section. */
export const DIABETES_CARE_DEFAULT_VIDEO_URL =
  'https://liivv.ca/cdn/shop/videos/c/vp/2e66f0d8b94242388f3b690c1c727817/2e66f0d8b94242388f3b690c1c727817.HD-1080p-7.2Mbps-83428254.mp4?v=0';

/** Matches archived section id so `diabetes-care-sections.css` section rules apply. */
export const VIDEO_HERO_SECTION_ID = 'shopify-section-template--26520397447459__video_with_text_overlay_RnWXxE';

export interface DiabetesCareVideoHeroProps {
  className?: string;
  videoUrl?: string;
  posterImage?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  showControls?: boolean;
  heading?: string;
  subheading?: string;
}

export function DiabetesCareVideoHero({
  className,
  videoUrl = DIABETES_CARE_DEFAULT_VIDEO_URL,
  posterImage,
  autoplay = true,
  muted = true,
  loop = true,
  playsInline = true,
  showControls = false,
  heading = '',
  subheading = '',
}: DiabetesCareVideoHeroProps) {
  const [clientReady, setClientReady] = useState(false);
  const { ref: mediaRef, animated: mediaAnimated } = useInViewAnimate({ disabled: !clientReady });

  useEffect(() => {
    setClientReady(true);
  }, []);

  const src = videoUrl.trim().length > 0 ? videoUrl.trim() : DIABETES_CARE_DEFAULT_VIDEO_URL;
  const poster = posterImage?.trim().length ? posterImage.trim() : undefined;
  const effectiveMuted = autoplay ? true : Boolean(muted);
  const headingText = heading.trim();
  const subheadingText = subheading.trim();
  const hasOverlay = headingText.length > 0 || subheadingText.length > 0;

  return (
    <div
      className={clsx(
        'diabetes-care-video-hero shopify-section w-full min-w-0 max-w-full overflow-x-hidden',
        '[--color-foreground:255_255_255] [--color-overlay:23_23_23] [--overlay-opacity:0.7]',
        className,
      )}
      id={VIDEO_HERO_SECTION_ID}
    >
      <div className="relative w-full [--section-padding-bottom:0px] [--section-padding-top:0px]">
        <div className="video-hero relative mx-auto w-full max-w-full">
          <div
            ref={mediaRef}
            className={clsx(
              'relative mx-auto w-full max-w-full overflow-hidden bg-black [aspect-ratio:1.775/1]',
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
                      <h2 className="heading max-w-4xl text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
                        <SplitWordsHeading text={headingText} />
                      </h2>
                    ) : null}
                    {subheadingText.length > 0 ? (
                      <ScrollReveal delayMs={120}>
                        <p className="heading mt-3 max-w-3xl text-pretty text-base leading-relaxed text-white/90 md:text-lg">
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
