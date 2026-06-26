import 'server-only';

import { syncStripeSubscriptionsForProduct } from '~/lib/stripe/sync-subscription-pricing';

const PRODUCT_PRICE_SYNC_SCOPES = new Set(['store/product/updated']);

interface BigCommerceWebhookPayload {
  scope: string;
  store_id: string;
  data: {
    type: string;
    id: number;
  };
}

export async function handleBigCommerceWebhookEvent(
  payload: BigCommerceWebhookPayload,
): Promise<{ handled: boolean; summary?: Awaited<ReturnType<typeof syncStripeSubscriptionsForProduct>> }> {
  if (!PRODUCT_PRICE_SYNC_SCOPES.has(payload.scope)) {
    return { handled: false };
  }

  if (payload.data.type !== 'product' || !Number.isFinite(payload.data.id) || payload.data.id <= 0) {
    return { handled: false };
  }

  const summary = await syncStripeSubscriptionsForProduct(payload.data.id);

  // eslint-disable-next-line no-console
  console.info(
    `Synced Stripe subscriptions for BigCommerce product ${payload.data.id}: matched=${summary.matched}, updated=${summary.updated}, paused=${summary.paused}, unchanged=${summary.unchanged}, skipped=${summary.skipped}, failed=${summary.failed}`,
  );

  return { handled: true, summary };
}
