'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
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
  HEALTH_IMAGES_WITH_TEXT_BACKGROUND_CHANNELS,
  HEALTH_IMAGES_WITH_TEXT_SECTION_ID,
  healthImagesWithTextSectionCss,
} from './archive-styles';

function IconArrowRight() {
  return (
    <svg
      aria-hidden
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
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

export type HealthImagesWithTextProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  layoutReverse?: boolean;
  primaryImage?: unknown;
  primaryImageAlt?: string;
  secondaryImage?: unknown;
  secondaryImageAlt?: string;
  subheading?: HeadingTypographyProps;
  heading?: HeadingTypographyProps;
  body?: BodyTextProps & {
    html?: string;
    fontSize?: number;
    fontSizeMobile?: number;
  };
  button?: ArchiveButtonProps;
  roundedTop?: boolean;
};

function ArchiveImage({
  src,
  alt,
  wrapperClassName,
}: {
  src: string;
  alt: string;
  wrapperClassName?: string;
}) {
  if (src.length === 0) {
    return null;
  }

  return (
    <div className={wrapperClassName}>
      <picture className="media media--square relative block w-full overflow-hidden">
        <img
          alt={alt}
          className="block h-auto w-full object-cover"
          decoding="async"
          loading="lazy"
          src={src}
        />
      </picture>
    </div>
  );
}

export function HealthImagesWithText({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  roundedTop = true,
  layoutReverse = false,
  primaryImage,
  primaryImageAlt = '',
  secondaryImage,
  secondaryImageAlt = '',
  subheading,
  heading,
  body,
  button,
}: HealthImagesWithTextProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_IMAGES_WITH_TEXT_SECTION_ID,
    instanceSuffix,
  );
  const primarySrc = resolveMakeswiftImageSrc(primaryImage);
  const secondarySrc = resolveMakeswiftImageSrc(secondaryImage);
  const subheadingResolved = resolveHeadingTypography(subheading);
  const headingResolved = resolveHeadingTypography(heading);
  const bodyColor = resolveBodyTextColor(body);
  const bodyFontSize = resolveHeadingFontSizeCss(body?.fontSize, body?.fontSizeMobile);
  const bodyHtml = body?.html?.trim() ?? '';
  const subheadingText = subheadingResolved.text.trim();
  const headingText = headingResolved.text.trim();
  const resolvedButton = resolveArchiveButton(button, {
    requireHref: false,
    ignoreShowButton: true,
  });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: healthImagesWithTextSectionCss(resolvedSectionId),
    background,
    defaultBackgroundChannels: HEALTH_IMAGES_WITH_TEXT_BACKGROUND_CHANNELS,
  });
  const showImages = primarySrc.length > 0 || secondarySrc.length > 0;

  const subheadingStyle: CSSProperties | undefined =
    subheadingResolved.color != null || subheadingResolved.fontSize != null
      ? {
          ...(subheadingResolved.color != null ? { color: subheadingResolved.color } : {}),
          ...(subheadingResolved.fontSize != null ? { fontSize: subheadingResolved.fontSize } : {}),
        }
      : undefined;
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
    <div className={clsx('health-images-with-text', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width">
            <div
              className={clsx(
                'image-with-text flex flex-col gap-8 overflow-hidden lg:gap-10',
                layoutReverse && showImages && 'image-with-text--reverse',
                !showImages && 'image-with-text--no-media',
              )}
            >
              {showImages ? (
                <div className="image-with-text__item image-with-text__media-col relative shrink-0">
                  <div
                    className={clsx(
                      'image-with-text__media relative',
                      secondarySrc.length > 0 && 'with-2nd-image',
                    )}
                  >
                    {secondarySrc.length > 0 ? (
                      <ArchiveImage
                        alt={secondaryImageAlt}
                        src={secondarySrc}
                        wrapperClassName="image-with-text__image-second absolute z-10"
                      />
                    ) : null}
                    {primarySrc.length > 0 ? (
                      <ArchiveImage
                        alt={primaryImageAlt}
                        src={primarySrc}
                        wrapperClassName="image-with-text__image-first block"
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="image-with-text__item image-with-text__content image-with-text__content-col relative z-[1] flex shrink-0 flex-col justify-center">
                <div className="rich-text relative z-[1] text-left">
                  {subheadingText.length > 0 ? (
                    <p
                      className="banner__subheading banner__text--colored subtitle-md heading mb-3 uppercase leading-none tracking-widest"
                      style={subheadingStyle}
                    >
                      {subheadingText}
                    </p>
                  ) : null}
                  {headingText.length > 0 ? (
                    <h2
                      className="heading title-md mb-4 leading-none tracking-heading"
                      style={headingStyle}
                    >
                      <SplitWordsHeading text={headingText} />
                    </h2>
                  ) : null}
                  {bodyHtml.length > 0 ? (
                    <div
                      className="rte body subtext-md leading-normal"
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                      style={bodyStyle}
                    />
                  ) : null}
                  {resolvedButton.visible ? (
                    <p className="mt-6">
                      <ArchiveShopifyButton
                        className="button--primary button--md icon-with-text"
                        colors={resolvedButton.colors}
                        href={resolvedButton.href}
                        rel={resolvedButton.rel}
                        target={resolvedButton.target}
                      >
                        {resolvedButton.text}
                        <IconArrowRight />
                      </ArchiveShopifyButton>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
