import { Color, Group, Number, Select, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  HEX_OVERRIDE_DESCRIPTION,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { hsl } from '~/lib/makeswift/utils/color';

import { AlignedTextIntro } from './client';

export const COMPONENT_TYPE = 'aligned-text-intro';

/** Soft cream `#fcf8f4` — stage intro bands. */
const INTRO_BACKGROUND_HSL = '40 57% 97%';
/** Sage-deep `#6b7f5c` — eyebrow default. */
const EYEBROW_HSL = '99 16% 43%';
/** Charcoal `rgb(49, 47, 47)`. */
const HEADING_HSL = '0 2% 19%';
/** Soft charcoal for body copy. */
const BODY_HSL = '0 2% 19% / 0.72';

runtime.registerComponent(AlignedTextIntro, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(17, 'Aligned text intro'),
  icon: 'text',
  props: {
    className: Style(),
    anchorId: TextInput({
      label: 'Scroll anchor id (optional)',
      defaultValue: '',
      description: 'e.g. intro — then link with Open URL → /path#intro (not Scroll to element).',
    }),
    ...sectionBackgroundControls(INTRO_BACKGROUND_HSL),
    ...roundedTopControl(),
    content: Group({
      label: 'Content',
      preferredLayout: Group.Layout.Popover,
      props: {
        contentAlign: Select({
          label: 'Content alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'center',
        }),
        eyebrow: TextInput({
          label: 'Eyebrow',
          defaultValue: "WHAT YOU'LL FIND HERE",
        }),
        eyebrowTextColor: Color({
          label: 'Eyebrow text color',
          defaultValue: hsl(EYEBROW_HSL),
        }),
        eyebrowTextColorHex: TextInput({
          label: 'Eyebrow text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
        heading: TextInput({
          label: 'Heading',
          defaultValue: 'Care that grows with her',
        }),
        ...textColorFields(HEADING_HSL),
        ...fontSizeFields(),
        body: TextArea({
          label: 'Body',
          defaultValue:
            'Everything below is meant to demystify the first cycles — for teens and the parents walking beside them.',
        }),
        bodyTextColor: Color({
          label: 'Body text color',
          defaultValue: hsl(BODY_HSL),
        }),
        bodyTextColorHex: TextInput({
          label: 'Body text color (hex override)',
          defaultValue: '',
          description: HEX_OVERRIDE_DESCRIPTION,
        }),
        bodyFontSize: Number({
          label: 'Body font size',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = theme default.',
        }),
        bodyFontSizeMobile: Number({
          label: 'Body font size (mobile)',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = same as desktop, or theme default when desktop is 0.',
        }),
      },
    }),
  },
});
