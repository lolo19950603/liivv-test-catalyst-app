import {
  Checkbox,
  Group,
  Image,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import { sectionBackgroundControls } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { ArchiveSlideshow } from './client';

export const COMPONENT_TYPE = 'archive-slideshow';

const slide = Group({
  label: 'Slide',
  props: {
    image: Image({ label: 'Image' }),
    imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
    imageAlignX: Select({
      label: 'Horizontal alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'center',
    }),
    imageAlignY: Select({
      label: 'Vertical alignment',
      options: [
        { value: 'top', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'bottom', label: 'Bottom' },
      ],
      defaultValue: 'center',
    }),
  },
});

runtime.registerComponent(ArchiveSlideshow, {
  type: COMPONENT_TYPE,
  label: archiveComponentLabel(0, 'Slideshow (hero carousel)'),
  icon: 'carousel',
  props: {
    className: Style(),
    ...sectionBackgroundControls('0 0% 100%'),
    slides: List({
      label: 'Slides',
      type: slide,
      getItemLabel(item, index) {
        const fallback = `Slide ${(index ?? 0) + 1}`;
        const alt = item?.imageAlt?.trim();

        return alt != null && alt.length > 0 ? alt : fallback;
      },
    }),
    autoplay: Checkbox({ label: 'Autoplay slideshow', defaultValue: true }),
    interval: Number({
      label: 'Time per slide',
      defaultValue: 5,
      suffix: 's',
    }),
    desktopHeight: Number({
      label: 'Desktop height',
      defaultValue: 500,
      suffix: 'px',
    }),
    mobileHeight: Number({
      label: 'Mobile height',
      defaultValue: 360,
      suffix: 'px',
    }),
    showArrows: Checkbox({ label: 'Show prev / next arrows', defaultValue: true }),
    paginationVisible: Checkbox({ label: 'Show pagination dots', defaultValue: true }),
    showPausePlay: Checkbox({ label: 'Show pause / play toggle', defaultValue: false }),
  },
});
