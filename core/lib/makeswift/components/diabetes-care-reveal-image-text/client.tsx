'use client';

import { clsx } from 'clsx';
import { useId, useState, type CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  AccentSplitWordsHeading,
  ScrollReveal,
  SplittingBanner,
  SplitWordsHeading,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

function storyAccentUsesHighlightSwash(heading?: HeadingWithHighlightProps | null): boolean {
  const value = heading?.useCustomHighlightColor;

  return value === true || value === 'true';
}

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

const DEFAULT_BODY_HTML =
  '<p><em>"I got diagnosed in March of 2020 at age 20.</em></p><p><em>The first sign that something was wrong was in February where I was doing sprints on a treadmill to get ready for a soccer season and after finishing I felt sick and dizzy to where I might need to go to the hospital.</em></p><p><em>I thought maybe I just went "too hard" and I was upset because it meant that I was way out of shape for the upcoming soccer season. Then I was getting very thirsty and seeing my weight drop despite working out and bulking..."</em></p><p><strong>Sometimes the best resource is a conversation. Connect with community partners who have walked the path before you.</strong></p>';

export type DiabetesCareRevealBannerImageProps = {
  heroImageSrc?: string;
  heroImageAlt?: string;
};

export type DiabetesCareRevealImageTextProps = {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  bannerHeading?: HeadingTypographyProps;
  bannerImage?: DiabetesCareRevealBannerImageProps;
  /** @deprecated Use `bannerHeading` + `bannerImage`. */
  banner?: {
    title?: string;
    heroImageSrc?: string;
    heroImageAlt?: string;
  };
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
  body?: HeadingTypographyProps & { html?: string };
  primaryButton?: ArchiveButtonProps;
  secondaryButton?: ArchiveButtonProps;
  /** @deprecated Use `primaryButton` and `secondaryButton`. */
  buttons?: {
    primaryText?: string;
    primaryLink?: { href?: string; target?: string };
    primaryColors?: ArchiveButtonProps;
    secondaryText?: string;
    secondaryLink?: { href?: string; target?: string };
    secondaryColors?: ArchiveButtonProps;
  };
};

function resolveBannerHeadingProps(props: {
  bannerHeading?: HeadingTypographyProps;
  banner?: DiabetesCareRevealImageTextProps['banner'];
}): HeadingTypographyProps | null {
  if (props.bannerHeading != null) {
    return props.bannerHeading;
  }

  const legacyTitle = props.banner?.title?.trim();

  if (legacyTitle != null && legacyTitle.length > 0) {
    return { text: legacyTitle };
  }

  return null;
}

export function DiabetesCareRevealImageWithText({
  className,
  background,
  roundedTop = true,
  bannerHeading,
  bannerImage,
  banner,
  primaryHeading,
  secondaryHeading,
  body,
  primaryButton,
  secondaryButton,
  buttons,
}: DiabetesCareRevealImageTextProps) {
  const bannerHeadline = resolveHeadingTypography(
    resolveBannerHeadingProps({ bannerHeading, banner }),
  );
  const storyLead = resolveHeadingTypography(primaryHeading);
  const storyAccent = resolveHeadingTypography(secondaryHeading);
  const useStoryAccentSwash = storyAccentUsesHighlightSwash(secondaryHeading);
  const storyAccentHighlightStyle = useStoryAccentSwash ? 'half_text' : 'text';
  const bodyColor = resolveBodyTextColor(body);
  const bodyFontSize = resolveHeadingFontSizeCss(body?.fontSize, body?.fontSizeMobile);
  const bodyStyle: CSSProperties | undefined =
    bodyColor != null || bodyFontSize != null
      ? {
          ...(bodyColor != null ? { color: bodyColor } : {}),
          ...(bodyFontSize != null ? { fontSize: bodyFontSize } : {}),
        }
      : undefined;
  const instance = useId().replace(/:/g, '');
  const rootId = `dcrift-${instance}`;
  const revealSectionId = `dcrift-reveal-${instance}`;
  const richSectionId = `dcrift-rich-${instance}`;

  /** Theme vars on the component root so reveal banner + image and rich text share background. */
  /** Shorter scroll runway on phone/tablet; portrait uses intrinsic ratio (no 16:9 crop). */
  const revealMobileCss =
    `#${revealSectionId} .reveal-banner__scroller{z-index:1}` +
    `#${revealSectionId} [data-dc-scroll-reveal].section--padding{position:relative;z-index:2;background-color:rgb(var(--color-background))}` +
    `@media screen and (max-width:1023px){#${revealSectionId} .splitting-banner .reveal-banner__scroller{position:sticky!important;top:0!important;height:100lvh!important;max-height:100dvh!important;overflow:hidden!important}` +
    `#${revealSectionId} .reveal-banner__tracker{inset-block-start:12%!important;height:72lvh!important}@supports (height:100lvh){#${revealSectionId} .reveal-banner__tracker{height:72lvh!important}}` +
    `#${revealSectionId} .reveal-banner .banner{height:100%!important;min-height:100%!important}}` +
    `@media screen and (max-width:500px){#${revealSectionId} .reveal-banner .banner__content .page-width--narrow{max-width:100%}` +
    `#${revealSectionId} .reveal-banner .banner__box{max-width:100%;margin-inline:auto}` +
    `#${revealSectionId} .reveal-banner .splitting-wrapper h2.title-xl{font-size:clamp(1.625rem,6.5vw,2rem)!important;line-height:1.05!important;letter-spacing:-0.02em;text-wrap:balance}}` +
    `#${revealSectionId} .dcrift-reveal-media.media--adapt{height:0;width:100%;padding-block-end:var(--ratio-percent,125%)}` +
    `#${revealSectionId} .dcrift-reveal-media.media--adapt>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain!important;object-position:center center}` +
    `@media screen and (max-width:1023px){#${revealSectionId} .dcrift-reveal-media.mobile\\:media--wide>img,#${revealSectionId} .dcrift-reveal-media>img{aspect-ratio:unset!important}}`;

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: rootId,
    sectionCss: `#${richSectionId}{--section-padding-top:72px;--section-padding-bottom:100px;--color-button-background:142 165 141;--color-button-border:142 165 141}${revealMobileCss}`,
    background,
    highlight: useStoryAccentSwash ? secondaryHeading : null,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  const rootThemeStyle = sectionStyle as CSSProperties & Record<string, string | number>;

  const title =
    bannerHeadline.text.length > 0 ? bannerHeadline.text : 'Meet Armaan...';
  const imageSrc = (bannerImage?.heroImageSrc ?? banner?.heroImageSrc)?.trim() ?? '';
  const imageAlt = (bannerImage?.heroImageAlt ?? banner?.heroImageAlt)?.trim() ?? '';
  const imageWidth = 1200;
  const imageHeight = 900;
  const [imageRatioPercent, setImageRatioPercent] = useState(
    `${String((imageHeight / imageWidth) * 100)}%`,
  );
  const revealMediaStyle = {
    '--ratio-percent': imageRatioPercent,
  } as CSSProperties;
  const lead = storyLead.text.length > 0 ? storyLead.text : 'You Are';
  const headingEmphasis = storyAccent.text.length > 0 ? storyAccent.text : 'Not Alone...';
  const bodyHtml =
    (body?.html?.trim().length ?? 0) > 0 ? (body?.html ?? '').trim() : DEFAULT_BODY_HTML;

  const primary = resolveArchiveButton(
    primaryButton ??
      (buttons != null
        ? {
            buttonText: buttons.primaryText,
            buttonLink: buttons.primaryLink,
            ...buttons.primaryColors,
          }
        : undefined),
    { requireHref: false },
  );
  const secondary = resolveArchiveButton(
    secondaryButton ??
      (buttons != null
        ? {
            buttonText: buttons.secondaryText,
            buttonLink: buttons.secondaryLink,
            ...buttons.secondaryColors,
          }
        : undefined),
    { requireHref: false },
  );
  const bannerDesktopFontPx = bannerHeading?.fontSize;
  const bannerMobileFontPx = bannerHeading?.fontSizeMobile;
  const hasBannerDesktopFont = bannerDesktopFontPx != null && bannerDesktopFontPx > 0;
  const hasBannerMobileFont = bannerMobileFontPx != null && bannerMobileFontPx > 0;
  /** Inline size only when desktop is set (optional mobile pairs via clamp). Mobile-only uses CSS ≤500px. */
  const bannerHeadingFontSize = hasBannerDesktopFont
    ? resolveHeadingFontSizeCss(
        bannerDesktopFontPx,
        hasBannerMobileFont ? bannerMobileFontPx : undefined,
      )
    : undefined;
  const bannerHeadingStyle: CSSProperties | undefined =
    bannerHeadline.color != null || bannerHeadingFontSize != null
      ? {
          ...(bannerHeadline.color != null ? { color: bannerHeadline.color } : {}),
          ...(bannerHeadingFontSize != null ? { fontSize: bannerHeadingFontSize } : {}),
        }
      : undefined;

  return (
    <div
      className={clsx('diabetes-care-reveal-image-text', DC_SECTION_ROOT_CLASS, className)}
      id={rootId}
      style={rootThemeStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
      <div className="shopify-section contents" id={revealSectionId}>
        <div className={clsx('section inline', roundedTop && 'section--rounded')}>
          <div className="relative contents">
            <SplittingBanner className="splitting-banner reveal-banner relative inline">
              <span className="reveal-banner__tracker absolute top-0 h-full" />
              <div className="reveal-banner__scroller sticky top-0 overflow-hidden">
                <div className="banner relative h-full min-h-[100dvh] w-full md:h-screen">
                  <div className="banner__content left-0 h-full w-full overflow-hidden">
                    <div className="page-width page-width--narrow flex h-full w-full items-center justify-center px-4 sm:px-5 md:px-0">
                      <div className="banner__box banner__box--large text-center">
                        <div className="splitting-wrapper relative">
                          <h2
                            className="heading title-xl tracking-heading splitting words chars leading-none"
                            style={bannerHeadingStyle}
                          >
                            <SplitWordsHeading text={title} />
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <ScrollReveal className="section--padding relative w-full" delayMs={80}>
                {imageSrc.length > 0 ? (
                  <div className="page-width page-width--narrow relative mx-auto w-full px-4 sm:px-5 md:px-0">
                    <picture
                      className="dcrift-reveal-media reveal-banner__cover-media media media--adapt media--transparent relative block w-full overflow-hidden rounded-3xl"
                      style={revealMediaStyle}
                    >
                      <img
                        alt={imageAlt}
                        className="h-full w-full"
                        height={imageHeight}
                        loading="lazy"
                        onLoad={(event) => {
                          const img = event.currentTarget;

                          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                            setImageRatioPercent(
                              `${String((img.naturalHeight / img.naturalWidth) * 100)}%`,
                            );
                          }
                        }}
                        sizes="(max-width: 768px) 100vw, min(720px, 90vw)"
                        src={imageSrc}
                        width={imageWidth}
                      />
                    </picture>
                  </div>
                ) : null}
              </ScrollReveal>
            </SplittingBanner>
          </div>
        </div>
      </div>

      <div className="shopify-section" id={richSectionId}>
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative px-4 sm:px-5 md:px-0">
            <div className="rich-text relative z-1 text-center md:text-center">
              <h2 className="heading title-md leading-none">
                <AccentSplitWordsHeading
                  accentColors={secondaryHeading}
                  emphasis={headingEmphasis}
                  emphasisColor={storyAccent.color ?? storyAccent.emphasisColor}
                  emphasisFontSize={storyAccent.fontSize}
                  highlightStyle={storyAccentHighlightStyle}
                  lead={lead}
                  leadColor={storyLead.color}
                  leadFontSize={storyLead.fontSize}
                />
              </h2>
              <ScrollReveal delayMs={80}>
                <div
                  className="rte body subtext-md leading-normal"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  style={bodyStyle}
                />
                {primary.visible || secondary.visible ? (
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    {primary.visible ? (
                      <ArchiveShopifyButton
                        className="button--primary button--md icon-with-text"
                        colors={primary.colors}
                        href={primary.href}
                        rel={primary.rel}
                        target={primary.target}
                      >
                        {primary.text}
                        <IconArrowRight />
                      </ArchiveShopifyButton>
                    ) : null}
                    {secondary.visible ? (
                      <ArchiveShopifyButton
                        className="button--secondary button--md icon-with-text"
                        colors={secondary.colors}
                        href={secondary.href}
                        rel={secondary.rel}
                        target={secondary.target}
                        variant="secondary"
                      >
                        {secondary.text}
                        <IconArrowRight />
                      </ArchiveShopifyButton>
                    ) : null}
                  </div>
                ) : null}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
