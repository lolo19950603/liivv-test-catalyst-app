import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { isSensitiveProduct, isSensitiveProductId } from './sensitive-products';

/*
 * =============================================================================
 * WHICH OF THESE PRODUCTS ARE HEALTH-REVEALING (server lookup)
 * =============================================================================
 * A cart line item carries no categories, and neither do the wishlist and
 * compare payloads. So the pages that emit ecommerce events ask the catalogue
 * once, by id, and get back the subset that may not be named.
 *
 * Deliberately narrow: the query selects entity ids and nothing else. No name,
 * no price, no image — this answer is a set of numbers.
 *
 * It never throws: a page must not break because an analytics question could
 * not be answered. It fails closed instead — if the lookup fails, every id
 * asked about is treated as sensitive, so the events are suppressed rather
 * than sent with names that were never checked. The cost of a catalogue
 * outage is missing measurement, which is the cheaper of the two mistakes.
 * =============================================================================
 */

const SensitiveProductCategoriesQuery = graphql(`
  query SensitiveProductCategories($entityIds: [Int!], $first: Int) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            categories(first: 25) {
              edges {
                node {
                  entityId
                }
              }
            }
          }
        }
      }
    }
  }
`);

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;

function chunk(ids: number[]): number[][] {
  const out: number[][] = [];

  for (let i = 0; i < ids.length; i += PAGE_SIZE) {
    out.push(ids.slice(i, i + PAGE_SIZE));
  }

  return out;
}

/*
 * Keyed on a string rather than the array, so React's request cache actually
 * dedupes: a cart page asks once for the analytics payload and once for the
 * view_cart event, and both get the same fetch.
 */
const fetchSensitiveIds = cache(async (key: string): Promise<ReadonlySet<number>> => {
  const ids = key === '' ? [] : key.split(',').map(Number);
  const sensitive = new Set(ids.filter((id) => isSensitiveProductId(id)));

  if (ids.length === 0) {
    return sensitive;
  }

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();

    const pages = await Promise.all(
      chunk(ids).map(async (entityIds) => {
        const { data } = await client.fetch({
          document: SensitiveProductCategoriesQuery,
          customerAccessToken,
          variables: { entityIds, first: entityIds.length },
          // Revalidating cache for guests, no store for a signed-in customer,
          // the same split getOcCatalog and getSupplyItems use.
          fetchOptions: customerAccessToken
            ? { cache: 'no-store' as const }
            : { next: { revalidate } },
        });

        return removeEdgesAndNodes(data.site.products);
      }),
    );

    const nodes = pages.flat();

    nodes.forEach((node) => {
      const categoryIds = removeEdgesAndNodes(node.categories).map((c) => c.entityId);

      if (isSensitiveProduct({ entityId: node.entityId, categoryIds })) {
        sensitive.add(node.entityId);
      }
    });

    // An id the catalogue did not answer for — hidden from this channel or
    // this customer, or gone — was not checked, so it is not named either.
    const checked = new Set(nodes.map((node) => node.entityId));

    ids.filter((id) => !checked.has(id)).forEach((id) => sensitive.add(id));
  } catch {
    // Offline, unauthorised or a schema change: nothing here was checked, so
    // treat the whole request as sensitive rather than let unchecked names go
    // out. Measurement stops; nothing a reader depends on is affected.
    return new Set(ids);
  }

  return sensitive;
});

/* The subset of these product ids that an analytics event may not name. */
export function getSensitiveProductIds(entityIds: readonly number[]): Promise<ReadonlySet<number>> {
  const unique = [...new Set(entityIds)].filter((id) => Number.isInteger(id)).sort((a, b) => a - b);

  return fetchSensitiveIds(unique.join(','));
}
