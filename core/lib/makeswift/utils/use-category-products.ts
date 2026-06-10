import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import {
  BcProductSchema,
  Product,
  useBcProductToVibesProduct,
} from './use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

const CategoryProductsResponseSchema = z.object({
  status: z.literal('success'),
  products: z.array(BcProductSchema),
  totalItems: z.number(),
});

type CategoryProductsSort =
  | 'A_TO_Z'
  | 'BEST_REVIEWED'
  | 'BEST_SELLING'
  | 'FEATURED'
  | 'HIGHEST_PRICE'
  | 'LOWEST_PRICE'
  | 'NEWEST'
  | 'RELEVANCE'
  | 'Z_TO_A';

interface UseCategoryProductsProps {
  categoryEntityIds: string[];
  limit: number;
  sort: CategoryProductsSort;
  searchSubCategories: boolean;
}

export function useCategoryProducts({
  categoryEntityIds,
  limit,
  sort,
  searchSubCategories,
}: UseCategoryProductsProps): {
  products: Product[] | null;
  totalItems: number;
  isLoading: boolean;
  error: Error | undefined;
} {
  const bcProductToVibesProduct = useBcProductToVibesProduct();
  const locale = useLocale();

  const ids = useMemo(
    () =>
      categoryEntityIds
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .sort()
        .join(','),
    [categoryEntityIds],
  );

  const url =
    ids.length > 0
      ? `/api/categories/products?ids=${encodeURIComponent(ids)}&limit=${limit}&sort=${sort}&searchSubCategories=${searchSubCategories ? 'true' : 'false'}&locale=${locale}`
      : null;

  const { data, error, isLoading } = useSWR(url, async (fetchUrl: string) => {
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`Category products request failed: ${String(response.status)}`);
    }

    const json: unknown = await response.json();

    return CategoryProductsResponseSchema.parse(json);
  });

  const products = useMemo(
    () => (data == null ? null : data.products.map(bcProductToVibesProduct)),
    [data, bcProductToVibesProduct],
  );

  return {
    products,
    totalItems: data?.totalItems ?? 0,
    isLoading,
    error,
  };
}
