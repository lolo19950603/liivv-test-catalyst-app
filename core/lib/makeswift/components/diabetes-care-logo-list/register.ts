import { Group, Image, List, Number, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareLogoList } from './client';

export const COMPONENT_TYPE = 'diabetes-care-logo-list';

runtime.registerComponent(DiabetesCareLogoList, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Logo list',
  icon: 'layout',
  props: {
    className: Style(),
    heading: TextInput({
      label: 'Heading (accent / half underline)',
      defaultValue: 'Trusted Brands, Made for Everyday Life',
    }),
    cycleDurationSeconds: Number({
      label: 'Loop duration (one pass of the logo set)',
      defaultValue: 45,
      suffix: 's',
    }),
    logoMaxHeightPx: Number({
      label: 'Logo max height (same for every logo)',
      defaultValue: 56,
      suffix: 'px',
    }),
    logoSlotWidthPx: Number({
      label: 'Logo slot width (same for every logo)',
      defaultValue: 176,
      suffix: 'px',
    }),
    logos: List({
      label: 'Logos (order = left to right in the strip)',
      type: Group({
        label: 'Logo',
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Alt text', defaultValue: '' }),
        },
      }),
      getItemLabel(item) {
        const alt = item?.imageAlt;

        return alt != null && String(alt).trim().length > 0 ? String(alt).trim() : 'Logo';
      },
    }),
  },
});
