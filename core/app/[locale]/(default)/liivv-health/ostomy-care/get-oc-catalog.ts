import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

import {
  HERO_FLOAT_BARRIER_ID,
  HERO_FLOAT_POUCH_ID,
  NEW_JOURNEY_STARTER_KIT_ID,
  SHOP_OSTOMY_CARE_CATEGORY_ID,
} from './oc-ids';

export {
  HERO_FLOAT_BARRIER_ID,
  HERO_FLOAT_POUCH_ID,
  NEW_JOURNEY_STARTER_KIT_ID,
  SHOP_OSTOMY_CARE_CATEGORY_ID,
} from './oc-ids';

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;
const MAX_PAGES = 3;

const OcCatalogQuery = graphql(
  `
    query OcCatalog(
      $filters: SearchProductsFiltersInput!
      $first: Int
      $after: String
      $currencyCode: currencyCode
      $featuredIds: [Int!]!
      $includeFeatured: Boolean!
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: FEATURED) {
            products(first: $first, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  entityId
                  name
                  path
                  defaultImage {
                    altText
                    url: urlTemplate(lossy: true)
                  }
                  images(first: 3) {
                    edges {
                      node {
                        altText
                        url: urlTemplate(lossy: true)
                        isDefault
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
                  ...PricingFragment
                }
              }
            }
          }
        }
        featuredProducts: products(entityIds: $featuredIds) @include(if: $includeFeatured) {
          edges {
            node {
              entityId
              name
              path
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
              }
              images(first: 3) {
                edges {
                  node {
                    altText
                    url: urlTemplate(lossy: true)
                    isDefault
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
              ...PricingFragment
            }
          }
        }
      }
    }
  `,
  [PricingFragment],
);

export interface OcCatalogItem {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  isKit: boolean;
}

export interface OcCatalog {
  kits: OcCatalogItem[];
  products: OcCatalogItem[];
  featuredKit: OcCatalogItem | null;
}

function pickProductImage(node: {
  name: string;
  defaultImage?: { altText: string; url: string } | null;
  images?: {
    edges?: Array<{
      node: { altText: string; url: string; isDefault?: boolean } | null;
    } | null> | null;
  } | null;
}): { src: string; alt: string } | undefined {
  const gallery = removeEdgesAndNodes(node.images ?? { edges: [] }).filter((image) =>
    Boolean(image.url.trim()),
  );
  const preferred =
    (node.defaultImage?.url.trim() ? node.defaultImage : null) ??
    gallery.find((image) => image.isDefault) ??
    gallery[0] ??
    null;

  if (!preferred?.url.trim()) {
    return undefined;
  }

  return {
    src: resolveBcCdnImageUrl(preferred.url, 640),
    alt: preferred.altText || node.name,
  };
}

function toItem(
  node: {
    entityId: number;
    name: string;
    path: string;
    defaultImage?: { altText: string; url: string } | null;
    images?: {
      edges?: Array<{
        node: { altText: string; url: string; isDefault?: boolean } | null;
      } | null> | null;
    } | null;
    customFields?: {
      edges?: Array<{ node: { name: string; value: string } } | null> | null;
    } | null;
    prices?: Parameters<typeof pricesTransformer>[0];
  },
  format: Awaited<ReturnType<typeof getFormatter>>,
): OcCatalogItem {
  const customFields = removeEdgesAndNodes(node.customFields ?? { edges: [] });
  const price = pricesTransformer(node.prices ?? null, format);
  let priceLabel: string | undefined;

  if (typeof price === 'string') {
    priceLabel = price;
  } else if (price?.type === 'sale') {
    priceLabel = price.currentValue;
  } else if (price?.type === 'range') {
    priceLabel = `From ${price.minValue}`;
  }

  return {
    entityId: node.entityId,
    name: node.name,
    path: node.path,
    image: pickProductImage(node),
    priceLabel,
    isKit: isCuratedKitProduct(customFields),
  };
}

export const getOcCatalog = cache(async (locale?: string): Promise<OcCatalog> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);
  const format = await getFormatter();
  const fetchOptions = {
    ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
    ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
  };
  const filters = {
    categoryEntityIds: [SHOP_OSTOMY_CARE_CATEGORY_ID],
    searchSubCategories: true,
  };
  const featuredIds = [NEW_JOURNEY_STARTER_KIT_ID, HERO_FLOAT_POUCH_ID, HERO_FLOAT_BARRIER_ID];

  try {
    const byId = new Map<number, OcCatalogItem>();
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const response = await client.fetch({
        document: OcCatalogQuery,
        customerAccessToken,
        channelId,
        variables: {
          currencyCode,
          first: PAGE_SIZE,
          after,
          includeFeatured: page === 0,
          featuredIds,
          filters,
        },
        fetchOptions,
      });

      const productConnection = response.data.site.search.searchProducts.products;
      const categoryNodes = removeEdgesAndNodes(productConnection);
      const featuredNodes =
        page === 0 ? removeEdgesAndNodes(response.data.site.featuredProducts ?? { edges: [] }) : [];

      for (const node of [...featuredNodes, ...categoryNodes]) {
        const item = toItem(node, format);
        const existing = byId.get(node.entityId);

        if (!existing) {
          byId.set(node.entityId, item);
        } else if (!existing.image && item.image) {
          byId.set(node.entityId, { ...existing, image: item.image });
        }
      }

      if (!productConnection.pageInfo.hasNextPage || !productConnection.pageInfo.endCursor) {
        break;
      }

      after = productConnection.pageInfo.endCursor;
    }

    const all = [...byId.values()];
    const kits = all.filter((item) => item.isKit);
    const products = all.filter((item) => !item.isKit);

    kits.sort((a, b) => {
      if (a.entityId === NEW_JOURNEY_STARTER_KIT_ID) return -1;
      if (b.entityId === NEW_JOURNEY_STARTER_KIT_ID) return 1;

      return a.name.localeCompare(b.name);
    });

    const featuredKit =
      kits.find((k) => k.entityId === NEW_JOURNEY_STARTER_KIT_ID) ?? kits[0] ?? null;

    return { kits, products, featuredKit };
  } catch (error) {
    console.error('[getOcCatalog] failed', error);

    return { kits: [], products: [], featuredKit: null };
  }
});
