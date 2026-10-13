import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import {
  blocksInsulinForQuebec,
  isQuebecProvince,
} from '~/app/[locale]/(default)/liivv-health/diabetes-care/dc-ids';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { pharmacistProducts } from '~/lib/catalog/view-only';

export { InsulinToQuebecError } from './checkout-gates';
export {
  pharmacistProductIds,
  pharmacistProducts,
  type PharmacistContents,
  withViewOnlyProducts as withPharmacistProductsViewOnly,
  withViewOnlyWishlistItems as withPharmacistWishlistItemsViewOnly,
} from '~/lib/catalog/view-only';

/*
 * =============================================================================
 * INSULIN CAN'T BE ORDERED ONLINE FOR DELIVERY IN QUEBEC
 * =============================================================================
 * Owner answers of 2026-10-06 (A1, B3, B11): Liivv serves Quebec, but insulin
 * can't be bought online for a Quebec address. A pharmacist can still arrange
 * it with the customer by phone. The rule itself (what counts as insulin, what
 * counts as Quebec) is in diabetes-care/dc-ids.ts; this file answers it for a
 * cart, whose lines carry no categories.
 *
 * Checked twice, from the same rule: the checkout page shows the message and
 * keeps the pay button off, and buildCheckoutSnapshot() refuses to build the
 * snapshot every payment and order is made from, so no path around the page
 * can pay for it.
 *
 * Only the shipping address counts: the rule is about delivery. Subscription
 * renewals (lib/bigcommerce/subscription-order.ts) are not checked here.
 * =============================================================================
 */

const InsulinCheckCategoriesQuery = graphql(`
  query InsulinCheckCategories($entityIds: [Int!], $first: Int) {
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

/*
 * Whether this cart may not be paid for online: insulin, shipped to Quebec.
 * Asks the catalogue nothing unless the address is in Quebec. A product the
 * catalogue does not answer for is judged on its id alone. A failed lookup
 * throws: for a Quebec address, the rule is not waived because it could not
 * be checked.
 */
export async function shipsInsulinToQuebec({
  stateOrProvince,
  productEntityIds,
}: {
  stateOrProvince: string | null | undefined;
  productEntityIds: readonly number[];
}): Promise<boolean> {
  if (!isQuebecProvince(stateOrProvince)) {
    return false;
  }

  const ids = [...new Set(productEntityIds)].filter((id) => Number.isInteger(id));

  if (ids.length === 0) {
    return false;
  }

  const customerAccessToken = await getSessionCustomerAccessToken();
  const pages: number[][] = [];

  for (let i = 0; i < ids.length; i += PAGE_SIZE) {
    pages.push(ids.slice(i, i + PAGE_SIZE));
  }

  const nodes = (
    await Promise.all(
      pages.map(async (entityIds) => {
        const { data } = await client.fetch({
          document: InsulinCheckCategoriesQuery,
          customerAccessToken,
          variables: { entityIds, first: entityIds.length },
          fetchOptions: { cache: 'no-store' },
        });

        return removeEdgesAndNodes(data.site.products);
      }),
    )
  ).flat();

  const categoriesById = new Map(
    nodes.map((node) => [
      node.entityId,
      removeEdgesAndNodes(node.categories).map((category) => category.entityId),
    ]),
  );

  return blocksInsulinForQuebec({
    stateOrProvince,
    products: ids.map((entityId) => ({
      entityId,
      categoryIds: categoriesById.get(entityId) ?? [],
    })),
  });
}

/*
 * Insulin and glucagon, and which products a pharmacist reviews, are answered
 * by the shared view-only rule (~/lib/catalog/view-only.ts), which also covers
 * prescription devices; the names are re-exported above so every existing
 * caller keeps working. `withPharmacistProductsViewOnly` and
 * `withPharmacistWishlistItemsViewOnly` are that rule's listing helpers, so a
 * listing that still imports them shows prescription devices as "View
 * product" too.
 */

/*
 * The French storefront never lists insulin (owner answer B11, 2026-10-06:
 * "Insulin cant be advertised to Quebec"), wherever a list of products is
 * drawn from the catalogue: a category page (Shop Diabetes Care, which the
 * Diabetes header menu links), search results and a product page's "You may
 * also like" (full-site review, 2026-10-06). English pages are unchanged.
 * Whether a French insulin product page may be opened at all is the owner's
 * question (OPEN-QUESTIONS B38). The list keeps its order; the result count
 * and the page numbers above it still count what was left off. A curated kit
 * holding insulin counts as insulin here too (`pharmacistProducts`); no kit
 * holds any today.
 *
 * It fails closed: if the catalogue cannot say which products are insulin,
 * the French list is left empty rather than risk listing insulin.
 */
export async function withoutInsulinOnFrench<T extends { entityId: number }>(
  items: readonly T[],
  locale: string,
): Promise<T[]> {
  if (locale !== 'fr' || items.length === 0) {
    return [...items];
  }

  const found = await pharmacistProducts(items.map((item) => item.entityId));

  return items.filter((item) => !found.get(item.entityId)?.insulin);
}
