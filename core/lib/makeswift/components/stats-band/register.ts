import {
  Checkbox,
  Color,
  Group,
  Image,
  Link,
  List,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { hsl } from '~/lib/makeswift/utils/color';

import { StatsBand } from './client';

/** `stats-band` is the canonical Makeswift component id. */
export const COMPONENT_TYPE = 'stats-band';

/** @deprecated Use {@link COMPONENT_TYPE} — retained so existing snapshots keep working. */
export const LEGACY_COMPONENT_TYPE = 'liivv-diabetes-care-stats-band';

const statsBandProps = {
  className: Style(),
  logoImage: Image({ label: 'Logo' }),
  logoAlt: TextInput({ label: 'Logo alt', defaultValue: 'Brand' }),
  logoLink: Link({ label: 'Logo link' }),
  headlinePrefix: TextInput({
    label: 'Heading (before accent)',
    defaultValue: 'Diabetes and',
  }),
  headlineAccent: TextInput({
    label: 'Heading (accent words)',
    defaultValue: 'Everyday Living',
  }),
  accentUseThemeHighlight: Checkbox({
    label: 'Use theme highlight color for accent words',
    defaultValue: true,
  }),
  accentHeadingColor: Color({
    label: 'Custom accent color',
    defaultValue: hsl('152 22% 38%'),
  }),
  stats: List({
    label: 'Statistics',
    type: Group({
      label: 'Stat',
      props: {
        value: TextInput({ label: 'Number', defaultValue: '9.7' }),
        description: TextArea({
          label: 'Supporting text',
          defaultValue: 'of Canadians live with diagnosed diabetes',
        }),
      },
    }),
    getItemLabel(item) {
      return item?.value ? `${item.value}%` : 'Stat';
    },
  }),
};

runtime.registerComponent(StatsBand, {
  type: COMPONENT_TYPE,
  label: 'Stats band',
  icon: 'layout',
  props: statsBandProps,
});

runtime.registerComponent(StatsBand, {
  type: LEGACY_COMPONENT_TYPE,
  label: 'Stats band (legacy slot)',
  icon: 'layout',
  hidden: true,
  props: statsBandProps,
});
