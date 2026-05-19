import {
  Combobox,
  Group,
  Image,
  List,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { searchProducts } from '../../utils/search-products';

import { DiabetesCareFloatingProductBundle } from './client';

export const COMPONENT_TYPE = 'diabetes-care-floating-product-bundle';

runtime.registerComponent(DiabetesCareFloatingProductBundle, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 11. Floating product bundle',
  icon: 'layout',
  props: {
    className: Style(),
    bannerImageSrc: Image({ label: 'Desktop banner image (large screens)' }),
    bannerImageAlt: TextInput({
      label: 'Banner image alt',
      defaultValue: '',
    }),
    promoTitle: TextInput({
      label: 'Promo heading',
      defaultValue: '🌱 Start Strong Kit',
    }),
    promoBodyHtml: TextArea({
      label: 'Promo body (HTML)',
      defaultValue:
        '<p>Everything you need to feel set up, comfortable, and ready for your day.</p>',
    }),
    addToCartLabel: TextInput({
      label: 'Add to cart button label',
      defaultValue: 'Add to cart',
    }),
    bundleProducts: List({
      label: 'Bundle products',
      type: Group({
        label: 'Product',
        props: {
          entityId: Combobox({
            label: 'Product',
            async getOptions(query) {
              const products = await searchProducts(query);

              return products.map((product: { entityId: number; name: string }) => ({
                id: product.entityId.toString(),
                label: product.name,
                value: product.entityId.toString(),
              }));
            },
          }),
        },
      }),
      getItemLabel(item) {
        const id = item?.entityId;

        return id != null && String(id).trim().length > 0
          ? `Product #${String(id).trim()}`
          : 'Product';
      },
    }),
  },
});
