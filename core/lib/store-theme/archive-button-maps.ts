import type { ButtonProps } from '@/vibes/soul/primitives/button';
import type { ButtonLinkProps } from '@/vibes/soul/primitives/button-link';
import type { ArchiveButtonSize, ArchiveButtonVariant } from '@/vibes/soul/primitives/archive-button';

type SoulButtonVariant = NonNullable<ButtonProps['variant']>;
type SoulButtonSize = NonNullable<ButtonProps['size']>;

export function mapSoulVariantToArchive(
  variant: SoulButtonVariant,
): ArchiveButtonVariant {
  switch (variant) {
    case 'secondary':
    case 'tertiary':
    case 'ghost':
      return 'secondary';
    case 'primary':
    case 'danger':
    default:
      return 'primary';
  }
}

export function mapSoulSizeToArchive(size: SoulButtonSize): ArchiveButtonSize {
  switch (size) {
    case 'x-small':
    case 'small':
      return 'sm';
    case 'large':
      return 'lg';
    case 'medium':
    default:
      return 'md';
  }
}

/** Icon-only / circle controls keep Catalyst styling. */
export function shouldUseSoulButton({
  variant,
  shape,
  appearance,
}: {
  variant?: SoulButtonVariant;
  shape?: ButtonProps['shape'];
  appearance: 'default' | 'archive';
}): boolean {
  if (appearance !== 'archive') {
    return true;
  }

  if (shape === 'circle') {
    return true;
  }

  return variant === 'ghost';
}

export type StoreButtonAppearance = 'default' | 'archive';

export function resolveButtonAppearance(
  appearance: StoreButtonAppearance | 'inherit' | undefined,
  storeAppearance: StoreButtonAppearance,
): StoreButtonAppearance {
  if (appearance == null || appearance === 'inherit') {
    return storeAppearance;
  }

  return appearance;
}

export type SoulLinkVariant = NonNullable<ButtonLinkProps['variant']>;

export function mapSoulLinkVariantToArchive(variant: SoulLinkVariant): ArchiveButtonVariant {
  return variant === 'secondary' || variant === 'tertiary' || variant === 'ghost'
    ? 'secondary'
    : 'primary';
}
