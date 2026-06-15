'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';

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
import { useIsInBuilderAfterMount } from '~/lib/makeswift/utils/use-is-in-builder-after-mount';

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

/** Headline + hero image share this cap; headline also syncs to rendered image width after load. */
const REVEAL_COLUMN_MAX_WIDTH = 'min(70rem, 96vw)';
const REVEAL_IMAGE_MAX_HEIGHT = 'min(95vh, 80rem)';

/** Portrait default avoids landscape letterboxing before `img` onLoad (common for this section). */
const DEFAULT_HERO_WIDTH = 900;
const DEFAULT_HERO_HEIGHT = 1200;

/** Banner headline when Makeswift font size is 0 (desktop only; mobile uses compact clamp). */
const DEFAULT_BANNER_HEADING_FONT_SIZE_DESKTOP = 90;

const ROUNDED_RADIUS = 'var(--border-radius,1.5rem)';

/** Reveal uses `section inline` + `shopify-section contents`; scoped rules restore archive rounded-top. */
function revealRoundedTopCss(revealSectionId: string, rootId: string, enabled: boolean): string {
  if (!enabled) {
    return '';
  }

  return (
    `#${rootId}{--border-radius:1.5rem}` +
    `#${revealSectionId} .section.section--rounded{` +
    `position:relative;z-index:1;display:block!important;width:100%;` +
    `margin-block-start:calc(-1 * ${ROUNDED_RADIUS});` +
    `overflow:hidden!important;` +
    `background-color:rgb(var(--color-background))!important;` +
    `border-start-end-radius:${ROUNDED_RADIUS}!important;` +
    `border-start-start-radius:${ROUNDED_RADIUS}!important}` +
    `.js #${revealSectionId} .section.section--rounded:before{` +
    `height:calc(100% + ${ROUNDED_RADIUS});` +
    `border-start-end-radius:${ROUNDED_RADIUS};` +
    `border-start-start-radius:${ROUNDED_RADIUS}}`
  );
}

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
  const isInBuilder = useIsInBuilderAfterMount();
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
  const revealSectionCss =
    `#${revealSectionId} .reveal-banner__scroller{z-index:1}` +
    `#${revealSectionId} [data-dc-scroll-reveal].section--padding{position:relative;z-index:2;background-color:rgb(var(--color-background))}` +
    `#${revealSectionId} .reveal-banner .banner__box{min-width:0!important;width:100%;max-width:${REVEAL_COLUMN_MAX_WIDTH};margin-inline:auto}` +
    `#${revealSectionId} .reveal-banner .splitting-wrapper,#${revealSectionId} .reveal-banner .splitting-wrapper h2,#${revealSectionId} .reveal-banner .split-words.words{max-width:100%}` +
    `#${revealSectionId} .reveal-banner .split-words.words{display:inline-flex;flex-wrap:wrap;justify-content:center;text-wrap:balance}` +
    `#${revealSectionId} .dcrift-reveal-media-wrap{display:flex;justify-content:center;width:100%}` +
    `@media screen and (min-width:1024px){#${revealSectionId} .reveal-banner .splitting-wrapper h2.dcrift-banner-heading--default{font-size:${String(DEFAULT_BANNER_HEADING_FONT_SIZE_DESKTOP)}px;line-height:1.05;letter-spacing:-0.02em;text-wrap:balance}}` +
    `@media screen and (max-width:1023px){#${revealSectionId} .reveal-banner .splitting-wrapper h2.dcrift-banner-heading--default{font-size:clamp(2rem,5.5vw,3.25rem);line-height:1.05;letter-spacing:-0.02em;text-wrap:balance}}` +
    `@media screen and (min-width:1024px){#${revealSectionId} .dcrift-reveal-media.media--adapt{height:auto!important;width:fit-content!important;max-width:${REVEAL_COLUMN_MAX_WIDTH};margin-inline:auto;padding-block-end:0!important}` +
    `#${revealSectionId} .dcrift-reveal-media.media--adapt>img{position:static!important;display:block;width:auto!important;height:auto!important;max-width:${REVEAL_COLUMN_MAX_WIDTH};max-height:${REVEAL_IMAGE_MAX_HEIGHT};margin-inline:auto;object-fit:contain!important;object-position:center center}}` +
    `@media screen and (max-width:1023px){#${revealSectionId} .splitting-banner .reveal-banner__scroller{position:sticky!important;top:0!important;height:100lvh!important;max-height:100dvh!important;overflow:hidden!important}` +
    `#${revealSectionId} .reveal-banner__tracker{inset-block-start:12%!important;height:72lvh!important}@supports (height:100lvh){#${revealSectionId} .reveal-banner__tracker{height:72lvh!important}}` +
    `#${revealSectionId} .reveal-banner .banner{height:100%!important;min-height:100%!important}}` +
    `@media screen and (max-width:500px){#${revealSectionId} .reveal-banner .banner__content .page-width--narrow{max-width:100%}` +
    `#${revealSectionId} .reveal-banner .banner__box{max-width:100%;margin-inline:auto}` +
    `#${revealSectionId} .reveal-banner .splitting-wrapper h2.dcrift-banner-heading--default{font-size:clamp(1.5rem,6vw,2.125rem)!important;line-height:1.05!important;letter-spacing:-0.02em;text-wrap:balance}}` +
    `#${revealSectionId} .dcrift-reveal-media.media--adapt{height:0;width:100%;padding-block-end:var(--ratio-percent,133.333%)}` +
    `#${revealSectionId} .dcrift-reveal-media.media--adapt>img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain!important;object-position:center center}` +
    `#${revealSectionId} .dcrift-reveal-media--placeholder{display:flex;align-items:center;justify-content:center;` +
    `background:rgb(var(--color-foreground)/0.06);border:2px dashed rgb(var(--color-foreground)/0.15);` +
    `color:rgb(var(--color-foreground)/0.45)}` +
    `#${revealSectionId} .dcrift-reveal-media--placeholder>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;` +
    `padding:1rem;text-align:center;font-size:0.875rem;font-weight:500;line-height:1.25;white-space:nowrap}` +
    `@media screen and (max-width:1023px){#${revealSectionId} .dcrift-reveal-media.mobile\\:media--wide>img,#${revealSectionId} .dcrift-reveal-media>img{aspect-ratio:unset!important}}`;

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: rootId,
    sectionCss:
      revealRoundedTopCss(revealSectionId, rootId, roundedTop) +
      `#${richSectionId}{--section-padding-top:72px;--section-padding-bottom:100px;--color-button-background:142 165 141;--color-button-border:142 165 141}${revealSectionCss}`,
    background,
    highlight: useStoryAccentSwash ? secondaryHeading : null,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  const rootThemeStyle = sectionStyle as CSSProperties & Record<string, string | number>;
  const roundedSectionStyle: CSSProperties | undefined =
    roundedTop && rootThemeStyle['--color-background'] != null
      ? ({
          '--color-background': rootThemeStyle['--color-background'],
          backgroundColor: `rgb(${String(rootThemeStyle['--color-background'])})`,
        } as CSSProperties)
      : undefined;

  const title =
    bannerHeadline.text.length > 0 ? bannerHeadline.text : 'Meet Armaan...';
  const imageSrc = (bannerImage?.heroImageSrc ?? banner?.heroImageSrc)?.trim() ?? '';
  const imageAlt = (bannerImage?.heroImageAlt ?? banner?.heroImageAlt)?.trim() ?? '';
  const revealImageRef = useRef<HTMLImageElement>(null);
  const [imageRatioPercent, setImageRatioPercent] = useState(
    `${String((DEFAULT_HERO_HEIGHT / DEFAULT_HERO_WIDTH) * 100)}%`,
  );
  const [revealColumnWidth, setRevealColumnWidth] = useState<number | null>(null);
  const revealMediaStyle = {
    '--ratio-percent': imageRatioPercent,
  } as CSSProperties;

  const syncRevealColumnWidth = useCallback((img: HTMLImageElement) => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImageRatioPercent(`${String((img.naturalHeight / img.naturalWidth) * 100)}%`);
    }

    const width = Math.round(img.getBoundingClientRect().width);

    if (width > 0) {
      setRevealColumnWidth(width);
    }
  }, []);

  useEffect(() => {
    const img = revealImageRef.current;

    if (img == null || imageSrc.length === 0) {
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      syncRevealColumnWidth(img);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (revealImageRef.current != null) {
        syncRevealColumnWidth(revealImageRef.current);
      }
    });

    resizeObserver.observe(img);

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageSrc, syncRevealColumnWidth]);
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
  const revealHeadlineBoxStyle: CSSProperties | undefined =
    revealColumnWidth != null ? { maxWidth: revealColumnWidth } : undefined;

  return (
    <div
      className={clsx('diabetes-care-reveal-image-text', DC_SECTION_ROOT_CLASS, className)}
      id={rootId}
      style={rootThemeStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
      <div className="shopify-section contents" id={revealSectionId}>
        <div
          className={clsx(
            'section relative w-full',
            roundedTop ? 'section--rounded overflow-hidden' : 'inline',
          )}
          style={roundedSectionStyle}
        >
          <div className="relative contents">
            <SplittingBanner className="splitting-banner reveal-banner relative inline">
              <span className="reveal-banner__tracker absolute top-0 h-full" />
              <div className="reveal-banner__scroller sticky top-0 overflow-hidden">
                <div className="banner relative h-full min-h-[100dvh] w-full md:h-screen">
                  <div className="banner__content left-0 h-full w-full overflow-hidden">
                    <div className="page-width page-width--narrow flex h-full w-full items-center justify-center px-4 sm:px-5 md:px-0">
                      <div
                        className="banner__box banner__box--large text-center"
                        style={revealHeadlineBoxStyle}
                      >
                        <div className="splitting-wrapper relative">
                          <h2
                            className={clsx(
                              'heading title-lg tracking-heading splitting words chars leading-none',
                              !hasBannerDesktopFont && 'dcrift-banner-heading--default',
                            )}
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
                  <div className="dcrift-reveal-media-wrap page-width page-width--narrow relative mx-auto w-full px-4 sm:px-5 md:px-0">
                    <picture
                      className="dcrift-reveal-media reveal-banner__cover-media media media--adapt media--transparent relative mx-auto block max-w-full overflow-hidden rounded-3xl"
                      style={revealMediaStyle}
                    >
                      <img
                        alt={imageAlt}
                        className="mx-auto block h-auto max-w-full"
                        height={DEFAULT_HERO_HEIGHT}
                        loading="lazy"
                        onLoad={(event) => {
                          syncRevealColumnWidth(event.currentTarget);
                        }}
                        ref={revealImageRef}
                        sizes="(max-width: 768px) 100vw, min(70rem, 96vw)"
                        src={imageSrc}
                        width={DEFAULT_HERO_WIDTH}
                      />
                    </picture>
                  </div>
                ) : isInBuilder ? (
                  <div className="dcrift-reveal-media-wrap page-width page-width--narrow relative mx-auto w-full px-4 sm:px-5 md:px-0">
                    <div
                      aria-hidden
                      className="dcrift-reveal-media dcrift-reveal-media--placeholder reveal-banner__cover-media media media--adapt relative mx-auto block max-w-full overflow-hidden rounded-3xl"
                      style={revealMediaStyle}
                    >
                      <span>Banner image</span>
                    </div>
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
