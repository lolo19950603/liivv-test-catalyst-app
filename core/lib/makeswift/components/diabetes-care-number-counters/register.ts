import { Checkbox, Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareNumberCounters } from './client';

export const COMPONENT_TYPE = 'diabetes-care-number-counters';

runtime.registerComponent(DiabetesCareNumberCounters, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Number counters',
  icon: 'layout',
  props: {
    className: Style(),
    showPercentSuffix: Checkbox({
      label: 'Append % after each number',
      defaultValue: true,
    }),
    counters: List({
      label: 'Counters (order = left to right on desktop)',
      type: Group({
        label: 'Counter',
        props: {
          value: TextInput({ label: 'Number', defaultValue: '9.7' }),
          description: TextArea({
            label: 'Text below',
            defaultValue: 'Supporting line for this stat',
          }),
        },
      }),
      getItemLabel(item) {
        return item?.value != null && String(item.value).length > 0
          ? String(item.value)
          : 'Counter';
      },
    }),
  },
});
