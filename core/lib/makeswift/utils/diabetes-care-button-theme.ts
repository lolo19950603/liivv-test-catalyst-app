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
  /** Outline / ghost: no resting fill (uses outline + text colors). */
  transparentBackground?: boolean;
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
  const transparentRaw = colors?.transparentBackground as unknown;
  const transparent =
    transparentRaw === true ||
    transparentRaw === 'true' ||
    transparentRaw === 1 ||
    transparentRaw === '1';

  const style: CSSProperties & Record<string, string> = {};
  const isSecondary = options.variant === 'secondary';

  /**
   * Archive `.button--secondary` uses `--color-button-background` for the visible label
   * and `--color-button-text` for the hover fill. Map editor fields to user-facing meaning.
   * Transparent primary keeps outline + text mapping and forces no resting fill.
   */
  const labelChannels = transparent
    ? (restingText ?? restingBg)
    : isSecondary
      ? restingText
      : restingBg;
  const fillChannels = transparent
    ? restingText
    : isSecondary
      ? restingBg
      : restingText;
  const borderChannels =
    outline ?? (transparent ? labelChannels : isSecondary ? labelChannels : restingBg);

  if (borderChannels != null) {
    style['--color-button-border'] = borderChannels;
  }

  if (labelChannels != null && !transparent) {
    style['--color-button-background'] = labelChannels;

    if (!isSecondary) {
      // Archive `.button` sets `background: var(--color-button-gradient)`; inherited
      // gradients from the section theme otherwise mask a custom resting fill.
      style['--color-button-gradient'] = 'none';
    }
  }

  if (transparent) {
    style['--color-button-gradient'] = 'none';

    if (labelChannels != null) {
      // Primary reads label from `--color-button-text`; secondary from `--color-button-background`.
      if (isSecondary) {
        style['--color-button-background'] = labelChannels;
      } else {
        style['--color-button-text'] = labelChannels;
      }
    }
  } else if (fillChannels != null) {
    style['--color-button-text'] = fillChannels;
  }

  const hasHover = hoverBg != null || hoverText != null;
  const hasAny =
    transparent ||
    borderChannels != null ||
    labelChannels != null ||
    fillChannels != null ||
    hasHover;

  if (!hasAny) {
    return { style: undefined, scopeCss: '', dataDcBtn: undefined };
  }

  const selector = `[data-dc-btn="${options.scopeId}"]`;
  const variantClass =
    options.variant === 'primary' ? '.button.button--primary' : '.button.button--secondary';

  let scopeCss = '';

  if (transparent) {
    scopeCss +=
      `${selector}${variantClass}{` +
      `background:transparent!important;` +
      `background-color:transparent!important;` +
      `--color-button-gradient:none!important;` +
      `}`;
  }

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
    // Always set data attr when we inject scoped CSS (transparent and/or hover).
    dataDcBtn: scopeCss.length > 0 ? options.scopeId : undefined,
  };
}
