import {
  Checkbox,
  Combobox,
  Group,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchCategories } from '../../utils/search-categories';

import { CategoryProductsList } from './client';

export const COMPONENT_TYPE = 'catalyst-category-products-list';

runtime.registerComponent(CategoryProductsList, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Category products',
  icon: 'gallery',
  props: {
    className: Style(),
    categories: List({
      label: 'Categories',
      type: Group({
        label: 'Category',
        props: {
          entityId: Combobox({
            label: 'Category',
            getOptions: async (query) => searchCategories(query),
          }),
          tabLabel: TextInput({
            label: 'Tab label',
            defaultValue: '',
            description: 'Optional. Used in Tabs mode.',
          }),
        },
      }),
      getItemLabel(item) {
        const id = item?.entityId;

        if (id != null && String(id).trim().length > 0) {
          return `Category #${String(id).trim()}`;
        }

        return 'Category';
      },
    }),
    heading: Group({
      label: 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Override',
          defaultValue: '',
          description: 'Leave blank to use the category name.',
        }),
        show: Checkbox({ label: 'Show heading', defaultValue: true }),
        showCount: Checkbox({ label: 'Show count', defaultValue: true }),
      },
    }),
    catalog: Group({
      label: 'Products',
      preferredLayout: Group.Layout.Popover,
      props: {
        displayMode: Select({
          label: 'Mode',
          options: [
            { value: 'combined', label: 'Combined' },
            { value: 'tabs', label: 'Tabs' },
          ],
          defaultValue: 'combined',
        }),
        limit: Number({ label: 'Max items', defaultValue: 12 }),
        sort: Select({
          label: 'Sort',
          options: [
            { value: 'FEATURED', label: 'Featured' },
            { value: 'NEWEST', label: 'Newest' },
            { value: 'BEST_SELLING', label: 'Best selling' },
            { value: 'A_TO_Z', label: 'A to Z' },
            { value: 'Z_TO_A', label: 'Z to A' },
            { value: 'LOWEST_PRICE', label: 'Lowest price' },
            { value: 'HIGHEST_PRICE', label: 'Highest price' },
            { value: 'BEST_REVIEWED', label: 'Best reviewed' },
            { value: 'RELEVANCE', label: 'Relevance' },
          ],
          defaultValue: 'FEATURED',
        }),
        searchSubCategories: Checkbox({
          label: 'Include subcategories',
          defaultValue: true,
        }),
      },
    }),
    display: Group({
      label: 'Cards',
      preferredLayout: Group.Layout.Popover,
      props: {
        aspectRatio: Select({
          label: 'Aspect ratio',
          options: [
            { value: '1:1', label: 'Square' },
            { value: '5:6', label: '5:6' },
            { value: '3:4', label: '3:4' },
          ],
          defaultValue: '5:6',
        }),
        colorScheme: Select({
          label: 'Text scheme',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ],
          defaultValue: 'light',
        }),
      },
    }),
    emptyState: Group({
      label: 'Empty state',
      preferredLayout: Group.Layout.Popover,
      props: {
        title: TextInput({
          label: 'Title',
          defaultValue: 'No products found',
        }),
        subtitle: TextInput({
          label: 'Subtitle',
          defaultValue: 'Try selecting a different category.',
        }),
      },
    }),
  },
});
