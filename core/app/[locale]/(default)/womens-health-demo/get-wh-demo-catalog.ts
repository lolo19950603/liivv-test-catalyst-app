import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

/** Shop Women's Health category (see create-clair-wristband / CREATE-CURATED-KIT). */
export const SHOP_WOMENS_HEALTH_CATEGORY_ID = 1152;

/** Seed curated kit — First Cycle Starter Kit. More kits will share kit_type=curated. */
export const FIRST_CYCLE_STARTER_KIT_ID = 8017;

const WhDemoCatalogQuery = graphql(
  `
    query WhDemoCatalog(
      $filters: SearchProductsFiltersInput!
      $first: Int
      $currencyCode: currencyCode
      $featuredIds: [Int!]!
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: FEATURED) {
            products(first: $first) {
              edges {
                node {
                  entityId
                  name
                  path
                  defaultImage {
                    altText
                    url: urlTemplate(lossy: true)
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
        featuredProducts: products(entityIds: $featuredIds) {
          edges {
            node {
              entityId
              name
              path
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
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

export type WhDemoCatalogItem = {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  isKit: boolean;
};

export type WhDemoCatalog = {
  kits: WhDemoCatalogItem[];
  products: WhDemoCatalogItem[];
  featuredKit: WhDemoCatalogItem | null;
};

function toItem(
  node: {
    entityId: number;
    name: string;
    path: string;
    defaultImage?: { altText: string; url: string } | null;
    customFields?: {
      edges?: Array<{ node: { name: string; value: string } } | null> | null;
    } | null;
    prices?: Parameters<typeof pricesTransformer>[0];
  },
  format: Awaited<ReturnType<typeof getFormatter>>,
): WhDemoCatalogItem {
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
    image: node.defaultImage
      ? {
          src: resolveBcCdnImageUrl(node.defaultImage.url, 640),
          alt: node.defaultImage.altText || node.name,
        }
      : undefined,
    priceLabel,
    isKit: isCuratedKitProduct(customFields),
  };
}

export const getWhDemoCatalog = cache(async (locale?: string): Promise<WhDemoCatalog> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);
  const format = await getFormatter();

  try {
    const response = await client.fetch({
      document: WhDemoCatalogQuery,
      customerAccessToken,
      channelId,
      variables: {
        currencyCode,
        first: 36,
        featuredIds: [FIRST_CYCLE_STARTER_KIT_ID],
        filters: {
          categoryEntityIds: [SHOP_WOMENS_HEALTH_CATEGORY_ID],
          searchSubCategories: true,
        },
      },
      fetchOptions: {
        ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const categoryNodes = removeEdgesAndNodes(response.data.site.search.searchProducts.products);
    const featuredNodes = removeEdgesAndNodes(response.data.site.featuredProducts);

    const byId = new Map<number, WhDemoCatalogItem>();

    for (const node of [...featuredNodes, ...categoryNodes]) {
      if (!byId.has(node.entityId)) {
        byId.set(node.entityId, toItem(node, format));
      }
    }

    const all = [...byId.values()];
    const kits = all.filter((item) => item.isKit);
    const products = all.filter((item) => !item.isKit);

    kits.sort((a, b) => {
      if (a.entityId === FIRST_CYCLE_STARTER_KIT_ID) return -1;
      if (b.entityId === FIRST_CYCLE_STARTER_KIT_ID) return 1;
      return a.name.localeCompare(b.name);
    });

    const featuredKit =
      kits.find((k) => k.entityId === FIRST_CYCLE_STARTER_KIT_ID) ?? kits[0] ?? null;

    return { kits, products, featuredKit };
  } catch {
    return { kits: [], products: [], featuredKit: null };
  }
});
