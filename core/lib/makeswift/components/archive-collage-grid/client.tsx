'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import { ARCHIVE_COLLAGE_GRID_SECTION_ID, ARCHIVE_COLLAGE_GRID_VARS } from './archive-styles';

type ImageAlignX = 'left' | 'center' | 'right';
type ImageAlignY = 'top' | 'center' | 'bottom';

export type ArchiveCollageItemProps = {
  image?: unknown;
  imageAlt?: string;
  imageAlignX?: ImageAlignX;
  imageAlignY?: ImageAlignY;
  link?: { href?: string; target?: string };
  /** Column span (1–12). Defaults to 3 (i.e. 4 across on desktop). */
  columnSpan?: number;
  /** Row span (1–4). Defaults to 2. */
  rowSpan?: number;
  /** Overlay color (HSL channels, e.g. "49 47 47"). Falls back to section. */
  overlayColor?: string;
  /** Overlay opacity (0–1). Falls back to section default. */
  overlayOpacity?: number;
  /** Title shown over the image (optional). */
  title?: string;
  /** Title color (HSL channels). */
  titleColor?: string;
};

export type ArchiveCollageCtaButtonProps = ButtonColorProps & {
  label?: string;
  link?: { href?: string; target?: string };
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
  enableHoverDim?: boolean;
  defaultOverlayOpacity?: number;
  cta?: ArchiveCollageCtaRowProps;
}

const DEFAULT_OVERLAY = 0.4;
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

function clampOpacity(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(1, Math.max(0, value));
}

function clampPct(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
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

function CollageItemFrame({
  item,
  index,
  link,
  defaultOverlayOpacity,
}: {
  item: ArchiveCollageItemProps;
  index: number;
  link: ReturnType<typeof resolveLink>;
  defaultOverlayOpacity: number;
}) {
  const src = resolveMakeswiftImageSrc(item.image);
  const columnSpan = clamp(item.columnSpan, 1, MAX_COLUMNS, 3);
  const rowSpan = clamp(item.rowSpan, 1, MAX_ROWS, 2);
  const overlayOpacity = clampOpacity(item.overlayOpacity, defaultOverlayOpacity);
  const overlayColor = item.overlayColor?.trim() ?? '';
  const titleColor = item.titleColor?.trim() ?? '';
  const title = item.title?.trim() ?? '';

  const itemStyle = {
    '--column-span': String(columnSpan),
    '--row-span': String(rowSpan),
    ...(overlayColor.length > 0 ? { '--color-overlay': overlayColor } : {}),
  } as CSSProperties;

  const overlayStyle: CSSProperties = {
    opacity: overlayOpacity,
    backgroundColor:
      overlayColor.length > 0 ? `rgb(${overlayColor})` : 'rgb(var(--color-overlay,49 47 47))',
  };

  const titleStyle: CSSProperties | undefined =
    titleColor.length > 0 ? { color: `rgb(${titleColor})` } : undefined;

  const content: ReactNode = (
    <>
      <picture className="media media--height relative block h-full w-full overflow-hidden">
        {src.length > 0 ? (
          <img
            alt={item.imageAlt?.trim() ?? ''}
            className="absolute inset-0 block h-full w-full object-cover"
            decoding="async"
            loading={index < 4 ? 'eager' : 'lazy'}
            src={src}
            style={{ objectPosition: toObjectPosition(item.imageAlignX, item.imageAlignY) }}
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 block bg-neutral-300" />
        )}
      </picture>
      <span
        aria-hidden="true"
        className="banner__overlay pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={overlayStyle}
      />
      {title.length > 0 ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-start p-4 md:p-6">
          <p className="heading text-white text-lg md:text-xl leading-tight" style={titleStyle}>
            {title}
          </p>
        </div>
      ) : null}
    </>
  );

  const baseClass =
    'collage__item with-image banner relative block h-full w-full overflow-hidden rounded-lg';
  const wrapperStyle = itemStyle;

  if (link != null) {
    return (
      <a
        className={clsx(baseClass, 'group')}
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

  const primaryLabel = cta.primary?.label?.trim() ?? '';
  const primaryHref = cta.primary?.link?.href?.trim() ?? '';
  const secondaryLabel = cta.secondary?.label?.trim() ?? '';
  const secondaryHref = cta.secondary?.link?.href?.trim() ?? '';
  const showPrimary = primaryLabel.length > 0 && primaryHref.length > 0;
  const showSecondary = secondaryLabel.length > 0 && secondaryHref.length > 0;

  if (!showPrimary && !showSecondary) {
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
      {showPrimary ? (
        <ArchiveShopifyButton
          className="button--primary button--sm icon-with-text size-style"
          colors={cta.primary}
          href={primaryHref}
          rel={cta.primary?.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
          target={cta.primary?.link?.target}
        >
          {primaryLabel}
        </ArchiveShopifyButton>
      ) : null}
      {showSecondary ? (
        <ArchiveShopifyButton
          className="button--secondary button--sm size-style"
          colors={cta.secondary}
          href={secondaryHref}
          rel={cta.secondary?.link?.target === '_blank' ? 'noopener noreferrer' : undefined}
          target={cta.secondary?.link?.target}
        >
          {secondaryLabel}
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
  enableHoverDim = true,
  defaultOverlayOpacity,
  cta,
}: ArchiveCollageGridProps) {
  const fallbackOverlay = clampOpacity(defaultOverlayOpacity, DEFAULT_OVERLAY);
  const resolvedItems = (items ?? []).flatMap((item) => {
    const src = resolveMakeswiftImageSrc(item.image);

    return src.length > 0 ? [item] : [];
  });

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
    '--overlay-opacity': String(fallbackOverlay),
    '--overlay-opacity-hover': enableHoverDim ? '0.1' : String(fallbackOverlay),
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
        <style
          dangerouslySetInnerHTML={{
            __html: `@media screen and (min-width:768px){#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage.with-grid{row-gap:${String(desktopGapPx)}px;column-gap:${String(desktopGapPx)}px}#${ARCHIVE_COLLAGE_GRID_SECTION_ID} .collage__item{grid-column:span var(--column-span,3) / span var(--column-span,3);grid-row:span var(--row-span,2) / span var(--row-span,2)}}`,
          }}
        />
        <div className="section section--padding">
          <div className="page-width relative">
            {resolvedItems.length > 0 ? (
              <div
                className="collage with-grid grid items-start grid-cols-2"
                style={gridStyle}
              >
                {resolvedItems.map((item, index) => {
                  const link = resolveLink(item.link);

                  return (
                    <CollageItemFrame
                      defaultOverlayOpacity={fallbackOverlay}
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
