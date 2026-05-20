import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareCollectionList } from './client';

export const COMPONENT_TYPE = 'diabetes-care-collection-list';

runtime.registerComponent(DiabetesCareCollectionList, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 13. Collection list',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...splitHeadingPopoverControls({
      primaryLabel: 'Heading',
      secondaryLabel: 'Heading accent',
      primaryDefault: 'Care Designed for',
      secondaryDefault: 'Every Stage of Health',
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        descriptionHtml: TextArea({
          label: 'Description (HTML)',
          defaultValue: '<p>Liivv connects you to the care you need—when you need it.</p>',
        }),
      },
    }),
    cards: List({
      label: 'Collections',
      type: Group({
        label: 'Collection card',
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
          title: TextInput({ label: 'Title', defaultValue: 'Collection' }),
          cardLink: Link({ label: 'Link' }),
          ariaLabel: TextInput({ label: 'Card aria-label (optional)', defaultValue: '' }),
        },
      }),
      getItemLabel(item) {
        const t = item?.title;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Collection';
      },
    }),
    ...bodyTextPopoverControls(),
  },
});
