import { Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { CustomCatalystSkeleton } from './client';

runtime.registerComponent(CustomCatalystSkeleton, {
  type: 'custom-catalyst-skeleton',
  label: 'Custom / Catalyst Skeleton',
  icon: 'box',
  props: {
    className: Style(),
    message: TextInput({
      label: 'Message',
      defaultValue: 'This is coming from a custom Catalyst component.',
    }),
  },
});
