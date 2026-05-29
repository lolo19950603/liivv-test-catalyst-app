export type ImageAlignX = 'left' | 'center' | 'right';

export type ImageAlignY = 'top' | 'upper' | 'center' | 'lower' | 'bottom';

export const IMAGE_ALIGN_Y_CONTROL_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'upper', label: 'Upper' },
  { value: 'center', label: 'Center' },
  { value: 'lower', label: 'Lower' },
  { value: 'bottom', label: 'Bottom' },
] as const;

function resolveImageAlignY(alignY: ImageAlignY | string | undefined): string {
  switch (alignY) {
    case 'top':
      return 'top';

    case 'upper':
      return '25%';

    case 'bottom':
      return 'bottom';

    case 'lower':
      return '75%';

    case 'center':
    default:
      return 'center';
  }
}

export function toImageObjectPosition(
  alignX: ImageAlignX | string | undefined,
  alignY: ImageAlignY | string | undefined,
): string {
  const x = alignX === 'left' || alignX === 'right' ? alignX : 'center';

  return `${x} ${resolveImageAlignY(alignY)}`;
}
