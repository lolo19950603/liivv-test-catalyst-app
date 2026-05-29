'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  HEALTH_HIGHLIGHT_TEXT_SECTION_ID,
  HEALTH_HIGHLIGHT_TEXT_VARS,
} from './archive-styles';

export const HEALTH_DEFAULT_LOGO_URL =
  'https://storage.googleapis.com/s.mkswft.com/RmlsZTg1ZDMwYmI2LTcwNmMtNDgxYS1hYWY2LWQ0MjZmMGU0NjA5NC=/Liivv_Favicon.png';

export type HealthHighlightTextProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  logo?: {
    image?: unknown;
    altText?: string;
  };
  heading?: HeadingTypographyProps;
  roundedTop?: boolean;
};

export function HealthHighlightText({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  logo,
  heading,
  roundedTop = true,
}: HealthHighlightTextProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_HIGHLIGHT_TEXT_SECTION_ID,
    instanceSuffix,
  );
  const logoSrc = resolveMakeswiftImageSrc(logo?.image) || HEALTH_DEFAULT_LOGO_URL;
  const logoAlt = logo?.altText?.trim() ?? 'Liivv';
  const headingResolved = resolveHeadingTypography(heading);
  const headingText = headingResolved.text.trim();
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: HEALTH_HIGHLIGHT_TEXT_VARS,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const logoStyle = {
    '--media-width': '200px',
    '--media-height': '90px',
    '--media-width-mobile': '90px',
    '--media-height-mobile': '50px',
  } as CSSProperties;
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;

  return (
    <div className={clsx('health-highlight-text', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width page-width--narrow relative">
            <div className="highlight-text relative z-[1] text-center md:text-center">
              <picture
                className="media media--height media--transparent media--fit relative inline-block h-full w-full overflow-hidden"
                data-animate="zoom-out"
                style={logoStyle}
              >
                <img
                  alt={logoAlt}
                  className="mx-auto block h-auto w-full max-w-[var(--media-width)] object-contain md:max-w-[var(--media-width)]"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  src={logoSrc}
                />
              </picture>
              {headingText.length > 0 ? (
                <h2
                  className="heading title-lg mt-6 leading-none tracking-heading"
                  style={headingStyle}
                >
                  <SplitWordsHeading text={headingText} />
                </h2>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
