import { Image, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DemoRevealImageWithText } from './client';

export const COMPONENT_TYPE = 'demo-reveal-image-with-text';

runtime.registerComponent(DemoRevealImageWithText, {
  type: COMPONENT_TYPE,
  label: 'Demo / Reveal Image With Text',
  icon: 'image',
  props: {
    className: Style(),
    eyebrow: TextInput({ label: 'Eyebrow', defaultValue: 'Reveal section' }),
    title: TextInput({ label: 'Title', defaultValue: 'Reveal image with text' }),
    description: TextArea({
      label: 'Description',
      defaultValue: 'Hover over the image to reveal supporting text. All fields are editable in Makeswift.',
    }),
    imageSrc: Image({ label: 'Image' }),
    imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Reveal section image' }),
    revealTitle: TextInput({ label: 'Reveal title', defaultValue: 'Additional context' }),
    revealDescription: TextArea({
      label: 'Reveal description',
      defaultValue: 'Use this area for a short supporting message that appears on image hover.',
    }),
  },
});
