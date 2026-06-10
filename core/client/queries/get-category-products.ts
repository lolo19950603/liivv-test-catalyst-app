import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { MakeswiftProductFragment } from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

const SortSchema = z.enum([
  'A_TO_Z',
  'BEST_REVIEWED',
  'BEST_SELLING',
  'FEATURED',
  'HIGHEST_PRICE',
  'LOWEST_PRICE',
  'NEWEST',
  'RELEVANCE',
  'Z_TO_A',
]);

const GetCategoryProductsQuery = graphql(
  `
    query GetCategoryProducts(
      $filters: SearchProductsFiltersInput!
      $first: Int
      $sort: SearchProductsSortInput
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: $sort) {
            products(first: $first) {
              collectionInfo {
                totalItems
              }
              edges {
                node {
                  ...MakeswiftProductFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [MakeswiftProductFragment],
);

export type CategoryProductsSort = z.infer<typeof SortSchema>;

export const getCategoryProducts = cache(
  async ({
    categoryEntityIds,
    limit = 12,
    sort = 'FEATURED',
    searchSubCategories = true,
    locale,
  }: {
    categoryEntityIds: number[];
    limit?: number;
    sort?: CategoryProductsSort;
    searchSubCategories?: boolean;
    locale?: string;
  }) => {
    if (categoryEntityIds.length === 0) {
      return { status: 'success' as const, products: [], totalItems: 0 };
    }

    const parsedSort = SortSchema.safeParse(sort);
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const channelId = getChannelIdFromLocale(locale);

    try {
      const response = await client.fetch({
        document: GetCategoryProductsQuery,
        customerAccessToken,
        channelId,
        variables: {
          currencyCode,
          first: limit,
          sort: parsedSort.success ? parsedSort.data : 'FEATURED',
          filters: {
            categoryEntityIds,
            searchSubCategories,
          },
        },
        fetchOptions: {
          ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
          ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
        },
      });

      const searchProducts = response.data.site.search.searchProducts;

      return {
        status: 'success' as const,
        products: removeEdgesAndNodes(searchProducts.products),
        totalItems: searchProducts.products.collectionInfo?.totalItems ?? 0,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { status: 'error' as const, error: error.message };
      }

      return { status: 'error' as const, error: 'Something went wrong. Please try again.' };
    }
  },
);
