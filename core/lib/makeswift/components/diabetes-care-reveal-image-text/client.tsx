import { clsx } from 'clsx';
import { useId, type CSSProperties } from 'react';

import {
  AccentSplitWordsHeading,
  ScrollReveal,
  SplittingBanner,
  SplitWordsHeading,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
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
  buttons?: {
    primaryText?: string;
    primaryLink?: { href?: string; target?: string };
    secondaryText?: string;
    secondaryLink?: { href?: string; target?: string };
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
  bannerHeading,
  bannerImage,
  banner,
  primaryHeading,
  secondaryHeading,
  body,
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
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: rootId,
    sectionCss: `#${richSectionId}{--section-padding-top:72px;--section-padding-bottom:100px;--color-button-background:142 165 141;--color-button-border:142 165 141}`,
    background,
    highlight: useStoryAccentSwash ? secondaryHeading : null,
    defaultBackgroundChannels: '255 255 255',
  });

  const rootThemeStyle = sectionStyle as CSSProperties & Record<string, string | number>;

  const title =
    bannerHeadline.text.length > 0 ? bannerHeadline.text : 'Meet Armaan...';
  const imageSrc = (bannerImage?.heroImageSrc ?? banner?.heroImageSrc)?.trim() ?? '';
  const imageAlt = (bannerImage?.heroImageAlt ?? banner?.heroImageAlt)?.trim() ?? '';
  const lead = storyLead.text.length > 0 ? storyLead.text : 'You Are';
  const headingEmphasis = storyAccent.text.length > 0 ? storyAccent.text : 'Not Alone...';
  const bodyHtml =
    (body?.html?.trim().length ?? 0) > 0 ? (body?.html ?? '').trim() : DEFAULT_BODY_HTML;

  const primaryLabel = buttons?.primaryText?.trim() ?? '';
  const secondaryLabel = buttons?.secondaryText?.trim() ?? '';
  const primaryHref = buttons?.primaryLink?.href ?? '#';
  const secondaryHref = buttons?.secondaryLink?.href ?? '#';
  const bannerHeadingStyle =
    bannerHeadline.color != null || bannerHeadline.fontSize != null
      ? {
          ...(bannerHeadline.color != null ? { color: bannerHeadline.color } : {}),
          ...(bannerHeadline.fontSize != null ? { fontSize: bannerHeadline.fontSize } : {}),
        }
      : undefined;

  return (
    <div
      className={clsx('diabetes-care-reveal-image-text', className)}
      id={rootId}
      style={rootThemeStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
      <div className="shopify-section contents" id={revealSectionId}>
        <div className="section inline">
          <div className="relative contents">
            <SplittingBanner className="splitting-banner reveal-banner relative inline">
              <span className="reveal-banner__tracker absolute top-0 h-full" />
              <div className="reveal-banner__scroller sticky top-0 overflow-hidden">
                <div className="banner relative h-screen w-full">
                  <div className="banner__content left-0 h-full w-full overflow-hidden">
                    <div className="page-width flex h-full w-full items-center justify-center">
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
            </SplittingBanner>
            <ScrollReveal className="section--padding relative w-full" delayMs={80}>
              {imageSrc.length > 0 ? (
                <div className="page-width page-width--narrow relative mx-auto w-full">
                  <picture className="media media--adapt media--transparent relative flex w-full justify-center overflow-hidden rounded-3xl">
                    <img
                      alt={imageAlt}
                      className="aspect-adapt w-full max-w-full object-cover"
                      height={900}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, min(720px, 90vw)"
                      src={imageSrc}
                      width={1200}
                    />
                  </picture>
                </div>
              ) : null}
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="shopify-section" id={richSectionId}>
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative">
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
                {primaryLabel.length > 0 || secondaryLabel.length > 0 ? (
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    {primaryLabel.length > 0 ? (
                      <a
                        className="button button--primary button--md icon-with-text"
                        href={primaryHref}
                        rel={
                          buttons?.primaryLink?.target === '_blank'
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        target={buttons?.primaryLink?.target}
                      >
                        <span className="btn-fill" data-fill />
                        <span className="btn-text">
                          {primaryLabel}
                          <IconArrowRight />
                        </span>
                      </a>
                    ) : null}
                    {secondaryLabel.length > 0 ? (
                      <a
                        className="button button--secondary button--md icon-with-text"
                        href={secondaryHref}
                        rel={
                          buttons?.secondaryLink?.target === '_blank'
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        target={buttons?.secondaryLink?.target}
                      >
                        <span className="btn-fill" data-fill />
                        <span className="btn-text">
                          {secondaryLabel}
                          <IconArrowRight />
                        </span>
                      </a>
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
