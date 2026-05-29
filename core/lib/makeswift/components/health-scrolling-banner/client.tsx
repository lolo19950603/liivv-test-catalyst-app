'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
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
  HEALTH_SCROLLING_BANNER_VARS,
  healthScrollingBannerLayoutCss,
} from './archive-styles';

export type HealthScrollingBannerPanel = {
  image?: unknown;
  imageAlt?: string;
  heading?: HeadingTypographyProps;
  body?: BodyTextProps & {
    html?: string;
    fontSize?: number;
    fontSizeMobile?: number;
  };
};

export type HealthScrollingBannerProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  panels?: HealthScrollingBannerPanel[];
  roundedTop?: boolean;
};

function BannerPanel({
  panel,
  index,
}: {
  panel: HealthScrollingBannerPanel;
  index: number;
}) {
  const imageSrc = resolveMakeswiftImageSrc(panel.image);
  const headingResolved = resolveHeadingTypography(panel.heading);
  const headingText = headingResolved.text.trim();
  const bodyHtml = panel.body?.html?.trim() ?? '';
  const bodyColor = resolveBodyTextColor(panel.body);
  const bodyFontSize = resolveHeadingFontSizeCss(panel.body?.fontSize, panel.body?.fontSizeMobile);
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
    <div
      className="health-scroll-banner-panel image-with-text with-scrolling flex flex-col overflow-hidden lg:flex-row lg:gap-2"
      style={{ zIndex: index + 1 }}
    >
      <div className="image-with-text__item image-with-text__media relative min-h-[240px] flex-1">
        {imageSrc.length > 0 ? (
          <picture className="media media--height relative block h-full min-h-[240px] w-full overflow-hidden">
            <img
              alt={panel.imageAlt?.trim() ?? ''}
              className="absolute inset-0 block h-full w-full object-cover"
              decoding="async"
              loading={index === 0 ? 'eager' : 'lazy'}
              src={imageSrc}
            />
          </picture>
        ) : null}
      </div>
      <div className="image-with-text__item image-with-text__content relative z-[1] flex flex-1 flex-col justify-center p-6 lg:p-10">
        <div className="rich-text relative z-[1] text-left">
          {headingText.length > 0 ? (
            <h2
              className="heading title-lg mb-4 leading-none tracking-heading"
              style={headingStyle}
            >
              <SplitWordsHeading text={headingText} />
            </h2>
          ) : null}
          {bodyHtml.length > 0 ? (
            <div
              className="rte body leading-normal"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
              style={bodyStyle}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HealthScrollingBanner({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  panels,
  roundedTop = true,
}: HealthScrollingBannerProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_SCROLLING_BANNER_SECTION_ID,
    instanceSuffix,
  );
  const list = panels ?? [];
  const stackHeightPx = Math.max(2400, list.length * 1100);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: `${HEALTH_SCROLLING_BANNER_VARS}${healthScrollingBannerLayoutCss(resolvedSectionId)}`,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  return (
    <div className={clsx('health-scrolling-banner', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx('section section--padding', roundedTop && 'section--rounded')}
        >
          <div className="page-width page-width--full">
            <div
              className="scrolling-banner block lg:block"
              style={{ '--scrolling-height': `${String(stackHeightPx)}px` } as CSSProperties}
            >
              <div
                className="health-scroll-banner-stack top-0 lg:sticky"
                style={{ minHeight: `${String(stackHeightPx)}px` }}
              >
                {list.map((panel, index) => (
                  <BannerPanel index={index} key={`panel-${index}`} panel={panel} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
