/* Twin of ostomy-care/get-ostomy-shop.ts @f7f9ef0b — port fixes both ways until Phase 2 */

import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { Product } from '@/vibes/soul/primitives/product-card';
import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { FragmentOf, graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { singleProductCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';

import { type ShopSort, shopSortQuery } from '../ostomy-care/shop-filters';

import { namesAnotherRetailer } from './chapters/chapter-shop';
import {
  isDiabetesKit,
  isInsulinProduct,
  isListedDiabetesKit,
  SHOP_DIABETES_CARE_CATEGORY_ID,
} from './dc-ids';
import {
  brandForProduct,
  isPharmacistProduct,
  needleForProduct,
  type ShelfFacts,
  typeForProduct,
  worksWithProduct,
} from './shop-classify';

/*
 * =============================================================================
 * THE WHOLE OF SHOP DIABETES CARE, FILED FOR THE SHELF
 * =============================================================================
 * Ostomy's shop loader for category 1151, reading every page of it: there is
 * no cap below the category's size (241 visible products on 2026-10-07, and
 * Ostomy's 200 cap would have dropped 41). The shelf filters, counts and pages
 * in memory, so every count is exact.
 *
 * What is left out before anything is counted:
 *   - on /fr, every insulin (`isInsulinProduct`): insulin may not be
 *     advertised to Quebec (owner answer B11), so the French shelf's counts
 *     and pages are of what it shows;
 *   - a curated kit not on DIABETES_LISTED_KIT_IDS (all twelve are, since the
 *     owner verified them on 2026-10-07);
 *   - a product whose description names or links another retailer
 *     (`namesAnotherRetailer`, ./chapters/chapter-shop.ts). None does since
 *     the store fixes of 2026-10-07; the check stays as a safety net, and a
 *     product comes back by itself once its description is clean.
 *
 * Insulin and glucagon are shown (English only for insulin) as a link to
 * their product page, never a one-click add, so the pharmacist notice under
 * the buy box is always seen (`viewOnly`).
 * =============================================================================
 */

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;
/* A runaway guard, far above the category's size; reaching it is logged. */
const MAX_PAGES = 20;

const DiabetesShopQuery = graphql(
  `
    query DiabetesShopCatalog(
      $filters: SearchProductsFiltersInput!
      $first: Int
      $after: String
      $sort: SearchProductsSortInput
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: $sort) {
            products(first: $first, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  ...ProductCardFragment
                  description
                  categories(first: 25) {
                    edges {
                      node {
                        entityId
                      }
                    }
                  }
                  options: productOptions(first: 10) {
                    edges {
                      node {
                        entityId
                        displayName
                        ... on MultipleChoiceOption {
                          values(first: 20) {
                            edges {
                              node {
                                label
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  customFields {
                    edges {
                      node {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

const DiabetesEnglishNamesQuery = graphql(`
  query DiabetesEnglishNames($filters: SearchProductsFiltersInput!, $first: Int, $after: String) {
    site {
      search {
        searchProducts(filters: $filters) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                entityId
                name
              }
            }
          }
        }
      }
    }
  }
