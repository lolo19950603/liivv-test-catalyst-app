import 'server-only';

import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { kv } from '~/lib/kv';
import {
  getCartSubscriptionLinesRecordFromSupabase,
  setCartSubscriptionLinesOptimisticInSupabase,
  deleteCartSubscriptionLinesFromSupabase,
} from '~/lib/supabase/cart-subscription-lines-store';
import { isSupabaseConfigured } from '~/lib/supabase/client';

import {
  clearSubscriptionMetadataPending,
  markSubscriptionMetadataPending,
  unmarkSubscriptionMetadataPending,
} from './subscription-metadata-pending';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import { reconcileSubscriptionLinesToCartItems } from './reconcile-subscription-cart-lines';
import {
  mergeSubscriptionLinesByIdentity,
  productOptionsMatch,
  subscriptionLineIdentityKey,
} from './subscription-line-key';
import type { SubscriptionLineMeta } from './types';

function subscriptionLinesKey(cartId: string): string {
  return `checkout:subscription-lines:${cartId}`;
}

const MAX_PERSIST_ATTEMPTS = 5;

async function loadSubscriptionLinesRecord(cartId: string): Promise<{
  lines: SubscriptionLineMeta[];
  updatedAt: string | null;
}> {
  if (isSupabaseConfigured()) {
    return getCartSubscriptionLinesRecordFromSupabase(cartId);
  }

  const lines = (await kv.get<SubscriptionLineMeta[]>(subscriptionLinesKey(cartId))) ?? [];

  return { lines, updatedAt: null };
}

async function loadSubscriptionLines(cartId: string): Promise<SubscriptionLineMeta[]> {
  const record = await loadSubscriptionLinesRecord(cartId);

  return record.lines;
}

function subscriptionCartMappingsChanged(
  current: SubscriptionLineMeta[],
  next: SubscriptionLineMeta[],
): boolean {
  if (current.length !== next.length) {
    return true;
  }

  const nextByIdentity = new Map(
    next.map((line) => [subscriptionLineIdentityKey(line), line]),
  );

  return current.some((line) => {
    const reconciled = nextByIdentity.get(subscriptionLineIdentityKey(line));

    return (
      !reconciled || reconciled.cartLineItemEntityId !== line.cartLineItemEntityId
    );
  });
}

async function mutateSubscriptionLines(
  cartId: string,
  mutator: (lines: SubscriptionLineMeta[]) => SubscriptionLineMeta[],
): Promise<SubscriptionLineMeta[]> {
  await markSubscriptionMetadataPending(cartId);

  try {
    return await mutateSubscriptionLinesInner(cartId, mutator);
  } finally {
    await unmarkSubscriptionMetadataPending(cartId);
  }
}

async function mutateSubscriptionLinesInner(
  cartId: string,
  mutator: (lines: SubscriptionLineMeta[]) => SubscriptionLineMeta[],
): Promise<SubscriptionLineMeta[]> {
  for (let attempt = 0; attempt < MAX_PERSIST_ATTEMPTS; attempt += 1) {
    const record = await loadSubscriptionLinesRecord(cartId);
    const normalizedCurrent = normalizeSubscriptionLines(record.lines);
    const nextLines = normalizeSubscriptionLines(mutator(record.lines));

    if (subscriptionLinesAreEqual(normalizedCurrent, nextLines)) {
      return nextLines;
    }

    if (isSupabaseConfigured()) {
      const saved = await setCartSubscriptionLinesOptimisticInSupabase(
        cartId,
        nextLines,
        record.updatedAt,
      );

      if (saved) {
        return nextLines;
      }

      continue;
    }

    await kv.set(subscriptionLinesKey(cartId), nextLines);

    return nextLines;
  }

  throw new Error('Failed to save cart subscription lines after concurrent updates');
}

