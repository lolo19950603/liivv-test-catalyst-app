import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import {
  blocksInsulinForQuebec,
  isQuebecProvince,
  pharmacistContentsOf,
} from '~/app/[locale]/(default)/liivv-health/diabetes-care/dc-ids';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';

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
 * A product's categories and custom fields: enough to say whether it is
 * insulin or glucagon, and whether it is a curated kit (`kit_type`).
 */
const PharmacistFactsQuery = graphql(`
  query PharmacistFacts($entityIds: [Int!], $first: Int) {
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
            customFields(first: 25) {
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
`);

/* A curated kit's contents: its related products, as the kit's product page reads them. */
const KitContentsQuery = graphql(`
  query PharmacistKitContents($entityIds: [Int!], $first: Int) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            relatedProducts(first: 50) {
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

/* Runs one catalogue lookup per page of ids, PAGE_SIZE at a time. */
async function inPages<R>(
  ids: readonly number[],
  fetchPage: (page: number[]) => Promise<R[]>,
): Promise<R[]> {
  const pages: number[][] = [];

  for (let i = 0; i < ids.length; i += PAGE_SIZE) {
    pages.push(ids.slice(i, i + PAGE_SIZE));
  }

  return (await Promise.all(pages.map(fetchPage))).flat();
}

export interface PharmacistContents {
  insulin: boolean;
  glucagon: boolean;
}

/*
 * Which of these products a pharmacist reviews and dispenses, and why: each
 * one that is insulin or glucagon, or a curated kit whose contents include
 * either (`pharmacistContentsOf`, dc-ids.ts), mapped to what it is or holds.
 * Products that are neither are left out of the map.
 *
 * A kit's contents are read from the catalogue each time (its related
 * products, which is how a curated kit stores what it holds; core/lib/kit),
 * never from a list of kit ids, so a kit that gains or loses Baqsimi or an
 * insulin is judged on what it holds today.
 *
 * Fails closed: if the catalogue cannot answer, every id counts as both.
 */
export async function pharmacistProducts(
  entityIds: readonly number[],
): Promise<Map<number, PharmacistContents>> {
  const ids = [...new Set(entityIds)].filter((id) => Number.isInteger(id));

  if (ids.length === 0) {
    return new Map();
  }

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const fetchOptions = customerAccessToken
      ? { cache: 'no-store' as const }
      : { next: { revalidate } };
    const factsFor = async (page: number[]) => {
      const { data } = await client.fetch({
        document: PharmacistFactsQuery,
        customerAccessToken,
        variables: { entityIds: page, first: page.length },
        fetchOptions,
      });

      return removeEdgesAndNodes(data.site.products);
    };
    const contentsFor = async (page: number[]) => {
      const { data } = await client.fetch({
        document: KitContentsQuery,
        customerAccessToken,
        variables: { entityIds: page, first: page.length },
        fetchOptions,
      });

      return removeEdgesAndNodes(data.site.products);
    };

    const categoriesById = new Map<number, number[]>();
    const kitIds: number[] = [];

    (await inPages(ids, factsFor)).forEach((node) => {
      categoriesById.set(
        node.entityId,
        removeEdgesAndNodes(node.categories).map((category) => category.entityId),
      );

      if (isCuratedKitProduct(removeEdgesAndNodes(node.customFields))) {
        kitIds.push(node.entityId);
      }
    });

    const contentsByKit = new Map<number, number[]>();

    if (kitIds.length > 0) {
      (await inPages(kitIds, contentsFor)).forEach((node) => {
        contentsByKit.set(
          node.entityId,
          removeEdgesAndNodes(node.relatedProducts).map((related) => related.entityId),
        );
      });

      const unread = [...new Set([...contentsByKit.values()].flat())].filter(
        (id) => !categoriesById.has(id),
      );

      (await inPages(unread, factsFor)).forEach((node) => {
        categoriesById.set(
          node.entityId,
          removeEdgesAndNodes(node.categories).map((category) => category.entityId),
        );
      });
    }

    const found = new Map<number, PharmacistContents>();

    ids.forEach((entityId) => {
      const contents = pharmacistContentsOf({
        entityId,
        categoryIds: categoriesById.get(entityId) ?? [],
        components: contentsByKit.get(entityId)?.map((componentId) => ({
          entityId: componentId,
          categoryIds: categoriesById.get(componentId) ?? [],
        })),
      });

      if (contents.insulin || contents.glucagon) {
        found.set(entityId, contents);
      }
    });

    return found;
  } catch {
    return new Map(ids.map((id) => [id, { insulin: true, glucagon: true }]));
  }
}

/*
 * Which of these products are insulin or glucagon, or a curated kit holding
 * either (`pharmacistProducts`). Fails closed: if the catalogue cannot
 * answer, every id counts.
 */
export async function pharmacistProductIds(entityIds: readonly number[]): Promise<Set<number>> {
  return new Set((await pharmacistProducts(entityIds)).keys());
}

/*
 * Insulin and glucagon are never added to the cart from a listing (owner note
 * 9, 2026-10-07): a pharmacist reviews every order, and the notice that says
 * so is under the product page's buy box. Every listing that offers a
 * one-click add — a category grid, search, a brand page, compare — passes its
 * cards through this, and an insulin or glucagon card links its product page
 * instead ("View product", `DiabetesCare.ui.commerce.viewProduct`). Other
 * cards come back unchanged. A curated kit holding insulin or glucagon is
 * treated the same (production check, 2026-10-12). Fails closed, as
 * `pharmacistProductIds` does. The listings' add actions refuse the same
 * products, so a stale or hand-built form cannot add one either.
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
