import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

/** Matches inline `<style>` from `diabetes-care.html` for this section id. */
const CUSTOM_SECTION_STYLE = `#shopify-section-template--26520397447459__custom_section_WpXaJg{--section-padding-top:32px;--section-padding-bottom:32px;--color-background:245 242 237}@media screen and (max-width: 767px){#shopify-section-template--26520397447459__custom_section_WpXaJg{--section-padding-top:24px;--section-padding-bottom:24px}}`;

/** Matches inline `<style>` from `diabetes-care.html` for this section id. */
const NUMBER_COUNTER_STYLE = `#shopify-section-template--26520397447459__number_counter_dTAx7w{--section-padding-top:40px;--section-padding-bottom:40px;--section-blocks-count:4}@media screen and (min-width:1024px){#shopify-section-template--26520397447459__number_counter_dTAx7w .multicolumn{--card-grid-gap:clamp(40px,3.5vw,60px)}}@media screen and (max-width: 767px){#shopify-section-template--26520397447459__number_counter_dTAx7w{--section-padding-top:28px;--section-padding-bottom:32px}}`;

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

const splitWordsStyle: ShopifyThemeStyle = {
  '--word-total': 4,
};

export interface StatsBandStatRow {
  value: string;
  description: string;
}

export interface StatsBandProps {
  className?: string;
  logoImage?: string;
  logoAlt?: string;
  logoLink?: { href?: string; target?: string };
  headlinePrefix?: string;
  headlineAccent?: string;
  /** When not `false`, accent words use Shopify CSS (`rgb(var(--color-highlight))`). */
  accentUseThemeHighlight?: boolean;
  /** Used when `accentUseThemeHighlight` is `false` (Makeswift Color control value). */
  accentHeadingColor?: string;
  stats?: StatsBandStatRow[];
}

const DEFAULT_STATS: StatsBandStatRow[] = [
  { value: '9.7', description: 'of Canadians live with diagnosed diabetes' },
  { value: '6.3', description: 'of adults aged 20 to 79 years had prediabetes' },
  { value: '60', description: 'of Canadians believe diabetes is caused only by lifestyle choices' },
  { value: '40', description: 'of adults with Type 1 diabetes are initially misdiagnosed' },
];

export function StatsBand({
  className,
  logoImage,
  logoAlt,
  logoLink,
  headlinePrefix,
  headlineAccent,
  accentUseThemeHighlight,
  accentHeadingColor,
  stats,
}: StatsBandProps) {
  const rows = stats !== undefined && stats.length > 0 ? stats : DEFAULT_STATS;
  const logoHref = logoLink?.href ?? 'https://liivv.ca/pages/diabetes-care';
  const prefix = headlinePrefix ?? 'Diabetes and';
  const accent = headlineAccent ?? 'Everyday Living';
  const alt = logoAlt ?? 'Liivv Diabetes';
  const useThemeHighlight = accentUseThemeHighlight !== false;
  const accentEmStyle: ShopifyThemeStyle | undefined =
    !useThemeHighlight &&
    typeof accentHeadingColor === 'string' &&
    accentHeadingColor.trim().length > 0
      ? { color: accentHeadingColor }
      : undefined;

  return (
    <div className={clsx('stats-band max-w-full overflow-x-hidden', className)}>
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
                <span className="split-words words splitting block" style={splitWordsStyle}>
                  {prefix}{' '}
                  <em
                    className="highlighted-text animated relative not-italic"
                    data-style="text"
                    is="highlighted-text"
                    style={accentEmStyle}
                  >
                    {accent}
                  </em>
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div
        className="shopify-section"
        id="shopify-section-template--26520397447459__number_counter_dTAx7w"
      >
        <style dangerouslySetInnerHTML={{ __html: NUMBER_COUNTER_STYLE }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width page-width--full relative px-4 sm:px-5 md:px-0">
            <slider-element className="slider slider--tablet grid" selector=".card-grid>.card">
              <div className="multicolumn with-4 card-grid card-grid--4 mobile:card-grid--1 z-1 relative grid">
                {rows.map((row, index) => (
                  <div
                    className="counter-card card flex w-full min-w-0 flex-col items-center gap-4 px-1 text-center sm:gap-5 sm:px-0 md:items-start md:text-center xl:flex-row"
                    key={`${row.value}-${index}`}
                  >
                    <div className="grid w-full min-w-0 gap-3 sm:gap-4 lg:gap-6">
                      <div className="counter-heading heading title-lg font-bold leading-none tracking-tight sm:whitespace-nowrap">
                        <span>{row.value}</span>%
                      </div>
                      <div className="heading text-xl leading-snug tracking-tight sm:text-2xl sm:leading-none lg:text-3xl">
                        {row.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </slider-element>
          </div>
        </div>
      </div>
    </div>
  );
}
