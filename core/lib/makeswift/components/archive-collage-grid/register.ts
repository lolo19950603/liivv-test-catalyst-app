import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import {
  buttonColorFields,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import {
  ARCHIVE_BUTTON_PRIMARY_DARK,
  ARCHIVE_BUTTON_SECONDARY_ON_WHITE,
} from '~/lib/makeswift/utils/archive-button-presets';

import { ArchiveCollageGrid } from './client';

export const COMPONENT_TYPE = 'archive-collage-grid';

const collageItem = Group({
  label: 'Collage item',
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
    link: Link({ label: 'Link (optional)' }),
    columnSpan: Number({
      label: 'Column span (desktop)',
      description: '1–12. Default 3 (i.e. 4 items per row in a 12-column grid).',
      defaultValue: 3,
    }),
    rowSpan: Number({
      label: 'Row span (desktop)',
      description: '1–6. Default 2.',
      defaultValue: 2,
    }),
    overlayColor: TextInput({
      label: 'Overlay color (HSL channels)',
      description: 'e.g. "49 47 47". Leave blank to inherit section default.',
      defaultValue: '',
    }),
    overlayOpacity: Number({
      label: 'Overlay opacity (per item)',
      description: 'Leave blank to use the section default.',
      suffix: '0–1',
    }),
    title: TextInput({ label: 'Title (optional)', defaultValue: '' }),
    titleColor: TextInput({
      label: 'Title color (HSL channels)',
      description: 'e.g. "255 255 255". Leave blank to use white.',
      defaultValue: '',
    }),
  },
});

const ctaButton = (defaultLabel: string, defaults = ARCHIVE_BUTTON_PRIMARY_DARK) =>
  Group({
    label: defaultLabel,
    preferredLayout: Group.Layout.Popover,
    props: {
      label: TextInput({ label: 'Button label', defaultValue: defaultLabel }),
      link: Link({ label: 'Button link' }),
      widthPct: Number({
        label: 'Desktop width (%)',
        description: 'Leave blank for auto width.',
        suffix: '%',
      }),
      ...buttonColorFields(defaults),
    },
  });

runtime.registerComponent(ArchiveCollageGrid, {
  type: COMPONENT_TYPE,
  label: archiveComponentLabel(1, 'Collage grid + optional CTA row'),
  icon: 'gallery',
  props: {
    className: Style(),
    ...sectionBackgroundControls('0 2% 65%'),
    items: List({
      label: 'Collage items',
      type: collageItem,
      getItemLabel(item, index) {
        const fallback = `Item ${(index ?? 0) + 1}`;
        const alt = item?.imageAlt?.trim();
        const title = item?.title?.trim();

        if (title != null && title.length > 0) {
          return title;
        }

        return alt != null && alt.length > 0 ? alt : fallback;
      },
    }),
    rowHeight: Number({
      label: 'Row height',
      defaultValue: 150,
      suffix: 'px',
    }),
    desktopGap: Number({
      label: 'Desktop gap',
      defaultValue: 24,
      suffix: 'px',
    }),
    mobileGap: Number({
      label: 'Mobile gap',
      defaultValue: 10,
      suffix: 'px',
    }),
    defaultOverlayOpacity: Number({
      label: 'Default overlay opacity',
      defaultValue: 0.4,
      suffix: '0–1',
    }),
    enableHoverDim: Checkbox({
      label: 'Dim overlay on hover',
      defaultValue: true,
    }),
    cta: Group({
      label: 'CTA row (below collage)',
      preferredLayout: Group.Layout.Popover,
      props: {
        enabled: Checkbox({ label: 'Show CTA row', defaultValue: false }),
        paddingTop: Number({ label: 'Padding top', defaultValue: 12, suffix: 'px' }),
        paddingBottom: Number({ label: 'Padding bottom', defaultValue: 32, suffix: 'px' }),
        primary: ctaButton('Primary CTA', ARCHIVE_BUTTON_PRIMARY_DARK),
        secondary: ctaButton('Secondary CTA', ARCHIVE_BUTTON_SECONDARY_ON_WHITE),
      },
    }),
  },
});
