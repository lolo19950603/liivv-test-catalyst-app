import { Combobox, Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

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

import { searchProducts } from '../../utils/search-products';

import { DEFAULT_FEATURED_COLLECTION_TABS, DiabetesCareFeaturedCollections } from './client';

export const COMPONENT_TYPE = 'diabetes-care-featured-collections';

runtime.registerComponent(DiabetesCareFeaturedCollections, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(8, 'Featured collections'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
    eyebrow: Group({
      label: 'Eyebrow',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text (small line above heading)',
          defaultValue: 'Your routine is personal',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    ...headingPopoverControls({
      label: 'Heading',
      textDefault: 'What Works, Every Day',
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextArea({
          label: 'Intro copy (below heading)',
          defaultValue:
            'Whether you’re just starting out or refining what you use, the right essentials can make everything feel easier.',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    collections: List({
      label: 'Tabs (each tab = one product row)',
      type: Group({
        label: 'Collection tab',
        props: {
          tabLabel: TextInput({ label: 'Tab label', defaultValue: '' }),
          products: List({
            label: 'Products',
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
      }),
      defaultValue: DEFAULT_FEATURED_COLLECTION_TABS,
      getItemLabel(item) {
        const t = item?.tabLabel?.trim();

        return t != null && t.length > 0 ? t : 'Collection tab';
      },
    }),
  },
});
