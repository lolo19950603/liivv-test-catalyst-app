import {
  resolveArchiveHighlightChannels,
  resolveCssColor,
} from '~/lib/makeswift/utils/archive-color';

export type HeadingAccentColorProps = {
  accentTextColor?: string;
  accentTextColorHex?: string;
  useCustomHighlightColor?: boolean | string;
  accentHighlightColor?: string;
  accentHighlightColorHex?: string;
};

export type PlainTextColorProps = {
  textColor?: string;
  textColorHex?: string;
};

export function resolvePlainTextColor(props: PlainTextColorProps): string | undefined {
  return resolveCssColor(props.textColorHex, props.textColor);
}

function useCustomHighlightSwash(settings: HeadingAccentColorProps): boolean {
  const value = settings.useCustomHighlightColor;

  return value === true || value === 'true';
}

export function resolveAccentColors(props?: HeadingAccentColorProps | null) {
  const settings = props ?? {};
  const highlightChannels = useCustomHighlightSwash(settings)
    ? resolveArchiveHighlightChannels(
        settings.accentHighlightColorHex,
        settings.accentHighlightColor,
      )
    : null;

  return {
    emphasisColor: resolveCssColor(settings.accentTextColorHex, settings.accentTextColor),
    highlightStyle: 'half_text' as const,
    highlightChannels,
  };
}

/** Injects `--color-highlight` into the first `#sectionId{…}` rule of archive section CSS. */
export function appendHighlightToSectionCss(
  sectionCss: string,
  sectionId: string,
  highlightChannels: string | null | undefined,
): string {
  if (!highlightChannels) {
    return sectionCss;
  }

  const escaped = sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rulePattern = new RegExp(`(#${escaped}\\{)([^}]*)(\\})`);

  if (rulePattern.test(sectionCss)) {
    return sectionCss.replace(
      rulePattern,
      `$1$2--color-highlight:${highlightChannels};$3`,
    );
  }

  return `#${sectionId}{--color-highlight:${highlightChannels};}${sectionCss}`;
}
