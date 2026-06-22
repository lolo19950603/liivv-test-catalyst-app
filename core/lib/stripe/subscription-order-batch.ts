import 'server-only';

import type Stripe from 'stripe';

import {
  BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY,
  parseProductOptionSelectionsFromMetadata,
  type ProductOptionSelection,
} from '~/lib/bigcommerce/product-options';
import { createBigCommerceBatchedSubscriptionOrder } from '~/lib/bigcommerce/subscription-order';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { kv } from '~/lib/kv';

import {
  buildSubscriptionOrderBatchStorageKey,
  getShipmentCalendarDayKey,
} from './subscription-shipment-grouping';
import {
  claimSubscriptionOrderCreation,
  markSubscriptionOrderCreated,
  releaseSubscriptionOrderCreation,
} from './storage';

export interface BatchedSubscriptionOrderLine {
  invoiceReferenceId: string;
  stripeSubscriptionId: string;
  productEntityId?: number;
  productName: string;
  productSku?: string;
  productOptions?: ProductOptionSelection[];
  quantity: number;
  unitAmountExTax: number;
  unitAmountIncTax: number;
}

export interface SubscriptionOrderBatch {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
  shippingMetadata: Record<string, string>;
  currencyCode: string;
  orderType: 'initial' | 'renewal';
  items: BatchedSubscriptionOrderLine[];
  updatedAt: number;
}

const SHIPPING_METADATA_KEYS = [
  'shipping_address_key',
  'shipping_address_label',
  'shipping_address_first_name',
  'shipping_address_last_name',
  'shipping_address1',
  'shipping_address2',
  'shipping_address_city',
  'shipping_address_state_or_province',
  'shipping_address_postal_code',
  'shipping_address_country_code',
  'shipping_method_label',
] as const;

function getBatchQuietPeriodMs(): number {
  const configured = Number(process.env.STRIPE_SUBSCRIPTION_ORDER_BATCH_QUIET_MS ?? '90000');

  return Number.isFinite(configured) && configured >= 0 ? configured : 90_000;
}

function batchKvKey(storageKey: string): string {
  return `stripe:subscription-batch:${storageKey}`;
}

function batchIndexKvKey(customerId: number): string {
  return `stripe:subscription-batch-index:${customerId}`;
}

