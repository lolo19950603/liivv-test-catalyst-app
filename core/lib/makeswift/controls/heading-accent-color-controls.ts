import { Checkbox, Color, Group, TextInput } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

const HEX_OVERRIDE_DESCRIPTION = 'Optional. Overrides the picker when valid (e.g. `#4C7662`).';

/** Swash-only highlight group (no accented text color pickers). */
export function highlightSwashControls(options?: {
  highlightDefault?: string;
  groupLabel?: string;
}) {
  return {
    highlight: Group({
      label: options?.groupLabel ?? 'Highlight',
      preferredLayout: Group.Layout.Popover,
      props: {
        useCustomHighlightColor: Checkbox({
          label: 'Use custom highlight swash color',
          defaultValue: false,
        }),
        accentHighlightColor: Color({
          label: 'Highlight swash color',
          defaultValue: options?.highlightDefault ?? hsl('15 61% 85%'),
        }),
        accentHighlightColorHex: TextInput({
          label: 'Highlight swash color (hex override)',
          defaultValue: '',
          description: 'Optional. Example: `#F3C7BE`.',
        }),
      },
    }),
  };
}

export function accentColorControls(options?: {
  accentTextLabel?: string;
  accentTextDefault?: string;
  highlightDefault?: string;
  groupLabel?: string;
}) {
  return {
    highlight: Group({
      label: options?.groupLabel ?? 'Highlight',
      preferredLayout: Group.Layout.Popover,
      props: {
        accentTextColor: Color({
          label: options?.accentTextLabel ?? 'Accented text color',
          defaultValue: options?.accentTextDefault ?? hsl('152 22% 38%'),
        }),
        accentTextColorHex: TextInput({
          label: 'Accented text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
        useCustomHighlightColor: Checkbox({
          label: 'Use custom highlight swash color',
          defaultValue: false,
        }),
        accentHighlightColor: Color({
          label: 'Highlight swash color',
          defaultValue: options?.highlightDefault ?? hsl('15 61% 85%'),
        }),
        accentHighlightColorHex: TextInput({
          label: 'Highlight swash color (hex override)',
          defaultValue: '',
          description: 'Optional. Example: `#F3C7BE`.',
        }),
      },
    }),
  };
}

export function headingTextColorControls(defaultHsl = '0 2% 19%') {
  return {
    headingTextColor: Color({
      label: 'Heading text color',
      defaultValue: hsl(defaultHsl),
    }),
    headingTextColorHex: TextInput({
      label: 'Heading text color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
  };
}

export function bodyTextColorControls(defaultHsl = '0 2% 19%') {
  return {
    bodyTextColor: Color({
      label: 'Body text color',
      defaultValue: hsl(defaultHsl),
    }),
    bodyTextColorHex: TextInput({
      label: 'Body text color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
  };
}
