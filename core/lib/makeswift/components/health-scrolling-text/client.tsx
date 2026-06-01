'use client';

import { clsx } from 'clsx';
import { useMemo, type CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';
import { buildScrollingTextMarqueeSequence } from '~/lib/makeswift/utils/scrolling-text-marquee';

import {
  HEALTH_SCROLLING_TEXT_SECTION_ID,
  HEALTH_SCROLLING_TEXT_TRACK_CLASS,
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
  iconHeightPx,
}: {
  item: HealthScrollingTextItem;
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
          alt={item.imageAlt?.trim() ?? 'Liivv'}
          className="block h-[var(--image-height)] w-auto max-w-full object-contain"
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

function MarqueeStrip({
  items,
  iconHeightPx,
}: {
  items: HealthScrollingTextItem[];
  iconHeightPx: number;
}) {
  return (
    <div className="marquee flex shrink-0 items-center whitespace-nowrap">
      {items.map((item, index) => (
        <ScrollingTextItem iconHeightPx={iconHeightPx} item={item} key={`${item.kind ?? 'text'}-${item.text ?? 'img'}-${index}`} />
      ))}
    </div>
  );
}

export function HealthScrollingText({
  className,
  instanceSuffix,
  sectionDomId,
  background,
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
  const iconAlt = 'Liivv';
  const rows = useMemo(() => {
    const fromProps = (items ?? []).filter(
      (item) =>
        (item.kind === 'image' && resolveMakeswiftImageSrc(item.image).length > 0) ||
        (item.kind !== 'image' && (item.text?.trim().length ?? 0) > 0),
    );

    const base = fromProps.length > 0 ? fromProps : HEALTH_SCROLLING_TEXT_DEFAULT_ITEMS;

    return buildScrollingTextMarqueeSequence(base, iconImage, iconSrc, iconAlt);
  }, [iconAlt, iconImage, iconSrc, items]);

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: `${HEALTH_SCROLLING_TEXT_VARS}${healthScrollingTextMarqueeCss(resolvedSectionId, duration)}`,
    background,
    defaultBackgroundChannels: '255 255 255',
  });

  if (rows.length === 0) {
    return null;
  }

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
        <div className="section section--padding section--solid">
          <div className="relative z-[1]">
            <div
              className={clsx(
                'scrolling-text flex items-center overflow-hidden',
                direction === 'right' ? 'scrolling-text--right' : 'scrolling-text--left',
                iconSrc.length === 0 && 'scrolling-text--no-icon',
              )}
              style={{ '--duration': `${String(duration)}s` } as CSSProperties}
            >
              <div className={clsx(HEALTH_SCROLLING_TEXT_TRACK_CLASS, 'flex items-center')}>
                <MarqueeStrip iconHeightPx={iconHeightPx} items={rows} />
                <div aria-hidden>
                  <MarqueeStrip iconHeightPx={iconHeightPx} items={rows} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
