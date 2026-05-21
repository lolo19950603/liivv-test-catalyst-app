import { Checkbox, Color, Group, Number, TextArea, TextInput } from '@makeswift/runtime/controls';

import { ARCHIVE_HIGHLIGHT_SWASH_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
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

export type ButtonColorFieldDefaults = {
  backgroundHsl?: string;
  textHsl?: string;
  hoverBackgroundHsl?: string;
  hoverTextHsl?: string;
};

/** Archive Shopify `.button` colors (resting + hover text/fill). */
export function buttonColorFields(defaults?: ButtonColorFieldDefaults) {
  return {
    backgroundColor: Color({
      label: 'Background color',
      defaultValue: hsl(defaults?.backgroundHsl ?? '0 0% 100%'),
    }),
    backgroundColorHex: TextInput({
      label: 'Background color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
    textColor: Color({
      label: 'Text color',
      defaultValue: hsl(defaults?.textHsl ?? '0 2% 19%'),
    }),
    textColorHex: TextInput({
      label: 'Text color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
    hoverBackgroundColor: Color({
      label: 'Hover background color',
      defaultValue: hsl(defaults?.hoverBackgroundHsl ?? defaults?.backgroundHsl ?? '0 0% 100%'),
      description: 'Primary: hover fill swatch. Secondary: hover fill behind text.',
    }),
    hoverBackgroundColorHex: TextInput({
      label: 'Hover background color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
    hoverTextColor: Color({
      label: 'Hover text color',
      defaultValue: hsl(defaults?.hoverTextHsl ?? defaults?.textHsl ?? '0 2% 19%'),
    }),
    hoverTextColorHex: TextInput({
      label: 'Hover text color (hex override)',
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

/** @param highlightDefaultHsl Space-separated HSL channels (e.g. `120 12% 60%` for `#8da58d`). */
export function highlightSwashFields(highlightDefaultHsl?: string) {
  return {
    useCustomHighlightColor: Checkbox({
      label: 'Override highlight swash color',
      defaultValue: false,
    }),
    accentHighlightColor: Color({
      label: 'Highlight swash color',
      defaultValue: hsl(highlightDefaultHsl ?? ARCHIVE_HIGHLIGHT_SWASH_HSL),
    }),
    accentHighlightColorHex: TextInput({
      label: 'Highlight swash color (hex override)',
      defaultValue: '',
      description:
        'Optional. Overrides the picker when valid. Reset on the picker above restores the theme swash color (e.g. `#8da58d`).',
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
  /** Archive foreground / accent copy; default is dark gray, not theme sage. */
  secondaryTextColorDefault?: string;
  /** HSL channels for highlight swash reset default (e.g. `#8da58d` → `120 12% 60%`). */
  highlightDefault?: string;
};

export type SplitRichTextLowerHeadingOptions = {
  line1Label?: string;
  line2Label?: string;
  line1Default?: string;
  line2Default?: string;
  line1TextColorDefault?: string;
  line2TextColorDefault?: string;
  highlightDefault?: string;
};

export type CombinedHeadingPopoverOptions = {
  label?: string;
  line1Label?: string;
  line2Label?: string;
  line1Default?: string;
  line2Default?: string;
  line1TextColorDefault?: string;
  line2TextColorDefault?: string;
  highlightDefault?: string;
};

/** One heading popover: line 1 + line 2 (accent); swash on line 2 is opt-in. Renders inline on one line. */
export function combinedHeadingPopoverControls(options?: CombinedHeadingPopoverOptions) {
  return {
    heading: Group({
      label: options?.label ?? 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: options?.line1Label ?? 'Line 1',
          defaultValue: options?.line1Default ?? '',
        }),
        ...textColorFields(options?.line1TextColorDefault),
        ...fontSizeFields(),
        accentText: TextInput({
          label: options?.line2Label ?? 'Line 2 (accent)',
          defaultValue: options?.line2Default ?? '',
        }),
        accentTextColor: Color({
          label: 'Line 2 text color',
          defaultValue: hsl(options?.line2TextColorDefault ?? '0 2% 19%'),
        }),
        accentTextColorHex: TextInput({
          label: 'Line 2 text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
        accentFontSize: Number({
          label: 'Line 2 font size',
          suffix: 'px',
          defaultValue: 0,
          description: FONT_SIZE_DESCRIPTION,
        }),
        accentFontSizeMobile: Number({
          label: 'Line 2 font size (mobile)',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = same as desktop, or theme default when desktop is 0.',
        }),
        ...highlightSwashFields(options?.highlightDefault),
      },
    }),
  };
}

/** Rich text lower: line 1 and line 2 each get their own popover; swash on line 2 is opt-in. */
export function splitRichTextLowerHeadingControls(options?: SplitRichTextLowerHeadingOptions) {
  return {
    headingLine1: Group({
      label: options?.line1Label ?? 'Heading line 1',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: options?.line1Default ?? '',
        }),
        ...textColorFields(options?.line1TextColorDefault),
        ...fontSizeFields(),
      },
    }),
    headingLine2: Group({
      label: options?.line2Label ?? 'Heading line 2',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: options?.line2Default ?? '',
        }),
        ...textColorFields(options?.line2TextColorDefault),
        ...fontSizeFields(),
        ...highlightSwashFields(options?.highlightDefault),
      },
    }),
  };
}

export type NestedSplitHeadingPopoverOptions = SplitHeadingPopoverOptions & {
  groupLabel?: string;
  /** When false, secondary heading has no highlight swash controls (default true). */
  includeHighlightSwash?: boolean;
};

/**
 * One sidebar "Heading" entry; opening it shows nested popovers for primary + secondary (accent).
 */
export function nestedSplitHeadingPopoverControls(options?: NestedSplitHeadingPopoverOptions) {
  return {
    heading: Group({
      label: options?.groupLabel ?? 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
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
          label: options?.secondaryLabel ?? 'Secondary heading (accent)',
          preferredLayout: Group.Layout.Popover,
          props: {
            text: TextInput({
              label: 'Text',
              defaultValue: options?.secondaryDefault ?? '',
            }),
            ...textColorFields(options?.secondaryTextColorDefault ?? '0 2% 19%'),
            ...fontSizeFields(),
            ...(options?.includeHighlightSwash !== false
              ? highlightSwashFields(options?.highlightDefault)
              : {}),
          },
        }),
      },
    }),
  };
}

/** Lead + emphasis headings (custom band style) — two top-level sidebar popovers. */
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
        ...textColorFields(options?.secondaryTextColorDefault ?? '0 2% 19%'),
        ...fontSizeFields(),
        ...highlightSwashFields(options?.highlightDefault),
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
