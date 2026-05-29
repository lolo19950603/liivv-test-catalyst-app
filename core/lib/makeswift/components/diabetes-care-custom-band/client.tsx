import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { resolveArchiveHighlightChannels } from '~/lib/makeswift/utils/archive-color';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import {
  appendHighlightToSectionCss,
  resolveAccentColors,
  resolvePlainTextColor,
} from '~/lib/makeswift/utils/heading-accent-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

const CUSTOM_SECTION_ID = 'shopify-section-template--26520397447459__custom_section_WpXaJg';

function buildCustomSectionStyle(backgroundChannels: string): string {
  return `#${CUSTOM_SECTION_ID}{--section-padding-top:32px;--section-padding-bottom:32px;--color-background:${backgroundChannels}}@media screen and (max-width: 767px){#${CUSTOM_SECTION_ID}{--section-padding-top:24px;--section-padding-bottom:24px}}`;
}

const sectionContentGapStyle: ShopifyThemeStyle = {
  '--gap': '15px',
};

const logoWrapStyle: ShopifyThemeStyle = {
  '--size-style-width': '10%',
  '--size-style-height': 'auto',
  '--size-style-width-mobile': '44%',
  '--size-style-width-mobile-min': '44%',
  '--border-width': '1px',
  '--border-style': 'none',
  '--border-color': 'rgb(var(--color-foreground)/1.0)',
  '--border-radius': '0px',
};

const dividerPaddingStyle: ShopifyThemeStyle = {
  '--padding-block-start': '0px',
  '--padding-block-end': '0px',
  '--padding-inline-start': '0px',
  '--padding-inline-end': '0px',
};

const dividerLineStyle: ShopifyThemeStyle = {
  '--divider-border-thickness': '1px',
  '--divider-flex-basis': '100%',
  '--divider-border-rounded': '0em',
};

const headingBoxStyle: ShopifyThemeStyle = {
  '--size-style-width': '100%',
  '--size-style-height': 'auto',
  '--size-style-width-mobile': '100%',
  '--size-style-width-mobile-min': '0px',
};

export type CustomBandBackgroundProps = {
  color?: string;
  colorHex?: string;
};

export type CustomBandLogoProps = {
  image?: string;
  altText?: string;
  link?: { href?: string; target?: string };
};

export type CustomBandHeadingGroupProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type CustomBandSecondaryHeadingProps = CustomBandHeadingGroupProps &
  HeadingAccentColorProps;

function secondaryUsesHighlightSwash(heading?: CustomBandSecondaryHeadingProps): boolean {
  const value = heading?.useCustomHighlightColor;

  return value === true || value === 'true';
}

export interface DiabetesCareCustomBandContentProps {
  className?: string;
  background?: CustomBandBackgroundProps;
  logo?: CustomBandLogoProps;
  primaryHeading?: CustomBandHeadingGroupProps;
  secondaryHeading?: CustomBandSecondaryHeadingProps;
}

export type DiabetesCareCustomBandProps = DiabetesCareCustomBandContentProps;

export function DiabetesCareCustomBand({
  className,
  background,
  logo,
  primaryHeading,
  secondaryHeading,
}: DiabetesCareCustomBandProps) {
  const backgroundChannels =
    resolveArchiveHighlightChannels(background?.colorHex, background?.color) ??
    ARCHIVE_CREAM_BACKGROUND_CHANNELS;
  const logoHref = logo?.link?.href ?? 'https://liivv.ca/pages/diabetes-care';
  const logoImage = logo?.image;
  const primary = primaryHeading?.text?.trim() ?? 'Diabetes and';
  const secondary = secondaryHeading?.text?.trim() ?? 'Everyday Living';
  const alt = logo?.altText?.trim() ?? 'Liivv Diabetes';
  const primaryColor = resolvePlainTextColor({
    textColor: primaryHeading?.textColor,
    textColorHex: primaryHeading?.textColorHex,
  });
  const secondaryColor = resolvePlainTextColor({
    textColor: secondaryHeading?.textColor,
    textColorHex: secondaryHeading?.textColorHex,
  });
  const primaryFontSize = resolveHeadingFontSizeCss(
    primaryHeading?.fontSize,
    primaryHeading?.fontSizeMobile,
  );
  const secondaryFontSize = resolveHeadingFontSizeCss(
    secondaryHeading?.fontSize,
    secondaryHeading?.fontSizeMobile,
  );
  const useHighlightSwash = secondaryUsesHighlightSwash(secondaryHeading);
  const { highlightChannels } = resolveAccentColors(secondaryHeading);
  const highlightStyle = useHighlightSwash ? 'half_text' : 'text';
  const sectionStyle = appendHighlightToSectionCss(
    buildCustomSectionStyle(backgroundChannels),
    CUSTOM_SECTION_ID,
    highlightChannels,
  );
  const sectionCssVars: ShopifyThemeStyle = {
    '--color-background': backgroundChannels,
    ...(highlightChannels != null ? { '--color-highlight': highlightChannels } : {}),
  };

  return (
    <div className={clsx('diabetes-care-custom-band', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div
        className="shopify-section custom-section"
        id={CUSTOM_SECTION_ID}
        style={sectionCssVars}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionStyle }} />
        <div className="section section--padding">
          <div className="page-width page-width--page relative grid h-full px-4 sm:px-5 md:px-0">
            <div
              className="section-content media--auto mobile:media--auto spacing-style flex min-w-0 flex-col flex-nowrap items-center justify-center gap-4 md:flex-row md:items-center md:justify-center md:gap-0"
              style={sectionContentGapStyle}
            >
              <div
                className="size-style border-style max-w-[220px] shrink-0 overflow-hidden md:max-w-none"
                style={logoWrapStyle}
              >
                <a aria-label={alt} className="leading-none" href={logoHref}>
                  {logoImage ? (
                    <picture className="media relative block w-full">
                      <img
                        alt={alt}
                        className="aspect-adapt w-full"
                        height={960}
                        loading="lazy"
                        sizes="(max-width: 768px) 44vw, 10vw"
                        src={logoImage}
                        width={1708}
                      />
                    </picture>
                  ) : null}
                </a>
              </div>
              <div
                className="divider align-self-stretch spacing-style hidden items-center justify-center md:flex"
                style={dividerPaddingStyle}
              >
                <span className="divider__line" style={dividerLineStyle} />
              </div>
              <h2
                className="heading size-style title-lg tracking-heading w-full min-w-0 max-w-full text-balance text-center leading-snug md:text-center md:leading-none"
                style={headingBoxStyle}
              >
                <SplitWordsHeading
                  emphasis={secondary}
                  emphasisColor={secondaryColor}
                  emphasisFontSize={secondaryFontSize}
                  highlightStyle={highlightStyle}
                  lead={primary}
                  leadColor={primaryColor}
                  leadFontSize={primaryFontSize}
                />
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
