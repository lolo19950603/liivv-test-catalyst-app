import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareFaqFirst } from './client';

export const COMPONENT_TYPE = 'diabetes-care-faq-first';

runtime.registerComponent(DiabetesCareFaqFirst, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(9, 'FAQ (first)'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'Support, Wherever You Are',
    }),
    introBody: Group({
      label: 'Intro body',
      preferredLayout: Group.Layout.Popover,
      props: {
        bodyHtml: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            '<p>Access funding, programs, and resources available across Canada</p>',
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    items: List({
      label: 'Questions',
      type: Group({
        label: 'FAQ item',
        props: {
          question: Group({
            label: 'Question',
            preferredLayout: Group.Layout.Popover,
            props: {
              text: TextInput({ label: 'Question', defaultValue: '' }),
              ...textColorFields(),
              ...fontSizeFields(),
            },
          }),
          answer: Group({
            label: 'Answer',
            preferredLayout: Group.Layout.Popover,
            props: {
              bodyHtml: TextArea({
                label: 'Body (HTML)',
                defaultValue: '',
                description:
                  'Supports HTML (e.g. &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;h2&gt;). Plain text: blank lines = paragraphs.',
              }),
              ...textColorFields(),
              ...fontSizeFields(),
            },
          }),
        },
      }),
      getItemLabel(item) {
        const q =
          typeof item?.question === 'string'
            ? item.question.trim()
            : (item?.question?.text?.trim() ?? '');

        return q.length > 0 ? q : 'Question';
      },
    }),
  },
});
