import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { isCuratedKitProduct } from '~/lib/kit/is-curated-kit';

import {
  FAIL_CLOSED_REASON,
  type ViewOnlyCheckProduct,
  type ViewOnlyReason,
  viewOnlyReasonOf,
} from './view-only-rules';

/*
 * =============================================================================
 * VIEW-ONLY PRODUCTS: WHAT THE CATALOGUE SAYS
 * =============================================================================
 * One shared rule (./view-only-rules.ts) for every product that is never
 * added to a cart in one click from a listing, a kit or the assistant:
 * insulin and glucagon (a pharmacist reviews every order) and prescription
 * devices (CPAP, APAP, bilevel and ASV machines, never bought online;
 * ./prescription-devices.ts). A curated kit is what it holds.
 *
 * Every listing that offers a one-click add (category, brand, search,
 * compare, wishlist) passes its cards through `withViewOnlyProducts`; every
 * one-click add action outside the product page refuses `viewOnlyProductIds`;
 * a subscription, a reorder, the product page's own add, the checkout
 * snapshot and the checkout page refuse `prescriptionDeviceIds` only
 * (insulin and glucagon may be subscribed to and reordered: owner decision,
 * 2026-10-13; `repeatOrderRefusalFor`).
 *
 * All of it fails closed: if the catalogue cannot answer, every id counts.
 * ~/lib/checkout/quebec-insulin.ts re-exports the pharmacist names from here.
 * =============================================================================
 */

/*
 * A product's name, categories and custom fields: enough to say whether it
 * is insulin, glucagon or a prescription device, and whether it is a curated
 * kit (`kit_type`).
 */
