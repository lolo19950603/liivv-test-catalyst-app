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

export function isHighlightOverrideEnabled(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function useCustomHighlightSwash(settings: HeadingAccentColorProps): boolean {
  return isHighlightOverrideEnabled(settings.useCustomHighlightColor);
}

/** Resolves swash `--color-highlight` channels (hex wins, then picker). No checkbox gate. */
export function resolveSectionHighlightChannels(
  settings?: HeadingAccentColorProps | null,
): string | null {
  if (settings == null) {
    return null;
  }

  return resolveArchiveHighlightChannels(
    settings.accentHighlightColorHex,
    settings.accentHighlightColor,
  );
}

export function resolveAccentColors(props?: HeadingAccentColorProps | null) {
  const settings = props ?? {};
  const highlightChannels = useCustomHighlightSwash(settings)
    ? resolveSectionHighlightChannels(settings)
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
