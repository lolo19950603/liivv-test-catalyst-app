import 'server-only';

import type { KitRecord, KitSession } from '~/lib/kit/types';

import { getSupabaseClient, isSupabaseConfigured } from './client';

/** PostgREST: table missing from schema cache (not migrated yet). */
function isMissingTableError(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST205' ||
    (error.message?.includes('schema cache') ?? false) ||
    (error.message?.includes('does not exist') ?? false)
  );
}

function logCartKitSessionError(action: 'load' | 'save', error: { code?: string; message: string }) {
  // Expected until cart_kit_sessions is created — callers fall back to cookie/KV.
  if (isMissingTableError(error)) {
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`Failed to ${action} cart kit session: ${error.message}`);
}

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
    logCartKitSessionError('load', error);

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
    logCartKitSessionError('save', error);

    return false;
  }

  return true;
}
