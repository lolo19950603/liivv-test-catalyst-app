import 'server-only';

import { kv } from '~/lib/kv';
import {
  getFinalizedShipmentRecordFromSupabase,
  getFinalizedShipmentsForCustomerFromSupabase,
  saveFinalizedShipmentRecordInSupabase,
} from '~/lib/supabase/shipment-records-store';
import { isSupabaseConfigured } from '~/lib/supabase/client';

import { buildSubscriptionOrderBatchStorageKey } from './subscription-shipment-grouping';

export type ShipmentSkipReason = 'customer_skip' | 'payment_deadline' | 'payment_failed';

export interface ShipmentSkippedItem {
  subscriptionId: string;
  productName: string;
  quantity: number;
  reason: ShipmentSkipReason;
  productEntityId?: number;
}

export interface ShipmentChargedItem {
  subscriptionId: string;
  productName: string;
  quantity: number;
  productEntityId?: number;
}

export type ShipmentOutcome = 'ordered' | 'partial_skipped' | 'all_failed';

export interface FinalizedShipmentRecord {
  storageKey: string;
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
  shippingAddressLabel: string;
  shippingMethodLabel?: string;
  outcome: ShipmentOutcome;
  bigcommerceOrderId?: number;
  chargedItems: ShipmentChargedItem[];
  skippedItems: ShipmentSkippedItem[];
  finalizedAt: number;
}

function shipmentRecordKvKey(storageKey: string): string {
  return `stripe:shipment-record:${storageKey}`;
}

function shipmentHistoryIndexKvKey(customerId: number): string {
  return `stripe:shipment-history-index:${customerId}`;
}

export function buildShipmentStorageKey({
  customerId,
  dayKey,
  shippingAddressKey,
}: {
  customerId: number;
  dayKey: string;
  shippingAddressKey: string;
}): string {
  return buildSubscriptionOrderBatchStorageKey({ customerId, dayKey, shippingAddressKey });
}

export async function getFinalizedShipmentRecord(
  storageKey: string,
): Promise<FinalizedShipmentRecord | null> {
  if (isSupabaseConfigured()) {
    return getFinalizedShipmentRecordFromSupabase(storageKey);
  }

  const record = await kv.get<FinalizedShipmentRecord | ''>(shipmentRecordKvKey(storageKey));

  if (!record || typeof record === 'string') {
    return null;
  }

  return record;
}

export async function getFinalizedShipmentsForCustomer(
  customerId: number,
): Promise<FinalizedShipmentRecord[]> {
  if (isSupabaseConfigured()) {
    return (await getFinalizedShipmentsForCustomerFromSupabase(customerId)) ?? [];
  }

  const indexValue = await kv.get<string[] | ''>(shipmentHistoryIndexKvKey(customerId));
  const index = typeof indexValue === 'string' || !indexValue ? [] : indexValue;

  const records = await Promise.all(index.map((storageKey) => getFinalizedShipmentRecord(storageKey)));

  return records
    .filter((record): record is FinalizedShipmentRecord => record != null)
    .sort((left, right) => right.finalizedAt - left.finalizedAt);
}

export async function isShipmentFinalized(storageKey: string): Promise<boolean> {
  return Boolean(await getFinalizedShipmentRecord(storageKey));
}

export async function saveFinalizedShipmentRecord(record: FinalizedShipmentRecord): Promise<void> {
  if (isSupabaseConfigured()) {
    await saveFinalizedShipmentRecordInSupabase(record);

    return;
  }

  await kv.set(shipmentRecordKvKey(record.storageKey), record);

  const indexKey = shipmentHistoryIndexKvKey(record.customerId);
  const existingIndex = (await kv.get<string[] | ''>(indexKey)) ?? [];
  const normalizedIndex = typeof existingIndex === 'string' ? [] : existingIndex;

  if (normalizedIndex.includes(record.storageKey)) {
    return;
  }

  await kv.set(indexKey, [...normalizedIndex, record.storageKey]);
}

export async function getFinalizedShipmentStorageKeys(customerId: number): Promise<Set<string>> {
  const records = await getFinalizedShipmentsForCustomer(customerId);

  return new Set(records.map((record) => record.storageKey));
}
