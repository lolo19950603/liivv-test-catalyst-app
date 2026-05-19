import { Checkbox, Link, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareRichTextLower } from './client';

export const COMPONENT_TYPE = 'diabetes-care-rich-text-lower';

runtime.registerComponent(DiabetesCareRichTextLower, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 12. Rich text (lower)',
  icon: 'layout',
  props: {
    className: Style(),
    showSupportIcon: Checkbox({ label: 'Show support icon above heading', defaultValue: true }),
    headingLead: TextInput({
      label: 'Heading — text before accent',
      defaultValue: 'Put a stop to pain.',
    }),
    headingAccent: TextInput({
      label: 'Heading — accent (half underline)',
      defaultValue: 'Period.',
    }),
    bodyHtml: TextArea({
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
});
