import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareFaqFirst } from './client';

export const COMPONENT_TYPE = 'diabetes-care-faq-first';

runtime.registerComponent(DiabetesCareFaqFirst, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 11. FAQ (first)',
  icon: 'layout',
  props: {
    className: Style(),
    heading: TextInput({
      label: 'Heading (last word gets accent underline)',
      defaultValue: 'Support, Wherever You Are',
    }),
    intro: TextArea({
      label: 'Intro (below heading; blank line = new paragraph)',
      defaultValue: 'Access funding, programs, and resources available across Canada',
    }),
    items: List({
      label: 'Questions',
      type: Group({
        label: 'FAQ item',
        props: {
          question: TextInput({ label: 'Question', defaultValue: '' }),
          answer: TextArea({
            label:
              'Answer (HTML allowed, e.g. <p>, <ul><li>, <h2>; or plain text with blank lines for paragraphs)',
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
