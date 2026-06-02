import { Checkbox, Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { ProductSingularDetails } from './client';

export const COMPONENT_TYPE = 'product-singular-details';

runtime.registerComponent(ProductSingularDetails, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(1, 'Product accordions'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    accordions: List({
      label: 'Accordions',
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
