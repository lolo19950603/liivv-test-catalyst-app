/* Twin of ostomy-care/chapters/get-supply-items.ts @3b343c6e — port fixes both ways until Phase 2 */

import 'server-only';

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
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

import type { PlacementItems } from './types';

/*
 * =============================================================================
 * PRODUCT PLACEMENTS — WHAT THE CATALOGUE SAYS TODAY
 * =============================================================================
 * A shelf names product ids (./shelves.ts). Whether each one is shown is a
 * fact about the catalogue, so it is read here on every request rather than
 * written down beside the shelf and left to go stale:
 *
 *   visible      the storefront returns hidden products for no one, so a
 *                product hidden in the store never comes back at all;
 *   purchasable  its availability is Available (not Preorder, not
 *                Unavailable);
 *   in stock     the storefront says it is in stock (an untracked product
 *                always is).
 *
 * A product that fails any of the three is left out, and a shelf with nothing
 * left renders nothing.
 *
 * `refuse` drops a product when it answers true for the full HTML
 * description (links included). A site passes the names and numbers it must
 * never lead a reader to (Diabetes Care: another retailer's name, site and
 * phone number), so a product page that would show them is never linked from
 * a care page until its description is fixed in the store.
 *
 * `oneClick` is true only when a reader has nothing to choose: no required
 * option or modifier, and one variant at most. Anything else is offered as a
 * link to its product page ("Choose options"), never as a one-click add that
 * the cart would refuse.
 *
 * Every failure resolves to an empty record: a shelf is a shopping aid, and
 * nothing a reader needs depends on it.
 * =============================================================================
 */

const PlacementItemsQuery = graphql(
  `
    query PlacementItems($entityIds: [Int!], $first: Int, $currencyCode: currencyCode) {
      site {
        products(entityIds: $entityIds, first: $first) {
          edges {
            node {
              entityId
              name
              path
              description
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
              }
              productOptions(first: 10) {
                edges {
                  node {
                    entityId
                    isRequired
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
              ...PricingFragment
            }
          }
        }
      }
    }
  `,
  [PricingFragment],
);

/** BigCommerce Storefront GraphQL caps product connections at 50. */
const PAGE_SIZE = 50;

interface PlacementOptions {
  /* "From $84.99" in the page language, for a product priced as a range. */
  fromPrice: (price: string) => string;
  /* A product this answers true for, given its full HTML description, is never placed. */
  refuse?: (description: string) => boolean;
}

function chunks(ids: number[]): number[][] {
  const out: number[][] = [];

  for (let start = 0; start < ids.length; start += PAGE_SIZE) {
    out.push(ids.slice(start, start + PAGE_SIZE));
  }

  return out;
}

export const getPlacementItems = cache(
  async (
    ids: readonly number[],
    locale: string,
    options: PlacementOptions,
  ): Promise<PlacementItems> => {
    const unique = [...new Set(ids)];

    if (!unique.length) return {};

    try {
      const customerAccessToken = await getSessionCustomerAccessToken();
      const currencyCode = await getPreferredCurrencyCode();
      const format = await getFormatter();
      const fetchOptions = {
        headers: { 'Accept-Language': locale },
        // Revalidating cache for guests, no store for a signed-in customer,
        // as the site's catalogue loaders do.
        ...(customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } }),
      };

      const pages = await Promise.all(
        chunks(unique).map((entityIds) =>
          client.fetch({
            document: PlacementItemsQuery,
            customerAccessToken,
            channelId: getChannelIdFromLocale(locale),
            variables: { entityIds, first: entityIds.length, currencyCode },
            fetchOptions,
          }),
        ),
      );

      const items: PlacementItems = {};

      pages
        .flatMap(({ data }) => removeEdgesAndNodes(data.site.products))
        .forEach((node) => {
          if (!node.inventory.isInStock || node.availabilityV2.status !== 'Available') return;

          if (options.refuse?.(node.description)) return;

          const price = pricesTransformer(node.prices ?? null, format);
          let priceLabel: string | undefined;

          if (typeof price === 'string') {
            priceLabel = price;
          } else if (price?.type === 'sale') {
            priceLabel = price.currentValue;
          } else if (price?.type === 'range') {
            priceLabel = options.fromPrice(price.minValue);
          }

          const image = node.defaultImage?.url.trim()
            ? {
                src: resolveBcCdnImageUrl(node.defaultImage.url, 320),
                alt: node.defaultImage.altText || node.name,
              }
            : undefined;

          items[node.entityId] = {
            entityId: node.entityId,
            name: node.name,
            path: node.path,
            ...(image ? { image } : {}),
            ...(priceLabel ? { priceLabel } : {}),
            oneClick:
              !removeEdgesAndNodes(node.productOptions).some((option) => option.isRequired) &&
              removeEdgesAndNodes(node.variants).length <= 1,
          };
        });

      return items;
    } catch {
      // Offline, unauthorised or a schema change: the shelves have nothing to
      // offer, and the page around them is unaffected.
      return {};
    }
  },
);
