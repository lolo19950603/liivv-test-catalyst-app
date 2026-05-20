import {
  Combobox,
  Group,
  Image,
  List,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { searchProducts } from '../../utils/search-products';

import { DiabetesCareFloatingProductBundle } from './client';

export const COMPONENT_TYPE = 'diabetes-care-floating-product-bundle';

runtime.registerComponent(DiabetesCareFloatingProductBundle, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 11. Floating product bundle',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    banner: Group({
      label: 'Banner',
      preferredLayout: Group.Layout.Popover,
      props: {
        imageSrc: Image({ label: 'Desktop banner image (large screens)' }),
        imageAlt: TextInput({
          label: 'Banner image alt',
          defaultValue: '',
        }),
      },
    }),
    ...headingPopoverControls({
      label: 'Promo heading',
      textDefault: '🌱 Start Strong Kit',
      textColorDefault: '0 0% 100%',
      includeHighlightSwash: true,
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Promo body (HTML)',
          defaultValue:
            '<p>Everything you need to feel set up, comfortable, and ready for your day.</p>',
        }),
      },
    }),
    products: List({
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
    buttons: Group({
      label: 'Buttons',
      preferredLayout: Group.Layout.Popover,
      props: {
        addToCartLabel: TextInput({
          label: 'Add to cart button label',
          defaultValue: 'Add to cart',
        }),
      },
    }),
    ...bodyTextPopoverControls('0 0% 100%'),
  },
});
