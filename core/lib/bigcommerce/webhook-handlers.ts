import 'server-only';

import { syncStripeProductNamesForBigCommerceProduct } from '~/lib/stripe/sync-subscription-product-name';
import { syncStripeSubscriptionsForProduct } from '~/lib/stripe/sync-subscription-pricing';

const PRODUCT_SYNC_SCOPES = new Set(['store/product/updated', 'store/sku/updated']);

interface BigCommerceWebhookPayload {
  scope: string;
  store_id: string;
  data: {
    type: string;
    id: number;
    properties?: string[];
    sku?: {
      product_id: number;
      variant_id: number;
    };
  };
}

function shouldSyncProductName(payload: BigCommerceWebhookPayload): boolean {
  if (payload.scope !== 'store/product/updated') {
    return false;
  }

  const properties = payload.data.properties;

  if (!properties || properties.length === 0) {
    return true;
  }

  return properties.includes('name');
}

function getProductEntityIdFromWebhookPayload(payload: BigCommerceWebhookPayload): number | null {
  if (payload.scope === 'store/product/updated') {
    if (payload.data.type !== 'product' || !Number.isFinite(payload.data.id) || payload.data.id <= 0) {
      return null;
    }

    return payload.data.id;
  }

  if (payload.scope === 'store/sku/updated') {
    const productEntityId = payload.data.sku?.product_id;

    if (!Number.isFinite(productEntityId) || productEntityId <= 0) {
      return null;
    }

    return productEntityId;
  }

  return null;
}

export async function handleBigCommerceWebhookEvent(
  payload: BigCommerceWebhookPayload,
): Promise<{
  handled: boolean;
  summary?: Awaited<ReturnType<typeof syncStripeSubscriptionsForProduct>>;
  nameSummary?: Awaited<ReturnType<typeof syncStripeProductNamesForBigCommerceProduct>>;
}> {
  if (!PRODUCT_SYNC_SCOPES.has(payload.scope)) {
    return { handled: false };
  }

  const productEntityId = getProductEntityIdFromWebhookPayload(payload);

  if (productEntityId == null) {
    return { handled: false };
  }

  const [summary, nameSummary] = await Promise.all([
    syncStripeSubscriptionsForProduct(productEntityId),
    shouldSyncProductName(payload)
      ? syncStripeProductNamesForBigCommerceProduct(productEntityId)
      : Promise.resolve(undefined),
  ]);

  // eslint-disable-next-line no-console
  console.info(
    `Synced Stripe subscriptions for BigCommerce product ${productEntityId} (${payload.scope}): matched=${summary.matched}, updated=${summary.updated}, paused=${summary.paused}, unchanged=${summary.unchanged}, skipped=${summary.skipped}, failed=${summary.failed}`,
  );

  if (nameSummary) {
    // eslint-disable-next-line no-console
    console.info(
      `Synced Stripe product names for BigCommerce product ${productEntityId}: matched=${nameSummary.matched}, updated=${nameSummary.updated}, unchanged=${nameSummary.unchanged}, failed=${nameSummary.failed}`,
    );
  }

  return {
    handled: true,
    summary,
    ...(nameSummary ? { nameSummary } : {}),
  };
}
