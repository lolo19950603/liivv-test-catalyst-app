'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveCssColor } from '~/lib/makeswift/utils/archive-color';
import {
  resolvePlainTextColor,
  type PlainTextColorProps,
} from '~/lib/makeswift/utils/heading-accent-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  ARCHIVE_COLLAGE_GRID_IMAGE_FADE_CSS,
  ARCHIVE_COLLAGE_GRID_SECTION_ID,
  ARCHIVE_COLLAGE_GRID_VARS,
} from './archive-styles';

type ImageAlignX = 'left' | 'center' | 'right';
type ImageAlignY = 'top' | 'center' | 'bottom';

export type CollageTitlePartProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type ArchiveCollageItemProps = {
  imageMedia?: {
    image?: unknown;
    imageAlt?: string;
    imageAlignX?: ImageAlignX;
    imageAlignY?: ImageAlignY;
  };
  image?: unknown;
  imageAlt?: string;
  imageAlignX?: ImageAlignX;
  imageAlignY?: ImageAlignY;
  titleContent?: {
    primaryTitle?: CollageTitlePartProps | string;
    secondaryTitle?: CollageTitlePartProps | string;
    /** @deprecated Nested under `primaryTitle` / `secondaryTitle` groups. */
    primaryTitleColor?: PlainTextColorProps | string;
    /** @deprecated Nested under `primaryTitle` / `secondaryTitle` groups. */
    secondaryTitleColor?: PlainTextColorProps | string;
    link?: { href?: string; target?: string };
  };
  link?: { href?: string; target?: string };
  /** Column span (1–12). Defaults to 3 (i.e. 4 across on desktop). */
  columnSpan?: number;
  /** Row span (1–4). Defaults to 2. */
  rowSpan?: number;
  /** Text-only block background (picker + hex override). */
  blockBackground?: {
    color?: string;
    colorHex?: string;
  };
  primaryTitle?: string;
  secondaryTitle?: string;
  primaryTitleColor?: PlainTextColorProps | string;
  secondaryTitleColor?: PlainTextColorProps | string;
  /** @deprecated Use `primaryTitle`. */
  title?: string;
  /** @deprecated Use `primaryTitleColor` / `secondaryTitleColor`. */
  titleColor?: string;
  /** @deprecated Use `blockBackground`. */
  blockBackgroundColor?: string;
};

export type ArchiveCollageCtaButtonProps = ArchiveButtonProps & {
  /** Desktop width percentage of the row (0–100). */
  widthPct?: number;
};

export type ArchiveCollageCtaRowProps = {
  enabled?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  primary?: ArchiveCollageCtaButtonProps;
  secondary?: ArchiveCollageCtaButtonProps;
};

export interface ArchiveCollageGridProps {
  className?: string;
  background?: SectionBackgroundProps;
  items?: ArchiveCollageItemProps[];
  rowHeight?: number;
  desktopGap?: number;
  mobileGap?: number;
  roundedTop?: boolean;
  cta?: ArchiveCollageCtaRowProps;
}

/** Matches `blockBackground` default in register.ts (`#f3eded`). */
const DEFAULT_TEXT_BLOCK_BACKGROUND = '#f3eded';
const DEFAULT_COLLAGE_TITLE_FONT_DESKTOP = 25;
const DEFAULT_COLLAGE_TITLE_FONT_MOBILE = 18;

const DEFAULT_ROW_HEIGHT = 150;
const DEFAULT_DESKTOP_GAP = 24;
const DEFAULT_MOBILE_GAP = 10;
const MAX_COLUMNS = 12;
const MAX_ROWS = 6;

function clamp(value: number | undefined, min: number, max: number, fallback: number): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampPx(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value < 0) {
    return fallback;
  }

  return Math.round(value);
}

