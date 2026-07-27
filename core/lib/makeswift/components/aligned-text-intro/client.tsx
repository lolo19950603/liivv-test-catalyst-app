'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import {
  resolveTextAlign,
  textAlignClass,
  type TextAlign,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveCssColor } from '~/lib/makeswift/utils/archive-color';
import { type SectionBackgroundProps } from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';

const DEFAULT_BACKGROUND = '#fcf8f4';
const DEFAULT_EYEBROW = '#6b7f5c';
const DEFAULT_HEADING = 'rgb(49, 47, 47)';
const DEFAULT_BODY = 'rgba(49, 47, 47, 0.72)';

export type AlignedTextIntroContentProps = {
  contentAlign?: string;
  eyebrow?: string;
  eyebrowTextColor?: string;
  eyebrowTextColorHex?: string;
  heading?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
  body?: string;
  bodyTextColor?: string;
  bodyTextColorHex?: string;
  bodyFontSize?: number;
  bodyFontSizeMobile?: number;
};

export type AlignedTextIntroProps = {
  className?: string;
  /** Short id for in-page links (e.g. `#intro`). */
  anchorId?: string;
  roundedTop?: boolean;
  background?: SectionBackgroundProps;
  content?: AlignedTextIntroContentProps;
};

function resolveScrollAnchorId(anchorId?: string): string | undefined {
  const raw = anchorId?.trim() ?? '';

  if (raw.length === 0) {
    return undefined;
  }

  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, '');

  return safe.length > 0 ? safe : undefined;
}

function contentJustifyClass(align: TextAlign): string {
  if (align === 'left') {
    return 'justify-start';
  }

  if (align === 'right') {
    return 'justify-end';
  }

  return 'justify-center';
}

function contentBlockMarginClass(align: TextAlign): string {
  if (align === 'left') {
    return 'mr-auto';
  }

  if (align === 'right') {
    return 'ml-auto';
  }

  return 'mx-auto';
}

function mergeStyle(
  ...parts: Array<CSSProperties | undefined>
): CSSProperties | undefined {
  const merged = parts.reduce<CSSProperties>((acc, part) => {
    if (part == null) {
      return acc;
    }

    return { ...acc, ...part };
  }, {});

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function AlignedTextIntro({
  className,
  anchorId,
  roundedTop = true,
  background,
  content,
}: AlignedTextIntroProps) {
  const scrollAnchorId = resolveScrollAnchorId(anchorId);
  const backgroundColor =
    resolveCssColor(background?.colorHex, background?.color) ?? DEFAULT_BACKGROUND;

  const align = resolveTextAlign(content?.contentAlign, 'center');
  const eyebrow = content?.eyebrow?.trim() ?? '';
  const heading = content?.heading?.trim() ?? '';
  const body = content?.body?.trim() ?? '';
  const headingFontSize = resolveHeadingFontSizeCss(content?.fontSize, content?.fontSizeMobile);
  const bodyFontSize = resolveHeadingFontSizeCss(
    content?.bodyFontSize,
    content?.bodyFontSizeMobile,
  );
  const eyebrowColor =
    resolvePlainTextColor({
      textColor: content?.eyebrowTextColor,
      textColorHex: content?.eyebrowTextColorHex,
    }) ?? DEFAULT_EYEBROW;
  const headingColor =
    resolvePlainTextColor({
      textColor: content?.textColor,
      textColorHex: content?.textColorHex,
    }) ?? DEFAULT_HEADING;
  const bodyColor =
    resolvePlainTextColor({
      textColor: content?.bodyTextColor,
      textColorHex: content?.bodyTextColorHex,
    }) ?? DEFAULT_BODY;

  return (
    <section
      className={clsx(
        'aligned-text-intro relative w-full min-w-0 max-w-full overflow-hidden',
        DC_SECTION_ROOT_CLASS,
        roundedTop && 'section section--rounded',
        className,
      )}
      id={scrollAnchorId}
      style={mergeStyle(
        { backgroundColor },
        scrollAnchorId != null ? { scrollMarginTop: '6rem' } : undefined,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px] px-6 py-[clamp(3.5rem,8vw,6.25rem)] md:px-8">
        <div className={clsx('flex w-full', contentJustifyClass(align))}>
          <div
            className={clsx(
              'w-full max-w-[52ch]',
              contentBlockMarginClass(align),
              textAlignClass(align),
            )}
          >
            {eyebrow.length > 0 ? (
              <p
                className="mb-3.5 text-[12px] font-medium uppercase tracking-[0.22em]"
                style={{ color: eyebrowColor }}
              >
                {eyebrow}
              </p>
            ) : null}

            {heading.length > 0 ? (
              <h2
                className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.15] tracking-tight"
                style={mergeStyle(
                  { color: headingColor },
                  headingFontSize != null ? { fontSize: headingFontSize } : undefined,
                )}
              >
                {heading}
              </h2>
            ) : null}

            {body.length > 0 ? (
              <p
                className={clsx(
                  'mt-4 text-[clamp(1rem,1.5vw,1.125rem)] font-light leading-relaxed',
                  align === 'center' && 'mx-auto',
                  align === 'right' && 'ml-auto',
                )}
                style={mergeStyle(
                  { color: bodyColor },
                  bodyFontSize != null ? { fontSize: bodyFontSize } : undefined,
                )}
              >
                {body}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
