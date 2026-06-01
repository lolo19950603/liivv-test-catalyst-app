import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';

/** Standard Makeswift archive CTA shape (text, link, resting/hover colors). */
export type ArchiveButtonProps = ButtonColorProps & {
  buttonText?: string;
  buttonLink?: { href?: string; target?: string };
  showButton?: boolean;
  /** @deprecated Use `buttonText`. */
  label?: string;
  /** @deprecated Use `buttonLink`. */
  link?: { href?: string; target?: string };
  /** @deprecated Colors are on the button object; nested `colors` is no longer used in new content. */
  colors?: ButtonColorProps;
};

export type ResolvedArchiveButton = {
  text: string;
  href: string;
  target: string | undefined;
  rel: string | undefined;
  colors: ButtonColorProps | undefined;
  visible: boolean;
};

function hasColorOverride(colors: ButtonColorProps | null | undefined): boolean {
  if (colors == null) {
    return false;
  }

  return (
    colors.outlineColor != null ||
    colors.outlineColorHex != null ||
    colors.backgroundColor != null ||
    colors.backgroundColorHex != null ||
    colors.textColor != null ||
    colors.textColorHex != null ||
    colors.hoverBackgroundColor != null ||
    colors.hoverBackgroundColorHex != null ||
    colors.hoverTextColor != null ||
    colors.hoverTextColorHex != null
  );
}

/** Picks flat color fields on the button, falling back to legacy nested `colors`. */
export function pickArchiveButtonColors(
  button: ArchiveButtonProps | null | undefined,
): ButtonColorProps | undefined {
  if (button == null) {
    return undefined;
  }

  const flat: ButtonColorProps = {
    outlineColor: button.outlineColor,
    outlineColorHex: button.outlineColorHex,
    backgroundColor: button.backgroundColor,
    backgroundColorHex: button.backgroundColorHex,
    textColor: button.textColor,
    textColorHex: button.textColorHex,
    hoverBackgroundColor: button.hoverBackgroundColor,
    hoverBackgroundColorHex: button.hoverBackgroundColorHex,
    hoverTextColor: button.hoverTextColor,
    hoverTextColorHex: button.hoverTextColorHex,
  };

  const merged: ButtonColorProps = {
    ...button.colors,
    ...flat,
  };

  return hasColorOverride(merged) ? merged : undefined;
}

export function resolveArchiveButton(
  button: ArchiveButtonProps | null | undefined,
  options?: {
    defaultText?: string;
    defaultHref?: string;
    requireHref?: boolean;
  },
): ResolvedArchiveButton {
  const text = (
    button?.buttonText ??
    button?.label ??
    options?.defaultText ??
    ''
  ).trim();
  const link = button?.buttonLink ?? button?.link;
  const href = (link?.href ?? options?.defaultHref ?? '#').trim();
  const showButton = button?.showButton !== false;
  const hasText = text.length > 0;
  const hasHref = href.length > 0 && href !== '#';
  const visible =
    showButton &&
    hasText &&
    (options?.requireHref === false || hasHref);

  return {
    text,
    href,
    target: link?.target,
    rel: link?.target === '_blank' ? 'noopener noreferrer' : undefined,
    colors: pickArchiveButtonColors(button),
    visible,
  };
}
