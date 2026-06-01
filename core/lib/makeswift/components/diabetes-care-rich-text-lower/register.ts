import { Checkbox, Group, Style, TextArea } from '@makeswift/runtime/controls';

import {
  archiveButtonGroup,
  fontSizeFields,
  roundedTopControl,
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
  label: diabetesCareComponentLabel(11, 'Rich text (lower)'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
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
    button: archiveButtonGroup('Button', ARCHIVE_BUTTON_PRIMARY_DARK, {
      textDefault: 'Book a virtual appointment',
    }),
    showSupportIcon: Checkbox({ label: 'Show support icon above heading', defaultValue: true }),
  },
});
