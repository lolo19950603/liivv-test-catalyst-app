import { Group, Image, Style, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { HealthHighlightText } from './client';

export const COMPONENT_TYPE = 'health-highlight-text';

runtime.registerComponent(HealthHighlightText, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(1, 'Highlight text (logo)'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    logo: Group({
      label: 'Logo',
      preferredLayout: Group.Layout.Popover,
      props: {
        image: Image({ label: 'Image' }),
        altText: TextInput({ label: 'Alt text', defaultValue: 'Liivv' }),
      },
    }),
    heading: Group({
      label: 'Heading (optional)',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({ label: 'Heading', defaultValue: 'Liivv' }),
        ...textColorFields('0 2% 19%'),
        ...fontSizeFields(),
      },
    }),
  },
});
