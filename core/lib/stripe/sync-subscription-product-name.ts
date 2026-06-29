import 'server-only';

import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

import { getStripe, isStripeConfigured } from './client';

interface CatalogProductResponse {
  data: {
    name: string;
  };
}

export async function syncStripeProductNamesForBigCommerceProduct(productEntityId: number): Promise<{
  productEntityId: number;
  matched: number;
  updated: number;
  unchanged: number;
  failed: number;
}> {
  const summary = {
    productEntityId,
    matched: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
  };

  if (!isStripeConfigured() || !isBigCommerceAdminConfigured()) {
    return summary;
  }

  let productName: string;

  try {
    const catalogProduct = await bigCommerceAdminFetch<CatalogProductResponse>(
      `/v3/catalog/products/${productEntityId}`,
    );

    productName = catalogProduct.data.name?.trim() ?? '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to load BigCommerce product ${productEntityId} for Stripe name sync:`,
      error,
    );

    return summary;
  }

  if (!productName) {
    return summary;
  }

  const stripe = getStripe();
  const stripeProductIds: string[] = [];
  let page: string | undefined;

  do {
    const result = await stripe.products.search({
      query: `metadata['bigcommerce_product_id']:'${productEntityId}'`,
      limit: 100,
      page,
    });

    stripeProductIds.push(...result.data.map((product) => product.id));
    page = result.has_more ? (result.next_page ?? undefined) : undefined;
  } while (page);

  summary.matched = stripeProductIds.length;

  await Promise.all(
    stripeProductIds.map(async (stripeProductId) => {
      try {
        const stripeProduct = await stripe.products.retrieve(stripeProductId);

        if (stripeProduct.deleted) {
          return;
        }

        if (stripeProduct.name === productName) {
          summary.unchanged += 1;
          return;
        }

        await stripe.products.update(stripeProductId, { name: productName });
        summary.updated += 1;
      } catch (error) {
        summary.failed += 1;
        // eslint-disable-next-line no-console
        console.error(
          `Failed to sync Stripe product name for ${stripeProductId} (BC product ${productEntityId}):`,
          error,
        );
      }
    }),
  );

  return summary;
}
