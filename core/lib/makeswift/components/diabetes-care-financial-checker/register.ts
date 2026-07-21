import { Style, TextArea } from '@makeswift/runtime/controls';

import {
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareFinancialChecker } from './client';

export const COMPONENT_TYPE = 'diabetes-care-financial-checker';

runtime.registerComponent(DiabetesCareFinancialChecker, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(15, 'Financial help checker'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    ...headingPopoverControls({
      label: 'Heading',
      textLabel: 'Heading',
      textDefault: 'You may be entitled to more help than you think',
      textColorDefault: '0 2% 19%',
    }),
    intro: TextArea({
      label: 'Intro paragraph',
      defaultValue:
        'Diabetes supplies add up — but across Canada, a lot of that cost can be covered by public programs. Answer a few quick questions to see what you may qualify for. Coverage changes often, so we link you straight to the official source to confirm and apply.',
    }),
    disclaimer: TextArea({
      label: 'Disclaimer',
      defaultValue:
        'This is general education as of July 2026 — not medical, financial, or legal advice. Coverage details and eligibility change and vary by province and territory. Always confirm current coverage with your provincial or territorial health ministry, the NIHB program, or your pharmacist, and speak with your diabetes care team before making changes to your management plan.',
    }),
  },
});
