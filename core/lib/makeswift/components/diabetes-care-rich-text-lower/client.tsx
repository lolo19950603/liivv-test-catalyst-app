'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  AccentSplitWordsHeading,
  ScrollReveal,
  SplitWordsHeading,
} from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import { ARCHIVE_SAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

import { RICH_TEXT_LOWER_SECTION_ID, RICH_TEXT_LOWER_VARS } from './archive-styles';

function IconSupport() {
  return (
    <svg
      className="icon icon-support icon-custom inline-block"
      fill="none"
      height={48}
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width={48}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="fill"
        d="M6.09 17.43H4.75C3.65 17.43 2.75 16.54 2.75 15.43V12.28C2.75 11.18 3.64 10.28 4.75 10.28H6.09C7.19 10.28 8.09 11.17 8.09 12.28V15.43C8.09 16.53 7.2 17.43 6.09 17.43ZM20.56 15.43V12.28C20.56 11.18 19.67 10.28 18.56 10.28H17.22C16.12 10.28 15.22 11.17 15.22 12.28V15.43C15.22 16.53 16.11 17.43 17.22 17.43H18.56C19.66 17.43 20.56 16.54 20.56 15.43Z"
      />
      <path
        d="M4.94 17.43V19.86C4.94 20.93 6.01 22 7.43 22H11.65M20.56 13.78V10.67C20.57 5.74 16.58 1.75 11.66 1.75C6.74 1.75 2.75 5.74 2.75 10.66V13.77M12.27 21.99C12.27 22.32 12 22.59 11.67 22.59C11.34 22.59 11.07 22.32 11.07 21.99M12.27 21.99C12.27 21.66 12 21.39 11.67 21.39C11.34 21.39 11.07 21.66 11.07 21.99M12.27 21.99H11.07M20.57 14.76V12.96C20.57 12.13 20.57 11.71 20.43 11.39C20.25 10.95 19.9 10.61 19.47 10.43C19.14 10.29 18.73 10.29 17.9 10.29C17.07 10.29 16.65 10.29 16.33 10.43C15.89 10.61 15.55 10.96 15.37 11.39C15.23 11.72 15.23 12.13 15.23 12.96V14.76C15.23 15.59 15.23 16.01 15.37 16.33C15.55 16.77 15.9 17.11 16.33 17.29C16.66 17.43 17.07 17.43 17.9 17.43C18.73 17.43 19.15 17.43 19.47 17.29C19.91 17.11 20.25 16.76 20.43 16.33C20.57 16 20.57 15.59 20.57 14.76ZM5.43 17.43C6.26 17.43 6.68 17.43 7 17.29C7.44 17.11 7.78 16.76 7.96 16.33C8.1 16 8.1 15.59 8.1 14.76V12.96C8.1 12.13 8.1 11.71 7.96 11.39C7.78 10.95 7.43 10.61 7 10.43C6.67 10.29 6.26 10.29 5.43 10.29C4.6 10.29 4.18 10.29 3.86 10.43C3.42 10.61 3.08 10.96 2.9 11.39C2.76 11.72 2.76 12.13 2.76 12.96V14.76C2.76 15.59 2.76 16.01 2.9 16.33C3.08 16.77 3.43 17.11 3.86 17.29C4.19 17.43 4.6 17.43 5.43 17.43Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

/** @deprecated Combined heading popover; use `headingLine1` + `headingLine2`. */
export type RichTextLowerHeadingProps = HeadingTypographyProps &
  HeadingAccentColorProps & {
    accentText?: string;
    accentTextColor?: string;
    accentTextColorHex?: string;
    accentFontSize?: number;
    accentFontSizeMobile?: number;
  };

export type RichTextLowerLine2HeadingProps = HeadingTypographyProps & HeadingAccentColorProps;

export type RichTextLowerBodyProps = BodyTextProps & {
  html?: string;
  /** @deprecated Use `button.label`. */
  ctaLabel?: string;
  /** @deprecated Use `button.link`. */
  ctaLink?: { href?: string; target?: string };
  fontSize?: number;
  fontSizeMobile?: number;
};

export type RichTextLowerButtonProps = ArchiveButtonProps;

export type DiabetesCareRichTextLowerProps = {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  headingLine1?: HeadingTypographyProps;
  headingLine2?: RichTextLowerLine2HeadingProps;
  /** @deprecated Use `headingLine1` + `headingLine2`. */
  heading?: RichTextLowerHeadingProps;
  /** @deprecated Use `headingLine1`. */
  primaryHeading?: HeadingTypographyProps;
  /** @deprecated Use `headingLine2`. */
  secondaryHeading?: HeadingWithHighlightProps;
  body?: RichTextLowerBodyProps;
  button?: RichTextLowerButtonProps;
  showSupportIcon?: boolean;
  /** @deprecated Use `body` text color and font size. */
  bodyText?: BodyTextProps;
};

function resolveRichTextLowerButton(props: {
  button?: RichTextLowerButtonProps;
  body?: RichTextLowerBodyProps;
}) {
  const legacyText = props.body?.ctaLabel?.trim();
  const legacyLink = props.body?.ctaLink;

  return resolveArchiveButton(
    props.button ??
      (legacyText != null && legacyText.length > 0
        ? { buttonText: legacyText, buttonLink: legacyLink }
        : undefined),
  );
}

function line2UsesHighlightSwash(heading?: HeadingAccentColorProps | null): boolean {
  const value = heading?.useCustomHighlightColor;

  return value === true || value === 'true';
}

function resolveRichTextLowerHeading(props: {
  headingLine1?: HeadingTypographyProps;
  headingLine2?: RichTextLowerLine2HeadingProps;
  heading?: RichTextLowerHeadingProps;
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
}): {
  line1: ReturnType<typeof resolveHeadingTypography>;
  line2: ReturnType<typeof resolveHeadingTypography>;
  line2Accent: RichTextLowerLine2HeadingProps | null;
  useLine2Swash: boolean;
} {
  if (props.headingLine1 != null || props.headingLine2 != null) {
    const line1 = resolveHeadingTypography(props.headingLine1);
    const line2 = resolveHeadingTypography(props.headingLine2);
    const line2Accent = props.headingLine2 ?? null;

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.color },
      line2Accent,
      useLine2Swash: line2UsesHighlightSwash(line2Accent),
    };
  }

  const combined = props.heading;

  if (combined != null && typeof combined === 'object') {
    const line1 = resolveHeadingTypography({
      text: combined.text,
      textColor: combined.textColor,
      textColorHex: combined.textColorHex,
      fontSize: combined.fontSize,
      fontSizeMobile: combined.fontSizeMobile,
    });
    const line2 = resolveHeadingTypography({
      text: combined.accentText,
      textColor: combined.accentTextColor,
      textColorHex: combined.accentTextColorHex,
      fontSize: combined.accentFontSize,
      fontSizeMobile: combined.accentFontSizeMobile,
    });

    return {
      line1,
      line2: { ...line2, emphasisColor: line2.color },
      line2Accent: combined,
      useLine2Swash: line2UsesHighlightSwash(combined),
    };
  }

  const line1 = resolveHeadingTypography(props.primaryHeading);
  const line2 = resolveHeadingTypography(props.secondaryHeading);
  const line2Accent = props.secondaryHeading ?? null;

  return {
    line1,
    line2: { ...line2, emphasisColor: line2.emphasisColor ?? line2.color },
    line2Accent,
    useLine2Swash: line2UsesHighlightSwash(line2Accent),
  };
}

function resolveRichTextLowerBody(props: {
  body?: RichTextLowerBodyProps;
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

function headingLineStyle(
  resolved: ReturnType<typeof resolveHeadingTypography>,
): CSSProperties | undefined {
  return resolved.color != null || resolved.fontSize != null
    ? {
        ...(resolved.color != null ? { color: resolved.color } : {}),
        ...(resolved.fontSize != null ? { fontSize: resolved.fontSize } : {}),
      }
    : undefined;
}

export function DiabetesCareRichTextLower({
  className,
  background,
  roundedTop = true,
  headingLine1,
  headingLine2,
  heading,
  primaryHeading,
  secondaryHeading,
  body,
  button,
  showSupportIcon = true,
  bodyText,
}: DiabetesCareRichTextLowerProps) {
  const { line1, line2, line2Accent, useLine2Swash } = resolveRichTextLowerHeading({
    headingLine1,
    headingLine2,
    heading,
    primaryHeading,
    secondaryHeading,
  });
  const bodyResolved = resolveRichTextLowerBody({ body, bodyText });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: RICH_TEXT_LOWER_SECTION_ID,
    sectionCss: RICH_TEXT_LOWER_VARS,
    background,
    highlight: useLine2Swash ? line2Accent : null,
    defaultBackgroundChannels: ARCHIVE_SAGE_BACKGROUND_CHANNELS,
  });
  const line1Text = line1.text.length > 0 ? line1.text : 'Put a stop to pain.';
  const line2Text = line2.text.length > 0 ? line2.text : 'Period.';
  const html = bodyResolved.html;
  const cta = resolveRichTextLowerButton({ button, body });
  const line1Style = headingLineStyle(line1);
  const line2Style = headingLineStyle(line2);

  return (
    <div className={clsx('diabetes-care-rich-text-lower', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={RICH_TEXT_LOWER_SECTION_ID} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width page-width--narrow relative px-4 sm:px-5 md:px-0">
            <div className="rich-text z-1 relative text-left md:text-left">
              {showSupportIcon ? (
                <div className="leading-none">
                  <IconSupport />
                </div>
              ) : null}
              <h2 className="heading title-lg tracking-heading leading-none">
                <span className="block" style={line1Style}>
                  <SplitWordsHeading
                    lead={line1Text}
                    leadColor={line1.color}
                    leadFontSize={line1.fontSize}
                  />
                </span>
                {line2Text.length > 0 ? (
                  <span className="block" style={line2Style}>
                    {useLine2Swash ? (
                      <AccentSplitWordsHeading
                        accentColors={line2Accent ?? undefined}
                        emphasisColor={line2.emphasisColor ?? line2.color}
                        emphasisFontSize={line2.fontSize}
                        highlightEntirePhrase
                        highlightStyle="half_text"
                        text={line2Text}
                      />
                    ) : (
                      <SplitWordsHeading
                        lead={line2Text}
                        leadColor={line2.color}
                        leadFontSize={line2.fontSize}
                      />
                    )}
                  </span>
                ) : null}
              </h2>
              <ScrollReveal className="flex flex-col gap-8" delayMs={80}>
                {html.length > 0 ? (
                  <div
                    className="rte body subtext-md leading-normal"
                    dangerouslySetInnerHTML={{ __html: html }}
                    style={bodyResolved.style}
                  />
                ) : null}
                {cta.visible ? (
                  <ArchiveShopifyButton
                    className="button--primary button--lg icon-with-text w-fit"
                    colors={cta.colors}
                    href={cta.href}
                    rel={cta.rel}
                    target={cta.target}
                  >
                    {cta.text}
                    <IconArrowRight />
                  </ArchiveShopifyButton>
                ) : null}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
