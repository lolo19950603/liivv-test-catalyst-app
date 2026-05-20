import type { CSSProperties } from 'react';

import { resolveArchiveHighlightChannels } from '~/lib/makeswift/utils/archive-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import {
  appendHighlightToSectionCss,
  resolveAccentColors,
  resolvePlainTextColor,
} from '~/lib/makeswift/utils/heading-accent-color';

export type SectionBackgroundProps = {
  color?: string;
  colorHex?: string;
};

export type HeadingTypographyProps = {
  text?: string;
  accentPhrase?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type BodyTextProps = {
  textColor?: string;
  textColorHex?: string;
};

export function resolveHeadingTypography(heading?: HeadingWithHighlightProps | null) {
  const accent = resolveAccentColors(heading);

  return {
    text: heading?.text?.trim() ?? '',
    accentPhrase: heading?.accentPhrase?.trim() ?? '',
    color: resolvePlainTextColor({
      textColor: heading?.textColor,
      textColorHex: heading?.textColorHex,
    }),
    fontSize: resolveHeadingFontSizeCss(heading?.fontSize, heading?.fontSizeMobile),
    emphasisColor: accent.emphasisColor,
    highlightStyle: accent.highlightStyle,
    highlightChannels: accent.highlightChannels,
  };
}

export function resolveBodyTextColor(bodyText?: BodyTextProps | null) {
  return resolvePlainTextColor({
    textColor: bodyText?.textColor,
    textColorHex: bodyText?.textColorHex,
  });
}

export type HeadingWithHighlightProps = HeadingTypographyProps & HeadingAccentColorProps;

export function resolveSectionBackgroundChannels(
  background?: SectionBackgroundProps | null,
  fallbackChannels?: string,
): string | undefined {
  const override = resolveArchiveHighlightChannels(background?.colorHex, background?.color);

  return override ?? fallbackChannels;
}

/** Replaces or injects `--color-background` on the section root rule. */
export function applySectionBackgroundToCss(
  sectionCss: string,
  sectionId: string,
  backgroundChannels: string | undefined,
): string {
  if (!backgroundChannels) {
    return sectionCss;
  }

  const escaped = sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const bgPattern = new RegExp(`(#${escaped}\\{[^}]*)(--color-background:)\\s*[^;]+`);

  if (bgPattern.test(sectionCss)) {
    return sectionCss.replace(bgPattern, `$1$2${backgroundChannels}`);
  }

  return `#${sectionId}{--color-background:${backgroundChannels};}${sectionCss}`;
}

export function buildSectionTheme(options: {
  sectionId: string;
  sectionCss: string;
  background?: SectionBackgroundProps | null;
  highlight?: HeadingAccentColorProps | null;
  defaultBackgroundChannels?: string;
}): { sectionCss: string; sectionStyle: CSSProperties & Record<string, string | number> } {
  const backgroundChannels = resolveSectionBackgroundChannels(
    options.background,
    options.defaultBackgroundChannels,
  );
  const { highlightChannels } = resolveAccentColors(options.highlight);

  let sectionCss = options.sectionCss;

  if (backgroundChannels) {
    sectionCss = applySectionBackgroundToCss(sectionCss, options.sectionId, backgroundChannels);
  }

  sectionCss = appendHighlightToSectionCss(sectionCss, options.sectionId, highlightChannels);

  const sectionStyle: CSSProperties & Record<string, string | number> = {};

  if (backgroundChannels) {
    sectionStyle['--color-background'] = backgroundChannels;
  }

  if (highlightChannels) {
    sectionStyle['--color-highlight'] = highlightChannels;
  }

  return { sectionCss, sectionStyle };
}
