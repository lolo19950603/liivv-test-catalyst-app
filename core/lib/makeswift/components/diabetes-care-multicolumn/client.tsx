import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { answerHtmlForRte } from '~/lib/makeswift/components/diabetes-care-faq/shared';
import { ArchiveHighlightedText } from '~/lib/makeswift/components/diabetes-care-faq/archive-highlighted-text';
import {
  DC_MOBILE_STACK_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
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

/** Desktop: 4 per row by default; 6 columns use 3 per row (2 rows). Cap at 6. */
const MAX_COLUMNS = 6;

/** Matches archived `--color-background` on `multicolumn_JtTdUn`. */
const DEFAULT_BACKGROUND_CHANNELS = ARCHIVE_SAGE_BACKGROUND_CHANNELS;

/**
 * Inline `<style>` from `diabetes-care.html` for this section id (theme color tokens + grid gap).
 * Appends `--section-blocks-count` and desktop column-per-row media rules when needed.
 */
/** Matches archive `card-grid` gap (home `multicolumn_xg87qF` uses ~`var(--sp-6)` at desktop, not 40–60px). */
const MULTICOLUMN_CARD_GRID_GAP = 'clamp(var(--sp-4),1.263vw,var(--sp-6))';

/** How many cards sit on one desktop row for a given total count. */
function desktopPerRow(count: number): number {
  if (count <= 1) {
    return 1;
  }

  if (count === 2) {
    return 2;
  }

  if (count === 3 || count === 6) {
    return 3;
  }

  // 4 or 5 → four across (5th centers on the next row via flex).
  return 4;
}

/**
 * Prefer content-sized tracks + justify-center for short rows over full-bleed 1fr
 * (left-aligned copy makes equal 1fr halves look off-center).
 */
function isNarrowCenteredCount(count: number): boolean {
  return count > 0 && count <= 2;
}

/** Per-card max width when centering a short row as a flex group. */
function narrowCardMaxWidth(count: number): string {
  return count <= 1 ? '36rem' : '26rem';
}

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
  // Allow wrapped rows to paint; archive scroll-reveal overflow was clipping row 2.
  `#${MULTICOLUMN_SECTION_ID} [data-dc-scroll-reveal]{overflow:visible}` +
  `@media screen and (min-width:768px){#${MULTICOLUMN_SECTION_ID} .multicolumn{--card-grid-gap:${MULTICOLUMN_CARD_GRID_GAP}}}`;

function multicolumnSectionStyle(
  blockCount: number,
  titleAlign: TextAlign,
  introAlign: TextAlign,
): string {
  const id = `#${MULTICOLUMN_SECTION_ID}`;
  const perRow = desktopPerRow(blockCount);
  let style =
    `${MULTICOLUMN_ARCHIVE_STYLE}${multicolumnMobileTitleCss(titleAlign)}${multicolumnIntroAlignCss(introAlign)}${id}{--section-blocks-count:${String(blockCount)}}`;

  if (blockCount > 0) {
    // Beat archive `.slider--tablet .card-grid { grid: auto/auto-flow 36vw }` which
    // kept all cards on one horizontal track (only ~3 visible, rest clipped).
    const leftover = blockCount % perRow;
    const narrow = isNarrowCenteredCount(blockCount);
    const cardMax = narrowCardMaxWidth(blockCount);
    style +=
      `@media screen and (min-width:768px){` +
      `${id} .mc-cols-host,` +
      `${id} [data-dc-scroll-reveal]:has(.mc-cols){` +
      `display:block!important;` +
      `width:100%!important;` +
      `max-width:100%!important;` +
      `}` +
      (narrow
        ? // 1–2 columns: flex-center a content-sized group in the full row.
          `${id} .multicolumn.mc-cols.mc-cols--narrow,` +
          `${id} .slider .multicolumn.mc-cols.mc-cols--narrow,` +
          `${id} .slider--tablet .multicolumn.mc-cols.mc-cols--narrow{` +
          `display:flex!important;` +
          `flex-direction:row!important;` +
          `flex-wrap:wrap!important;` +
          `justify-content:center!important;` +
          `align-items:stretch!important;` +
          `align-content:center!important;` +
          `gap:${MULTICOLUMN_CARD_GRID_GAP}!important;` +
          `grid:none!important;` +
          `grid-template-columns:none!important;` +
          `--card-grid-template:none!important;` +
          `--slider-grid:none!important;` +
          `--slider-item-width:unset!important;` +
          `--card-grid-per-row:${String(perRow)}!important;` +
          `width:100%!important;` +
          `max-width:100%!important;` +
          `margin-left:0!important;` +
          `margin-right:0!important;` +
          `overflow:visible!important;` +
          `}` +
          `${id} .multicolumn.mc-cols.mc-cols--narrow > .multicolumn-card{` +
          `flex:0 1 ${cardMax}!important;` +
          `width:100%!important;` +
          `max-width:${cardMax}!important;` +
          `min-width:min(100%,16rem)!important;` +
          `}`
        : `${id} .multicolumn.mc-cols,` +
          `${id} .slider .multicolumn.mc-cols,` +
          `${id} .slider--tablet .multicolumn.mc-cols{` +
          `display:grid!important;` +
          `grid:none!important;` +
          `grid-template-columns:repeat(${String(perRow)},minmax(0,1fr))!important;` +
          `grid-auto-flow:row!important;` +
          `--card-grid-template:none!important;` +
          `--slider-grid:none!important;` +
          `--slider-item-width:unset!important;` +
          `--card-grid-per-row:${String(perRow)}!important;` +
          `gap:${MULTICOLUMN_CARD_GRID_GAP}!important;` +
          `justify-content:center;` +
          `justify-items:stretch;` +
          `align-items:stretch;` +
          `overflow:visible!important;` +
          `width:100%!important;` +
          `max-width:100%!important;` +
          `margin-inline:auto!important;` +
          `}` +
          `${id} .multicolumn.mc-cols > .multicolumn-card,` +
          `${id} .slider--tablet .multicolumn.mc-cols > .multicolumn-card{` +
          `width:auto!important;` +
          `max-width:none!important;` +
          `min-width:0!important;` +
          `flex:none!important;` +
          `}`) +
      `}`;

    // Incomplete last row (e.g. 5 cards → 4+1): center leftover card(s).
    if (!narrow && perRow > 1 && leftover !== 0) {
      const startCol = Math.floor((perRow - leftover) / 2) + 1;
      style += `@media screen and (min-width:768px){`;
      for (let i = 0; i < leftover; i += 1) {
        const childIndex = blockCount - leftover + i + 1;
        style +=
          `${id} .multicolumn.mc-cols > .multicolumn-card:nth-child(${String(childIndex)})` +
          `{grid-column:${String(startCol + i)} / span 1}`;
      }
      style += `}`;
    }
  }

  return style;
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

/** Column secondary: color + font size only (no swash). */
export type MulticolumnPlainTextBlockProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

/** Column body: HTML in `text` (and optional `bodyHtml`). */
export type MulticolumnBodyBlockProps = {
  /** HTML or plain text (rendered as RTE). */
  text?: string;
  bodyHtml?: string;
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
  body?: MulticolumnBodyBlockProps;
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
  /** Thin border around each column card (archive `with-border`). */
  showCardBorders?: boolean;
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

function readColumnBody(row: DiabetesCareMulticolumnColumn): MulticolumnBodyBlockProps | undefined {
  if (row.body != null) {
    return row.body;
  }

  const legacy = row.content?.body;

  if (legacy != null && String(legacy).trim().length > 0) {
    return { text: String(legacy) };
  }

  return undefined;
}

function resolveColumnBodyHtml(body: MulticolumnBodyBlockProps | undefined): string {
  const htmlRaw = body?.bodyHtml?.trim() ?? '';

  if (htmlRaw.length > 0) {
    return answerHtmlForRte(htmlRaw);
  }

  const textRaw = body?.text?.trim() ?? '';

  if (textRaw.length === 0) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(textRaw)) {
    return answerHtmlForRte(textRaw);
  }

  // Legacy plain TextArea: each non-empty line becomes a paragraph.
  return answerHtmlForRte(textRaw.replace(/\n+/g, '\n\n'));
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
  const bodyHtml = resolveColumnBodyHtml(readColumnBody(row));
  const { imageSrc } = readColumnImage(row);
  const { buttonText } = readColumnButton(row);
  const image = imageSrc?.trim() ?? '';
  const button = buttonText?.trim() ?? '';

  return (
    headingText.length > 0 ||
    secondaryText.length > 0 ||
    bodyHtml.length > 0 ||
    image.length > 0 ||
    button.length > 0
  );
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
  block?: MulticolumnPlainTextBlockProps | MulticolumnBodyBlockProps | null,
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
  block: MulticolumnPlainTextBlockProps | MulticolumnBodyBlockProps | undefined,
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
  showCardBorders = true,
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

  const rows = (columns ?? []).filter(columnHasContent).slice(0, MAX_COLUMNS);
  const sectionVars: ShopifyThemeStyle = {
    '--section-blocks-count': rows.length,
  };
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

            <ScrollReveal delayMs={100} className="w-full">
              <div
                className={clsx('mc-cols-host w-full', DC_MOBILE_STACK_CLASS)}
                id={MULTICOLUMN_SLIDER_ID}
              >
                <div
                  className={clsx(
                    'multicolumn mc-cols card-grid mobile:card-grid--1 relative z-1 w-full items-stretch',
                    isNarrowCenteredCount(rows.length) && 'mc-cols--narrow',
                  )}
                >
                  {rows.map((row, index) => {
                    const headingBlock = readColumnHeading(row);
                    const secondaryBlock = readColumnSecondaryHeading(row);
                    const bodyBlock = readColumnBody(row);
                    const legacyBodyStyle = legacyColumnBodyTypographyStyle(row.bodyText);
                    const bodyHtml = resolveColumnBodyHtml(bodyBlock);

                    const headingText = headingBlock?.text?.trim() ?? '';
                    const secondaryText = secondaryBlock?.text?.trim() ?? '';
                    const bodyText = bodyHtml;

                    const img = readColumnImage(row);
                    const btn = readColumnButton(row);

                    const imageSrc = img.imageSrc?.trim();
                    const showImage = imageSrc != null && imageSrc.length > 0;
                    const columnButton = resolveArchiveButton(btn, { requireHref: false });

                    const headingAccent = resolveAccentColors(headingBlock);

                    return (
                      <div
                        className={clsx(
                          'multicolumn-card card flex h-full w-full min-h-0 flex-col items-start gap-5 text-left md:text-left',
                          showCardBorders && 'with-border',
                        )}
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

                              {bodyHtml.length > 0 ? (
                                <div
                                  className={clsx(
                                    COLUMN_COPY_TEXT,
                                    'rte min-h-0 flex-1 leading-normal',
                                    '[&_p]:m-0 [&_p+p]:mt-3',
                                    '[&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-2',
                                    '[&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-2',
                                    '[&_li]:m-0',
                                    '[&_a]:underline [&_a]:underline-offset-2',
                                    '[&_strong]:font-semibold',
                                  )}
                                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                                  style={mergePlainWithLegacy(bodyBlock, legacyBodyStyle)}
                                />
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
