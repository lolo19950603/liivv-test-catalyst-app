import 'server-only';

import type Stripe from 'stripe';

import {
  BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY,
  parseProductOptionSelectionsFromMetadata,
  type ProductOptionSelection,
} from '~/lib/bigcommerce/product-options';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { kv } from '~/lib/kv';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  deleteSubscriptionOrderBatchFromSupabase,
  getSubscriptionOrderBatchFromSupabase,
  getSubscriptionOrderBatchIndexFromSupabase,
  getSubscriptionOrderBatchesForCustomerFromSupabase,
  saveSubscriptionOrderBatchInSupabase,
} from '~/lib/supabase/subscription-order-batch-store';

import {
  buildSubscriptionOrderBatchStorageKey,
  getShipmentCalendarDayKey,
  getSubscriptionInvoiceShipmentTimestamp,
} from './subscription-shipment-grouping';
import {
  claimSubscriptionOrderCreation,
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

function batchKvKey(storageKey: string): string {
  return `stripe:subscription-batch:${storageKey}`;
}

function batchIndexKvKey(customerId: number): string {
  return `stripe:subscription-batch-index:${customerId}`;
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

function mergeBatchLines(
  existingItems: BatchedSubscriptionOrderLine[],
  line: BatchedSubscriptionOrderLine,
): BatchedSubscriptionOrderLine[] {
  const withoutDuplicate = existingItems.filter(
    (item) => item.invoiceReferenceId !== line.invoiceReferenceId,
  );

  return [...withoutDuplicate, line];
}

async function readBatch(storageKey: string): Promise<SubscriptionOrderBatch | null> {
  if (isSupabaseConfigured()) {
    return getSubscriptionOrderBatchFromSupabase(storageKey);
  }

  const batch = await kv.get<SubscriptionOrderBatch | ''>(batchKvKey(storageKey));

  if (!batch || typeof batch === 'string' || batch.items.length === 0) {
    return null;
  }

  return batch;
}

async function writeBatch(storageKey: string, batch: SubscriptionOrderBatch): Promise<void> {
  if (isSupabaseConfigured()) {
    await saveSubscriptionOrderBatchInSupabase(storageKey, batch);

    return;
  }

  await kv.set(batchKvKey(storageKey), batch);
}

async function deleteBatch(storageKey: string, customerId: number): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteSubscriptionOrderBatchFromSupabase(storageKey);

    return;
  }

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
  if (isSupabaseConfigured()) {
    return;
  }

  const indexKey = batchIndexKvKey(customerId);
  const existingIndex = (await kv.get<string[] | ''>(indexKey)) ?? [];
  const normalizedIndex = typeof existingIndex === 'string' ? [] : existingIndex;

  if (!normalizedIndex.includes(storageKey)) {
    await kv.set(indexKey, [...normalizedIndex, storageKey]);
  }
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
    // eslint-disable-next-line no-console
    console.warn(
      `Skipping BigCommerce subscription order for invoice ${invoice.id}: admin API not configured`,
    );

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

  const dayKey = getShipmentCalendarDayKey(
    getSubscriptionInvoiceShipmentTimestamp(invoice, subscription),
  );
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
          items: mergeBatchLines(existingBatch.items, line),
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

export async function getSubscriptionOrderBatch(
  storageKey: string,
): Promise<SubscriptionOrderBatch | null> {
  return readBatch(storageKey);
}

export async function getSubscriptionOrderBatchIndex(customerId: number): Promise<string[]> {
  if (isSupabaseConfigured()) {
    return (await getSubscriptionOrderBatchIndexFromSupabase(customerId)) ?? [];
  }

  const indexValue = await kv.get<string[] | ''>(batchIndexKvKey(customerId));

  return typeof indexValue === 'string' || !indexValue ? [] : indexValue;
}

export async function getSubscriptionOrderBatchesForCustomer(
  customerId: number,
): Promise<Map<string, SubscriptionOrderBatch>> {
  if (isSupabaseConfigured()) {
    const rows = await getSubscriptionOrderBatchesForCustomerFromSupabase(customerId);

    return new Map(rows.map((row) => [row.storageKey, row.batch]));
  }

  const keys = await getSubscriptionOrderBatchIndex(customerId);
  const entries = await Promise.all(
    keys.map(async (storageKey) => {
      const batch = await readBatch(storageKey);

      return batch ? ([storageKey, batch] as const) : null;
    }),
  );

  return new Map(
    entries.filter((entry): entry is readonly [string, SubscriptionOrderBatch] => Boolean(entry)),
  );
}

export async function removeSubscriptionOrderBatch(
  storageKey: string,
  customerId: number,
): Promise<void> {
  await deleteBatch(storageKey, customerId);
}
