import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { z } from 'zod';

import { DEFAULT_FACETED_PAGE_SIZE } from '@/vibes/soul/sections/products-list-section/constants';

import { client } from '~/client';
import { defaultPageInfo } from '~/data-transformers/page-info-transformer';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';
import { CurrencyCode } from '~/components/header/fragment';
import { ProductCardFragment } from '~/components/product-card/fragment';

const GetProductSearchResultsQuery = graphql(
  `
    query GetProductSearchResultsQuery(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $filters: SearchProductsFiltersInput!
      $sort: SearchProductsSortInput
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: $sort) {
            products(first: $first, after: $after, last: $last, before: $before) {
              pageInfo {
                ...PaginationFragment
              }
              collectionInfo {
                totalItems
              }
              edges {
                node {
                  ...ProductCardFragment
                }
              }
            }
            filters {
              edges {
                node {
                  __typename
                  displayName
                  isCollapsedByDefault
                  ... on BrandSearchFilter {
                    displayProductCount
                    displayName
                    brands {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          entityId
                          name
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on CategorySearchFilter {
                    displayProductCount
                    displayName
                    categories {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          entityId
                          name
                          isSelected
                          productCount
                          subCategories {
                            pageInfo {
                              ...PaginationFragment
                            }
                            edges {
                              cursor
                              node {
                                entityId
                                name
                                isSelected
                                productCount
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  ... on ProductAttributeSearchFilter {
                    displayProductCount
                    filterName
                    filterKey
                    displayName
                    attributes {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          value
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on RatingSearchFilter {
                    displayName
                    ratings {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          value
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on PriceSearchFilter {
                    displayName
                    selected {
                      minPrice
                      maxPrice
                    }
                  }
                  ... on OtherSearchFilter {
                    displayProductCount
                    freeShipping {
                      isSelected
                      productCount
                    }
                    isFeatured {
                      isSelected
                      productCount
                    }
                    isInStock {
                      isSelected
                      productCount
                    }
                  }
                }
              }
            }
          }
        }
        settings {
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
        }
      }
    }
  `,
  [PaginationFragment, ProductCardFragment],
);

type Variables = VariablesOf<typeof GetProductSearchResultsQuery>;
type SearchProductsSortInput = Variables['sort'];
type SearchProductsFiltersInput = Variables['filters'];

const SEARCH_CHUNK_SIZE = 50;

interface ProductSearch {
  limit?: number | null;
  page?: number | null;
  before?: string | null;
  after?: string | null;
  sort?: SearchProductsSortInput | null;
  filters: SearchProductsFiltersInput;
}

