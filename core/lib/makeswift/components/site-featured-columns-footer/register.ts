import {
  Group,
  List,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  roundedBottomControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { SiteFeaturedColumnsFooter } from './client';

export const COMPONENT_TYPE = 'site-featured-columns-footer';

runtime.registerComponent(SiteFeaturedColumnsFooter, {
  type: COMPONENT_TYPE,
  label: 'Site Featured Columns Footer',
  hidden: true,
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...roundedBottomControl(),
    features: List({
      label: 'Feature columns',
      description: 'Maximum of 4 features. Additional items are ignored on the live site.',
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
          title: Group({
            label: 'Title',
            preferredLayout: Group.Layout.Popover,
            props: {
              text: TextInput({ label: 'Text', defaultValue: '' }),
              ...textColorFields(),
              ...fontSizeFields(),
            },
          }),
          description: Group({
            label: 'Description',
            preferredLayout: Group.Layout.Popover,
            props: {
              text: TextArea({
                label: 'Text (plain text or HTML)',
                defaultValue: '',
              }),
              ...textColorFields(),
              ...fontSizeFields(),
            },
          }),
        },
      }),
      getItemLabel(item) {
        const raw = item?.title;
        const text = typeof raw === 'string' ? raw : raw?.text;

        return text != null && String(text).trim().length > 0 ? String(text).trim() : 'Feature';
      },
    }),
  },
});