const ViewOnlyFactsQuery = graphql(`
  query ViewOnlyFacts($entityIds: [Int!], $first: Int) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            name
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
  query ViewOnlyKitContents($entityIds: [Int!], $first: Int) {
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

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;

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

/*
 * Why each of these products is view-only, read from the catalogue. Products
 * that are not are left out of the map.
 *
 * A kit's contents are read from the catalogue each time (its related
 * products, which is how a curated kit stores what it holds; core/lib/kit),
 * never from a list of kit ids, so a kit that gains or loses Baqsimi, an
 * insulin or a machine is judged on what it holds today.
 *
 * Fails closed: if the catalogue cannot answer, every id counts as all of
 * insulin, glucagon and a device. With `throwOnLookupFailure`, the failure
 * is thrown instead, for a caller that refuses on any error anyway and
 * should not name a reason it does not know (the checkout snapshot).
 */
export async function viewOnlyProducts(
  entityIds: readonly number[],
  { throwOnLookupFailure = false }: { throwOnLookupFailure?: boolean } = {},
): Promise<Map<number, ViewOnlyReason>> {
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
        document: ViewOnlyFactsQuery,
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

    const factsById = new Map<number, ViewOnlyCheckProduct>();
    const kitIds: number[] = [];
    const readFacts = (node: Awaited<ReturnType<typeof factsFor>>[number]) => {
      factsById.set(node.entityId, {
        entityId: node.entityId,
        name: node.name,
        categoryIds: removeEdgesAndNodes(node.categories).map((category) => category.entityId),
      });
    };

    (await inPages(ids, factsFor)).forEach((node) => {
      readFacts(node);

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
        (id) => !factsById.has(id),
      );

      (await inPages(unread, factsFor)).forEach(readFacts);
    }

    const factsOf = (entityId: number): ViewOnlyCheckProduct =>
      factsById.get(entityId) ?? { entityId, categoryIds: [] };
    const found = new Map<number, ViewOnlyReason>();

    ids.forEach((entityId) => {
      const reason = viewOnlyReasonOf({
        ...factsOf(entityId),
        components: contentsByKit.get(entityId)?.map(factsOf),
      });

      if (reason) {
        found.set(entityId, reason);
      }
    });

    return found;
  } catch (error) {
    if (throwOnLookupFailure) {
      throw error;
    }

    return new Map(ids.map((id) => [id, FAIL_CLOSED_REASON]));
  }
}

/* Which of these products are view-only, for any reason (`viewOnlyProducts`). */
export async function viewOnlyProductIds(entityIds: readonly number[]): Promise<Set<number>> {
  return new Set((await viewOnlyProducts(entityIds)).keys());
}

/*
 * Which of these products are, or hold, a prescription device. Fails closed,
 * or throws with `throwOnLookupFailure` (`viewOnlyProducts`).
 */
export async function prescriptionDeviceIds(
  entityIds: readonly number[],
  options?: { throwOnLookupFailure?: boolean },
): Promise<Set<number>> {
  const found = await viewOnlyProducts(entityIds, options);

  return new Set([...found].flatMap(([id, reason]) => (reason.device ? [id] : [])));
}

export interface PharmacistContents {
  insulin: boolean;
  glucagon: boolean;
}

/*
 * Which of these products a pharmacist reviews and dispenses, and why: each
 * one that is insulin or glucagon, or a curated kit whose contents include
 * either (`pharmacistContentsOf`, dc-ids.ts), mapped to what it is or holds.
 * Products that are neither are left out of the map. Prescription devices
 * are not part of this answer (`viewOnlyProducts` is).
 *
 * Fails closed: if the catalogue cannot answer, every id counts as both.
 */
export async function pharmacistProducts(
  entityIds: readonly number[],
): Promise<Map<number, PharmacistContents>> {
  const found = new Map<number, PharmacistContents>();

  (await viewOnlyProducts(entityIds)).forEach(({ insulin, glucagon }, entityId) => {
    if (insulin || glucagon) {
      found.set(entityId, { insulin, glucagon });
    }
  });

  return found;
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
 * View-only products are never added to the cart from a listing: insulin and
 * glucagon (owner note 9, 2026-10-07: a pharmacist reviews every order, and
 * the notice that says so is under the product page's buy box) and
 * prescription devices (owner approval, 2026-10-12: the product page says
 * "Prescription required"). Every listing that offers a one-click add — a
 * category grid, search, a brand page, compare — passes its cards through
 * this, and a view-only card links its product page instead ("View product",
 * `DiabetesCare.ui.commerce.viewProduct`). Other cards come back unchanged. A
 * curated kit holding one is treated the same. Fails closed. The listings'
 * add actions refuse the same products, so a stale or hand-built form cannot
 * add one either.
 *
 * A device card is also marked `subscribeUnavailable`, so it shows no
 * "Subscribe & save" link: its page offers no subscription. Insulin and
 * glucagon cards keep theirs (owner decision, 2026-10-13).
 */
export async function withViewOnlyProducts<T extends { id: string }>(
  cards: readonly T[],
): Promise<Array<T & { viewOnlyLabel?: string; subscribeUnavailable?: boolean }>> {
  if (cards.length === 0) {
    return [];
  }

  const viewOnly = await viewOnlyProducts(cards.map((card) => Number(card.id)));

  if (viewOnly.size === 0) {
    return [...cards];
  }

  const t = await getTranslations('DiabetesCare.ui.commerce');
  const viewOnlyLabel = t('viewProduct');

  return cards.map((card) => {
    const reason = viewOnly.get(Number(card.id));

    if (!reason) {
      return card;
    }

    return reason.device
      ? { ...card, viewOnlyLabel, subscribeUnavailable: true }
      : { ...card, viewOnlyLabel };
  });
}

/*
 * The same for a wishlist's items (the account wishlist and a shared one): a
 * view-only item's card links its product page instead of offering "Add to
 * cart". The wishlist's add action refuses them as well.
 */
export async function withViewOnlyWishlistItems<T extends { product: { id: string } }>(
  items: readonly T[],
): Promise<Array<T & { product: T['product'] & { viewOnlyLabel?: string } }>> {
  const products = await withViewOnlyProducts(items.map((item) => item.product));

  return items.map((item, index) => ({ ...item, product: products[index] ?? item.product }));
}

/*
 * The message a cart action shows when it refuses a view-only product. Read
 * on the server: CareNotices is not in the browser's message bundle.
 */
export async function viewOnlyRefusalMessage(
  refusal: 'prescription-device' | 'pharmacist',
): Promise<string> {
  const t = await getTranslations('CareNotices.refusals');

  return refusal === 'prescription-device' ? t('prescriptionDevice') : t('pharmacist');
}
