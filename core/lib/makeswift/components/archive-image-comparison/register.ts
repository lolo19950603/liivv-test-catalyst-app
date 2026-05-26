import {
  Checkbox,
  Image,
  Number,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import {
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { ArchiveImageComparison } from './client';

export const COMPONENT_TYPE = 'archive-image-comparison';

runtime.registerComponent(ArchiveImageComparison, {
  type: COMPONENT_TYPE,
  label: archiveComponentLabel(2, 'Image comparison (before / after slider)'),
  icon: 'image',
  props: {
    className: Style(),
    ...sectionBackgroundControls('168 156 148'),
    ...headingPopoverControls({
      label: 'Section heading (optional)',
      textDefault: '',
      textColorDefault: '0 2% 19%',
    }),
    beforeImage: Image({ label: 'Before image' }),
    beforeImageAlt: TextInput({ label: 'Before image alt', defaultValue: 'Before' }),
    beforeLabel: TextInput({ label: 'Before label', defaultValue: 'Before' }),
    afterImage: Image({ label: 'After image' }),
    afterImageAlt: TextInput({ label: 'After image alt', defaultValue: 'After' }),
    afterLabel: TextInput({ label: 'After label', defaultValue: 'After' }),
    initialPosition: Number({
      label: 'Initial divider position',
      defaultValue: 50,
      suffix: '%',
    }),
    desktopRatioPercent: Number({
      label: 'Desktop aspect ratio (% of width)',
      description: 'Height as a % of width. 56.25 ≈ 16:9, 75 ≈ 4:3.',
      defaultValue: 56.25,
      suffix: '%',
    }),
    mobileRatioPercent: Number({
      label: 'Mobile aspect ratio (% of width)',
      description: 'Leave equal to desktop for the same ratio.',
      defaultValue: 56.25,
      suffix: '%',
    }),
    showLabels: Checkbox({ label: 'Show before / after labels', defaultValue: true }),
  },
});
