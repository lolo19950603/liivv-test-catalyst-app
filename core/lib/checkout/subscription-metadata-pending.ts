import 'server-only';

import { kv } from '~/lib/kv';

const PENDING_TTL_SECONDS = 120;

function pendingKey(cartId: string): string {
  return `checkout:subscription-metadata-pending:${cartId}`;
}

export async function markSubscriptionMetadataPending(cartId: string): Promise<void> {
  const current = (await kv.get<number>(pendingKey(cartId))) ?? 0;

  await kv.set(pendingKey(cartId), current + 1, { ex: PENDING_TTL_SECONDS });
}

export async function unmarkSubscriptionMetadataPending(cartId: string): Promise<void> {
  const current = (await kv.get<number>(pendingKey(cartId))) ?? 0;

  if (current <= 1) {
    await kv.set(pendingKey(cartId), 0, { ex: 1 });
  } else {
    await kv.set(pendingKey(cartId), current - 1, { ex: PENDING_TTL_SECONDS });
  }
}

export async function isSubscriptionMetadataPending(cartId: string): Promise<boolean> {
  const current = await kv.get<number>(pendingKey(cartId));

  return (current ?? 0) > 0;
}

export async function clearSubscriptionMetadataPending(cartId: string): Promise<void> {
  await kv.set(pendingKey(cartId), 0, { ex: 1 });
}
