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

import { runtime } from '~/lib/makeswift/runtime';
import { IMAGE_ALIGN_Y_CONTROL_OPTIONS } from '~/lib/makeswift/utils/image-object-position';

import { SiteHeaderSlideshow } from './client';

export const COMPONENT_TYPE = 'catalyst-site-header-slideshow';

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
      options: [...IMAGE_ALIGN_Y_CONTROL_OPTIONS],
      defaultValue: 'center',
    }),
  },
});

const contentWidthOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full width' },
] as const;

const mobileLayout = Group({
  label: 'Mobile layout',
  props: {
    mobileHeight: Number({
      label: 'Mobile height',
      defaultValue: 200,
      suffix: 'px',
    }),
    mobileContentWidth: Select({
      label: 'Mobile content width',
      options: [...contentWidthOptions],
      defaultValue: 'full',
    }),
  },
});

runtime.registerComponent(SiteHeaderSlideshow, {
  type: COMPONENT_TYPE,
  label: 'Site Header Slideshow',
  hidden: true,
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: slide,
      getItemLabel(item, index) {
        const label = index != null ? index + 1 : 1;
        const imageAlt = item?.imageAlt?.trim() ?? item?.imageMedia?.imageAlt?.trim();

        if (imageAlt) {
          return imageAlt;
        }

        return `Slide ${label}`;
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
      defaultValue: 450,
      suffix: 'px',
    }),
    desktopContentWidth: Select({
      label: 'Desktop content width',
      options: [...contentWidthOptions],
      defaultValue: 'large',
    }),
    mobileLayout,
  },
});
