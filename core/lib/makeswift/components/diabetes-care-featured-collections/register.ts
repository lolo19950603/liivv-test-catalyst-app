import { Combobox, Group, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { searchProducts } from '../../utils/search-products';

import { DiabetesCareFeaturedCollections } from './client';

export const COMPONENT_TYPE = 'diabetes-care-featured-collections';

runtime.registerComponent(DiabetesCareFeaturedCollections, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 9. Featured collections',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
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
          tabLabel: TextInput({ label: 'Tab label', defaultValue: 'The Basics' }),
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
      getItemLabel(item) {
        const t = item?.tabLabel;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Tab';
      },
    }),
  },
});
