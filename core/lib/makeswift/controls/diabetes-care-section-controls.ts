import { Checkbox, Color, Group, Number, TextArea, TextInput } from '@makeswift/runtime/controls';

import { hsl } from '~/lib/makeswift/utils/color';

export const HEX_OVERRIDE_DESCRIPTION =
  'Optional. Overrides the picker when valid (e.g. `#4C7662`).';

export const FONT_SIZE_DESCRIPTION = '0 = theme default (title-lg).';

export function sectionBackgroundControls(defaultHsl = '0 0% 100%') {
  return {
    background: Group({
      label: 'Background',
      preferredLayout: Group.Layout.Popover,
      props: {
        color: Color({
          label: 'Background color',
          defaultValue: hsl(defaultHsl),
        }),
        colorHex: TextInput({
          label: 'Background color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
      },
    }),
  };
}

/** Matches archived storefront body/heading copy: `rgb(49, 47, 47)` (`--color-foreground` when unset). */
export function textColorFields(defaultHsl = '0 2% 19%') {
  return {
    textColor: Color({
      label: 'Text color',
      defaultValue: hsl(defaultHsl),
    }),
    textColorHex: TextInput({
      label: 'Text color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
  };
}

export function fontSizeFields() {
  return {
    fontSize: Number({
      label: 'Font size',
      suffix: 'px',
      defaultValue: 0,
      description: FONT_SIZE_DESCRIPTION,
    }),
    fontSizeMobile: Number({
      label: 'Font size (mobile)',
      suffix: 'px',
      defaultValue: 0,
      description: '0 = same as desktop, or theme default when desktop is 0.',
    }),
  };
}

export function highlightSwashFields(highlightDefault?: string) {
  return {
    useCustomHighlightColor: Checkbox({
      label: 'Use custom highlight swash color',
      defaultValue: false,
    }),
    accentHighlightColor: Color({
      label: 'Highlight swash color',
      defaultValue: highlightDefault ?? hsl('15 61% 85%'),
    }),
    accentHighlightColorHex: TextInput({
      label: 'Highlight swash color (hex override)',
      defaultValue: '',
      description: 'Optional. Example: `#F3C7BE`.',
    }),
  };
}

export type HeadingPopoverOptions = {
  label: string;
  textLabel?: string;
  textDefault?: string;
  textArea?: boolean;
  accentPhraseLabel?: string;
  accentPhraseDefault?: string;
  textColorDefault?: string;
  includeHighlightSwash?: boolean;
  highlightDefault?: string;
};

/** Single heading popover: text, color, font size, optional highlight swash. */
export function headingPopoverControls(options: HeadingPopoverOptions) {
  const textControl = options.textArea
    ? TextArea({
        label: options.textLabel ?? 'Text',
        defaultValue: options.textDefault ?? '',
      })
    : TextInput({
        label: options.textLabel ?? 'Text',
        defaultValue: options.textDefault ?? '',
      });

  return {
    heading: Group({
      label: options.label,
      preferredLayout: Group.Layout.Popover,
      props: {
        text: textControl,
        ...(options.accentPhraseLabel != null
          ? {
              accentPhrase: TextInput({
                label: options.accentPhraseLabel,
                defaultValue: options.accentPhraseDefault ?? '',
              }),
            }
          : {}),
        ...textColorFields(options.textColorDefault),
        ...fontSizeFields(),
        ...(options.includeHighlightSwash
          ? highlightSwashFields(options.highlightDefault)
          : {}),
      },
    }),
  };
}

export type SplitHeadingPopoverOptions = {
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryDefault?: string;
  secondaryDefault?: string;
  primaryTextColorDefault?: string;
  secondaryTextColorDefault?: string;
};

/** Lead + emphasis headings (custom band style). */
export function splitHeadingPopoverControls(options?: SplitHeadingPopoverOptions) {
  return {
    primaryHeading: Group({
      label: options?.primaryLabel ?? 'Primary heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: options?.primaryDefault ?? '',
        }),
        ...textColorFields(options?.primaryTextColorDefault),
        ...fontSizeFields(),
      },
    }),
    secondaryHeading: Group({
      label: options?.secondaryLabel ?? 'Secondary heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: options?.secondaryDefault ?? '',
        }),
        ...textColorFields(options?.secondaryTextColorDefault ?? '152 22% 38%'),
        ...fontSizeFields(),
        ...highlightSwashFields(),
      },
    }),
  };
}

export function bodyTextPopoverControls(defaultHsl = '0 2% 19%') {
  return {
    bodyText: Group({
      label: 'Body text',
      preferredLayout: Group.Layout.Popover,
      props: textColorFields(defaultHsl),
    }),
  };
}

/** Legacy flat highlight group (accent text + swash). Prefer heading popover with includeHighlightSwash. */
export function legacyHighlightPopoverControls(options?: {
  groupLabel?: string;
  accentTextLabel?: string;
  accentTextDefault?: string;
}) {
  return {
    highlight: Group({
      label: options?.groupLabel ?? 'Highlight',
      preferredLayout: Group.Layout.Popover,
      props: {
        accentTextColor: Color({
          label: options?.accentTextLabel ?? 'Accented text color',
          defaultValue: hsl(options?.accentTextDefault ?? '152 22% 38%'),
        }),
        accentTextColorHex: TextInput({
          label: 'Accented text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
        ...highlightSwashFields(),
      },
    }),
  };
}
