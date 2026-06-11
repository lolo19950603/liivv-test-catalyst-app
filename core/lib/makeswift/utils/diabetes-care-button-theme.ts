import type { CSSProperties } from 'react';

import { resolveArchiveHighlightChannels } from '~/lib/makeswift/utils/archive-color';

export type ButtonColorProps = {
  outlineColor?: string;
  outlineColorHex?: string;
  backgroundColor?: string;
  backgroundColorHex?: string;
  textColor?: string;
  textColorHex?: string;
  hoverBackgroundColor?: string;
  hoverBackgroundColorHex?: string;
  hoverTextColor?: string;
  hoverTextColorHex?: string;
};

export type ArchiveButtonVariant = 'primary' | 'secondary';

export type ResolvedButtonTheme = {
  style: CSSProperties | undefined;
  scopeCss: string;
  dataDcBtn: string | undefined;
};

function channels(
  hex: string | undefined,
  picker: string | undefined,
): string | null {
  return resolveArchiveHighlightChannels(hex, picker);
}

/**
 * Maps Makeswift button color fields to archive `--color-button-*` vars and optional hover overrides.
 * Note: `.button--secondary` uses `--color-button-background` for resting label color (not `--color-button-text`).
 */
export function resolveButtonTheme(
  colors: ButtonColorProps | null | undefined,
  options: {
    scopeId: string;
    variant: ArchiveButtonVariant;
  },
): ResolvedButtonTheme {
  const outline = channels(colors?.outlineColorHex, colors?.outlineColor);
  const restingBg = channels(colors?.backgroundColorHex, colors?.backgroundColor);
  const restingText = channels(colors?.textColorHex, colors?.textColor);
  const hoverBg = channels(colors?.hoverBackgroundColorHex, colors?.hoverBackgroundColor);
  const hoverText = channels(colors?.hoverTextColorHex, colors?.hoverTextColor);

  const style: CSSProperties & Record<string, string> = {};
  const isSecondary = options.variant === 'secondary';

  /**
   * Archive `.button--secondary` uses `--color-button-background` for the visible label
   * and `--color-button-text` for the hover fill. Map editor fields to user-facing meaning.
   */
  const labelChannels = isSecondary ? restingText : restingBg;
  const fillChannels = isSecondary ? restingBg : restingText;
  const borderChannels = outline ?? (isSecondary ? labelChannels : restingBg);

  if (borderChannels != null) {
    style['--color-button-border'] = borderChannels;
  }

  if (labelChannels != null) {
    style['--color-button-background'] = labelChannels;
  }

  if (fillChannels != null) {
    style['--color-button-text'] = fillChannels;
  }

  const hasHover = hoverBg != null || hoverText != null;
  const hasAny =
    borderChannels != null || labelChannels != null || fillChannels != null || hasHover;

  if (!hasAny) {
    return { style: undefined, scopeCss: '', dataDcBtn: undefined };
  }

  const selector = `[data-dc-btn="${options.scopeId}"]`;
  const variantClass =
    options.variant === 'primary' ? '.button.button--primary' : '.button.button--secondary';

  let scopeCss = '';

  if (hoverText != null) {
    scopeCss += `${selector}${variantClass}:hover:not([disabled]) .btn-text{color:rgb(var(--dc-btn-hover-text))!important;}`;
    style['--dc-btn-hover-text'] = hoverText;
  }

  if (hoverBg != null) {
    // Sweep uses `.btn-fill` on hover; set fill to hover bg always so the animation
    // does not flash the resting text color while `background-color` transitions.
    scopeCss += `${selector}${variantClass} .btn-fill{background-color:rgb(var(--dc-btn-hover-fill))!important;}`;
    style['--dc-btn-hover-fill'] = hoverBg;
  }

  return {
    style: Object.keys(style).length > 0 ? style : undefined,
    scopeCss,
    dataDcBtn: hasHover ? options.scopeId : undefined,
  };
}
