import { Group, Image, List, Number, Style, TextInput } from '@makeswift/runtime/controls';

import {
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareLogoList } from './client';

export const COMPONENT_TYPE = 'diabetes-care-logo-list';

runtime.registerComponent(DiabetesCareLogoList, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 8. Logo list',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'Trusted by leading organizations',
      includeHighlightSwash: true,
    }),
    marquee: Group({
      label: 'Marquee',
      preferredLayout: Group.Layout.Popover,
      props: {
        cycleDurationSeconds: Number({
          label: 'Cycle duration',
          suffix: 's',
          defaultValue: 30,
        }),
        logoMaxHeightPx: Number({
          label: 'Logo max height',
          suffix: 'px',
          defaultValue: 80,
        }),
        logoSlotWidthPx: Number({
          label: 'Logo slot width',
          suffix: 'px',
          defaultValue: 160,
        }),
      },
    }),
    logos: List({
      label: 'Logos',
      type: Group({
        label: 'Logo',
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Alt text', defaultValue: '' }),
        },
      }),
      getItemLabel(item) {
        return item?.imageAlt?.trim() || 'Logo';
      },
    }),
  },
});
