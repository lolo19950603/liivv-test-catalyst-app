import { Checkbox, Color, Image, Link, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { hsl } from '~/lib/makeswift/utils/color';

import { DiabetesCareCustomBand } from './client';

export const COMPONENT_TYPE = 'diabetes-care-custom-band';

runtime.registerComponent(DiabetesCareCustomBand, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Custom band (logo + heading)',
  icon: 'layout',
  props: {
    className: Style(),
    logoImage: Image({ label: 'Logo image' }),
    logoAlt: TextInput({ label: 'Logo alt text', defaultValue: 'Liivv Diabetes' }),
    logoLink: Link({ label: 'Logo link' }),
    primaryHeading: TextInput({
      label: 'Primary heading',
      defaultValue: 'Diabetes and',
    }),
    secondaryHeading: TextInput({
      label: 'Secondary heading',
      defaultValue: 'Everyday Living',
    }),
    useThemeHighlightForSecondary: Checkbox({
      label: 'Use theme highlight color for secondary heading',
      defaultValue: true,
    }),
    secondaryTextColor: Color({
      label: 'Secondary heading color (when not using theme highlight)',
      defaultValue: hsl('152 22% 38%'),
    }),
  },
});
