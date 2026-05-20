import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareFaqSecond } from './client';

export const COMPONENT_TYPE = 'diabetes-care-faq-second';

runtime.registerComponent(DiabetesCareFaqSecond, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 14. FAQ (second)',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'We Thought You Might Ask',
      includeHighlightSwash: true,
    }),
    items: List({
      label: 'Questions',
      type: Group({
        label: 'FAQ item',
        props: {
          question: TextInput({ label: 'Question', defaultValue: '' }),
          answer: TextArea({
            label:
              'Answer (HTML allowed, e.g. <p>, <ul><li>; or plain text with blank lines for paragraphs)',
            defaultValue: '',
          }),
        },
      }),
      getItemLabel(item) {
        const q = item?.question;

        return q != null && String(q).trim().length > 0 ? String(q).trim() : 'Question';
      },
    }),
    ...bodyTextPopoverControls(),
  },
});
