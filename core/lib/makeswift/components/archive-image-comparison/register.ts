import { Group, Image, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import {
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_HIGHLIGHT_SWASH_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { IMAGE_ALIGN_Y_CONTROL_OPTIONS } from '~/lib/makeswift/utils/image-object-position';

import { ArchiveImageComparison } from './client';
import { ARCHIVE_IMAGE_COMPARISON_BACKGROUND_HSL } from './archive-styles';

export const COMPONENT_TYPE = 'archive-image-comparison';

const imageAlignX = Select({
  label: 'Horizontal position',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
});

const imageAlignY = Select({
  label: 'Vertical position',
  options: [...IMAGE_ALIGN_Y_CONTROL_OPTIONS],
  defaultValue: 'center',
});

const comparisonImage = (label: string) =>
  Group({
    label,
    preferredLayout: Group.Layout.Popover,
    props: {
      image: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
      imageAlignX,
      imageAlignY,
    },
  });

runtime.registerComponent(ArchiveImageComparison, {
  type: COMPONENT_TYPE,
  label: archiveComponentLabel(2, 'Image comparison (before-after slider)'),
  icon: 'image',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_IMAGE_COMPARISON_BACKGROUND_HSL),
    ...roundedTopControl(),
    ...headingPopoverControls({
      label: 'Section heading (optional)',
      textDefault: 'Support at every stage of your journey',
      accentPhraseLabel: 'Accent phrase',
      accentPhraseDefault: 'every stage',
      textColorDefault: '0 2% 19%',
      includeAccentTextColor: true,
      accentTextColorDefault: ARCHIVE_HIGHLIGHT_SWASH_HSL,
      fontSizeDefault: 50,
      fontSizeMobileDefault: 0,
    }),
    beforeImage: comparisonImage('Before image'),
    afterImage: comparisonImage('After image'),
    initialPosition: Number({
      label: 'Initial divider position',
      defaultValue: 50,
      suffix: '%',
    }),
    desktopRatioPercent: Number({
      label: 'Desktop height (% of width)',
      description: 'Lower = shorter. 40 ≈ wide banner, 56.25 ≈ 16:9.',
      defaultValue: 40,
      suffix: '%',
    }),
    mobileRatioPercent: Number({
      label: 'Mobile height (% of width)',
      description: 'Leave equal to desktop for the same proportion.',
      defaultValue: 40,
      suffix: '%',
    }),
  },
});
