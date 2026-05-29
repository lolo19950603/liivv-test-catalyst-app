'use client';

import { clsx } from 'clsx';
import { useMemo, type CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  HEALTH_SCROLLING_TEXT_SECTION_ID,
  HEALTH_SCROLLING_TEXT_VARS,
  healthScrollingTextMarqueeCss,
} from './archive-styles';

export type HealthScrollingTextItem = {
  kind?: 'text' | 'image';
  text?: string;
  image?: unknown;
  imageAlt?: string;
};

export type HealthScrollingTextProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  direction?: 'left' | 'right';
  durationSeconds?: number;
  iconImage?: unknown;
  iconHeightPx?: number;
  items?: HealthScrollingTextItem[];
  roundedTop?: boolean;
};

export const HEALTH_SCROLLING_TEXT_DEFAULT_ITEMS: HealthScrollingTextItem[] = [
  { kind: 'text', text: 'Ostomy Care & Everyday Living' },
  { kind: 'text', text: "Women's Health & Wellness" },
  { kind: 'text', text: 'Sleep & Rest' },
  { kind: 'text', text: 'Healing & Advanced Wound Care' },
  { kind: 'text', text: 'Personal Care & Confidence' },
  { kind: 'text', text: 'Heart & Blood Pressure' },
  { kind: 'text', text: 'Breathing & Lung Health' },
  { kind: 'text', text: 'Skin Health & Relief' },
  { kind: 'text', text: 'Diabetes Care & Everyday Living' },
  { kind: 'text', text: 'Daily Nutrition & Fuel' },
];

function ScrollingTextItem({
  item,
  iconSrc,
  iconAlt,
  iconHeightPx,
}: {
  item: HealthScrollingTextItem;
  iconSrc: string;
  iconAlt: string;
  iconHeightPx: number;
}) {
  if (item.kind === 'image') {
    const src = resolveMakeswiftImageSrc(item.image);

    if (src.length === 0) {
      return null;
    }

    return (
      <div
        className="scrolling-text__item with-media media media--transparent relative flex shrink-0 items-center"
        style={{ '--image-height': `${String(iconHeightPx)}px` } as CSSProperties}
      >
        <img
          alt={item.imageAlt?.trim() ?? iconAlt}
          className="block h-[var(--image-height)] w-auto object-contain"
          decoding="async"
          loading="lazy"
          src={src}
        />
      </div>
    );
  }

  const label = item.text?.trim() ?? '';

  if (label.length === 0) {
    return null;
  }

  return (
    <div
      className="scrolling-text__item with-text body flex shrink-0 items-center"
      style={{ '--font-size': '12px' } as CSSProperties}
    >
      <p>{label}</p>
    </div>
  );
}

export function HealthScrollingText({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  roundedTop = true,
  direction = 'left',
  durationSeconds = 26,
  iconImage,
  iconHeightPx = 80,
  items,
}: HealthScrollingTextProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_SCROLLING_TEXT_SECTION_ID,
    instanceSuffix,
  );
  const duration = Math.min(120, Math.max(8, durationSeconds));
  const iconSrc = resolveMakeswiftImageSrc(iconImage);
  const iconAlt = 'Category icon';
  const rows = useMemo(() => {
    const fromProps = (items ?? []).filter(
      (item) =>
        (item.kind === 'image' && resolveMakeswiftImageSrc(item.image).length > 0) ||
        (item.kind !== 'image' && (item.text?.trim().length ?? 0) > 0),
    );

    const base = fromProps.length > 0 ? fromProps : HEALTH_SCROLLING_TEXT_DEFAULT_ITEMS;
    const withIcons: HealthScrollingTextItem[] = [];

    for (const item of base) {
      if (item.kind === 'image') {
        withIcons.push(item);
      } else {
        if (iconSrc.length > 0) {
          withIcons.push({ kind: 'image', image: iconImage, imageAlt: iconAlt });
        }

        withIcons.push(item);
      }
    }

    return withIcons;
  }, [iconAlt, iconImage, iconSrc.length, items]);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: `${HEALTH_SCROLLING_TEXT_VARS}${healthScrollingTextMarqueeCss(resolvedSectionId, duration)}`,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  const renderedItems = rows.map((item, index) => (
    <ScrollingTextItem
      iconAlt={iconAlt}
      iconHeightPx={iconHeightPx}
      iconSrc={iconSrc}
      item={item}
      key={`${item.kind ?? 'text'}-${item.text ?? 'img'}-${index}`}
    />
  ));

  return (
    <div
      className={clsx(
        'health-scrolling-text scrolling-text-section',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx(
            'section section--padding section--solid',
            roundedTop && 'section--rounded',
          )}
        >
          <div className="relative z-[1]">
            <div
              className={clsx(
                'scrolling-text flex items-center overflow-hidden',
                direction === 'right' ? 'scrolling-text--right' : 'scrolling-text--left',
              )}
            >
              <div className="health-scroll-marquee-track items-center gap-[var(--section-grid-gap,50px)]">
                {renderedItems}
                <div
                  aria-hidden
                  className="flex items-center gap-[var(--section-grid-gap,50px)]"
                >
                  {renderedItems}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
