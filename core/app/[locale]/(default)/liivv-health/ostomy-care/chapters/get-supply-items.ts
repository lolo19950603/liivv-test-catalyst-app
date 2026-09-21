import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

/*
 * =============================================================================
 * SUPPLY LIST — WHAT LIIVV CAN ACTUALLY ADD (C02)
 * =============================================================================
 * The optional shop section of the supply list offers a one-click add only for
 * a product a reader does not have to make a choice about, and only while it
 * is in stock. That is a fact about the catalogue, so it is read from the
 * catalogue rather than written down beside the list and left to go stale.
 *
 * Deliberately narrow. No price, no image, no brand and no description is
 * selected, because none of them may appear inside the list: what comes back
 * is a name, a path, and two yes/no answers.
 *
 * Only ids on SUPPLY_CART_ALLOWLIST are ever asked for, and an empty list asks
 * for nothing. Every failure resolves to an empty array — the list is a
 * shopping tool, and nothing a reader needs depends on this answer.
 *
 * get-oc-catalog.ts is the landing page's fetch and is left alone.
 * =============================================================================
 */

const SupplyItemsQuery = graphql(`
  query SupplyItems($entityIds: [Int!], $first: Int) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            name
            path
            productOptions(first: 2) {
              edges {
                node {
                  entityId
                }
              }
            }
            variants(first: 2) {
              edges {
                node {
                  entityId
                }
              }
            }
            inventory {
              isInStock
            }
            availabilityV2 {
              status
            }
          }
        }
      }
    }
  }
`);

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;

export interface SupplyItem {
  entityId: number;
  name: string;
  path: string;
  /** Nothing to choose on the product page, so a single click can add it. */
  optionFree: boolean;
  /** In stock and orderable today. */
  inStock: boolean;
}

export const getSupplyItems = cache(
  async (ids: number[], locale?: string): Promise<SupplyItem[]> => {
    if (!ids.length) return [];

    try {
      const customerAccessToken = await getSessionCustomerAccessToken();
      const { data } = await client.fetch({
        document: SupplyItemsQuery,
        customerAccessToken,
        channelId: getChannelIdFromLocale(locale),
        variables: { entityIds: ids, first: Math.min(ids.length, PAGE_SIZE) },
        // Revalidating cache for guests, no store for a signed-in customer,
        // exactly as getOcCatalog does.
        fetchOptions: customerAccessToken
          ? { cache: 'no-store' as const }
          : { next: { revalidate } },
      });

      return removeEdgesAndNodes(data.site.products).map((node) => ({
        entityId: node.entityId,
        name: node.name,
        path: node.path,
        optionFree:
          removeEdgesAndNodes(node.productOptions).length === 0 &&
          removeEdgesAndNodes(node.variants).length <= 1,
        inStock: node.inventory.isInStock && node.availabilityV2.status !== 'Unavailable',
      }));
    } catch {
      // Offline, unauthorised or a schema change: the optional shop section
      // simply has nothing to offer, and the list itself is unaffected.
      return [];
    }
  },
);
