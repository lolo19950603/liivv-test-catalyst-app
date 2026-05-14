import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareFaqSecond } from './client';

export const COMPONENT_TYPE = 'diabetes-care-faq-second';

runtime.registerComponent(DiabetesCareFaqSecond, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / FAQ (second)',
  icon: 'layout',
  props: {
    className: Style(),
    heading: TextInput({
      label: 'Heading',
      defaultValue: 'We Thought You Might Ask',
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
  },
});