const getProductSearchResults = cache(
  async (
    { limit = DEFAULT_FACETED_PAGE_SIZE, page, after, before, sort, filters }: ProductSearch,
    currencyCode?: CurrencyCode,
    customerAccessToken?: string,
  ) => {
    const filterArgs = { filters, sort };
    const resolvedLimit = limit ?? DEFAULT_FACETED_PAGE_SIZE;
    const resolvedPage = Math.max(1, Math.floor(page ?? 1));

    const fetchSearchChunk = async (paginationArgs: {
      first?: number;
      last?: number;
      after?: string | null;
      before?: string | null;
    }) => {
      const response = await client.fetch({
        document: GetProductSearchResultsQuery,
        variables: { ...filterArgs, ...paginationArgs, currencyCode },
        customerAccessToken,
        fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate: 300 } },
      });

      const searchResults = response.data.site.search.searchProducts;

      return {
        facets: {
          items: removeEdgesAndNodes(searchResults.filters).map((node) => {
            switch (node.__typename) {
              case 'BrandSearchFilter':
                return {
                  ...node,
                  brands: removeEdgesAndNodes(node.brands),
                };

              case 'CategorySearchFilter':
                return {
                  ...node,
                  categories: removeEdgesAndNodes(node.categories),
                };

              case 'ProductAttributeSearchFilter':
                return {
                  ...node,
                  attributes: removeEdgesAndNodes(node.attributes),
                };

              case 'RatingSearchFilter':
                return {
                  ...node,
                  ratings: removeEdgesAndNodes(node.ratings),
                };

              default:
                return node;
            }
          }),
        },
        items: removeEdgesAndNodes(searchResults.products).map((product) => ({
          ...product,
        })),
        collectionInfo: searchResults.products.collectionInfo,
        pageInfo: searchResults.products.pageInfo,
      };
    };

    if (after || before) {
      const paginationArgs = before
        ? { last: resolvedLimit, before }
        : { first: resolvedLimit, after };

      const chunk = await fetchSearchChunk(paginationArgs);

      return {
        facets: chunk.facets,
        products: {
          collectionInfo: chunk.collectionInfo,
          pageInfo: chunk.pageInfo,
          items: chunk.items,
        },
      };
    }

    const targetStart = (resolvedPage - 1) * resolvedLimit;
    const targetEnd = targetStart + resolvedLimit;
    let collectedItems: Awaited<ReturnType<typeof fetchSearchChunk>>['items'] = [];
    let afterCursor: string | undefined;
    let facets: Awaited<ReturnType<typeof fetchSearchChunk>>['facets'] | null = null;
    let collectionInfo: Awaited<ReturnType<typeof fetchSearchChunk>>['collectionInfo'] | null =
      null;
    let pageInfo: Awaited<ReturnType<typeof fetchSearchChunk>>['pageInfo'] = defaultPageInfo;

    while (collectedItems.length < targetEnd) {
      const remaining = targetEnd - collectedItems.length;
      const first = Math.min(SEARCH_CHUNK_SIZE, remaining);
      const chunk = await fetchSearchChunk({ first, after: afterCursor });

      if (!facets) {
        facets = chunk.facets;
      }

      collectionInfo = chunk.collectionInfo;
      pageInfo = chunk.pageInfo;
      collectedItems = collectedItems.concat(chunk.items);

      if (!chunk.pageInfo.hasNextPage || chunk.items.length === 0) {
        break;
      }

      afterCursor = chunk.pageInfo.endCursor ?? undefined;
    }

    const items = collectedItems.slice(targetStart, targetEnd);

    return {
      facets: facets ?? { items: [] },
      products: {
        collectionInfo,
        pageInfo: pageInfo ?? {
          hasNextPage: false,
          hasPreviousPage: resolvedPage > 1,
          startCursor: null,
          endCursor: null,
        },
        items,
      },
    };
  },
);

const SearchParamSchema = z.union([z.string(), z.array(z.string()), z.undefined()]);

const SearchParamToArray = SearchParamSchema.transform((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value !== '') {
    return [value];
  }

  return undefined;
});

const PrivateSortParam = z.union([
  z.literal('A_TO_Z'),
  z.literal('BEST_REVIEWED'),
  z.literal('BEST_SELLING'),
  z.literal('FEATURED'),
  z.literal('HIGHEST_PRICE'),
  z.literal('LOWEST_PRICE'),
  z.literal('NEWEST'),
  z.literal('RELEVANCE'),
  z.literal('Z_TO_A'),
]) satisfies z.ZodType<SearchProductsSortInput>;

const PublicSortParam = z.string().toUpperCase().pipe(PrivateSortParam);

const SearchProductsFiltersInputSchema = z.object({
  brandEntityIds: z.array(z.number()).nullish(),
  categoryEntityId: z.number().nullish(),
  categoryEntityIds: z.array(z.number()).nullish(),
  hideOutOfStock: z.boolean().nullish(),
  isFeatured: z.boolean().nullish(),
  isFreeShipping: z.boolean().nullish(),
  price: z
    .object({
      maxPrice: z.number().nullish(),
      minPrice: z.number().nullish(),
    })
    .nullish(),
  productAttributes: z
    .array(
      z.object({
        attribute: z.string(),
        values: z.array(z.string()),
      }),
    )
    .nullish(),
  rating: z
    .object({
      maxRating: z.number().nullish(),
      minRating: z.number().nullish(),
    })
    .nullish(),
  searchSubCategories: z.boolean().nullish(),
  searchTerm: z.string().nullish(),
}) satisfies z.ZodType<SearchProductsFiltersInput>;

