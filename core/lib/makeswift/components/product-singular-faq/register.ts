import { Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { ProductSingularFaq } from './client';

export const COMPONENT_TYPE = 'product-singular-faq';

runtime.registerComponent(ProductSingularFaq, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(4, 'FAQ with contact form'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'FAQs',
    }),
    introBody: Group({
      label: 'Intro',
      preferredLayout: Group.Layout.Popover,
      props: {
        bodyHtml: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            '<p>Please read our <a href="#">FAQs</a> page to find out more.</p>',
        }),
        ...textColorFields('0 0% 100%'),
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
              ...textColorFields('0 0% 100%'),
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
              }),
              ...textColorFields('0 0% 100%'),
              ...fontSizeFields(),
            },
          }),
        },
      }),
      getItemLabel(item) {
        const q = item?.question?.text?.trim() ?? '';

        return q.length > 0 ? q : 'Question';
      },
    }),
    contactHeading: Group({
      label: 'Contact sidebar heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Heading',
          defaultValue: "Didn't find your answer?",
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    contactBody: Group({
      label: 'Contact sidebar body',
      preferredLayout: Group.Layout.Popover,
      props: {
        bodyHtml: TextArea({
          label: 'Body (HTML)',
          defaultValue: "<p>Don't hesitate to contact us</p>",
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    submitLabel: TextInput({
      label: 'Submit button label',
      defaultValue: 'Send message',
    }),
  },
});
