import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareCollectionList } from './client';

export const COMPONENT_TYPE = 'diabetes-care-collection-list';

runtime.registerComponent(DiabetesCareCollectionList, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 13. Collection list',
  icon: 'layout',
  props: {
    className: Style(),
    headingLead: TextInput({
      label: 'Heading — before accent',
      defaultValue: 'Care Designed for',
    }),
    headingEmphasis: TextInput({
      label: 'Heading — accent (half underline)',
      defaultValue: 'Every Stage of Health',
    }),
    descriptionHtml: TextArea({
      label: 'Description (HTML)',
      defaultValue: '<p>Liivv connects you to the care you need—when you need it.</p>',
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
  },
});
