import 'server-only';

import type { KitRecord, KitSession } from '~/lib/kit/types';

import { getSupabaseClient, isSupabaseConfigured } from './client';

export async function getCartKitSessionFromSupabase(cartId: string): Promise<KitSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cart_kit_sessions')
    .select('kits')
    .eq('cart_id', cartId)
    .maybeSingle();

  if (error) {
    // Table may not exist yet — callers fall back to cookie/KV.
    // eslint-disable-next-line no-console
    console.error(`Failed to load cart kit session: ${error.message}`);

    return null;
  }

  if (!data) {
    return null;
  }

  const kits = (data.kits as KitRecord[]) ?? [];

  return { kits };
}

export async function setCartKitSessionInSupabase(
  cartId: string,
  session: KitSession,
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('cart_kit_sessions').upsert(
    {
      cart_id: cartId,
      kits: session.kits,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'cart_id' },
  );

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to save cart kit session: ${error.message}`);

    return false;
  }

  return true;
}
