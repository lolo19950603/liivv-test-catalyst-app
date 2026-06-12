import { Group, Image, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  archiveButtonControls,
  fontSizeFields,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { HealthScrollingBanner } from './client';

export const COMPONENT_TYPE = 'health-scrolling-banner';

/** Taupe `#a99c93` — outline matches fill on resting state. */
const TAUPE_BUTTON_DEFAULTS = {
  outlineHsl: '23 11% 62%',
  backgroundHsl: '23 11% 62%',
  textHsl: '0 0% 100%',
  hoverBackgroundHsl: '0 0% 100%',
  hoverTextHsl: '23 11% 62%',
} as const;

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
          defaultValue:
            '<p>Discreet solutions and reliable supplies designed to give you the security and comfort you need to live your life without interruption. Confidence in every movement.</p>',
        }),
        ...textColorFields('0 2% 19%'),
        ...fontSizeFields(),
      },
    }),
    button: Group({
      label: 'Button',
      preferredLayout: Group.Layout.Popover,
      props: archiveButtonControls(TAUPE_BUTTON_DEFAULTS, { textDefault: 'Get Started' }),
    }),
  },
});

runtime.registerComponent(HealthScrollingBanner, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(3, 'Scrolling banner (sticky stack)'),
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

