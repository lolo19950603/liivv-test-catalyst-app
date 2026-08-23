import 'server-only';

import type { KitItem } from '~/lib/kit/types';

import { getSupabaseClient, isSupabaseConfigured } from './client';

export type SavedKitRow = {
  id: string;
  bigcommerce_customer_id: string;
  name: string;
  source_kit_name: string | null;
  fingerprint: string;
  items: KitItem[];
  created_at: string;
  updated_at: string;
};

export type UpsertSavedKitInput = {
  bigcommerceCustomerId: string;
  name: string;
  sourceKitName?: string;
  fingerprint: string;
  items: KitItem[];
};

export async function listSavedKits(
  bigcommerceCustomerId: string,
): Promise<SavedKitRow[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('saved_kits')
    .select('*')
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .order('updated_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to list saved kits: ${error.message}`);

    return [];
  }

  return (data ?? []).map(normalizeSavedKitRow);
}

export async function getSavedKit(
  bigcommerceCustomerId: string,
  kitId: string,
): Promise<SavedKitRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('saved_kits')
    .select('*')
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .eq('id', kitId)
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load saved kit: ${error.message}`);

    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeSavedKitRow(data);
}

export async function upsertSavedKit(input: UpsertSavedKitInput): Promise<SavedKitRow | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('saved_kits')
    .upsert(
      {
        bigcommerce_customer_id: input.bigcommerceCustomerId,
        name: input.name,
        source_kit_name: input.sourceKitName ?? null,
        fingerprint: input.fingerprint,
        items: input.items,
        updated_at: now,
      },
      { onConflict: 'bigcommerce_customer_id,fingerprint' },
    )
    .select('*')
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to upsert saved kit: ${error.message}`);

    return null;
  }

  return data ? normalizeSavedKitRow(data) : null;
}

export async function updateSavedKitName(
  bigcommerceCustomerId: string,
  kitId: string,
  name: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('saved_kits')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .eq('id', kitId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to rename saved kit: ${error.message}`);

    return false;
  }

  return true;
}

export async function deleteSavedKitsForCustomer(
  bigcommerceCustomerId: string,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('saved_kits')
    .delete()
    .eq('bigcommerce_customer_id', bigcommerceCustomerId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to delete saved kits for customer: ${error.message}`);
  }
}

export async function deleteSavedKit(
  bigcommerceCustomerId: string,
  kitId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('saved_kits')
    .delete()
    .eq('bigcommerce_customer_id', bigcommerceCustomerId)
    .eq('id', kitId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to delete saved kit: ${error.message}`);

    return false;
  }

  return true;
}

function normalizeSavedKitRow(row: Record<string, unknown>): SavedKitRow {
  return {
    id: String(row.id),
    bigcommerce_customer_id: String(row.bigcommerce_customer_id),
    name: String(row.name),
    source_kit_name: row.source_kit_name != null ? String(row.source_kit_name) : null,
    fingerprint: String(row.fingerprint),
    items: (row.items as KitItem[]) ?? [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