function batchFlushKvKey(storageKey: string): string {
  return `stripe:subscription-batch-flush:${storageKey}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function pickShippingMetadata(metadata: Stripe.Metadata): Record<string, string> {
  const picked: Record<string, string> = {};

  for (const key of SHIPPING_METADATA_KEYS) {
    const value = metadata[key]?.trim();

    if (value) {
      picked[key] = value;
    }
  }

  return picked;
}

async function readBatch(storageKey: string): Promise<SubscriptionOrderBatch | null> {
  const batch = await kv.get<SubscriptionOrderBatch | ''>(batchKvKey(storageKey));

  if (!batch || typeof batch === 'string' || batch.items.length === 0) {
    return null;
  }

  return batch;
}

async function writeBatch(storageKey: string, batch: SubscriptionOrderBatch): Promise<void> {
  await kv.set(batchKvKey(storageKey), batch);
}

async function deleteBatch(storageKey: string, customerId: number): Promise<void> {
  await kv.set(batchKvKey(storageKey), '');

  const indexKey = batchIndexKvKey(customerId);
  const existingIndex = (await kv.get<string[] | ''>(indexKey)) ?? [];
  const normalizedIndex = typeof existingIndex === 'string' ? [] : existingIndex;
  const nextIndex = normalizedIndex.filter((entry) => entry !== storageKey);

  if (nextIndex.length > 0) {
    await kv.set(indexKey, nextIndex);
  } else {
    await kv.set(indexKey, '');
  }
}

async function registerBatchIndex(customerId: number, storageKey: string): Promise<void> {
  const indexKey = batchIndexKvKey(customerId);
  const existingIndex = (await kv.get<string[] | ''>(indexKey)) ?? [];
  const normalizedIndex = typeof existingIndex === 'string' ? [] : existingIndex;

  if (normalizedIndex.includes(storageKey)) {
    return;
  }

  await kv.set(indexKey, [...normalizedIndex, storageKey]);
}

async function claimBatchFlush(storageKey: string): Promise<boolean> {
  const key = batchFlushKvKey(storageKey);
  const existing = await kv.get<string>(key);

  if (existing) {
    return false;
  }

  await kv.set(key, 'pending');

  return true;
}

async function releaseBatchFlush(storageKey: string): Promise<void> {
  const key = batchFlushKvKey(storageKey);
  const existing = await kv.get<string>(key);

  if (existing === 'pending') {
    await kv.set(key, '');
  }
}

async function markBatchFlushComplete(storageKey: string): Promise<void> {
  await kv.set(batchFlushKvKey(storageKey), 'complete');
}

function getInvoiceChargeTimestamp(invoice: Stripe.Invoice): number {
  return (
    invoice.status_transitions?.paid_at ??
    invoice.effective_at ??
    invoice.created ??
    Math.floor(Date.now() / 1000)
  );
}

function getBigCommerceCustomerId(metadata: Stripe.Metadata): number | null {
  const value = metadata.bigcommerce_customer_id;

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getBigCommerceProductId(metadata: Stripe.Metadata): number | undefined {
  const value = metadata.bigcommerce_product_id;

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getProductSku(metadata: Stripe.Metadata): string | undefined {
  const sku = metadata.bigcommerce_sku;

  return sku?.trim() || undefined;
}

function getProductOptionsFromMetadata(metadata: Stripe.Metadata): ProductOptionSelection[] {
  return parseProductOptionSelectionsFromMetadata(
    metadata[BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY],
  );
}

function getSubscriptionProductName(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  const product = item?.price.product;

  if (typeof product === 'string' || !product || product.deleted) {
    return 'Subscription';
  }

  return product.name;
}

function getSubscriptionLineTotals(
  subscription: Stripe.Subscription,
  metadata: Stripe.Metadata,
): { quantity: number; unitAmountExTax: number } {
  const item = subscription.items.data[0];
  const quantity = item?.quantity ?? 1;
  const billedSubtotal = Number(metadata.billed_subtotal_cents ?? '');
  const unitAmount =
    Number.isFinite(billedSubtotal) && billedSubtotal > 0
      ? billedSubtotal
      : (item?.price.unit_amount ?? 0) * quantity;

  return {
    quantity,
    unitAmountExTax: unitAmount,
  };
}

export interface QueuedSubscriptionInvoiceBatch {
  customerId: number;
  batchStorageKey: string;
}

export async function queuePaidInvoiceForSubscriptionOrderBatch({
  invoice,
  subscription,
  subscriptionMetadata,
  orderType,
}: {
  invoice: Stripe.Invoice;
  subscription: Stripe.Subscription;
  subscriptionMetadata: Stripe.Metadata;
  orderType: 'initial' | 'renewal';
}): Promise<QueuedSubscriptionInvoiceBatch | null> {
  if (!isBigCommerceAdminConfigured()) {
    return null;
  }

  const customerId = getBigCommerceCustomerId(subscriptionMetadata);

  if (!customerId) {
    return null;
  }

  const invoiceReferenceId = `invoice:${invoice.id}`;
  const claimed = await claimSubscriptionOrderCreation(invoiceReferenceId);

  if (!claimed) {
    return null;
  }

  const dayKey = getShipmentCalendarDayKey(getInvoiceChargeTimestamp(invoice));
  const shippingAddressKey =
    subscriptionMetadata.shipping_address_key?.trim() || 'default-shipping-address';
  const batchStorageKey = buildSubscriptionOrderBatchStorageKey({
    customerId,
    dayKey,
    shippingAddressKey,
  });

  const { quantity, unitAmountExTax } = getSubscriptionLineTotals(
    subscription,
    subscriptionMetadata,
  );
  const unitAmountIncTax = invoice.amount_paid ?? unitAmountExTax;
  const currencyCode = (invoice.currency ?? subscription.currency ?? 'usd').toUpperCase();
  const shippingMetadata = pickShippingMetadata(subscriptionMetadata);

  const line: BatchedSubscriptionOrderLine = {
    invoiceReferenceId,
    stripeSubscriptionId: subscription.id,
    productEntityId: getBigCommerceProductId(subscriptionMetadata),
    productName: getSubscriptionProductName(subscription),
    productSku: getProductSku(subscriptionMetadata),
    productOptions: getProductOptionsFromMetadata(subscriptionMetadata),
    quantity,
    unitAmountExTax,
    unitAmountIncTax,
  };

  try {
    const existingBatch = await readBatch(batchStorageKey);
    const nextBatch: SubscriptionOrderBatch = existingBatch
      ? {
          ...existingBatch,
          items: [...existingBatch.items, line],
          updatedAt: Date.now(),
        }
      : {
          customerId,
          dayKey,
          shippingAddressKey,
          shippingMetadata,
          currencyCode,
          orderType,
          items: [line],
          updatedAt: Date.now(),
        };

    await writeBatch(batchStorageKey, nextBatch);
    await registerBatchIndex(customerId, batchStorageKey);

    return { customerId, batchStorageKey };
  } catch (error) {
    await releaseSubscriptionOrderCreation(invoiceReferenceId);
    throw error;
  }
}

async function flushSubscriptionOrderBatch(storageKey: string): Promise<number | null> {
  const batch = await readBatch(storageKey);

  if (!batch || batch.items.length === 0) {
    return null;
  }

  if (Date.now() - batch.updatedAt < getBatchQuietPeriodMs()) {
    return null;
  }

  const claimed = await claimBatchFlush(storageKey);

  if (!claimed) {
    return null;
  }

  try {
    const orderId = await createBigCommerceBatchedSubscriptionOrder({
      customerId: batch.customerId,
      shippingMetadata: batch.shippingMetadata,
      currencyCode: batch.currencyCode,
      orderType: batch.orderType,
      batchStorageKey: storageKey,
      dayKey: batch.dayKey,
      lines: batch.items,
    });

    await Promise.all(
      batch.items.map((item) => markSubscriptionOrderCreated(item.invoiceReferenceId, orderId)),
    );

    await deleteBatch(storageKey, batch.customerId);
    await markBatchFlushComplete(storageKey);

    // eslint-disable-next-line no-console
    console.info(
      `Created batched BigCommerce subscription order ${orderId} for ${storageKey} (${batch.items.length} items)`,
    );

    return orderId;
  } catch (error) {
    await releaseBatchFlush(storageKey);
    await Promise.all(
      batch.items.map((item) => releaseSubscriptionOrderCreation(item.invoiceReferenceId)),
    );
    throw error;
  }
}

export async function flushSubscriptionOrderBatchIfReady(storageKey: string): Promise<number | null> {
  return flushSubscriptionOrderBatch(storageKey);
}

export async function flushQuietSubscriptionOrderBatchesForCustomer(
  customerId: number,
): Promise<void> {
  const indexValue = await kv.get<string[] | ''>(batchIndexKvKey(customerId));
  const index = typeof indexValue === 'string' || !indexValue ? [] : indexValue;

  for (const storageKey of index) {
    try {
      await flushSubscriptionOrderBatch(storageKey);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to flush subscription order batch ${storageKey}:`, error);
    }
  }
}

export async function scheduleSubscriptionOrderBatchFlush({
  customerId,
  batchStorageKey,
}: QueuedSubscriptionInvoiceBatch): Promise<void> {
  await delay(getBatchQuietPeriodMs());
  await flushSubscriptionOrderBatchIfReady(batchStorageKey);
  await flushQuietSubscriptionOrderBatchesForCustomer(customerId);
}
