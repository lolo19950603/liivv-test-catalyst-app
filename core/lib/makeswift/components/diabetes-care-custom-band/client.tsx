import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

/** Matches inline `<style>` from `diabetes-care.html` for this section id. */
const CUSTOM_SECTION_STYLE = `#shopify-section-template--26520397447459__custom_section_WpXaJg{--section-padding-top:32px;--section-padding-bottom:32px;--color-background:255 255 255}@media screen and (max-width: 767px){#shopify-section-template--26520397447459__custom_section_WpXaJg{--section-padding-top:24px;--section-padding-bottom:24px}}`;

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

export interface DiabetesCareCustomBandProps {
  className?: string;
  logoImage?: string;
  logoAlt?: string;
  logoLink?: { href?: string; target?: string };
  primaryHeading?: string;
  secondaryHeading?: string;
  /** When not `false`, secondary line uses theme highlight (`rgb(var(--color-highlight))`). */
  useThemeHighlightForSecondary?: boolean;
  /** Used when `useThemeHighlightForSecondary` is `false`. */
  secondaryTextColor?: string;
}

export function DiabetesCareCustomBand({
  className,
  logoImage,
  logoAlt,
  logoLink,
  primaryHeading,
  secondaryHeading,
  useThemeHighlightForSecondary,
  secondaryTextColor,
}: DiabetesCareCustomBandProps) {
  const logoHref = logoLink?.href ?? 'https://liivv.ca/pages/diabetes-care';
  const primary = primaryHeading ?? 'Diabetes and';
  const secondary = secondaryHeading ?? 'Everyday Living';
  const alt = logoAlt ?? 'Liivv Diabetes';
  const useThemeHighlight = useThemeHighlightForSecondary !== false;
  const secondaryEmStyle: ShopifyThemeStyle | undefined =
    !useThemeHighlight &&
    typeof secondaryTextColor === 'string' &&
    secondaryTextColor.trim().length > 0
      ? { color: secondaryTextColor }
      : undefined;

  return (
    <div className={clsx('diabetes-care-custom-band max-w-full overflow-x-hidden', className)}>
      <div
        className="shopify-section custom-section"
        id="shopify-section-template--26520397447459__custom_section_WpXaJg"
      >
        <style dangerouslySetInnerHTML={{ __html: CUSTOM_SECTION_STYLE }} />
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
                {useThemeHighlight ? (
                  <SplitWordsHeading emphasis={secondary} lead={primary} />
                ) : (
                  <span className="block">
                    {primary}{' '}
                    <em
                      className="highlighted-text animated relative not-italic"
                      data-style="text"
                      is="highlighted-text"
                      style={secondaryEmStyle}
                    >
                      {secondary}
                    </em>
                  </span>
                )}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
