import 'server-only';

import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface BatchedSubscriptionOrderLineRow {
  invoiceReferenceId: string;
  stripeSubscriptionId: string;
  productEntityId?: number;
  productName: string;
  productSku?: string;
  productOptions?: Array<{ optionEntityId: number; valueEntityId: number }>;
  quantity: number;
  unitAmountExTax: number;
  unitAmountIncTax: number;
}

export interface SubscriptionOrderBatchRowData {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
  shippingMetadata: Record<string, string>;
  currencyCode: string;
  orderType: 'initial' | 'renewal';
  items: BatchedSubscriptionOrderLineRow[];
  updatedAt: number;
}

interface SubscriptionOrderBatchDbRow {
  storage_key: string;
  customer_id: number;
  day_key: string;
  shipping_address_key: string;
  shipping_metadata: Record<string, string>;
  currency_code: string;
  order_type: 'initial' | 'renewal';
  items: BatchedSubscriptionOrderLineRow[];
  updated_at: string;
}

function rowToBatch(row: SubscriptionOrderBatchDbRow): SubscriptionOrderBatchRowData | null {
  const items = Array.isArray(row.items) ? row.items : [];

  if (items.length === 0) {
    return null;
  }

  return {
    customerId: row.customer_id,
    dayKey: row.day_key,
    shippingAddressKey: row.shipping_address_key,
    shippingMetadata: row.shipping_metadata ?? {},
    currencyCode: row.currency_code,
    orderType: row.order_type,
    items,
    updatedAt: Date.parse(row.updated_at),
  };
}

function batchToRow(
  storageKey: string,
  batch: SubscriptionOrderBatchRowData,
): SubscriptionOrderBatchDbRow {
  return {
    storage_key: storageKey,
    customer_id: batch.customerId,
    day_key: batch.dayKey,
    shipping_address_key: batch.shippingAddressKey,
    shipping_metadata: batch.shippingMetadata,
    currency_code: batch.currencyCode,
    order_type: batch.orderType,
    items: batch.items,
    updated_at: new Date(batch.updatedAt).toISOString(),
  };
}

export async function getSubscriptionOrderBatchFromSupabase(
  storageKey: string,
): Promise<SubscriptionOrderBatchRowData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscription_order_batches')
    .select('*')
    .eq('storage_key', storageKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load subscription order batch: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return rowToBatch(data as SubscriptionOrderBatchDbRow);
}

export async function getSubscriptionOrderBatchesForCustomerFromSupabase(
  customerId: number,
): Promise<Array<{ storageKey: string; batch: SubscriptionOrderBatchRowData }>> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscription_order_batches')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(`Failed to load subscription order batches: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => {
      const batch = rowToBatch(row as SubscriptionOrderBatchDbRow);

      if (!batch) {
        return null;
      }

      return {
        storageKey: (row as SubscriptionOrderBatchDbRow).storage_key,
        batch,
      };
    })
    .filter((entry): entry is { storageKey: string; batch: SubscriptionOrderBatchRowData } =>
      Boolean(entry),
    );
}

export async function getSubscriptionOrderBatchIndexFromSupabase(
  customerId: number,
): Promise<string[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscription_order_batches')
    .select('storage_key, items')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(`Failed to load subscription order batch index: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => {
      const items = (row as { items: BatchedSubscriptionOrderLineRow[] }).items;

      return Array.isArray(items) && items.length > 0;
    })
    .map((row) => (row as { storage_key: string }).storage_key);
}

export async function saveSubscriptionOrderBatchInSupabase(
  storageKey: string,
  batch: SubscriptionOrderBatchRowData,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('subscription_order_batches')
    .upsert(batchToRow(storageKey, batch), { onConflict: 'storage_key' });

  if (error) {
    throw new Error(`Failed to save subscription order batch: ${error.message}`);
  }
}

export async function deleteSubscriptionOrderBatchFromSupabase(storageKey: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('subscription_order_batches')
    .delete()
    .eq('storage_key', storageKey);

  if (error) {
    throw new Error(`Failed to delete subscription order batch: ${error.message}`);
  }
}
