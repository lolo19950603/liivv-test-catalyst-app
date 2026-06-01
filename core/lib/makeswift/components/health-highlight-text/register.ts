import { Color, Group, Image, List, Style, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  HEX_OVERRIDE_DESCRIPTION,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import {
  ARCHIVE_CREAM_BACKGROUND_HSL,
  ARCHIVE_HIGHLIGHT_SWASH_HSL,
} from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { hsl } from '~/lib/makeswift/utils/color';

import { HealthHighlightText } from './client';

export const COMPONENT_TYPE = 'health-highlight-text';

const pillImageGroup = Group({
  label: 'Pill image',
  props: {
    image: Image({ label: 'Image' }),
    altText: TextInput({ label: 'Alt text', defaultValue: '' }),
    objectPosition: TextInput({
      label: 'Object position (optional)',
      defaultValue: '',
      description: 'e.g. 50% 50% or 44% 50%',
    }),
  },
});

runtime.registerComponent(HealthHighlightText, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(0, 'Highlight text (logo)'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(ARCHIVE_CREAM_BACKGROUND_HSL),
    ...roundedTopControl(),
    topRowImages: List({
      label: 'Images above heading (pill row)',
      type: pillImageGroup,
      getItemLabel(item) {
        return item?.altText?.trim() || 'Pill image';
      },
    }),
    bottomRowImages: List({
      label: 'Images below heading (pill row)',
      type: pillImageGroup,
      getItemLabel(item) {
        return item?.altText?.trim() || 'Pill image';
      },
    }),
    heading: Group({
      label: 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: Group({
          label: 'Text',
          preferredLayout: Group.Layout.Popover,
          props: {
            beforeHealth: TextInput({ label: 'Before highlight', defaultValue: 'Liivv' }),
            healthPhrase: TextInput({
              label: 'Highlighted phrase 1',
              defaultValue: 'Health',
            }),
            midText: TextInput({ label: 'Middle text', defaultValue: 'is your' }),
            journeyPhrase: TextInput({
              label: 'Highlighted phrase 2',
              defaultValue: 'customized journey',
            }),
            trailText: TextInput({
              label: 'Trailing text',
              defaultValue: 'for every day living',
            }),
          },
        }),
        colors: Group({
          label: 'Colors',
          preferredLayout: Group.Layout.Popover,
          props: {
            ...textColorFields('0 2% 19%'),
            healthPhraseAccentColor: Color({
              label: 'Highlight 1 color',
              defaultValue: hsl(ARCHIVE_HIGHLIGHT_SWASH_HSL),
            }),
            healthPhraseAccentColorHex: TextInput({
              label: 'Highlight 1 color (hex override)',
              defaultValue: '',
              description: HEX_OVERRIDE_DESCRIPTION,
            }),
            journeyPhraseAccentColor: Color({
              label: 'Highlight 2 color',
              defaultValue: hsl(ARCHIVE_HIGHLIGHT_SWASH_HSL),
            }),
            journeyPhraseAccentColorHex: TextInput({
              label: 'Highlight 2 color (hex override)',
              defaultValue: '',
              description: HEX_OVERRIDE_DESCRIPTION,
            }),
          },
        }),
        typography: Group({
          label: 'Typography',
          preferredLayout: Group.Layout.Popover,
          props: {
            ...fontSizeFields(),
          },
        }),
      },
    }),
  },
});
