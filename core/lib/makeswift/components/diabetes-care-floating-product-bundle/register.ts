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
  buttonColorFields,
  fontSizeFields,
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_SECONDARY_ON_BANNER } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import { comboboxEntityIdFromMakeswift } from '~/lib/makeswift/utils/combobox-entity-id';

import { searchProducts } from '../../utils/search-products';

import { DiabetesCareFloatingProductBundle } from './client';

export const COMPONENT_TYPE = 'diabetes-care-floating-product-bundle';

runtime.registerComponent(DiabetesCareFloatingProductBundle, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(10, 'Floating product bundle'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
    imageSrc: Image({ label: 'Background image' }),
    ...headingPopoverControls({
      label: 'Promo heading',
      textDefault: '🌱 Start Strong Kit',
      textColorDefault: '0 0% 100%',
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Promo body (HTML)',
          defaultValue:
            '<p>Everything you need to feel set up, comfortable, and ready for your day.</p>',
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
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
        const id = comboboxEntityIdFromMakeswift(item?.entityId);

        return id.length > 0 ? `Product #${id}` : 'Product';
      },
    }),
    buttons: Group({
      label: 'Buttons',
      preferredLayout: Group.Layout.Popover,
      props: {
        addToCartLabel: TextInput({
          label: 'Add to cart button label',
          defaultValue: 'Add kit to cart',
        }),
        ...buttonColorFields(ARCHIVE_BUTTON_SECONDARY_ON_BANNER),
      },
    }),
  },
});
