import 'server-only';

import { getCart } from '~/app/[locale]/(default)/cart/page-data';
import { getCartSubscriptionLinesRecordFromSupabase } from '~/lib/supabase/cart-subscription-lines-store';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { getCartId } from '~/lib/cart';

import {
  isSubscriptionMetadataPending,
} from './subscription-metadata-pending';
import {
  getSubscriptionLinesForCart,
  reconcileSubscriptionLinesWithCart,
  subscriptionLinesAreEqual,
} from './subscription-lines';

const METADATA_SETTLE_MS = 500;
const STABILITY_POLL_MS = 300;

async function getMetadataUpdatedAt(cartId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const record = await getCartSubscriptionLinesRecordFromSupabase(cartId);

  return record.updatedAt;
}

function isMetadataRecordSettled(updatedAt: string | null): boolean {
  if (!updatedAt) {
    return true;
  }

  return Date.now() - new Date(updatedAt).getTime() >= METADATA_SETTLE_MS;
}

export async function isCheckoutSubscriptionMetadataReady(
  cartId: string,
): Promise<boolean> {
  if (await isSubscriptionMetadataPending(cartId)) {
    return false;
  }

  const lines = await getSubscriptionLinesForCart(cartId);

  if (lines.length === 0) {
    return true;
  }

  if (!isSupabaseConfigured()) {
    return true;
  }

  const updatedAt = await getMetadataUpdatedAt(cartId);

  return isMetadataRecordSettled(updatedAt);
}

export async function ensureCheckoutSubscriptionMetadataReady(): Promise<{ ready: boolean }> {
  const cartId = await getCartId();

  if (!cartId) {
    return { ready: true };
  }

  if (await isSubscriptionMetadataPending(cartId)) {
    return { ready: false };
  }

  const firstLines = await getSubscriptionLinesForCart(cartId);

  if (firstLines.length === 0) {
    return { ready: true };
  }

  const firstUpdatedAt = await getMetadataUpdatedAt(cartId);

  await new Promise((resolve) => {
    setTimeout(resolve, STABILITY_POLL_MS);
  });

  if (await isSubscriptionMetadataPending(cartId)) {
    return { ready: false };
  }

  const secondLines = await getSubscriptionLinesForCart(cartId);
  const secondUpdatedAt = await getMetadataUpdatedAt(cartId);
  const metadataStable =
    firstUpdatedAt === secondUpdatedAt &&
    subscriptionLinesAreEqual(firstLines, secondLines);

  if (!metadataStable) {
    return { ready: false };
  }

  if (!isMetadataRecordSettled(secondUpdatedAt)) {
    return { ready: false };
  }

  const data = await getCart({ cartId });
  const cart = data.site.cart;

  if (cart) {
    await reconcileSubscriptionLinesWithCart(cartId, [
      ...cart.lineItems.physicalItems.filter((item) => !item.parentEntityId),
      ...cart.lineItems.digitalItems.filter((item) => !item.parentEntityId),
    ]);
  }

  return { ready: true };
}
