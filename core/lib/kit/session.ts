import 'server-only';

import { kv } from '~/lib/kv';

import type { KitRecord, KitSession } from './types';

function kitSessionKey(cartId: string): string {
  return `kit:${cartId}`;
}

export async function getKitSession(cartId: string): Promise<KitSession | null> {
  return kv.get<KitSession>(kitSessionKey(cartId));
}

export async function appendKitToSession(cartId: string, kit: KitRecord): Promise<void> {
  const existing = (await getKitSession(cartId)) ?? { kits: [] };

  await kv.set(kitSessionKey(cartId), {
    kits: [...existing.kits, kit],
  });
}
