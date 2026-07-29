import 'server-only';

import { kv } from '~/lib/kv';
import {
  getCartKitSessionFromSupabase,
  setCartKitSessionInSupabase,
} from '~/lib/supabase/cart-kit-sessions-store';
import { isSupabaseConfigured } from '~/lib/supabase/client';

import { getKitSessionFromCookie, setKitSessionCookie } from './cookie';
import type { KitRecord, KitSession } from './types';

function kitSessionKey(cartId: string): string {
  return `kit:${cartId}`;
}

export async function getKitSession(cartId: string): Promise<KitSession | null> {
  if (isSupabaseConfigured()) {
    const fromSupabase = await getCartKitSessionFromSupabase(cartId);

    if (fromSupabase && fromSupabase.kits.length > 0) {
      return fromSupabase;
    }
  }

  const fromCookie = await getKitSessionFromCookie(cartId);

  if (fromCookie && fromCookie.kits.length > 0) {
    return fromCookie;
  }

  return kv.get<KitSession>(kitSessionKey(cartId));
}

export async function appendKitToSession(cartId: string, kit: KitRecord): Promise<void> {
  const existing = (await getKitSession(cartId)) ?? { kits: [] };
  const next: KitSession = {
    kits: [...existing.kits, kit],
  };

  await kv.set(kitSessionKey(cartId), next);
  await setKitSessionCookie(cartId, next);

  if (isSupabaseConfigured()) {
    await setCartKitSessionInSupabase(cartId, next);
  }
}
