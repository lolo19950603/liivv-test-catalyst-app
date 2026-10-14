import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, ResultOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { rxMaskKindOf } from '~/lib/catalog/cpap-masks';
import { prescriptionDeviceKindOf } from '~/lib/catalog/prescription-devices';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

import { namesAnotherRetailer } from './chapters/chapter-shop';
import { MAGNET_NOTICE_MASK_IDS, PAEDIATRIC_MASK_IDS, SLEEP_SHELF_CATEGORY_IDS } from './sa-ids';
import type { SaLandingItem } from './sa-landing-types';
import { isShelfable, roomForSleepProduct } from './sa-shop-classify';

/*
 * =============================================================================
 * SLEEP APNEA CARE — THE LANDING'S SHELF
 * =============================================================================
 * Read-only Storefront GraphQL: the products in the store's CPAP mask, parts
 * and cleaning categories (SLEEP_SHELF_CATEGORY_IDS, never the machine
 * category), filtered by the shelf rules (./sa-shop-classify.ts):
 *   - no machine and no bundle holding one, so no ASV (N1);
 *   - no children's mask (C17), no ozone or UV cleaner, no compliance-report
 *     service, nothing discontinued;
 *   - nothing whose description names, links or phones another retailer.
 * A complete mask is marked `rxMask` (C26: its tile links the product page,
 * where the prescription check is; never an add button). A mask a Health
 * Canada notice names is marked `magnetNotice` (N7).
 *
 * The storefront returns no hidden product, so a product hidden in the store
 * never reaches here. Every failure resolves to an empty shelf: the shelf is
 * a shopping aid, and nothing a reader needs depends on it.
 * =============================================================================
 */

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;
/* A runaway guard far above the categories' size; reaching it is logged. */
const MAX_PAGES = 10;

const SaCatalogQuery = graphql(
  `
    query SaCatalog(
      $filters: SearchProductsFiltersInput!
      $first: Int
      $after: String
      $currencyCode: currencyCode
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
                  ...PricingFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [PricingFragment],
);

interface SaNode {
  entityId: number;
  name: string;
  path: string;
  description?: string;
  categories?: { edges?: Array<{ node: { entityId: number } } | null> | null } | null;
  defaultImage?: { altText: string; url: string } | null;
  prices?: Parameters<typeof pricesTransformer>[0];
}

function priceLabelOf(
  prices: Parameters<typeof pricesTransformer>[0],
  format: Awaited<ReturnType<typeof getFormatter>>,
) {
  const price = pricesTransformer(prices ?? null, format);

  if (typeof price === 'string') return price;
  if (price?.type === 'sale') return price.currentValue;

  /* A range ("from") is left to the product page: the landing words no "from" line. */
  return undefined;
}

/* One shelf item, or nothing where the shelf rules leave it off. */
function toItem(node: SaNode, format: Awaited<ReturnType<typeof getFormatter>>): SaLandingItem[] {
  const categoryIds = removeEdgesAndNodes(node.categories ?? { edges: [] }).map(
    (category) => category.entityId,
  );
  const check = { entityId: node.entityId, name: node.name, categoryIds };
  const candidate = {
    ...check,
    deviceKind: prescriptionDeviceKindOf(check),
    rxMaskKind: rxMaskKindOf(check),
  };

  if (!isShelfable(candidate, PAEDIATRIC_MASK_IDS) || namesAnotherRetailer(node.description)) {
    return [];
  }

  const room = roomForSleepProduct(candidate);
  const image = node.defaultImage?.url.trim()
    ? {
        src: resolveBcCdnImageUrl(node.defaultImage.url, 640),
        alt: node.defaultImage.altText || node.name,
      }
    : undefined;
  const priceLabel = priceLabelOf(node.prices ?? null, format);

  return [
    {
      entityId: node.entityId,
      name: node.name,
      path: node.path,
      isKit: false,
      ...(image ? { image } : {}),
      ...(priceLabel ? { priceLabel } : {}),
      ...(room ? { room } : {}),
      ...(candidate.rxMaskKind === 'adult' ? { rxMask: true as const } : {}),
      ...(node.entityId in MAGNET_NOTICE_MASK_IDS ? { magnetNotice: true as const } : {}),
    },
  ];
}

export const getSaCatalog = cache(async (locale?: string): Promise<SaLandingItem[]> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  const channelId = getChannelIdFromLocale(locale);
  const format = await getFormatter();
  const fetchOptions = {
    ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
    ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
  };
  const filters = {
    categoryEntityIds: [...SLEEP_SHELF_CATEGORY_IDS],
    searchSubCategories: false,
  };

  try {
    const byId = new Map<number, SaLandingItem>();
    let after: string | null = null;

    for (let page = 0; page < MAX_PAGES; page += 1) {
      /* Sequential on purpose: each page needs the cursor the one before it returned. */
      // eslint-disable-next-line no-await-in-loop
      const response: { data: ResultOf<typeof SaCatalogQuery> } = await client.fetch({
        document: SaCatalogQuery,
        customerAccessToken,
        channelId,
        variables: { currencyCode, first: PAGE_SIZE, after, filters },
        fetchOptions,
      });
      const connection = response.data.site.search.searchProducts.products;

      removeEdgesAndNodes(connection)
        .flatMap((node) => toItem(node, format))
        .forEach((item) => {
          if (!byId.has(item.entityId)) byId.set(item.entityId, item);
        });

      if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) break;

      if (page === MAX_PAGES - 1) {
        // eslint-disable-next-line no-console
        console.warn('[getSaCatalog] stopped at the page guard; the landing shelf is partial');
      }

      after = connection.pageInfo.endCursor;
    }

    return [...byId.values()];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[getSaCatalog] failed', error);

    return [];
  }
});
