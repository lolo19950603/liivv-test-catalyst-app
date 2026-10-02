import 'server-only';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

import type { CompatibilityProduct } from './compatibility';

export type { CompatibilityProduct };

const CompatibilityProductsQuery = graphql(`
  query CompatibilityProducts($entityIds: [Int!], $first: Int, $currencyCode: currencyCode) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
            prices(currencyCode: $currencyCode) {
              price {
                value
                currencyCode
              }
              basePrice {
                value
                currencyCode
              }
              retailPrice {
                value
                currencyCode
              }
              salePrice {
                value
                currencyCode
              }
              priceRange {
                min {
                  value
                  currencyCode
                }
                max {
                  value
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`);

export const getCompatibilityProducts = cache(
  async (ids: number[], locale?: string): Promise<CompatibilityProduct[]> => {
    if (!ids.length) return [];

    try {
      const customerAccessToken = await getSessionCustomerAccessToken();
      const currencyCode = await getPreferredCurrencyCode();
      const format = await getFormatter();
      const { data } = await client.fetch({
        document: CompatibilityProductsQuery,
        customerAccessToken,
        channelId: getChannelIdFromLocale(locale),
        variables: { entityIds: ids, first: Math.min(ids.length, 50), currencyCode },
        fetchOptions: customerAccessToken ? { cache: 'no-store' as const } : { next: { revalidate } },
      });

      return removeEdgesAndNodes(data.site.products).map((node) => {
        const price = pricesTransformer(node.prices, format);
        let priceLabel: string | undefined;

        if (typeof price === 'string') priceLabel = price;
        else if (price?.type === 'sale') priceLabel = price.currentValue;
        else if (price?.type === 'range') priceLabel = price.minValue;

        return {
          entityId: node.entityId,
          name: node.name,
          path: node.path,
          image: node.defaultImage
            ? { src: resolveBcCdnImageUrl(node.defaultImage.url, 320), alt: node.defaultImage.altText }
            : undefined,
          priceLabel,
        };
      });
    } catch (error) {
      console.error('[getCompatibilityProducts] failed', error);

      return [];
    }
  },
);
