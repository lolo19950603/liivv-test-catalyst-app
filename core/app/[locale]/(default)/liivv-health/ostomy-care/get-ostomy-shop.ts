import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { Product } from '@/vibes/soul/primitives/product-card';
import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { FragmentOf, graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import { singleProductCardTransformer } from '~/data-transformers/product-card-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';

import { isListedOstomyKit, SHOP_OSTOMY_CARE_CATEGORY_ID } from './oc-ids';
import { type OpeningSize, openingSize, roomForProductName, type ShopRoom } from './shop-classify';
import { type ShopSort, shopSortQuery } from './shop-filters';

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;
const MAX_PAGES = 4;

const OstomyShopQuery = graphql(
  `
    query OstomyShopCatalog(
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

type ShopNode = FragmentOf<typeof ProductCardFragment> & {
  customFields: {
    edges: Array<{ node: { name: string; value: string } } | null> | null;
  };
};

export interface OstomyShopProduct {
  node: ShopNode;
  card: Product;
  room: ShopRoom;
  isKit: boolean;
  brand: string | null;
  size: OpeningSize | null;
}

export interface OstomyShopCatalog {
  ok: boolean;
  products: OstomyShopProduct[];
}

export const getOstomyShopCatalog = cache(
  async (
    locale: string,
    sort: ShopSort,
    outOfStockMessage?: string,
    showBackorderMessage?: boolean,
  ): Promise<OstomyShopCatalog> => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const channelId = getChannelIdFromLocale(locale);
    const format = await getFormatter();
    const fetchOptions = {
      ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
      ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
    };

    try {
      const byId = new Map<number, OstomyShopProduct>();

      const loadPage = async (after: string | null, remaining: number): Promise<void> => {
        if (remaining <= 0) {
          return;
        }

        const response = await client.fetch({
          document: OstomyShopQuery,
          customerAccessToken,
          channelId,
          variables: {
            currencyCode,
            first: PAGE_SIZE,
            after,
            sort: shopSortQuery(sort),
            filters: {
              categoryEntityId: SHOP_OSTOMY_CARE_CATEGORY_ID,
            },
          },
          fetchOptions,
        });

        const connection = response.data.site.search.searchProducts.products;

        removeEdgesAndNodes(connection).forEach((node) => {
          if (byId.has(node.entityId)) {
            return;
          }

          const customFields = removeEdgesAndNodes(node.customFields);
          const isKit = isCuratedKitProduct(customFields);

          if (isKit && !isListedOstomyKit(node.entityId)) {
            return;
          }

          byId.set(node.entityId, {
            name: node.name,
            node,
            card: singleProductCardTransformer(
              node,
              format,
              outOfStockMessage,
              showBackorderMessage,
            ),
            room: roomForProductName(node.name),
            isKit,
            brand: node.brand ? node.brand.name.trim() || null : null,
            size: openingSize(node.name),
          });
        });

        if (connection.pageInfo.hasNextPage && connection.pageInfo.endCursor) {
          await loadPage(connection.pageInfo.endCursor, remaining - 1);
        }
      };

      await loadPage(null, MAX_PAGES);

      return { ok: true, products: [...byId.values()] };
    } catch (error) {
      // Same failure log as getOcCatalog: a shelf outage should be visible in the server log.
      // eslint-disable-next-line no-console
      console.error('[getOstomyShopCatalog] failed', error);

      return { ok: false, products: [] };
    }
  },
);
