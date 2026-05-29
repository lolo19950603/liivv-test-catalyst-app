import { Group, Image, List, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import {
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { ProductSingularScrollingText } from './client';

export const COMPONENT_TYPE = 'product-singular-scrolling-text';

const itemGroup = Group({
  label: 'Item',
  props: {
    kind: Select({
      label: 'Type',
      options: [
        { value: 'text', label: 'Text' },
        { value: 'image', label: 'Image only' },
      ],
      defaultValue: 'text',
    }),
    text: TextInput({ label: 'Label', defaultValue: '' }),
    image: Image({ label: 'Image (when type is image)' }),
    imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
  },
});

runtime.registerComponent(ProductSingularScrollingText, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(3, 'Scrolling text marquee'),
  icon: 'carousel',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    direction: Select({
      label: 'Scroll direction',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'left',
    }),
    durationSeconds: Number({
      label: 'Loop duration',
      defaultValue: 26,
      suffix: 's',
    }),
    iconImage: Image({ label: 'Repeating icon between labels (optional)' }),
    iconHeightPx: Number({
      label: 'Icon height',
      defaultValue: 80,
      suffix: 'px',
    }),
    items: List({
      label: 'Marquee items',
      type: itemGroup,
      getItemLabel(item) {
        if (item?.kind === 'image') {
          return item.imageAlt?.trim() || 'Image';
        }

        return item?.text?.trim() || 'Text item';
      },
    }),
  },
});
