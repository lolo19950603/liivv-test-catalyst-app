import {
  Combobox,
  Group,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { searchProducts } from '~/lib/makeswift/utils/search-products';

import { ProductSingularRecommendations } from './client';

export const COMPONENT_TYPE = 'product-singular-recommendations';

runtime.registerComponent(ProductSingularRecommendations, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(2, 'Product recommendations'),
  icon: 'carousel',
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
      textDefault: 'You may also like',
    }),
    collection: Select({
      label: 'Product collection',
      options: [
        { value: 'none', label: 'None (additional products only)' },
        { value: 'best-selling', label: 'Best selling' },
        { value: 'newest', label: 'Newest' },
        { value: 'featured', label: 'Featured' },
      ],
      defaultValue: 'best-selling',
    }),
    limit: Number({ label: 'Max collection items', defaultValue: 6 }),
    additionalProducts: List({
      label: 'Additional products',
      type: Group({
        label: 'Product',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Product title' }),
          entityId: Combobox({
            label: 'Product',
            async getOptions(query) {
              const products = await searchProducts(query);

              return products.map((product) => ({
                id: product.entityId.toString(),
                label: product.name,
                value: product.entityId.toString(),
              }));
            },
          }),
        },
      }),
      getItemLabel(product) {
        return product?.title || 'Product';
      },
    }),
  },
});
