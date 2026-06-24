import 'server-only';

import type { SubscriptionLineMeta } from '~/lib/checkout/types';

import { getSupabaseClient, isSupabaseConfigured } from './client';

export async function getCartSubscriptionLinesFromSupabase(
  cartId: string,
): Promise<SubscriptionLineMeta[] | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cart_subscription_lines')
    .select('lines')
    .eq('cart_id', cartId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load cart subscription lines: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return (data.lines as SubscriptionLineMeta[]) ?? [];
}

export async function setCartSubscriptionLinesInSupabase(
  cartId: string,
  lines: SubscriptionLineMeta[],
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('cart_subscription_lines').upsert(
    {
      cart_id: cartId,
      lines,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'cart_id' },
  );

  if (error) {
    throw new Error(`Failed to save cart subscription lines: ${error.message}`);
  }
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
