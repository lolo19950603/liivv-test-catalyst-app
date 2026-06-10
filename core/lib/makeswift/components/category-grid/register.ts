import { Combobox, Group, List, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchCategories } from '../../utils/search-categories';
import { comboboxEntityIdFromMakeswift } from '../../utils/combobox-entity-id';

import { CategoryGrid } from './client';

export const COMPONENT_TYPE = 'catalyst-category-grid';

runtime.registerComponent(CategoryGrid, {
  type: COMPONENT_TYPE,
  label: 'Catalog / Category grid',
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
          label: TextInput({
            label: 'Label override',
            defaultValue: '',
            description: 'Optional. Leave blank to use the category name.',
          }),
        },
      }),
      getItemLabel(item) {
        const id = comboboxEntityIdFromMakeswift(item?.entityId);

        if (id.length > 0) {
          return `Category #${id}`;
        }

        return 'Category';
      },
    }),
    columns: Select({
      label: 'Columns',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
      defaultValue: '4',
    }),
    aspectRatio: Select({
      label: 'Image aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '4:5', label: '4:5' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '1:1',
    }),
  },
});