const PrivateSearchParamsSchema = z.object({
  after: z.string().nullish(),
  before: z.string().nullish(),
  limit: z.number().nullish(),
  page: z.number().nullish(),
  sort: PrivateSortParam.nullish(),
  filters: SearchProductsFiltersInputSchema,
});

export const PublicSearchParamsSchema = z.object({
  after: z.string().nullish(),
  before: z.string().nullish(),
  brand: SearchParamToArray.nullish().transform((value) => value?.map(Number)),
  category: z.coerce.number().optional(),
  categoryIn: SearchParamToArray.nullish().transform((value) => value?.map(Number)),
  isFeatured: z.coerce.boolean().nullish(),
  limit: z.coerce.number().nullish(),
  minPrice: z.coerce.number().nullish(),
  maxPrice: z.coerce.number().nullish(),
  minRating: z.coerce.number().nullish(),
  maxRating: z.coerce.number().nullish(),
  sort: PublicSortParam.nullish(),
  // In the future we should support more stock filters, e.g. out of stock, low stock, etc.
  stock: SearchParamToArray.nullish().transform((value) =>
    value?.filter((stock) => z.enum(['in_stock']).safeParse(stock).success),
  ),
  // In the future we should support more shipping filters, e.g. 2 day shipping, same day, etc.
  shipping: SearchParamToArray.nullish().transform((value) =>
    value?.filter((stock) => z.enum(['free_shipping']).safeParse(stock).success),
  ),
  term: z.string().nullish(),
  page: z.coerce.number().nullish(),
});

const AttributeKey = z.custom<`attr_${string}`>((val) => {
  return typeof val === 'string' ? /^attr_.+$/.test(val) : false;
});

export const PublicToPrivateParams = PublicSearchParamsSchema.catchall(SearchParamToArray.nullish())
  .transform((publicParams) => {
    const { after, before, limit, page, sort, ...filters } = publicParams;

    const {
      brand,
      category,
      categoryIn,
      isFeatured,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      term,
      shipping,
      stock,
      // There is a bug in Next.js that is adding the path params to the searchParams. We need to filter out the slug params for now.
      // https://github.com/vercel/next.js/issues/51802
      slug,
      ...additionalParams
    } = filters;

    // Assuming the rest of the params are product attributes for now. We need to see if we can get the GQL endpoint to ingore unknown params.
    const productAttributes = Object.entries(additionalParams)
      .filter(([attribute]) => AttributeKey.safeParse(attribute).success)
      .filter(([, values]) => values != null)
      .map(([attribute, values]) => ({
        attribute: attribute.replace('attr_', ''),
        values,
      }));

    return {
      after,
      before,
      limit,
      page,
      sort,
      filters: {
        brandEntityIds: brand,
        categoryEntityId: category,
        categoryEntityIds: categoryIn,
        hideOutOfStock: stock?.includes('in_stock'),
        isFreeShipping: shipping?.includes('free_shipping'),
        isFeatured,
        price:
          minPrice || maxPrice
            ? {
                maxPrice,
                minPrice,
              }
            : undefined,
        productAttributes,
        rating:
          minRating || maxRating
            ? {
                maxRating,
                minRating,
              }
            : undefined,
        searchTerm: term,
      },
    };
  })
  .pipe(PrivateSearchParamsSchema);

export const fetchFacetedSearch = cache(
  // We need to make sure the reference passed into this function is the same if we want it to be memoized.
  async (
    params: z.input<typeof PublicSearchParamsSchema>,
    currencyCode?: CurrencyCode,
    customerAccessToken?: string,
  ) => {
    const { after, before, limit = DEFAULT_FACETED_PAGE_SIZE, page, sort, filters } =
      PublicToPrivateParams.parse(params);

    return getProductSearchResults(
      {
        after,
        before,
        limit,
        page,
        sort,
        filters,
      },
      currencyCode,
      customerAccessToken,
    );
  },
);