`);

/*
 * Every Shop Diabetes Care product's English name, by id. The filing rules
 * read English names (./shop-classify.ts), and the French storefront returns
 * French ones ("Bandes de test One Touch Verio"), so a French page files each
 * product by its English name and shows the French. Fails to an empty map:
 * a product is then filed by the name it has.
 */
export const getDiabetesEnglishNames = cache(async (): Promise<ReadonlyMap<number, string>> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const names = new Map<number, string>();
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      // Sequential on purpose: each page's cursor comes from the one before.
      // eslint-disable-next-line no-await-in-loop
      const response: { data: ResultOf<typeof DiabetesEnglishNamesQuery> } = await client.fetch({
        document: DiabetesEnglishNamesQuery,
        customerAccessToken,
        channelId: getChannelIdFromLocale('en'),
        variables: {
          first: PAGE_SIZE,
          after,
          filters: { categoryEntityId: SHOP_DIABETES_CARE_CATEGORY_ID },
        },
        fetchOptions: {
          headers: { 'Accept-Language': 'en' },
          ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
        },
      });
      const connection = response.data.site.search.searchProducts.products;

      removeEdgesAndNodes(connection).forEach((node) => names.set(node.entityId, node.name));

      if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) break;

      after = connection.pageInfo.endCursor;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getDiabetesEnglishNames] failed', error);
  }

  return names;
});

type ShopNode = FragmentOf<typeof ProductCardFragment>;

export interface DiabetesShopProduct extends ShelfFacts {
  node: ShopNode;
  card: Product;
  entityId: number;
  /* Insulin or glucagon: shown as a link to its page, never a one-click add. */
  viewOnly: boolean;
}

export interface DiabetesShopCatalog {
  ok: boolean;
  products: DiabetesShopProduct[];
}

export const getDiabetesShopCatalog = cache(
  async (
    locale: string,
    sort: ShopSort,
    outOfStockMessage?: string,
    showBackorderMessage?: boolean,
  ): Promise<DiabetesShopCatalog> => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const channelId = getChannelIdFromLocale(locale);
    const format = await getFormatter();
    const englishNames = locale === 'en' ? null : await getDiabetesEnglishNames();
    const fetchOptions = {
      ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
      ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
    };

    try {
      const byId = new Map<number, DiabetesShopProduct>();
      let after: string | null = null;

      for (let page = 0; page < MAX_PAGES; page += 1) {
        // Sequential on purpose: each page's cursor comes from the one before.
        // eslint-disable-next-line no-await-in-loop
        const response: { data: ResultOf<typeof DiabetesShopQuery> } = await client.fetch({
          document: DiabetesShopQuery,
          customerAccessToken,
          channelId,
          variables: {
            currencyCode,
            first: PAGE_SIZE,
            after,
            sort: shopSortQuery(sort),
            filters: { categoryEntityId: SHOP_DIABETES_CARE_CATEGORY_ID },
          },
          fetchOptions,
        });

        const connection = response.data.site.search.searchProducts.products;

        removeEdgesAndNodes(connection).forEach((node) => {
          if (byId.has(node.entityId)) return;

          const categoryIds = removeEdgesAndNodes(node.categories).map((c) => c.entityId);
          const facts = { entityId: node.entityId, categoryIds };

          if (locale === 'fr' && isInsulinProduct(facts)) return;

          if (namesAnotherRetailer(node.description)) return;

          const isKit =
            isCuratedKitProduct(removeEdgesAndNodes(node.customFields)) ||
            isDiabetesKit(node.entityId);

          if (isKit && !isListedDiabetesKit(node.entityId)) return;

          const optionText = removeEdgesAndNodes(node.options).flatMap((option) =>
            'values' in option
              ? removeEdgesAndNodes(option.values).map(
                  (value) => `${option.displayName} ${value.label}`,
                )
              : [],
          );
          const productFacts = {
            ...facts,
            name: englishNames?.get(node.entityId) ?? node.name,
            bcBrand: node.brand?.name ?? null,
            isKit,
            optionText,
          };
          const type = typeForProduct(productFacts);
          const brand = brandForProduct(productFacts);
          const card = singleProductCardTransformer(
            node,
            format,
            outOfStockMessage,
            showBackorderMessage,
          );

          byId.set(node.entityId, {
            entityId: node.entityId,
            name: node.name,
            ...(englishNames?.has(node.entityId)
              ? { searchName: englishNames.get(node.entityId) }
              : {}),
            node,
            // The card's small line names the shopping brand, not the store's raw record.
            card: { ...card, subtitle: brand?.label },
            type,
            brand,
            works: worksWithProduct(productFacts),
            needle: needleForProduct(productFacts, type),
            inStock: node.inventory.isInStock,
            viewOnly: isPharmacistProduct(facts),
          });
        });

        if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) break;

        if (page === MAX_PAGES - 1) {
          // eslint-disable-next-line no-console
          console.warn('[getDiabetesShopCatalog] stopped at the page guard; the shelf is partial');
        }

        after = connection.pageInfo.endCursor;
      }

      return { ok: true, products: [...byId.values()] };
    } catch (error) {
      // Same failure log as Ostomy's shop: a shelf outage should be visible in the server log.
      // eslint-disable-next-line no-console
      console.error('[getDiabetesShopCatalog] failed', error);

      return { ok: false, products: [] };
    }
  },
);
