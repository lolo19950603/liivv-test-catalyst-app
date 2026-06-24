import 'server-only';

import type {
  FinalizedShipmentRecord,
  ShipmentChargedItem,
  ShipmentOutcome,
  ShipmentSkippedItem,
} from '~/lib/stripe/subscription-shipment-records';

import { getSupabaseClient, isSupabaseConfigured } from './client';

interface ShipmentRecordRow {
  storage_key: string;
  customer_id: number;
  day_key: string;
  shipping_address_key: string;
  shipping_address_label: string;
  shipping_method_label: string | null;
  outcome: ShipmentOutcome;
  bigcommerce_order_id: number | null;
  charged_items: ShipmentChargedItem[];
  skipped_items: ShipmentSkippedItem[];
  finalized_at: number;
}

function rowToRecord(row: ShipmentRecordRow): FinalizedShipmentRecord {
  return {
    storageKey: row.storage_key,
    customerId: row.customer_id,
    dayKey: row.day_key,
    shippingAddressKey: row.shipping_address_key,
    shippingAddressLabel: row.shipping_address_label,
    shippingMethodLabel: row.shipping_method_label ?? undefined,
    outcome: row.outcome,
    bigcommerceOrderId: row.bigcommerce_order_id ?? undefined,
    chargedItems: row.charged_items,
    skippedItems: row.skipped_items,
    finalizedAt: row.finalized_at,
  };
}

function recordToRow(record: FinalizedShipmentRecord): ShipmentRecordRow {
  return {
    storage_key: record.storageKey,
    customer_id: record.customerId,
    day_key: record.dayKey,
    shipping_address_key: record.shippingAddressKey,
    shipping_address_label: record.shippingAddressLabel,
    shipping_method_label: record.shippingMethodLabel ?? null,
    outcome: record.outcome,
    bigcommerce_order_id: record.bigcommerceOrderId ?? null,
    charged_items: record.chargedItems,
    skipped_items: record.skippedItems,
    finalized_at: record.finalizedAt,
  };
}

export async function getFinalizedShipmentRecordFromSupabase(
  storageKey: string,
): Promise<FinalizedShipmentRecord | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finalized_shipment_records')
    .select('*')
    .eq('storage_key', storageKey)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load shipment record: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return rowToRecord(data as ShipmentRecordRow);
}

export async function getFinalizedShipmentsForCustomerFromSupabase(
  customerId: number,
): Promise<FinalizedShipmentRecord[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('finalized_shipment_records')
    .select('*')
    .eq('customer_id', customerId)
    .order('finalized_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load shipment history: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToRecord(row as ShipmentRecordRow));
}

export async function saveFinalizedShipmentRecordInSupabase(
  record: FinalizedShipmentRecord,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('finalized_shipment_records')
    .upsert(recordToRow(record), { onConflict: 'storage_key' });

  if (error) {
    throw new Error(`Failed to save shipment record: ${error.message}`);
  }
}
