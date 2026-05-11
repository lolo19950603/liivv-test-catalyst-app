import { Image, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DemoHero } from './client';

export const COMPONENT_TYPE = 'demo-hybrid-hero';

runtime.registerComponent(DemoHero, {
  type: COMPONENT_TYPE,
  label: 'Demo / Hybrid Hero',
  icon: 'layout',
  props: {
    className: Style(),
    eyebrow: TextInput({
      label: 'Eyebrow',
      defaultValue: 'Coded content',
    }),
    title: TextInput({
      label: 'Title',
      defaultValue: 'Hybrid demo page',
    }),
    description: TextInput({
      label: 'Description',
      defaultValue:
        'This section is hardcoded in Catalyst, but the text and image props are editable in Makeswift.',
    }),
    imageSrc: Image({
      label: 'Image',
    }),
    imageAlt: TextInput({
      label: 'Image alt',
      defaultValue: 'Hero image',
    }),
  },
});
