import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import {
  blocksInsulinForQuebec,
  isGlucagonProduct,
  isInsulinProduct,
  isQuebecProvince,
} from '~/app/[locale]/(default)/liivv-health/diabetes-care/dc-ids';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

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

/*
 * The message the snapshot throws with. The page shows its own, translated
 * (`DiabetesCare.ui.commerce.quebecInsulinCheckout`); this English copy says
 * the same, naming Liivv as the service (owner note 5, 2026-10-07).
 */
export class InsulinToQuebecError extends Error {
  constructor() {
    super(
      'Insulin can’t be ordered online for delivery in Quebec. Remove it to continue, or call Liivv at 1-844-561-1254 and a pharmacist will help.',
    );
    this.name = 'InsulinToQuebecError';
  }
}

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
 * Which of these products are insulin or glucagon, from the catalogue's
 * categories. Fails closed: if the catalogue cannot answer, every id counts.
 */
export async function pharmacistProductIds(entityIds: readonly number[]): Promise<Set<number>> {
  const ids = [...new Set(entityIds)].filter((id) => Number.isInteger(id));

  if (ids.length === 0) {
    return new Set();
  }

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const pages: number[][] = [];

    for (let i = 0; i < ids.length; i += PAGE_SIZE) {
      pages.push(ids.slice(i, i + PAGE_SIZE));
    }

    const nodes = (
      await Promise.all(
        pages.map(async (page) => {
          const { data } = await client.fetch({
            document: InsulinCheckCategoriesQuery,
            customerAccessToken,
            variables: { entityIds: page, first: page.length },
            fetchOptions: customerAccessToken
              ? { cache: 'no-store' as const }
              : { next: { revalidate } },
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

    return new Set(
      ids.filter(
        (entityId) =>
          isInsulinProduct({ entityId, categoryIds: categoriesById.get(entityId) ?? [] }) ||
          isGlucagonProduct(entityId),
      ),
    );
  } catch {
    return new Set(ids);
  }
}

/*
 * Insulin and glucagon are never added to the cart from a listing (owner note
 * 9, 2026-10-07): a pharmacist reviews every order, and the notice that says
 * so is under the product page's buy box. Every listing that offers a
 * one-click add — a category grid, search, a brand page, compare — passes its
 * cards through this, and an insulin or glucagon card links its product page
 * instead ("View product", `DiabetesCare.ui.commerce.viewProduct`). Other
 * cards come back unchanged. Fails closed, as `pharmacistProductIds` does.
 */
export async function withPharmacistProductsViewOnly<T extends { id: string }>(
  cards: readonly T[],
): Promise<Array<T & { viewOnlyLabel?: string }>> {
  if (cards.length === 0) {
    return [];
  }

  const viewOnly = await pharmacistProductIds(cards.map((card) => Number(card.id)));

  if (viewOnly.size === 0) {
    return [...cards];
  }

  const t = await getTranslations('DiabetesCare.ui.commerce');
  const viewOnlyLabel = t('viewProduct');

  return cards.map((card) => (viewOnly.has(Number(card.id)) ? { ...card, viewOnlyLabel } : card));
}

/*
 * The same for a wishlist's items (the account wishlist and a shared one):
 * an insulin or glucagon item's card links its product page instead of
 * offering "Add to cart". The wishlist's add action refuses them as well.
 */
export async function withPharmacistWishlistItemsViewOnly<T extends { product: { id: string } }>(
  items: readonly T[],
): Promise<Array<T & { product: T['product'] & { viewOnlyLabel?: string } }>> {
  const products = await withPharmacistProductsViewOnly(items.map((item) => item.product));

  return items.map((item, index) => ({ ...item, product: products[index] ?? item.product }));
}

/*
 * The French storefront never lists insulin (owner answer B11, 2026-10-06:
 * "Insulin cant be advertised to Quebec"), wherever a list of products is
 * drawn from the catalogue: a category page (Shop Diabetes Care, which the
 * Diabetes header menu links), search results and a product page's "You may
 * also like" (full-site review, 2026-10-06). English pages are unchanged.
 * Whether a French insulin product page may be opened at all is the owner's
 * question (OPEN-QUESTIONS B38). The list keeps its order; the result count
 * and the page numbers above it still count what was left off.
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

  const ids = [...new Set(items.map((item) => item.entityId))];

  try {
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
            fetchOptions: customerAccessToken
              ? { cache: 'no-store' as const }
              : { next: { revalidate } },
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

    return items.filter(
      (item) =>
        !isInsulinProduct({
          entityId: item.entityId,
          categoryIds: categoriesById.get(item.entityId) ?? [],
        }),
    );
  } catch {
    return [];
  }
}
