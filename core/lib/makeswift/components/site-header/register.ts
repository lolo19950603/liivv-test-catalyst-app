import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Slot,
  TextInput,
} from '@makeswift/runtime/controls';

import { sectionBackgroundControls } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

const banner = Group({
  label: 'Banner',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show banner', defaultValue: false }),
    allowClose: Checkbox({ label: 'Allow banner to close', defaultValue: true }),
    id: TextInput({ label: 'Banner ID', defaultValue: 'black_friday_2025' }),
    children: Slot(),
  },
});

const sectionNavLinks = List({
  label: 'Navigation links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Label', defaultValue: 'Diabetes Essentials' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Link',
});

const additionalNavSubLink = Group({
  label: 'Sub link',
  props: {
    label: TextInput({ label: 'Text', defaultValue: 'Subcategory' }),
    link: Link({ label: 'URL' }),
    previewImage: Image({ label: 'Hover preview image' }),
    previewImageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
  },
});

const additionalNavLinks = List({
  label: 'Additional links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
      exploreAllLabel: TextInput({ label: 'Explore all label', defaultValue: 'Explore All' }),
      subLinks: List({
        label: 'Sub links (mega menu)',
        type: additionalNavSubLink,
        getItemLabel: (item) => item?.label ?? 'Sub link',
      }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'Site Header',
  hidden: true,
  props: {
    ...sectionBackgroundControls('0 0% 100%'),
    banner,
    links: additionalNavLinks,
    linksPosition: Select({
      label: 'Links position',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    }),
    pageOverrides: List({
      label: 'Per-page header overrides',
      type: Group({
        label: 'Page',
        props: {
          paths: List({
            label: 'Show on paths',
            type: TextInput({
              label: 'Path',
              defaultValue: '/diabetes-care',
            }),
            getItemLabel: (item) => item ?? '/path',
          }),
          showLogo: Checkbox({ label: 'Show logo', defaultValue: true }),
          logoImage: Image({ label: 'Logo image' }),
          logoAlt: TextInput({ label: 'Logo alt text', defaultValue: 'Liivv' }),
          logoLink: Link({ label: 'Logo link' }),
          navLinks: sectionNavLinks,
          showUtilityIcons: Checkbox({
            label: 'Show search, account & cart icons',
            defaultValue: true,
          }),
          searchPlaceholder: TextInput({
            label: 'Search field placeholder',
            defaultValue: 'Search products',
          }),
        },
      }),
      getItemLabel: (item) => {
        const firstPath = item?.paths?.find((p): p is string => Boolean(p));

        return firstPath ?? 'Page';
      },
    }),
  },
});
