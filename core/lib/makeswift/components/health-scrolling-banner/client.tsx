'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
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
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  HEALTH_SCROLLING_BANNER_SECTION_ID,
  HEALTH_SCROLLING_BANNER_SEGMENT_PX,
  healthScrollingBannerLayoutCss,
  healthScrollingBannerSectionVars,
} from './archive-styles';
import {
  computeScrollBannerProgress,
  isScrollBannerContentRevealed,
  resolveScrollBannerMotion,
  SCROLL_BANNER_SSR_STICKY_INSET_PX,
  SCROLL_BANNER_SSR_VIEWPORT_HEIGHT,
  scrollBannerContentLayerStyle,
  scrollBannerImageLayerStyle,
  scrollBannerTrackHeightPx,
} from './scroll-banner-motion';
import { useStickyHeaderInset } from './use-sticky-header-inset';

function IconArrowRight() {
  return (
    <svg
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H18M18 10L12.1667 4.16675M18 10L12.1667 15.8334"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useScrollingBannerProgress(
  trackRef: RefObject<HTMLElement | null>,
  stickyInsetPx: number,
): number {
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number | null>(null);

  const update = useCallback(() => {
    frameRef.current = null;
    const track = trackRef.current;

    if (track == null || typeof window === 'undefined') {
      return;
    }

    setProgress(computeScrollBannerProgress(track, stickyInsetPx));
  }, [stickyInsetPx, trackRef]);

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

export type HealthScrollingBannerPanel = {
  image?: unknown;
  imageAlt?: string;
  heading?: HeadingTypographyProps;
  body?: BodyTextProps & {
    html?: string;
    fontSize?: number;
    fontSizeMobile?: number;
  };
  button?: ArchiveButtonProps;
};

export type HealthScrollingBannerProps = {
  className?: string;
  instanceSuffix?: string;
  /** Friendly hash target for nav (e.g. life-chapters → /womens-health#life-chapters). */
  anchorId?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  panels?: HealthScrollingBannerPanel[];
  roundedTop?: boolean;
};

function resolvePanelButton(panel: HealthScrollingBannerPanel) {
  // Sticky banner panels: show the CTA whenever button text is set.
  // Links are optional for visibility; missing href falls back to `#`.
  return resolveArchiveButton(panel.button, { requireHref: false });
}

function PanelCopy({
  panel,
  headingClassName,
}: {
  panel: HealthScrollingBannerPanel;
  headingClassName?: string;
}) {
  const headingResolved = resolveHeadingTypography(panel.heading);
  const headingText = headingResolved.text.trim();
  const bodyHtml = panel.body?.html?.trim() ?? '';
  const bodyColor = resolveBodyTextColor(panel.body);
  const bodyFontSize = resolveHeadingFontSizeCss(panel.body?.fontSize, panel.body?.fontSizeMobile);
  const panelButton = resolvePanelButton(panel);

  const headingStyle: CSSProperties | undefined =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const bodyStyle: CSSProperties | undefined =
    bodyColor != null || bodyFontSize != null
      ? {
          ...(bodyColor != null ? { color: bodyColor } : {}),
          ...(bodyFontSize != null ? { fontSize: bodyFontSize } : {}),
        }
      : undefined;

  return (
    <div className="rich-text relative z-[1] text-left lg:text-left">
      {headingText.length > 0 ? (
        <h2
          className={clsx(
            'heading leading-none title-lg tracking-heading',
            headingClassName,
          )}
          style={headingStyle}
        >
          {headingText}
        </h2>
      ) : null}
      {bodyHtml.length > 0 ? (
        <div
          className="rte leading-normal subtext-lg"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
          style={bodyStyle}
        />
      ) : null}
      {panelButton.visible ? (
        <ArchiveShopifyButton
          className="button--md icon-with-text"
          colors={panelButton.colors}
          href={panelButton.href}
          rel={panelButton.rel}
          target={panelButton.target}
          variant="primary"
        >
          {panelButton.text}
          <IconArrowRight />
        </ArchiveShopifyButton>
      ) : null}
    </div>
  );
}

function PanelImage({
  panel,
  index,
  eager,
}: {
  panel: HealthScrollingBannerPanel;
  index: number;
  eager?: boolean;
}) {
  const imageSrc = resolveMakeswiftImageSrc(panel.image);

  if (imageSrc.length === 0) {
    return null;
  }

  return (
    <picture className="media media--height block h-full w-full overflow-hidden">
      <img
        alt={panel.imageAlt?.trim() ?? ''}
        className="block h-full w-full object-cover"
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
        src={imageSrc}
      />
    </picture>
  );
}

function MobilePanel({ panel, index }: { panel: HealthScrollingBannerPanel; index: number }) {
  return (
    <div className="flex flex-col gap-6 overflow-hidden">
      <div className="image-with-text__image block media--650px mobile:media--auto relative overflow-hidden">
        <PanelImage eager={index === 0} index={index} panel={panel} />
      </div>
      <PanelCopy panel={panel} />
    </div>
  );
}

export function HealthScrollingBanner({
  className,
  instanceSuffix,
  anchorId,
  sectionDomId,
  background,
  panels,
  roundedTop = true,
}: HealthScrollingBannerProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_SCROLLING_BANNER_SECTION_ID,
    instanceSuffix,
  );
  const scrollAnchorId = (() => {
    const raw = anchorId?.trim() ?? '';

    if (raw.length === 0) {
      return undefined;
    }

    const safe = raw.replace(/[^a-zA-Z0-9_-]/g, '');

    return safe.length > 0 ? safe : undefined;
  })();
  const list = panels ?? [];
  const stickyInsetPx = useStickyHeaderInset(SCROLL_BANNER_SSR_STICKY_INSET_PX);
  const panelCount = list.length;
  const [viewportHeight, setViewportHeight] = useState(SCROLL_BANNER_SSR_VIEWPORT_HEIGHT);

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight || document.documentElement.clientHeight);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const stickyPanelRef = useRef<HTMLDivElement>(null);
  const [panelHeightPx, setPanelHeightPx] = useState(HEALTH_SCROLLING_BANNER_SEGMENT_PX);
  const scrollProgress = useScrollingBannerProgress(scrollTrackRef, stickyInsetPx);
  const { segmentIndex, segmentProgress } = resolveScrollBannerMotion(panelCount, scrollProgress);

  const stackHeightPx =
    panelCount > 0
      ? scrollBannerTrackHeightPx(
          panelCount,
          HEALTH_SCROLLING_BANNER_SEGMENT_PX,
          viewportHeight,
          stickyInsetPx,
          panelHeightPx,
        )
      : HEALTH_SCROLLING_BANNER_SEGMENT_PX * 2;

  useEffect(() => {
    const stickyPanel = stickyPanelRef.current;

    if (stickyPanel == null || typeof window === 'undefined') {
      return;
    }

    const updatePanelHeight = () => {
      setPanelHeightPx(stickyPanel.offsetHeight);
    };

    updatePanelHeight();

    const observer = new ResizeObserver(updatePanelHeight);
    observer.observe(stickyPanel);

    return () => {
      observer.disconnect();
    };
  }, [list, segmentIndex]);

  const [contentEnterKey, setContentEnterKey] = useState(0);
  const prevSegmentIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevSegmentIndexRef.current === null) {
      prevSegmentIndexRef.current = segmentIndex;

      return;
    }

    if (prevSegmentIndexRef.current !== segmentIndex) {
      prevSegmentIndexRef.current = segmentIndex;
      setContentEnterKey((key) => key + 1);
    }
  }, [segmentIndex]);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: `${healthScrollingBannerSectionVars(resolvedSectionId)}${healthScrollingBannerLayoutCss(resolvedSectionId)}`,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  return (
    <div
      className={clsx('health-scrolling-banner', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
      id={scrollAnchorId}
      style={scrollAnchorId != null ? ({ scrollMarginTop: '6rem' } as CSSProperties) : undefined}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding relative', roundedTop && 'section--rounded')}>
          <div className="page-width page-width--full relative">
            {list.length > 0 ? (
              <div className="health-scroll-banner-mobile grid gap-10 lg:hidden">
                {list.map((panel, index) => (
                  <MobilePanel index={index} key={`mobile-panel-${index}`} panel={panel} />
                ))}
              </div>
            ) : null}

            <div
              className="scrolling-banner hidden lg:block"
              ref={scrollTrackRef}
              style={{ '--scrolling-height': `${String(stackHeightPx)}px` } as CSSProperties}
            >
              <div
                className="scrolling-banner__track"
                style={{ minHeight: `${String(stackHeightPx)}px` }}
              >
                <div
                  className="image-with-text with-scrolling flex flex-col lg:sticky lg:flex-row"
                  ref={stickyPanelRef}
                  style={
                    {
                      '--scroll-banner-inset': `${String(stickyInsetPx)}px`,
                    } as CSSProperties
                  }
                >
                  <div className="image-with-text__item relative shrink-0 grow lg:grow-0">
                    <div className="image-with-text__media h-full">
                      <div className="image-with-text__image media--650px mobile:media--auto relative block overflow-hidden">
                        {list.map((panel, index) => (
                          <div
                            aria-hidden={
                              index !== segmentIndex &&
                              index !== segmentIndex + 1 &&
                              panelCount > 1
                            }
                            className="image-with-text__image-layer absolute inset-0"
                            key={`image-layer-${index}`}
                            style={scrollBannerImageLayerStyle(
                              index,
                              panelCount,
                              segmentIndex,
                              segmentProgress,
                            )}
                          >
                            <PanelImage eager={index === 0} index={index} panel={panel} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="image-with-text__item image-with-text__content-col relative grid shrink-0 grow">
                    {list.map((panel, index) => {
                      const contentRevealed = isScrollBannerContentRevealed(
                        index,
                        panelCount,
                        segmentIndex,
                      );

                      return (
                      <div
                        aria-hidden={
                          panelCount > 1 &&
                          index !== segmentIndex &&
                          index !== segmentIndex + 1
                        }
                        className={clsx(
                          'image-with-text__content image-with-text__content-layer flex w-full items-center',
                          contentRevealed && 'image-with-text__content-layer--revealed',
                        )}
                        key={`content-layer-${index}`}
                        style={scrollBannerContentLayerStyle(
                          index,
                          panelCount,
                          segmentIndex,
                          segmentProgress,
                        )}
                      >
                        {contentRevealed ? (
                          <div
                            className={clsx(
                              'health-scroll-banner-content-enter w-full',
                              contentEnterKey > 0 && 'health-scroll-banner-content-enter--animate',
                            )}
                            key={`scroll-banner-enter-${String(index)}-${String(contentEnterKey)}`}
                          >
                            <PanelCopy panel={panel} />
                          </div>
                        ) : (
                          <div aria-hidden className="health-scroll-banner-content-enter w-full">
                            <PanelCopy panel={panel} />
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {list.length === 0 ? (
              <p className="text-center opacity-60">Add sticky panels in the editor.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
