import { Checkbox, Group, Link, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  buttonColorFields,
  fontSizeFields,
  sectionBackgroundControls,
  textColorFields,
  splitRichTextLowerHeadingControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_PRIMARY_DARK } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareRichTextLower } from './client';

export const COMPONENT_TYPE = 'diabetes-care-rich-text-lower';

runtime.registerComponent(DiabetesCareRichTextLower, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(12, 'Rich text (lower)'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...splitRichTextLowerHeadingControls({
      line1Default: 'Put a stop to pain.',
      line2Default: 'Period.',
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            "<p>Skip the doctor's office. Our pharmacists can now assess and prescribe for period cramps right on the spot — no appointment needed, just faster relief.</p><p>(Only available in Ontario)</p>",
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    button: Group({
      label: 'Button',
      preferredLayout: Group.Layout.Popover,
      props: {
        label: TextInput({
          label: 'Button label',
          defaultValue: 'Book a virtual appointment',
        }),
        link: Link({ label: 'Button link' }),
        ...buttonColorFields(ARCHIVE_BUTTON_PRIMARY_DARK),
      },
    }),
    showSupportIcon: Checkbox({ label: 'Show support icon above heading', defaultValue: true }),
  },
});