export function subscriptionLinesAreEqual(
  left: SubscriptionLineMeta[],
  right: SubscriptionLineMeta[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const rightByIdentity = new Map(
    right.map((line) => [subscriptionLineIdentityKey(line), line]),
  );

  return left.every((line) => {
    const other = rightByIdentity.get(subscriptionLineIdentityKey(line));

    if (!other) {
      return false;
    }

    return (
      line.quantity === other.quantity &&
      line.cartLineItemEntityId === other.cartLineItemEntityId &&
      line.billingCycleAnchor === other.billingCycleAnchor &&
      line.productEntityId === other.productEntityId
    );
  });
}

function normalizeSubscriptionLines(lines: SubscriptionLineMeta[]): SubscriptionLineMeta[] {
  return mergeSubscriptionLinesByIdentity(
    lines.map((line) => ({
      ...line,
      quantity: line.quantity ?? 1,
      cartLineItemEntityId: line.cartLineItemEntityId
        ? String(line.cartLineItemEntityId)
        : undefined,
    })),
  );
}

export async function getSubscriptionLinesForCart(
  cartId: string,
): Promise<SubscriptionLineMeta[]> {
  const lines = await loadSubscriptionLines(cartId);

  return normalizeSubscriptionLines(lines);
}

interface CartLineItemForReconciliation {
  entityId: string;
  productEntityId: number;
  selectedOptions: Parameters<typeof mapCartSelectedOptionsToProductOptions>[0];
}

export async function reconcileSubscriptionLinesWithCart(
  cartId: string,
  cartLineItems: CartLineItemForReconciliation[],
): Promise<SubscriptionLineMeta[]> {
  return mutateSubscriptionLines(cartId, (lines) => {
    if (lines.length === 0) {
      return lines;
    }

    const reconciled = normalizeSubscriptionLines(
      reconcileSubscriptionLinesToCartItems(lines, cartLineItems),
    );

    if (!subscriptionCartMappingsChanged(lines, reconciled)) {
      return lines;
    }

    return reconciled;
  });
}

export async function addSubscriptionLineToCart(
  cartId: string,
  line: SubscriptionLineMeta,
): Promise<void> {
  await mutateSubscriptionLines(cartId, (existing) => {
    const identityKey = subscriptionLineIdentityKey(line);
    const existingIndex = existing.findIndex(
      (entry) => subscriptionLineIdentityKey(entry) === identityKey,
    );

    if (existingIndex >= 0) {
      const current = existing[existingIndex]!;
      const next = [...existing];

      next[existingIndex] = {
        ...current,
        ...line,
        cartLineItemEntityId: (line.cartLineItemEntityId ?? current.cartLineItemEntityId)
          ? String(line.cartLineItemEntityId ?? current.cartLineItemEntityId)
          : undefined,
        productOptions:
          line.productOptions.length >= current.productOptions.length
            ? line.productOptions
            : current.productOptions,
        quantity: current.quantity + line.quantity,
      };

      return next;
    }

    return [...existing, line];
  });
}

export async function adjustSubscriptionQuantity(
  cartId: string,
  subscriptionLineKey: string,
  delta: number,
): Promise<void> {
  await mutateSubscriptionLines(cartId, (existing) => {
    const index = existing.findIndex(
      (entry) => subscriptionLineIdentityKey(entry) === subscriptionLineKey,
    );

    if (index < 0) {
      return existing;
    }

    const entry = existing[index]!;
    const nextQuantity = entry.quantity + delta;

    if (nextQuantity <= 0) {
      return existing.filter((_, entryIndex) => entryIndex !== index);
    }

    const next = [...existing];

    next[index] = { ...entry, quantity: nextQuantity };

    return next;
  });
}

export async function removeSubscriptionLineFromCart(
  cartId: string,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  subscriptionLineKey?: string,
  cartLineItemEntityId?: string,
): Promise<void> {
  await mutateSubscriptionLines(cartId, (existing) =>
    existing.filter((entry) => {
      if (subscriptionLineKey) {
        return subscriptionLineIdentityKey(entry) !== subscriptionLineKey;
      }

      if (cartLineItemEntityId) {
        return String(entry.cartLineItemEntityId ?? '') !== String(cartLineItemEntityId);
      }

      return !(
        entry.productEntityId === productEntityId &&
        productOptionsMatch(entry.productOptions, productOptions)
      );
    }),
  );
}

export async function clearSubscriptionLinesForCart(cartId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteCartSubscriptionLinesFromSupabase(cartId);
  } else {
    await kv.set(subscriptionLinesKey(cartId), []);
  }

  await clearSubscriptionMetadataPending(cartId);
}

export function findSubscriptionLineByKey(
  lines: SubscriptionLineMeta[],
  subscriptionLineKey: string,
): SubscriptionLineMeta | undefined {
  return lines.find((line) => subscriptionLineIdentityKey(line) === subscriptionLineKey);
}

export function buildSubscriptionLineMeta({
  productEntityId,
  sku,
  productName,
  productOptions,
  billingInterval,
  billingCycleAnchor,
  unitAmount,
  currency,
  cartLineItemEntityId,
  quantity = 1,
}: {
  productEntityId: number;
  sku: string;
  productName: string;
  productOptions: ProductOptionSelection[];
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
  unitAmount: number;
  currency: string;
  cartLineItemEntityId?: string;
  quantity?: number;
}): SubscriptionLineMeta {
  return {
    productEntityId,
    sku,
    productName,
    productOptions,
    billingInterval,
    billingCycleAnchor,
    unitAmount,
    currency,
    quantity,
    cartLineItemEntityId,
  };
}
