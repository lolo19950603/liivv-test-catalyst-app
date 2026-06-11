import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import {
  DC_MOBILE_STACK_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import { ArchiveHighlightedText } from '~/lib/makeswift/components/diabetes-care-faq/archive-highlighted-text';
import {
  resolveTextAlign,
  textAlignClass,
  type TextAlign,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { ARCHIVE_SAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingTypographyProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import {
  isHighlightOverrideEnabled,
  resolveAccentColors,
  resolvePlainTextColor,
} from '~/lib/makeswift/utils/heading-accent-color';

/** CSS variables used by migrated Shopify section markup (avoids `as CSSProperties`). */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

/** Stable id aligned with `multicolumn_JtTdUn` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const MULTICOLUMN_SECTION_ID = 'shopify-section-template--26520397447459__multicolumn_JtTdUn';

const MULTICOLUMN_SLIDER_ID = 'Slider-template--26520397447459__multicolumn_JtTdUn';

/** Desktop grid: four columns per row; additional columns wrap to the next row. */
const DESKTOP_COLUMNS_PER_ROW = 4;

/** Matches archived `--color-background` on `multicolumn_JtTdUn`. */
const DEFAULT_BACKGROUND_CHANNELS = ARCHIVE_SAGE_BACKGROUND_CHANNELS;

/**
 * Inline `<style>` from `diabetes-care.html` for this section id (theme color tokens + grid gap).
 * Appends `--section-blocks-count` and a four-column-per-row media rule when needed.
 */
/** Matches archive `card-grid` gap (home `multicolumn_xg87qF` uses ~`var(--sp-6)` at desktop, not 40–60px). */
const MULTICOLUMN_CARD_GRID_GAP = 'clamp(var(--sp-4),1.263vw,var(--sp-6))';

function multicolumnMobileTitleAlignCss(align: TextAlign): string {
  const justify =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    `#${MULTICOLUMN_SECTION_ID} .title-wrapper.mc-title-align-${align} h2.title-lg .split-words{` +
    `display:flex;width:100%;justify-content:${justify};text-wrap:balance}`
  );
}

/** Uniform section title on mobile — overrides Makeswift inline sizes on split-word segments. */
function multicolumnMobileTitleCss(titleAlign: TextAlign): string {
  return (
    `@media screen and (max-width:767px){#${MULTICOLUMN_SECTION_ID}{--title-lg:clamp(1.25rem,4.5vw,1.5rem)}` +
    `#${MULTICOLUMN_SECTION_ID} .title-wrapper h2.title-lg,` +
    `#${MULTICOLUMN_SECTION_ID} .title-wrapper h2.title-lg .split-words,` +
    `#${MULTICOLUMN_SECTION_ID} .title-wrapper h2.title-lg .split-words :is(.word,[data-dc-animate-child],.highlighted-text){` +
    `font-size:clamp(1.25rem,4.5vw,1.5rem)!important;line-height:1.1!important;letter-spacing:-0.02em}` +
    `${multicolumnMobileTitleAlignCss(titleAlign)}}`
  );
}

/** Archive `.title-wrapper.text-center .description` centers the max-width block; we use `mc-intro-align-*` instead. */
function multicolumnIntroAlignCss(introAlign: TextAlign): string {
  const id = `#${MULTICOLUMN_SECTION_ID}`;
  const selector = `${id} .title-wrapper .description.mc-intro-align-${introAlign}`;
  const justifySelf =
    introAlign === 'left' ? 'start' : introAlign === 'right' ? 'end' : 'center';

  return (
    `${selector},${selector} p{text-align:${introAlign}}` +
    `@media screen and (min-width:768px){${selector}{justify-self:${justifySelf}}}`
  );
}

const MULTICOLUMN_ARCHIVE_STYLE =
  `#${MULTICOLUMN_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;--color-background:${DEFAULT_BACKGROUND_CHANNELS};--color-foreground:49 47 47;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-highlight:243 199 190;--color-button-background:255 255 255;--color-button-border:255 255 255;--color-button-text:49 47 47}` +
  `#${MULTICOLUMN_SECTION_ID} [data-dc-scroll-reveal]{overflow:hidden}` +
  `@media screen and (min-width:768px){#${MULTICOLUMN_SECTION_ID} .multicolumn{--card-grid-gap:${MULTICOLUMN_CARD_GRID_GAP}}}` +
  `@media screen and (min-width:1024px){#${MULTICOLUMN_SECTION_ID} .slider.slider--tablet{overflow:visible;padding-inline:0;margin-inline:0;padding-block-end:0}}`;

function multicolumnSectionStyle(
  blockCount: number,
  titleAlign: TextAlign,
  introAlign: TextAlign,
): string {
  const id = `#${MULTICOLUMN_SECTION_ID}`;
  let style =
    `${MULTICOLUMN_ARCHIVE_STYLE}${multicolumnMobileTitleCss(titleAlign)}${multicolumnIntroAlignCss(introAlign)}${id}{--section-blocks-count:${String(blockCount)}}`;

  if (blockCount >= DESKTOP_COLUMNS_PER_ROW) {
    style += `@media screen and (min-width:768px){${id} .multicolumn.with-4.card-grid.card-grid--4{--card-grid-per-row:${String(DESKTOP_COLUMNS_PER_ROW)}}}`;
  }

  if (blockCount === 3) {
    style +=
      `@media screen and (min-width:768px){${id} .multicolumn.with-3.card-grid.card-grid--3{--card-grid-per-row:3;--card-grid-gap:${MULTICOLUMN_CARD_GRID_GAP};--card-grid-template:auto-flow dense/repeat(3,minmax(0,1fr))}}` +
      `@media screen and (min-width:768px){${id} .slider.slider--tablet .multicolumn.with-3.card-grid{--slider-item-width:unset;--slider-grid:unset;grid:var(--card-grid-template)}}`;
  }

  return style;
}

function multicolumnCardGridModifierClass(count: number): string | undefined {
  if (count <= 0) {
    return undefined;
  }

  const n = count;

  if (n >= DESKTOP_COLUMNS_PER_ROW) {
    return 'with-4 card-grid--4';
  }

  if (n === 3) {
    return 'with-3 card-grid--3';
  }

  if (n === 2) {
    return 'with-2';
  }

  if (n === 1) {
    return 'with-1';
  }

  return undefined;
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

/** Column secondary / body: color + font size only (no swash). */
export type MulticolumnPlainTextBlockProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

/** Column heading: optional highlight swash. */
export type MulticolumnSwashTextBlockProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
} & HeadingAccentColorProps;

export type MulticolumnColumnImageProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export type MulticolumnColumnButtonProps = ArchiveButtonProps;

/** @deprecated Legacy nested `content` + `bodyText` */
export type MulticolumnCardContentProps = {
  title?: string;
  subheading?: string;
  body?: string;
};

export interface DiabetesCareMulticolumnColumn {
  heading?: MulticolumnSwashTextBlockProps;
  secondaryHeading?: MulticolumnPlainTextBlockProps;
  body?: MulticolumnPlainTextBlockProps;
  image?: MulticolumnColumnImageProps;
  button?: MulticolumnColumnButtonProps;
  content?: MulticolumnCardContentProps;
  bodyText?: BodyTextProps & { fontSize?: number; fontSizeMobile?: number };
  title?: string;
  subheading?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  buttonLink?: { href?: string; target?: string };
}

export type IntroBodyTypographyProps = BodyTextProps & {
  body?: string;
  fontSize?: number;
  fontSizeMobile?: number;
  textAlign?: TextAlign;
};

export type TopHeadingTypographyProps = BodyTextProps & {
  text?: string;
  fontSize?: number;
  fontSizeMobile?: number;
  textAlign?: TextAlign;
};

export type DiabetesCareMulticolumnProps = {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  topHeading?: TopHeadingTypographyProps;
  primaryHeading?: HeadingTypographyProps;
  secondaryHeading?: HeadingWithHighlightProps;
  intro?: IntroBodyTypographyProps;
  columns?: DiabetesCareMulticolumnColumn[];
};

function readColumnHeading(row: DiabetesCareMulticolumnColumn): MulticolumnSwashTextBlockProps | undefined {
  if (row.heading != null) {
    return row.heading;
  }

  const legacy = row.content?.title ?? row.title;

  if (legacy != null && String(legacy).trim().length > 0) {
    return { text: String(legacy) };
  }

  return undefined;
}

function readColumnSecondaryHeading(
  row: DiabetesCareMulticolumnColumn,
): MulticolumnPlainTextBlockProps | undefined {
  if (row.secondaryHeading != null) {
    return row.secondaryHeading;
  }

  const legacy = row.content?.subheading ?? row.subheading;

  if (legacy != null && String(legacy).trim().length > 0) {
    return { text: String(legacy) };
  }

  return undefined;
}

function readColumnBody(row: DiabetesCareMulticolumnColumn): MulticolumnPlainTextBlockProps | undefined {
  if (row.body != null) {
    return row.body;
  }

  const legacy = row.content?.body;

  if (legacy != null && String(legacy).trim().length > 0) {
    return { text: String(legacy) };
  }

  return undefined;
}

function readColumnImage(row: DiabetesCareMulticolumnColumn): MulticolumnColumnImageProps {
  return {
    imageSrc: row.image?.imageSrc ?? row.imageSrc,
    imageAlt: row.image?.imageAlt ?? row.imageAlt,
  };
}

function readColumnButton(row: DiabetesCareMulticolumnColumn): MulticolumnColumnButtonProps {
  const group = row.button;

  return {
    ...(group != null && typeof group === 'object' ? group : {}),
    buttonText: group?.buttonText ?? group?.label ?? row.buttonText,
    buttonLink: group?.buttonLink ?? group?.link ?? row.buttonLink,
  };
}

function columnHasContent(row: DiabetesCareMulticolumnColumn): boolean {
  const headingText = readColumnHeading(row)?.text?.trim() ?? '';
  const secondaryText = readColumnSecondaryHeading(row)?.text?.trim() ?? '';
  const bodyText = readColumnBody(row)?.text?.trim() ?? '';
  const { imageSrc } = readColumnImage(row);
  const { buttonText } = readColumnButton(row);
  const image = imageSrc?.trim() ?? '';
  const button = buttonText?.trim() ?? '';

  return (
    headingText.length > 0 ||
    secondaryText.length > 0 ||
    bodyText.length > 0 ||
    image.length > 0 ||
    button.length > 0
  );
}

/** Body split into paragraphs; empty lines omitted. */
function bodyParagraphs(body: string): string[] {
  return body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function topHeadingStyle(topHeading?: TopHeadingTypographyProps | null): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: topHeading?.textColor,
    textColorHex: topHeading?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(topHeading?.fontSize, topHeading?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function introBodyStyle(intro?: IntroBodyTypographyProps | null): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: intro?.textColor,
    textColorHex: intro?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(intro?.fontSize, intro?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

/** Column heading only: font size, text color, optional `--color-highlight` for swash. */
function multicolumnSwashBlockStyle(
  block?: MulticolumnSwashTextBlockProps | null,
): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: block?.textColor,
    textColorHex: block?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(block?.fontSize, block?.fontSizeMobile);
  const { highlightChannels } = resolveAccentColors(block);

  if (color == null && fontSize == null && highlightChannels == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
    ...(highlightChannels != null ? { '--color-highlight': highlightChannels } : {}),
  };
}

/** Legacy `bodyText` color/size applied to secondary + body when new blocks omit colors. */
function legacyColumnBodyTypographyStyle(
  bodyText?: (BodyTextProps & { fontSize?: number; fontSizeMobile?: number }) | null,
): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: bodyText?.textColor,
    textColorHex: bodyText?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(bodyText?.fontSize, bodyText?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function columnPlainTypographyStyle(
  block?: MulticolumnPlainTextBlockProps | null,
): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: block?.textColor,
    textColorHex: block?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(block?.fontSize, block?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function mergePlainWithLegacy(
  block: MulticolumnPlainTextBlockProps | undefined,
  legacy?: CSSProperties | null,
): CSSProperties | undefined {
  const primary = columnPlainTypographyStyle(block);

  if (primary == null) {
    return legacy ?? undefined;
  }

  if (legacy == null) {
    return primary;
  }

  return { ...legacy, ...primary };
}

/** ~10% smaller than `text-sm` / `md:text-base` for secondary heading + body. */
const COLUMN_COPY_TEXT =
  'text-[calc(0.875rem_*_0.9)] leading-normal md:text-[calc(1rem_*_0.9)]';

export function DiabetesCareMulticolumn({
  className,
  background,
  roundedTop = true,
  topHeading,
  primaryHeading,
  secondaryHeading,
  intro,
  columns,
}: DiabetesCareMulticolumnProps) {
  const primaryResolved = resolveHeadingTypography(primaryHeading);
  const secondaryResolved = resolveHeadingTypography(secondaryHeading);

  const primaryText = primaryResolved.text;
  const secondaryText = secondaryResolved.text;
  const hasSectionHeading = primaryText.length > 0 || secondaryText.length > 0;

  const rows = (columns ?? []).filter(columnHasContent);
  const sectionVars: ShopifyThemeStyle = {
    '--section-blocks-count': rows.length,
  };
  const useThemeColumnsOnly = rows.length >= 3;
  const topHeadingText = topHeading?.text?.trim() ?? '';
  const topHeadingAlign = resolveTextAlign(topHeading?.textAlign);
  const titleAlign = resolveTextAlign(
    primaryHeading?.textAlign,
    secondaryHeading?.textAlign,
  );
  const introAlign = resolveTextAlign(intro?.textAlign, titleAlign);

  const introCopy = intro?.body?.trim() ?? '';
  const hasTitleBlock =
    topHeadingText.length > 0 || hasSectionHeading || introCopy.length > 0;

  const { sectionCss, sectionStyle: themeStyle } = buildSectionTheme({
    sectionId: MULTICOLUMN_SECTION_ID,
    sectionCss: multicolumnSectionStyle(rows.length, titleAlign, introAlign),
    background,
    // Swash color is scoped to the section title only (see `sectionTitleStyle` below), not
    // every `.highlighted-text` in the column cards.
    defaultBackgroundChannels: DEFAULT_BACKGROUND_CHANNELS,
  });

  const useSecondaryTitleSwash = isHighlightOverrideEnabled(
    secondaryHeading?.useCustomHighlightColor,
  );
  const sectionTitleStyle: ShopifyThemeStyle | undefined = useSecondaryTitleSwash
    ? {
        '--color-highlight':
          secondaryResolved.highlightChannels ?? '0 0 0 / 0',
      }
    : undefined;

  return (
    <div
      className={clsx(
        'diabetes-care-multicolumn',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div
        className="shopify-section"
        id={MULTICOLUMN_SECTION_ID}
        style={{ ...sectionVars, ...themeStyle }}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx('section section--padding relative', roundedTop && 'section--rounded')}
        >
          <div className="page-width relative">
            {hasTitleBlock ? (
              <div
                className={clsx(
                  'title-wrapper relative z-1 mb-10 flex flex-col gap-4 leading-none md:mb-12 md:justify-between lg:gap-8',
                  `mc-title-align-${titleAlign}`,
                )}
              >
                <div className="grid w-full gap-4">
                  {topHeadingText.length > 0 ? (
                    <p
                      className={clsx(
                        'heading subtext-lg font-medium normal-case leading-normal tracking-none',
                        textAlignClass(topHeadingAlign),
                      )}
                      style={topHeadingStyle(topHeading)}
                    >
                      {topHeadingText}
                    </p>
                  ) : null}
                  {hasSectionHeading ? (
                    <h2
                      className={clsx(
                        'heading title-lg tracking-heading',
                        textAlignClass(titleAlign),
                      )}
                      style={sectionTitleStyle}
                    >
                      <AccentSplitWordsHeading
                        accentColors={useSecondaryTitleSwash ? secondaryHeading : undefined}
                        emphasis={secondaryText}
                        emphasisColor={secondaryResolved.emphasisColor}
                        emphasisFontSize={secondaryResolved.fontSize}
                        highlightStyle={useSecondaryTitleSwash ? 'half_text' : 'text'}
                        lead={primaryText}
                        leadColor={primaryResolved.color}
                        leadFontSize={primaryResolved.fontSize}
                      />
                    </h2>
                  ) : null}
                  {introCopy.length > 0 ? (
                    <div
                      className={clsx(
                        'description rte subtext-lg leading-normal',
                        textAlignClass(introAlign),
                        `mc-intro-align-${introAlign}`,
                      )}
                      style={introBodyStyle(intro)}
                    >
                      {introCopy
                        .split(/\n+/)
                        .map((p) => p.trim())
                        .filter((p) => p.length > 0)
                        .map((p, i) => (
                          <p key={`intro-${i}`}>{p}</p>
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <ScrollReveal delayMs={100}>
              <div
                className={clsx('grid slider slider--tablet', DC_MOBILE_STACK_CLASS)}
                id={MULTICOLUMN_SLIDER_ID}
              >
                <div
                  className={clsx(
                    'multicolumn card-grid mobile:card-grid--1 relative z-1 grid items-stretch',
                    multicolumnCardGridModifierClass(rows.length),
                    !useThemeColumnsOnly &&
                      (rows.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-2'),
                  )}
                >
                  {rows.map((row, index) => {
                    const headingBlock = readColumnHeading(row);
                    const secondaryBlock = readColumnSecondaryHeading(row);
                    const bodyBlock = readColumnBody(row);
                    const legacyBodyStyle = legacyColumnBodyTypographyStyle(row.bodyText);

                    const headingText = headingBlock?.text?.trim() ?? '';
                    const secondaryText = secondaryBlock?.text?.trim() ?? '';
                    const bodyText = bodyBlock?.text?.trim() ?? '';

                    const img = readColumnImage(row);
                    const btn = readColumnButton(row);

                    const imageSrc = img.imageSrc?.trim();
                    const showImage = imageSrc != null && imageSrc.length > 0;
                    const columnButton = resolveArchiveButton(btn, { requireHref: false });

                    const headingAccent = resolveAccentColors(headingBlock);

                    return (
                      <div
                        className="multicolumn-card with-border card flex h-full w-full min-h-0 flex-col items-start gap-5 text-left md:text-left"
                        key={`multicolumn-${index}`}
                      >
                        {showImage ? (
                          <div className="media media--square mobile:media--wide relative w-full shrink-0 overflow-hidden rounded-3xl">
                            <img
                              alt={img.imageAlt?.trim() ?? ''}
                              className="aspect-square w-full object-cover md:aspect-square"
                              height={520}
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 520px"
                              src={imageSrc}
                              width={520}
                            />
                          </div>
                        ) : null}
                        <div className="grid w-full gap-4 lg:gap-6">
                          <div
                            className={clsx(
                              'multicolumn-card__info grid min-h-0 w-full gap-4 lg:gap-6',
                              columnButton.visible &&
                                bodyText.length === 0 &&
                                secondaryText.length === 0 &&
                                (headingText.length > 0 || showImage) &&
                                'h-full',
                            )}
                          >
                          {headingText.length > 0 ? (
                            <p
                              className="heading text-2xl leading-tight tracking-tight lg:text-3xl"
                              style={multicolumnSwashBlockStyle(headingBlock)}
                            >
                              <ArchiveHighlightedText
                                color={resolvePlainTextColor(headingBlock)}
                                highlightStyle={headingAccent.highlightStyle}
                              >
                                {headingText}
                              </ArchiveHighlightedText>
                            </p>
                          ) : null}

                          {(secondaryText.length > 0 || bodyText.length > 0) ? (
                            <div
                              className={clsx(
                                'flex min-h-0 flex-col gap-0',
                                columnButton.visible &&
                                  (secondaryText.length > 0 || bodyText.length > 0) &&
                                  'flex-1',
                              )}
                            >
                              {secondaryText.length > 0 ? (
                                <p
                                  className={clsx(
                                    COLUMN_COPY_TEXT,
                                    'm-0 shrink-0 font-bold leading-normal',
                                  )}
                                  style={mergePlainWithLegacy(secondaryBlock, legacyBodyStyle)}
                                >
                                  {secondaryText}
                                </p>
                              ) : null}

                              {bodyText.length > 0 ? (
                                <div
                                  className={clsx(
                                    COLUMN_COPY_TEXT,
                                    'rte min-h-0 flex-1 leading-normal [&_p]:m-0 [&_p+p]:mt-3',
                                  )}
                                  style={mergePlainWithLegacy(bodyBlock, legacyBodyStyle)}
                                >
                                  {bodyParagraphs(bodyText).map((para, pi) => (
                                    <p key={`col-${index}-b-${pi}`}>{para}</p>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {columnButton.visible ? (
                            <p
                              className={
                                bodyText.length > 0 ||
                                secondaryText.length > 0 ||
                                headingText.length > 0 ||
                                showImage
                                  ? 'mt-auto pt-1'
                                  : 'mt-1'
                              }
                            >
                              <ArchiveShopifyButton
                                className="button--secondary button--md icon-with-text"
                                colors={columnButton.colors}
                                href={columnButton.href}
                                rel={columnButton.rel}
                                target={columnButton.target}
                                variant="secondary"
                              >
                                {columnButton.text}
                                <IconArrowRight />
                              </ArchiveShopifyButton>
                            </p>
                          ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
