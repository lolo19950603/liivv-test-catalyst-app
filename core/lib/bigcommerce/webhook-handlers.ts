import 'server-only';

import { syncStripeSubscriptionsForProduct } from '~/lib/stripe/sync-subscription-pricing';

const PRODUCT_PRICE_SYNC_SCOPES = new Set(['store/product/updated', 'store/sku/updated']);

interface BigCommerceWebhookPayload {
  scope: string;
  store_id: string;
  data: {
    type: string;
    id: number;
    sku?: {
      product_id: number;
      variant_id: number;
    };
  };
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
): Promise<{ handled: boolean; summary?: Awaited<ReturnType<typeof syncStripeSubscriptionsForProduct>> }> {
  if (!PRODUCT_PRICE_SYNC_SCOPES.has(payload.scope)) {
    return { handled: false };
  }

  const productEntityId = getProductEntityIdFromWebhookPayload(payload);

  if (productEntityId == null) {
    return { handled: false };
  }

  const summary = await syncStripeSubscriptionsForProduct(productEntityId);

  // eslint-disable-next-line no-console
  console.info(
    `Synced Stripe subscriptions for BigCommerce product ${productEntityId} (${payload.scope}): matched=${summary.matched}, updated=${summary.updated}, paused=${summary.paused}, unchanged=${summary.unchanged}, skipped=${summary.skipped}, failed=${summary.failed}`,
  );

  return { handled: true, summary };
}
