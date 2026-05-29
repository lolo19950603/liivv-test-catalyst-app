import { Checkbox, Group, Image, List, Number, Style, TextInput } from '@makeswift/runtime/controls';

import {
  roundedTopControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { productSingularPageComponentLabel } from '~/lib/makeswift/product-singular-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { ProductSingularMainProduct } from './client';

export const COMPONENT_TYPE = 'product-singular-main-product';

const galleryImageGroup = Group({
  label: 'Gallery image',
  props: {
    image: Image({ label: 'Image' }),
    altText: TextInput({ label: 'Alt text', defaultValue: '' }),
  },
});

runtime.registerComponent(ProductSingularMainProduct, {
  type: COMPONENT_TYPE,
  label: productSingularPageComponentLabel(0, 'Main product'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
    }),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    galleryImages: List({
      label: 'Gallery images',
      type: galleryImageGroup,
      getItemLabel(item) {
        return item?.altText?.trim() || 'Image';
      },
    }),
    vendor: TextInput({ label: 'Vendor', defaultValue: 'Fisher & Paykel' }),
    vendorUrl: TextInput({ label: 'Vendor link', defaultValue: '/collections/vendors' }),
    title: TextInput({
      label: 'Product title',
      defaultValue: 'Fisher & Paykel Nova Nasal CPAP Mask - FitPack COMING SOON',
    }),
    sku: TextInput({ label: 'SKU', defaultValue: 'NVN1SMLA' }),
    price: TextInput({ label: 'Price label', defaultValue: '$170.00' }),
    showInventory: Checkbox({ label: 'Show inventory', defaultValue: true }),
    inventoryMessage: TextInput({
      label: 'Inventory message',
      defaultValue: 'Hurry, only 8 items left in stock!',
    }),
    inventoryPercent: Number({
      label: 'Inventory bar fill',
      defaultValue: 53,
      suffix: '%',
    }),
    addToCartLabel: TextInput({ label: 'Add to cart label', defaultValue: 'Add to cart' }),
    showShare: Checkbox({ label: 'Show share row', defaultValue: true }),
  },
});
