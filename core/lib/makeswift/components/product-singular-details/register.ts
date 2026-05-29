import { Checkbox, Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { ProductSingularDetails } from './client';

export const COMPONENT_TYPE = 'product-singular-details';

runtime.registerComponent(ProductSingularDetails, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(1, 'Product description & accordions'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    descriptionLabel: TextInput({
      label: 'Description column label',
      defaultValue: 'Product description',
    }),
    descriptionHtml: TextArea({
      label: 'Description (HTML)',
      defaultValue: '',
      description: 'Leave empty to use default archive copy.',
    }),
    descriptionBody: Group({
      label: 'Description colors',
      preferredLayout: Group.Layout.Popover,
      props: {
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    accordions: List({
      label: 'Specification accordions',
      type: Group({
        label: 'Accordion',
        props: {
          title: TextInput({ label: 'Title', defaultValue: '' }),
          bodyHtml: TextArea({ label: 'Body (HTML)', defaultValue: '' }),
          defaultOpen: Checkbox({ label: 'Open by default', defaultValue: false }),
        },
      }),
      getItemLabel(item) {
        return item?.title?.trim() || 'Accordion';
      },
    }),
  },
});
