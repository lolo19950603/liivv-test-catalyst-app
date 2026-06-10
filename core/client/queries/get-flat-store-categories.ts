import { cache } from 'react';

import { getStoreCategoryCatalog, type StoreCategoryRecord } from './get-store-category-catalog';

export type StoreCategoryOption = {
  entityId: number;
  name: string;
  path: string;
  breadcrumb: string;
};

function toStoreCategoryOption(category: StoreCategoryRecord): StoreCategoryOption {
  return {
    entityId: category.entityId,
    name: category.name,
    path: category.path,
    breadcrumb: category.breadcrumb,
  };
}

async function getFlatStoreCategoriesUncached(locale?: string): Promise<StoreCategoryOption[]> {
  const categories = await getStoreCategoryCatalog(locale);

  return categories
    .map(toStoreCategoryOption)
    .sort((a, b) => a.breadcrumb.localeCompare(b.breadcrumb));
}

export const getFlatStoreCategories = cache(getFlatStoreCategoriesUncached);
