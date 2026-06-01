import { Group, Image, List, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { sectionBackgroundControls } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { HealthScrollingText } from './client';

export const COMPONENT_TYPE = 'health-scrolling-text';

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

runtime.registerComponent(HealthScrollingText, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(1, 'Scrolling text marquee'),
  icon: 'carousel',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
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
    iconImage: Image({
      label: 'Liivv logo between label groups (every 5 labels)',
    }),
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
