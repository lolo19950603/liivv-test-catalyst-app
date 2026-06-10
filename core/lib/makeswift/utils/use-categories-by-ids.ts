import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

const CategoryImageSchema = z
  .object({
    src: z.string(),
    alt: z.string(),
  })
  .nullable();

const StoreCategorySchema = z.object({
  entityId: z.number(),
  name: z.string(),
  path: z.string(),
  breadcrumb: z.string(),
  image: CategoryImageSchema,
});

const CategoriesByIdsResponseSchema = z.object({
  status: z.literal('success'),
  categories: z.array(StoreCategorySchema),
});

export type StoreCategory = z.infer<typeof StoreCategorySchema>;

export function useCategoriesByIds(entityIds: string[]): {
  categories: StoreCategory[] | null;
  isLoading: boolean;
  error: Error | undefined;
} {
  const locale = useLocale();

  const ids = useMemo(
    () =>
      entityIds
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .join(','),
    [entityIds],
  );

  const url =
    ids.length > 0
      ? `/api/categories/by-ids?ids=${encodeURIComponent(ids)}&locale=${locale}`
      : null;

  const { data, error, isLoading } = useSWR(url, async (fetchUrl: string) => {
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(`Categories request failed: ${String(response.status)}`);
    }

    const json: unknown = await response.json();

    return CategoriesByIdsResponseSchema.parse(json);
  });

  return {
    categories: data?.categories ?? null,
    isLoading,
    error,
  };
}
