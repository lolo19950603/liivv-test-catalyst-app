import {
  Group,
  Image,
  Link,
  List,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareImageTextOverlay } from './client';

export const COMPONENT_TYPE = 'diabetes-care-image-text-overlay';

runtime.registerComponent(DiabetesCareImageTextOverlay, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 15. Image with text overlay',
  icon: 'image',
  props: {
    className: Style(),
    ...sectionBackgroundControls('0 0% 100%'),
    banner: Group({
      label: 'Banner',
      preferredLayout: Group.Layout.Popover,
      props: {
        imageSrc: Image({ label: 'Background image' }),
        imageAlt: TextInput({ label: 'Background image alt', defaultValue: '' }),
      },
    }),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: "We're Here if You Need Us",
      textColorDefault: '0 0% 100%',
      includeHighlightSwash: true,
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Body (HTML)',
          defaultValue: '<p>If you have questions — or want a second opinion — we’re always here.</p>',
        }),
      },
    }),
    button: Group({
      label: 'Button',
      preferredLayout: Group.Layout.Popover,
      props: {
        label: TextInput({ label: 'Button label', defaultValue: 'Reach Out' }),
        link: Link({ label: 'Button link' }),
      },
    }),
    features: List({
      label: 'Feature columns (below banner)',
      type: Group({
        label: 'Feature',
        props: {
          icon: Select({
            label: 'Icon',
            options: [
              { value: 'support', label: 'Headset (support)' },
              { value: 'box', label: 'Box (shipping)' },
              { value: 'heart', label: 'Heart (care)' },
              { value: 'shield', label: 'Shield (payments)' },
            ],
            defaultValue: 'support',
          }),
          title: TextInput({ label: 'Title', defaultValue: '' }),
          description: TextArea({
            label: 'Description (plain text or HTML)',
            defaultValue: '',
          }),
        },
      }),
      getItemLabel(item) {
        const t = item?.title;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Feature';
      },
    }),
    ...bodyTextPopoverControls('0 0% 100%'),
  },
});
