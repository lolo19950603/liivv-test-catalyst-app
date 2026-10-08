import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter, getTranslations } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

import { namesAnotherRetailer } from './chapters/chapter-shop';
import {
  DAY_ONE_STARTER_KIT_ID,
  FEATURED_CGM_ID,
  FEATURED_METER_ID,
  isDiabetesKit,
  isGlucagonProduct,
  isInsulinProduct,
  SHOP_DIABETES_CARE_CATEGORY_ID,
} from './dc-ids';
import { getDiabetesEnglishNames } from './get-diabetes-shop';
import { roomForProduct, type ShopRoom } from './shop-classify';

export {
  DAY_ONE_STARTER_KIT_ID,
  FEATURED_CGM_ID,
  FEATURED_METER_ID,
  SHOP_DIABETES_CARE_CATEGORY_ID,
} from './dc-ids';

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;
/*
 * A runaway guard, far above the category's size (241 visible products on
 * 2026-10-07). It was 3 pages until then, so the landing's rooms saw only the
 * first 150 products (owner note 10); reaching the guard is logged.
 */
const MAX_PAGES = 20;

const DcCatalogQuery = graphql(
  `
    query DcCatalog(
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
                  description
                  categories(first: 25) {
                    edges {
                      node {
                        entityId
                      }
                    }
                  }
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
              description
              categories(first: 25) {
                edges {
                  node {
                    entityId
                  }
                }
              }
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

export type DcCatalogItem = {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
  isKit: boolean;
  /* The landing room its type puts it in (./shop-classify.ts, one scheme with the shop). */
  room: ShopRoom;
  /* Insulin (`isInsulinProduct`) or glucagon (`isGlucagonProduct`): never on /fr, and noticed. */
  isInsulin: boolean;
  isGlucagon: boolean;
  /*
   * Its full HTML description names, links or phones another retailer
   * (`namesAnotherRetailer`, ./chapters/chapter-shop.ts), so the landing
   * never links it until the description is fixed in the store (B3).
   */
  refused?: true;
};

export type DcCatalog = {
  kits: DcCatalogItem[];
  products: DcCatalogItem[];
  featuredKit: DcCatalogItem | null;
};

function pickProductImage(
  node: {
    name: string;
    defaultImage?: { altText: string; url: string } | null;
    images?: {
      edges?: Array<{
        node: { altText: string; url: string; isDefault?: boolean } | null;
      } | null> | null;
    } | null;
  },
): { src: string; alt: string } | undefined {
  const gallery = removeEdgesAndNodes(node.images ?? { edges: [] }).filter((image) =>
    Boolean(image.url?.trim()),
  );
  const preferred =
    (node.defaultImage?.url?.trim() ? node.defaultImage : null) ??
    gallery.find((image) => image.isDefault) ??
    gallery[0] ??
    null;

  if (!preferred?.url?.trim()) {
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
    description?: string;
    categories?: {
      edges?: Array<{ node: { entityId: number } } | null> | null;
    } | null;
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
  /* "From $84.99" in the page language (`ui.landingPage.shop.fromPrice`). */
  fromPrice: (price: string) => string,
  /* Its English name, on a French page: the filing rules read English names. */
  englishName?: string,
): DcCatalogItem {
  const customFields = removeEdgesAndNodes(node.customFields ?? { edges: [] });
  const price = pricesTransformer(node.prices ?? null, format);
  let priceLabel: string | undefined;

  if (typeof price === 'string') {
    priceLabel = price;
  } else if (price?.type === 'sale') {
    priceLabel = price.currentValue;
  } else if (price?.type === 'range') {
    priceLabel = fromPrice(price.minValue);
  }

  const categoryIds = removeEdgesAndNodes(node.categories ?? { edges: [] }).map(
    (category) => category.entityId,
  );
  const isKit = isCuratedKitProduct(customFields) || isDiabetesKit(node.entityId);

  return {
    entityId: node.entityId,
    name: node.name,
    path: node.path,
    image: pickProductImage(node),
    priceLabel,
    isKit,
    room: roomForProduct({
      entityId: node.entityId,
      name: englishName ?? node.name,
      categoryIds,
      isKit,
    }),
    isInsulin: isInsulinProduct({ entityId: node.entityId, categoryIds }),
    isGlucagon: isGlucagonProduct(node.entityId),
    ...(namesAnotherRetailer(node.description) ? { refused: true as const } : {}),
  };
}

export const getDcCatalog = cache(async (locale?: string): Promise<DcCatalog> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);
  const format = await getFormatter();
  const shopT = await getTranslations('DiabetesCare.ui.landingPage.shop');
  const fromPrice = (price: string) => shopT('fromPrice', { price });
  const englishNames = locale && locale !== 'en' ? await getDiabetesEnglishNames() : null;
  const fetchOptions = {
    ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
    ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
  };
  const filters = {
    categoryEntityIds: [SHOP_DIABETES_CARE_CATEGORY_ID],
    searchSubCategories: true,
  };
  const featuredIds = [DAY_ONE_STARTER_KIT_ID, FEATURED_CGM_ID, FEATURED_METER_ID];

  try {
    const byId = new Map<number, DcCatalogItem>();
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const response: { data: ResultOf<typeof DcCatalogQuery> } = await client.fetch({
        document: DcCatalogQuery,
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
        const item = toItem(node, format, fromPrice, englishNames?.get(node.entityId));
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

      if (page === MAX_PAGES - 1) {
        // eslint-disable-next-line no-console
        console.warn('[getDcCatalog] stopped at the page guard; the landing shelf is partial');
      }

      after = productConnection.pageInfo.endCursor;
    }

    const all = [...byId.values()];
    const kits = all.filter((item) => item.isKit);
    const products = all.filter((item) => !item.isKit);

    kits.sort((a, b) => {
      if (a.entityId === DAY_ONE_STARTER_KIT_ID) return -1;
      if (b.entityId === DAY_ONE_STARTER_KIT_ID) return 1;
      return a.name.localeCompare(b.name);
    });

    const featuredKit =
      kits.find((k) => k.entityId === DAY_ONE_STARTER_KIT_ID) ?? kits[0] ?? null;

    return { kits, products, featuredKit };
  } catch (error) {
    console.error('[getDcCatalog] failed', error);
    return { kits: [], products: [], featuredKit: null };
  }
});
