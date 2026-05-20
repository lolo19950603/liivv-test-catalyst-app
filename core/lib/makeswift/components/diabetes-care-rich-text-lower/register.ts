import { Checkbox, Group, Link, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareRichTextLower } from './client';

export const COMPONENT_TYPE = 'diabetes-care-rich-text-lower';

runtime.registerComponent(DiabetesCareRichTextLower, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 12. Rich text (lower)',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...splitHeadingPopoverControls({
      primaryLabel: 'Heading',
      secondaryLabel: 'Heading accent',
      primaryDefault: 'Put a stop to pain.',
      secondaryDefault: 'Period.',
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            "<p>Skip the doctor's office. Our pharmacists can now assess and prescribe for period cramps right on the spot — no appointment needed, just faster relief.</p><p>(Only available in Ontario)</p>",
        }),
        ctaLabel: TextInput({
          label: 'Button label',
          defaultValue: 'Book a virtual appointment',
        }),
        ctaLink: Link({ label: 'Button link' }),
      },
    }),
    showSupportIcon: Checkbox({ label: 'Show support icon above heading', defaultValue: true }),
    ...bodyTextPopoverControls(),
  },
});
