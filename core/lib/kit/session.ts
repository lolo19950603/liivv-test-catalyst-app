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

async function persistKitSession(cartId: string, next: KitSession): Promise<void> {
  await kv.set(kitSessionKey(cartId), next);
  await setKitSessionCookie(cartId, next);

  if (isSupabaseConfigured()) {
    await setCartKitSessionInSupabase(cartId, next);
  }
}

export async function appendKitToSession(cartId: string, kit: KitRecord): Promise<void> {
  const existing = (await getKitSession(cartId)) ?? { kits: [] };

  await persistKitSession(cartId, {
    kits: [...existing.kits, kit],
  });
}

export async function updateKitShipQuantity(
  cartId: string,
  kitId: string,
  quantity: number,
): Promise<void> {
  const existing = (await getKitSession(cartId)) ?? { kits: [] };

  if (quantity <= 0) {
    await persistKitSession(cartId, {
      kits: existing.kits.filter((kit) => kit.kitId !== kitId),
    });

    return;
  }

  await persistKitSession(cartId, {
    kits: existing.kits.map((kit) => (kit.kitId === kitId ? { ...kit, quantity } : kit)),
  });
}

export async function updateKitItemQuantity(
  cartId: string,
  kitId: string,
  productEntityId: number,
  quantity: number,
): Promise<void> {
  if (quantity <= 0) {
    await removeKitItemFromSession(cartId, kitId, productEntityId);

    return;
  }

  const existing = (await getKitSession(cartId)) ?? { kits: [] };

  await persistKitSession(cartId, {
    kits: existing.kits.map((kit) => {
      if (kit.kitId !== kitId) {
        return kit;
      }

      return {
        ...kit,
        items: kit.items.map((item) =>
          item.productEntityId === productEntityId ? { ...item, quantity } : item,
        ),
      };
    }),
  });
}

export async function removeKitItemFromSession(
  cartId: string,
  kitId: string,
  productEntityId: number,
): Promise<void> {
  const existing = (await getKitSession(cartId)) ?? { kits: [] };

  await persistKitSession(cartId, {
    kits: existing.kits
      .map((kit) => {
        if (kit.kitId !== kitId) {
          return kit;
        }

        return {
          ...kit,
          items: kit.items.filter((item) => item.productEntityId !== productEntityId),
        };
      })
      .filter((kit) => kit.items.length > 0),
  });
}
