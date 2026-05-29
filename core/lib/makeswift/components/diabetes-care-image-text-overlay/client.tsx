'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';
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
  IMAGE_TEXT_OVERLAY_BANNER_CSS,
  IMAGE_TEXT_OVERLAY_SECTION_ID,
  IMAGE_TEXT_OVERLAY_VARS,
} from './archive-styles';

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

/** @deprecated Flat combined heading; use `heading.primaryHeading` + `heading.secondaryHeading`. */
export type ImageTextOverlayHeadingProps = HeadingTypographyProps & {
  accentText?: string;
  accentTextColor?: string;
  accentTextColorHex?: string;
  accentFontSize?: number;
  accentFontSizeMobile?: number;
};

export type ImageTextOverlayHeadingGroupProps = {
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingTypographyProps;
};

export type ImageTextOverlayBodyProps = BodyTextProps & {
  html?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type DiabetesCareImageTextOverlayProps = {
  className?: string;
  background?: SectionBackgroundProps;
  imageSrc?: unknown;
  /** @deprecated Use root `imageSrc`. */
  banner?: {
    imageSrc?: unknown;
    imageAlt?: string;
  };
  heading?: ImageTextOverlayHeadingGroupProps | ImageTextOverlayHeadingProps;
  /** @deprecated Use `heading` or nested primary/secondary. */
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingTypographyProps;
  headingLine1?: HeadingTypographyProps;
  headingLine2?: ImageTextOverlayHeadingProps;
  body?: ImageTextOverlayBodyProps;
  button?: ButtonColorProps & {
    label?: string;
    link?: { href?: string; target?: string };
  };
  /** @deprecated Use `body` text color and font size. */
  bodyText?: BodyTextProps;
};

function isNestedHeadingGroup(
  heading: ImageTextOverlayHeadingGroupProps | ImageTextOverlayHeadingProps,
): heading is ImageTextOverlayHeadingGroupProps {
  return 'primaryHeading' in heading || 'secondaryHeading' in heading;
}

function resolveImageTextOverlayHeading(props: {
  heading?: ImageTextOverlayHeadingGroupProps | ImageTextOverlayHeadingProps;
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingTypographyProps;
  headingLine1?: HeadingTypographyProps;
  headingLine2?: ImageTextOverlayHeadingProps;
}): {
  line1: ReturnType<typeof resolveHeadingTypography>;
  line2: ReturnType<typeof resolveHeadingTypography>;
} {
  const nested = props.heading;

  if (nested != null && typeof nested === 'object' && isNestedHeadingGroup(nested)) {
    return {
      line1: resolveHeadingTypography(nested.primaryHeading),
      line2: resolveHeadingTypography(nested.secondaryHeading),
    };
  }

  if (props.primaryHeading != null || props.secondaryHeading != null) {
    return {
      line1: resolveHeadingTypography(props.primaryHeading),
      line2: resolveHeadingTypography(props.secondaryHeading),
    };
  }

  const combined = props.heading as ImageTextOverlayHeadingProps | undefined;

  if (combined != null && typeof combined === 'object' && !isNestedHeadingGroup(combined)) {
    return {
      line1: resolveHeadingTypography({
        text: combined.text,
        textColor: combined.textColor,
        textColorHex: combined.textColorHex,
        fontSize: combined.fontSize,
        fontSizeMobile: combined.fontSizeMobile,
      }),
      line2: resolveHeadingTypography({
        text: combined.accentText,
        textColor: combined.accentTextColor,
        textColorHex: combined.accentTextColorHex,
        fontSize: combined.accentFontSize,
        fontSizeMobile: combined.accentFontSizeMobile,
      }),
    };
  }

  if (props.headingLine1 != null || props.headingLine2 != null) {
    return {
      line1: resolveHeadingTypography(props.headingLine1),
      line2: resolveHeadingTypography({
        text: props.headingLine2?.text,
        textColor: props.headingLine2?.textColor,
        textColorHex: props.headingLine2?.textColorHex,
        fontSize: props.headingLine2?.fontSize,
        fontSizeMobile: props.headingLine2?.fontSizeMobile,
      }),
    };
  }

  // Legacy flat `heading.text` (single field).
  if (
    combined != null &&
    typeof combined === 'object' &&
    typeof combined.text === 'string' &&
    combined.text.trim().length > 0
  ) {
    const full = combined.text.trim();
    const accent = combined.accentText?.trim() ?? '';

    if (accent.length > 0) {
      return {
        line1: resolveHeadingTypography({ ...combined, text: full.replace(accent, '').trim() }),
        line2: resolveHeadingTypography({
          text: accent,
          textColor: combined.accentTextColor,
          textColorHex: combined.accentTextColorHex,
          fontSize: combined.accentFontSize,
          fontSizeMobile: combined.accentFontSizeMobile,
        }),
      };
    }

    return {
      line1: resolveHeadingTypography(combined),
      line2: resolveHeadingTypography(undefined),
    };
  }

  return {
    line1: resolveHeadingTypography(undefined),
    line2: resolveHeadingTypography(undefined),
  };
}

function resolveImageTextOverlayBody(props: {
  body?: ImageTextOverlayBodyProps;
  bodyText?: BodyTextProps;
}): { html: string; style: CSSProperties | undefined } {
  const group = props.body;

  if (group != null && typeof group === 'object') {
    const html = group.html?.trim() ?? '';
    const color = resolveBodyTextColor(group) ?? resolveBodyTextColor(props.bodyText);
    const fontSize = resolveHeadingFontSizeCss(group.fontSize, group.fontSizeMobile);

    return {
      html,
      style:
        color != null || fontSize != null
          ? {
              ...(color != null ? { color } : {}),
              ...(fontSize != null ? { fontSize } : {}),
            }
          : undefined,
    };
  }

  const legacyColor = resolveBodyTextColor(props.bodyText);

  return {
    html: '',
    style: legacyColor != null ? { color: legacyColor } : undefined,
  };
}

function resolveBannerImageSrc(props: {
  imageSrc?: unknown;
  banner?: DiabetesCareImageTextOverlayProps['banner'];
}): string {
  return (
    resolveMakeswiftImageSrc(props.imageSrc) || resolveMakeswiftImageSrc(props.banner?.imageSrc)
  );
}

export function DiabetesCareImageTextOverlay({
  className,
  background,
  banner,
  imageSrc,
  heading,
  primaryHeading,
  secondaryHeading,
  headingLine1,
  headingLine2,
  body,
  button,
  bodyText,
}: DiabetesCareImageTextOverlayProps) {
  const { line1, line2 } = resolveImageTextOverlayHeading({
    heading,
    primaryHeading,
    secondaryHeading,
    headingLine1,
    headingLine2,
  });
  const bodyResolved = resolveImageTextOverlayBody({ body, bodyText });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: IMAGE_TEXT_OVERLAY_SECTION_ID,
    sectionCss: `${IMAGE_TEXT_OVERLAY_VARS}${IMAGE_TEXT_OVERLAY_BANNER_CSS}`,
    background,
    highlight: null,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const img = resolveBannerImageSrc({ imageSrc, banner });
  const line1Text = line1.text.length > 0 ? line1.text : "We're Here if";
  const line2Text = line2.text.length > 0 ? line2.text : 'You Need Us';
  const html = bodyResolved.html;
  const btn = button?.label?.trim() ?? '';
  const btnHref = button?.link?.href?.trim() ?? '';
  const hasBtn = btn.length > 0 && btnHref.length > 0;
  const showLine2 = line2Text.length > 0;

  return (
    <div
      className={clsx('diabetes-care-image-text-overlay', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div className="shopify-section" id={IMAGE_TEXT_OVERLAY_SECTION_ID} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding section--rounded relative">
          <div className="relative">
            <div className="banner media--450px dciw-banner relative">
              <div className="banner__media block h-full w-full overflow-hidden">
                {img.length > 0 ? (
                  <picture className="media media--height relative block h-full w-full overflow-hidden">
                    <img
                      alt=""
                      className="h-full w-full object-cover object-center"
                      decoding="async"
                      height={1200}
                      loading="lazy"
                      src={img}
                      width={2000}
                    />
                  </picture>
                ) : (
                  <div className="media media--height block min-h-[280px] w-full bg-zinc-300 md:min-h-[360px]" />
                )}
              </div>
              <span className="banner__overlay pointer-events-none absolute left-0 top-0 h-full w-full" />
              <div className="banner__content z-1 absolute left-0 top-0 h-full w-full overflow-hidden">
                <div className="page-width flex h-full w-full items-end justify-start px-4 sm:px-5 md:items-center md:justify-center md:px-0">
                  <div className="banner__box banner__box--small pb-10 pt-[min(35vh,12rem)] text-left md:py-0 md:text-center">
                    <h2 className="banner__title heading title-lg tracking-heading leading-none text-white">
                      {showLine2 ? (
                        <>
                          <SplitWordsHeading
                            className="block"
                            highlightStyle="text"
                            lead={line1Text}
                            leadColor={line1.color}
                            leadFontSize={line1.fontSize}
                          />
                          <SplitWordsHeading
                            className="block"
                            highlightStyle="text"
                            lead={line2Text}
                            leadColor={line2.color}
                            leadFontSize={line2.fontSize}
                          />
                        </>
                      ) : (
                        <SplitWordsHeading
                          className="block"
                          highlightStyle="text"
                          lead={line1Text}
                          leadColor={line1.color}
                          leadFontSize={line1.fontSize}
                        />
                      )}
                    </h2>
                    {html.length > 0 ? (
                      <div
                        className="rte body subtext-md leading-normal text-white"
                        dangerouslySetInnerHTML={{ __html: html }}
                        style={bodyResolved.style}
                      />
                    ) : null}
                    {hasBtn ? (
                      <ArchiveShopifyButton
                        className="button--primary button--fixed button--md icon-with-text mt-6"
                        colors={button}
                        href={btnHref}
                        rel={button?.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
                        target={button?.link?.target}
                      >
                        {btn}
                        <IconArrowRight />
                      </ArchiveShopifyButton>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