function clampPct(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function resolveTitleColorValue(
  color: PlainTextColorProps | string | undefined,
  legacyHex?: string,
): string | undefined {
  if (typeof color === 'string') {
    const input = color.trim() || legacyHex?.trim() || '';

    if (input.length === 0) {
      return undefined;
    }

    const resolved = resolveCssColor(input, undefined);

    if (resolved != null) {
      return resolved;
    }

    return input.startsWith('#') ? input : `rgb(${input})`;
  }

  return resolvePlainTextColor({
    textColor: color?.textColor,
    textColorHex: color?.textColorHex ?? legacyHex,
  });
}

function resolveTitleColorStyle(
  color: PlainTextColorProps | string | undefined,
  legacyHex?: string,
): CSSProperties | undefined {
  const resolved = resolveTitleColorValue(color, legacyHex);

  return resolved != null ? { color: resolved } : undefined;
}

function resolveBlockBackgroundStyle(item: ArchiveCollageItemProps): CSSProperties | undefined {
  const legacyHex = item.blockBackgroundColor?.trim() ?? '';
  const background = item.blockBackground;
  const hasImage = resolveImageFields(item).src.length > 0;
  const resolved = resolveCssColor(
    background?.colorHex ?? legacyHex,
    background?.color ?? (hasImage ? undefined : DEFAULT_TEXT_BLOCK_BACKGROUND),
  );

  return resolved != null ? { backgroundColor: resolved } : undefined;
}

function resolveImageFields(item: ArchiveCollageItemProps) {
  const media = item.imageMedia;

  return {
    src: resolveMakeswiftImageSrc(media?.image ?? item.image),
    alt: media?.imageAlt ?? item.imageAlt ?? '',
    alignX: media?.imageAlignX ?? item.imageAlignX,
    alignY: media?.imageAlignY ?? item.imageAlignY,
  };
}

function resolveTitleText(
  part: CollageTitlePartProps | string | undefined,
  flatText?: string,
  legacyTitle?: string,
): string {
  if (typeof part === 'string') {
    return part.trim();
  }

  return part?.text?.trim() || flatText?.trim() || legacyTitle?.trim() || '';
}

function resolveCollageTitleFontSize(desktopPx?: number, mobilePx?: number): string {
  const desktop =
    desktopPx == null || desktopPx <= 0 ? DEFAULT_COLLAGE_TITLE_FONT_DESKTOP : desktopPx;
  const mobile =
    mobilePx == null || mobilePx <= 0 ? DEFAULT_COLLAGE_TITLE_FONT_MOBILE : mobilePx;

  return resolveHeadingFontSizeCss(desktop, mobile) ?? `${String(desktop)}px`;
}

function resolveTitlePartStyle(
  part: CollageTitlePartProps | string | undefined,
  legacyColorGroup: PlainTextColorProps | string | undefined,
  sharedLegacyColor?: string,
): CSSProperties | undefined {
  const colorProps =
    typeof part === 'object' && part != null
      ? { textColor: part.textColor, textColorHex: part.textColorHex }
      : legacyColorGroup;
  const colorStyle = resolveTitleColorStyle(colorProps, sharedLegacyColor);
  const fontSize =
    typeof part === 'object' && part != null
      ? resolveCollageTitleFontSize(part.fontSize, part.fontSizeMobile)
      : resolveCollageTitleFontSize();

  return {
    ...colorStyle,
    fontSize,
  };
}

function resolveCollageTitles(item: ArchiveCollageItemProps) {
  const titleGroup = item.titleContent;
  const legacyTitle = item.title?.trim() ?? '';
  const legacyColor = item.titleColor?.trim() ?? '';
  const primaryPart = titleGroup?.primaryTitle;
  const secondaryPart = titleGroup?.secondaryTitle;

  const primaryColorProps =
    typeof primaryPart === 'object' && primaryPart != null
      ? { textColor: primaryPart.textColor, textColorHex: primaryPart.textColorHex }
      : (titleGroup?.primaryTitleColor ?? item.primaryTitleColor);

  return {
    primaryTitle: resolveTitleText(primaryPart, item.primaryTitle, legacyTitle),
    secondaryTitle: resolveTitleText(secondaryPart, item.secondaryTitle),
    primaryStyle: resolveTitlePartStyle(
      primaryPart,
      titleGroup?.primaryTitleColor ?? item.primaryTitleColor,
      legacyColor,
    ),
    primaryUnderlineColor: resolveTitleColorValue(primaryColorProps, legacyColor),
    secondaryStyle: resolveTitlePartStyle(
      secondaryPart,
      titleGroup?.secondaryTitleColor ?? item.secondaryTitleColor,
      legacyColor,
    ),
  };
}

function toObjectPosition(alignX: ImageAlignX | undefined, alignY: ImageAlignY | undefined): string {
  const x = alignX === 'left' || alignX === 'right' ? alignX : 'center';
  const y = alignY === 'top' || alignY === 'bottom' ? alignY : 'center';

  return `${x} ${y}`;
}

function resolveLink(link?: { href?: string; target?: string }) {
  const href = link?.href?.trim() ?? '';
  const target = link?.target?.trim();

  if (href.length === 0) {
    return null;
  }

  return { href, target: target != null && target.length > 0 ? target : undefined };
}

function CollageItemTitles({
  primaryTitle,
  secondaryTitle,
  primaryStyle,
  primaryUnderlineColor,
  secondaryStyle,
  layout,
}: {
  primaryTitle: string;
  secondaryTitle: string;
  primaryStyle?: CSSProperties;
  primaryUnderlineColor?: string;
  secondaryStyle?: CSSProperties;
  layout: 'overlay' | 'centered';
}) {
  if (primaryTitle.length === 0 && secondaryTitle.length === 0) {
    return null;
  }

  const lineClass = clsx(
    'collage-item-title heading leading-tight transition-[text-decoration]',
    layout !== 'centered' && 'text-white',
  );
  const lineStyle =
    primaryUnderlineColor != null
      ? ({ '--collage-primary-underline': primaryUnderlineColor } as CSSProperties)
      : undefined;
  const line = (
    <>
      {primaryTitle.length > 0 ? <span style={primaryStyle}>{primaryTitle}</span> : null}
      {primaryTitle.length > 0 && secondaryTitle.length > 0 ? ' ' : null}
      {secondaryTitle.length > 0 ? <span style={secondaryStyle}>{secondaryTitle}</span> : null}
    </>
  );

  if (layout === 'centered') {
    return (
      <div className="pointer-events-none relative z-10 flex h-full w-full items-center justify-center p-6 text-center md:p-8">
        <p className={lineClass} style={lineStyle}>
          {line}
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-start p-4 md:p-6">
      <p className={lineClass} style={lineStyle}>
        {line}
      </p>
    </div>
  );
}

function CollageItemFrame({
  item,
  index,
  link,
}: {
  item: ArchiveCollageItemProps;
  index: number;
  link: ReturnType<typeof resolveLink>;
}) {
  const imageFields = resolveImageFields(item);
  const src = imageFields.src;
  const showImage = src.length > 0;
  const columnSpan = clamp(item.columnSpan, 1, MAX_COLUMNS, 3);
  const rowSpan = clamp(item.rowSpan, 1, MAX_ROWS, 2);
  const { primaryTitle, secondaryTitle, primaryStyle, primaryUnderlineColor, secondaryStyle } =
    resolveCollageTitles(item);
  const blockBackgroundStyle = resolveBlockBackgroundStyle(item);

  const itemStyle = {
    '--column-span': String(columnSpan),
    '--row-span': String(rowSpan),
    ...blockBackgroundStyle,
  } as CSSProperties;

  const titles = (
    <CollageItemTitles
      layout={showImage ? 'overlay' : 'centered'}
      primaryStyle={primaryStyle}
      primaryTitle={primaryTitle}
      primaryUnderlineColor={primaryUnderlineColor}
      secondaryStyle={secondaryStyle}
      secondaryTitle={secondaryTitle}
    />
  );

  const content: ReactNode = showImage ? (
    <>
      <picture className="media media--height relative block h-full w-full overflow-hidden">
        <img
          alt={imageFields.alt.trim()}
          className="absolute inset-0 block h-full w-full object-cover"
          decoding="async"
          loading={index < 4 ? 'eager' : 'lazy'}
          src={src}
          style={{ objectPosition: toObjectPosition(imageFields.alignX, imageFields.alignY) }}
        />
      </picture>
      <span
        aria-hidden="true"
        className="banner__overlay pointer-events-none absolute inset-0 z-[1] h-full w-full"
      />
      {titles}
    </>
  ) : (
    titles ?? <span aria-hidden="true" className="block h-full min-h-[inherit] w-full" />
  );

  const baseClass = clsx(
    'collage__item banner group relative block h-full w-full overflow-hidden rounded-lg',
    showImage ? 'with-image' : 'without-image',
  );
  const wrapperStyle = itemStyle;

  if (link != null) {
    return (
      <a
        className={baseClass}
        href={link.href}
        rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
        style={wrapperStyle}
        target={link.target}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={baseClass} style={wrapperStyle}>
      {content}
    </div>
  );
}

function CtaRow({ cta }: { cta: ArchiveCollageCtaRowProps | undefined }) {
  if (cta?.enabled !== true) {
    return null;
  }

  const primary = resolveArchiveButton(cta.primary);
  const secondary = resolveArchiveButton(cta.secondary);

  if (!primary.visible && !secondary.visible) {
    return null;
  }

  const paddingTop = clampPx(cta.paddingTop, 12);
  const paddingBottom = clampPx(cta.paddingBottom, 32);
  const primaryWidth = clampPct(cta.primary?.widthPct, 60);
  const secondaryWidth = clampPct(cta.secondary?.widthPct, 40);

  return (
    <div
      className="section-content media--auto mobile:media--auto flex flex-col items-center justify-center md:flex-row md:items-center md:justify-center"
      style={{ paddingTop, paddingBottom, gap: 10 }}
    >
      {primary.visible ? (
        <ArchiveShopifyButton
          className="button--primary button--sm icon-with-text size-style"
          colors={primary.colors}
          href={primary.href}
          rel={primary.rel}
          target={primary.target}
        >
          {primary.text}
        </ArchiveShopifyButton>
      ) : null}
      {secondary.visible ? (
        <ArchiveShopifyButton
          className="button--secondary button--sm size-style"
          colors={secondary.colors}
          href={secondary.href}
          rel={secondary.rel}
          target={secondary.target}
          variant="secondary"
        >
          {secondary.text}
        </ArchiveShopifyButton>
      ) : null}
    </div>
  );
}

export function ArchiveCollageGrid({
  className,
  background,
  items,
  rowHeight,
  desktopGap,
  mobileGap,
  roundedTop = true,
  cta,
}: ArchiveCollageGridProps) {
  const resolvedItems = items ?? [];

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: ARCHIVE_COLLAGE_GRID_SECTION_ID,
    sectionCss: ARCHIVE_COLLAGE_GRID_VARS,
    background,
    highlight: null,
    defaultBackgroundChannels: '0 2% 65%',
  });

  if (resolvedItems.length === 0 && cta?.enabled !== true) {
    return null;
  }

  const rowHeightPx = clampPx(rowHeight, DEFAULT_ROW_HEIGHT);
  const desktopGapPx = clampPx(desktopGap, DEFAULT_DESKTOP_GAP);
  const mobileGapPx = clampPx(mobileGap, DEFAULT_MOBILE_GAP);

  const gridStyle = {
    '--row-height': `${String(rowHeightPx)}px`,
    gridAutoRows: `var(--row-height,${String(rowHeightPx)}px)`,
    rowGap: `${String(mobileGapPx)}px`,
    columnGap: `${String(mobileGapPx)}px`,
  } as CSSProperties;

  return (
    <div
      className={clsx('archive-collage-grid', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div
        className="shopify-section"
        id={ARCHIVE_COLLAGE_GRID_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <style dangerouslySetInnerHTML={{ __html: ARCHIVE_COLLAGE_GRID_IMAGE_FADE_CSS }} />
        <style
          dangerouslySetInnerHTML={{
            __html: `@media screen and (min-width:768px){#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage.with-grid{row-gap:${String(desktopGapPx)}px;column-gap:${String(desktopGapPx)}px}#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage__item{grid-column:span var(--column-span,3) / span var(--column-span,3);grid-row:span var(--row-span,2) / span var(--row-span,2)}}`,
          }}
        />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width relative">
            {resolvedItems.length > 0 ? (
              <div
                className="collage with-grid grid items-start grid-cols-2"
                style={gridStyle}
              >
                {resolvedItems.map((item, index) => {
                  const link = resolveLink(item.titleContent?.link ?? item.link);

                  return (
                    <CollageItemFrame
                      index={index}
                      item={item}
                      key={`collage-item-${String(index)}`}
                      link={link}
                    />
                  );
                })}
              </div>
            ) : null}
            <CtaRow cta={cta} />
          </div>
        </div>
      </div>
    </div>
  );
}
