import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareFaqSecond } from './client';

export const COMPONENT_TYPE = 'diabetes-care-faq-second';

runtime.registerComponent(DiabetesCareFaqSecond, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(13, 'FAQ (second)'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'We Thought You Might Ask',
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
