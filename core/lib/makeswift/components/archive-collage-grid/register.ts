import { Checkbox, Color, Group, Image, Link, List, Number, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import {
  buttonColorFields,
  FONT_SIZE_DESCRIPTION,
  HEX_OVERRIDE_DESCRIPTION,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { hsl } from '~/lib/makeswift/utils/color';
import {
  ARCHIVE_BUTTON_PRIMARY_DARK,
  ARCHIVE_BUTTON_SECONDARY_ON_WHITE,
} from '~/lib/makeswift/utils/archive-button-presets';

import { ArchiveCollageGrid } from './client';

export const COMPONENT_TYPE = 'archive-collage-grid';

const COLLAGE_TITLE_FONT_SIZE_DESKTOP = 25;
const COLLAGE_TITLE_FONT_SIZE_MOBILE = 18;

const collageFontSizeFields = () => ({
  fontSize: Number({
    label: 'Font size',
    suffix: 'px',
    defaultValue: COLLAGE_TITLE_FONT_SIZE_DESKTOP,
    description: FONT_SIZE_DESCRIPTION,
  }),
  fontSizeMobile: Number({
    label: 'Font size (mobile)',
    suffix: 'px',
    defaultValue: COLLAGE_TITLE_FONT_SIZE_MOBILE,
    description: '0 = same as desktop.',
  }),
});

const collageTitlePart = (label: string, textColorDefaultHsl: string) =>
  Group({
    label,
    preferredLayout: Group.Layout.Popover,
    props: {
      text: TextInput({ label: 'Text', defaultValue: '' }),
      ...textColorFields(textColorDefaultHsl),
      ...collageFontSizeFields(),
    },
  });

const collageItem = Group({
  label: 'Collage item',
  props: {
    imageMedia: Group({
      label: 'Image',
      preferredLayout: Group.Layout.Popover,
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
    }),
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
    blockBackground: Group({
      label: 'Block background (text-only)',
      preferredLayout: Group.Layout.Popover,
      props: {
        color: Color({
          label: 'Background color',
          defaultValue: hsl('0 20% 94%'),
        }),
        colorHex: TextInput({
          label: 'Background color (hex override)',
          defaultValue: '#f3eded',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
      },
    }),
    titleContent: Group({
      label: 'Title',
      preferredLayout: Group.Layout.Popover,
      props: {
        primaryTitle: collageTitlePart('Primary title', '0 0% 100%'),
        secondaryTitle: collageTitlePart('Secondary title', '142 10% 55%'),
        link: Link({ label: 'Link (optional)' }),
      },
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
        const alt = item?.imageMedia?.imageAlt?.trim() ?? item?.imageAlt?.trim();
        const primaryPart = item?.titleContent?.primaryTitle;
        const secondaryPart = item?.titleContent?.secondaryTitle;
        const primary =
          (typeof primaryPart === 'string' ? primaryPart : primaryPart?.text)?.trim() ??
          item?.primaryTitle?.trim() ??
          item?.title?.trim();
        const secondary =
          (typeof secondaryPart === 'string' ? secondaryPart : secondaryPart?.text)?.trim() ??
          item?.secondaryTitle?.trim();

        if (primary != null && primary.length > 0 && secondary != null && secondary.length > 0) {
          return `${primary} / ${secondary}`;
        }

        if (primary != null && primary.length > 0) {
          return primary;
        }

        if (secondary != null && secondary.length > 0) {
          return secondary;
        }

        if (alt != null && alt.length > 0) {
          return alt;
        }

        return 'Text block';
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
    ...roundedTopControl(),
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
