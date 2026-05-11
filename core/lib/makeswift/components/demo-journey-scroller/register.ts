import { Group, Image, List, Slot, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DemoJourneyScroller } from './client';

export const COMPONENT_TYPE = 'demo-journey-scroller';

runtime.registerComponent(DemoJourneyScroller, {
  type: COMPONENT_TYPE,
  label: 'Demo / Journey Scroller',
  icon: 'carousel',
  props: {
    className: Style(),
    heading: TextInput({
      label: 'Heading',
      defaultValue: 'Your Care Journey, Simp(liivv)fied',
    }),
    sections: List({
      label: 'Sections',
      type: Group({
        label: 'Section',
        props: {
          name: TextInput({ label: 'Name', defaultValue: 'Section' }),
          eyebrow: TextInput({ label: 'Eyebrow', defaultValue: 'How things work' }),
          title: TextInput({ label: 'Title', defaultValue: 'Your Liivv Account' }),
          description: TextArea({
            label: 'Description',
            defaultValue: 'Keep it simple and make it yours. Add details for this section.',
          }),
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Journey section image' }),
          leftContent: Slot(),
        },
      }),
      getItemLabel(section) {
        return section?.name || section?.title || 'Section';
      },
    }),
  },
});
