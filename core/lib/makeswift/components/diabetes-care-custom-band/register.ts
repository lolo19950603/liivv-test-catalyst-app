import { Color, Group, Image, Link, Number, Style, TextInput } from '@makeswift/runtime/controls';

import { highlightSwashFields } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { hsl } from '~/lib/makeswift/utils/color';

import { DiabetesCareCustomBand } from './client';

export const COMPONENT_TYPE = 'diabetes-care-custom-band';

const HEX_OVERRIDE_DESCRIPTION = 'Optional. Overrides the picker when valid (e.g. `#4C7662`).';
const FONT_SIZE_DESCRIPTION = '0 = theme default (title-lg).';

runtime.registerComponent(DiabetesCareCustomBand, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(2, 'Custom band (logo + heading)'),
  icon: 'layout',
  props: {
    className: Style(),
    background: Group({
      label: 'Background',
      preferredLayout: Group.Layout.Popover,
      props: {
        color: Color({
          label: 'Background color',
          defaultValue: hsl('0 0% 100%'),
        }),
        colorHex: TextInput({
          label: 'Background color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
      },
    }),
    logo: Group({
      label: 'Logo',
      preferredLayout: Group.Layout.Popover,
      props: {
        image: Image({ label: 'Image' }),
        altText: TextInput({ label: 'Alt text', defaultValue: 'Liivv Diabetes' }),
        link: Link({ label: 'Link' }),
      },
    }),
    primaryHeading: Group({
      label: 'Primary heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: 'Diabetes and',
        }),
        textColor: Color({
          label: 'Text color',
          defaultValue: hsl('0 2% 19%'),
        }),
        textColorHex: TextInput({
          label: 'Text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
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
      },
    }),
    secondaryHeading: Group({
      label: 'Secondary heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text',
          defaultValue: 'Everyday Living',
        }),
        textColor: Color({
          label: 'Text color',
          defaultValue: hsl(ARCHIVE_SAGE_BACKGROUND_HSL),
        }),
        textColorHex: TextInput({
          label: 'Text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
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
        ...highlightSwashFields(),
      },
    }),
  },
});
