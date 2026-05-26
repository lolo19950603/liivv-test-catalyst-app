import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareSectionHeader } from './client';

export const COMPONENT_TYPE = 'diabetes-care-section-header';

runtime.registerComponent(DiabetesCareSectionHeader, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(0, 'Section header (sticky)'),
  icon: 'layout',
  props: {
    className: Style(),
    showLogo: Checkbox({
      label: 'Show logo',
      defaultValue: true,
    }),
    logoImage: Image({ label: 'Logo image' }),
    logoAlt: TextInput({ label: 'Logo alt text', defaultValue: 'Liivv' }),
    logoLink: Link({ label: 'Logo link' }),
    navLinks: List({
      label: 'Section navigation links',
      type: Group({
        label: 'Link',
        props: {
          label: TextInput({ label: 'Label', defaultValue: 'Diabetes Essentials' }),
          link: Link({ label: 'URL' }),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Link',
    }),
    showUtilityIcons: Checkbox({
      label: 'Show search, account & cart icons',
      defaultValue: true,
    }),
    searchPlaceholder: TextInput({
      label: 'Search field placeholder',
      defaultValue: 'Search products',
    }),
  },
});

