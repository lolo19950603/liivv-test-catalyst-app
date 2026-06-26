import 'server-only';

import type { SubscriptionLineMeta } from '~/lib/checkout/types';

import { getSupabaseClient, isSupabaseConfigured } from './client';

export interface CartSubscriptionLinesRecord {
  lines: SubscriptionLineMeta[];
  updatedAt: string | null;
}

export async function getCartSubscriptionLinesRecordFromSupabase(
  cartId: string,
): Promise<CartSubscriptionLinesRecord> {
  if (!isSupabaseConfigured()) {
    return { lines: [], updatedAt: null };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cart_subscription_lines')
    .select('lines, updated_at')
    .eq('cart_id', cartId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load cart subscription lines: ${error.message}`);
  }

  if (!data) {
    return { lines: [], updatedAt: null };
  }

  return {
    lines: (data.lines as SubscriptionLineMeta[]) ?? [],
    updatedAt: data.updated_at ?? null,
  };
}

export async function getCartSubscriptionLinesFromSupabase(
  cartId: string,
): Promise<SubscriptionLineMeta[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const record = await getCartSubscriptionLinesRecordFromSupabase(cartId);

  return record.lines;
}

export async function setCartSubscriptionLinesInSupabase(
  cartId: string,
  lines: SubscriptionLineMeta[],
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const record = await getCartSubscriptionLinesRecordFromSupabase(cartId);
  const saved = await setCartSubscriptionLinesOptimisticInSupabase(
    cartId,
    lines,
    record.updatedAt,
  );

  if (!saved) {
    throw new Error('Failed to save cart subscription lines');
  }
}

export async function setCartSubscriptionLinesOptimisticInSupabase(
  cartId: string,
  lines: SubscriptionLineMeta[],
  expectedUpdatedAt: string | null | undefined,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true;
  }

  const supabase = getSupabaseClient();
  const nextUpdatedAt = new Date().toISOString();

  if (expectedUpdatedAt == null) {
    const { data, error } = await supabase
      .from('cart_subscription_lines')
      .insert({
        cart_id: cartId,
        lines,
        updated_at: nextUpdatedAt,
      })
      .select('cart_id');

    if (!error && (data?.length ?? 0) > 0) {
      return true;
    }

    if (error?.code === '23505') {
      return false;
    }

    if (error) {
      throw new Error(`Failed to save cart subscription lines: ${error.message}`);
    }

    return false;
  }

  const { data, error } = await supabase
    .from('cart_subscription_lines')
    .update({
      lines,
      updated_at: nextUpdatedAt,
    })
    .eq('cart_id', cartId)
    .eq('updated_at', expectedUpdatedAt)
    .select('cart_id');

  if (error) {
    throw new Error(`Failed to save cart subscription lines: ${error.message}`);
  }

  return (data?.length ?? 0) > 0;
}

export async function deleteCartSubscriptionLinesFromSupabase(cartId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('cart_subscription_lines').delete().eq('cart_id', cartId);

  if (error) {
    throw new Error(`Failed to clear cart subscription lines: ${error.message}`);
  }
}
