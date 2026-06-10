import {
  Color,
  Group,
  List,
  Number,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  FONT_SIZE_DESCRIPTION,
  HEX_OVERRIDE_DESCRIPTION,
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { hsl } from '~/lib/makeswift/utils/color';

import { DiabetesCareNumberCounters } from './client';

export const COMPONENT_TYPE = 'diabetes-care-number-counters';

function counterNumberStyleFields() {
  return {
    numberColor: Color({
      label: 'Number color',
      defaultValue: hsl('0 2% 19%'),
    }),
    numberColorHex: TextInput({
      label: 'Number color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
    numberFontSize: Number({
      label: 'Number font size',
      suffix: 'px',
      defaultValue: 0,
      description: FONT_SIZE_DESCRIPTION,
    }),
    numberFontSizeMobile: Number({
      label: 'Number font size (mobile)',
      suffix: 'px',
      defaultValue: 0,
      description: '0 = same as desktop, or theme default when desktop is 0.',
    }),
  };
}

function counterDescriptionStyleFields() {
  return {
    descriptionColor: Color({
      label: 'Text below color',
      defaultValue: hsl('0 2% 19%'),
    }),
    descriptionColorHex: TextInput({
      label: 'Text below color (hex override)',
      defaultValue: '',
      description: HEX_OVERRIDE_DESCRIPTION,
    }),
    descriptionFontSize: Number({
      label: 'Text below font size',
      suffix: 'px',
      defaultValue: 0,
      description: FONT_SIZE_DESCRIPTION,
    }),
    descriptionFontSizeMobile: Number({
      label: 'Text below font size (mobile)',
      suffix: 'px',
      defaultValue: 0,
      description: '0 = same as desktop, or theme default when desktop is 0.',
    }),
  };
}

runtime.registerComponent(DiabetesCareNumberCounters, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(2, 'Number counters'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    counters: List({
      label: 'Counters (order = left to right on desktop)',
      description: 'Maximum of 4 counters. Additional items are ignored on the live site.',
      type: Group({
        label: 'Counter',
        props: {
          number: Group({
            label: 'Number',
            preferredLayout: Group.Layout.Popover,
            props: {
              value: TextInput({
                label: 'Number',
                defaultValue: '9.7',
                description: 'Numeric value for the count-up. Add symbols in “Suffix after number”.',
              }),
              suffix: TextInput({
                label: 'Suffix after number',
                defaultValue: '%',
                description: 'Optional text after the number (e.g. %, +, x). Leave empty for none.',
              }),
              ...counterNumberStyleFields(),
            },
          }),
          textBelow: Group({
            label: 'Text below',
            preferredLayout: Group.Layout.Popover,
            props: {
              description: TextArea({
                label: 'Text',
                defaultValue: 'Supporting line for this stat',
              }),
              ...counterDescriptionStyleFields(),
            },
          }),
        },
      }),
      getItemLabel(item) {
        const value = item?.number?.value;

        return value != null && String(value).length > 0 ? String(value) : 'Counter';
      },
    }),
  },
});
