import { Group, Image, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { HealthScrollingBanner } from './client';

export const COMPONENT_TYPE = 'health-scrolling-banner';

const panelGroup = Group({
  label: 'Panel',
  props: {
    image: Image({ label: 'Image' }),
    imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
    heading: Group({
      label: 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({ label: 'Heading', defaultValue: 'Ostomy Care & Everyday Living' }),
        ...textColorFields('0 2% 19%'),
        ...fontSizeFields(),
      },
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'HTML',
          defaultValue: '<p>Supportive products and guidance for everyday confidence.</p>',
        }),
        ...textColorFields('0 2% 19%'),
        ...fontSizeFields(),
      },
    }),
  },
});

runtime.registerComponent(HealthScrollingBanner, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(5, 'Scrolling banner (sticky stack)'),
  icon: 'carousel',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
      description: 'Use "b" for the second scrolling banner on the health page.',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    panels: List({
      label: 'Sticky panels (top to bottom)',
      type: panelGroup,
      getItemLabel(panel) {
        return panel?.heading?.text?.trim() || 'Panel';
      },
    }),
  },
});
