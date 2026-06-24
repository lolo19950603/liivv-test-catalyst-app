import 'server-only';

import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import { findMatchingCartLineItem } from '~/lib/checkout/find-cart-line-item';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import { kv } from '~/lib/kv';
import {
  getCartSubscriptionLinesFromSupabase,
  setCartSubscriptionLinesInSupabase,
  deleteCartSubscriptionLinesFromSupabase,
} from '~/lib/supabase/cart-subscription-lines-store';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import {
  mergeSubscriptionLinesByIdentity,
  productOptionsMatch,
  subscriptionLineIdentityKey,
} from './subscription-line-key';
import type { SubscriptionLineMeta } from './types';

function subscriptionLinesKey(cartId: string): string {
  return `checkout:subscription-lines:${cartId}`;
}

async function loadSubscriptionLines(cartId: string): Promise<SubscriptionLineMeta[]> {
  if (isSupabaseConfigured()) {
    return (await getCartSubscriptionLinesFromSupabase(cartId)) ?? [];
  }

  return (await kv.get<SubscriptionLineMeta[]>(subscriptionLinesKey(cartId))) ?? [];
}

async function persistSubscriptionLines(
  cartId: string,
  lines: SubscriptionLineMeta[],
): Promise<void> {
  if (isSupabaseConfigured()) {
    await setCartSubscriptionLinesInSupabase(cartId, lines);

    return;
  }

  await kv.set(subscriptionLinesKey(cartId), lines);
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
  const lines = await getSubscriptionLinesForCart(cartId);

  if (lines.length === 0) {
    return lines;
  }

  let changed = false;
  const reconciled = lines.map((line) => {
    const matchedLine = findMatchingCartLineItem(
      cartLineItems,
      line.productEntityId,
      line.productOptions,
    );

    if (!matchedLine) {
      return line;
    }

    const nextCartLineItemEntityId = String(matchedLine.entityId);

    if (line.cartLineItemEntityId === nextCartLineItemEntityId) {
      return line;
    }

    changed = true;

    return {
      ...line,
      cartLineItemEntityId: nextCartLineItemEntityId,
    };
  });

  if (!changed) {
    return lines;
  }

  const normalized = normalizeSubscriptionLines(reconciled);

  await persistSubscriptionLines(cartId, normalized);

  return normalized;
}

export async function addSubscriptionLineToCart(
  cartId: string,
  line: SubscriptionLineMeta,
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);
  const identityKey = subscriptionLineIdentityKey(line);
  const existingIndex = existing.findIndex(
    (entry) => subscriptionLineIdentityKey(entry) === identityKey,
  );

  if (existingIndex >= 0) {
    const current = existing[existingIndex]!;

    existing[existingIndex] = {
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
    await persistSubscriptionLines(cartId, existing);

    return;
  }

  await persistSubscriptionLines(cartId, [...existing, line]);
}

export async function adjustSubscriptionQuantity(
  cartId: string,
  subscriptionLineKey: string,
  delta: number,
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);
  const index = existing.findIndex(
    (entry) => subscriptionLineIdentityKey(entry) === subscriptionLineKey,
  );

  if (index < 0) {
    return;
  }

  const entry = existing[index]!;
  const nextQuantity = entry.quantity + delta;

  if (nextQuantity <= 0) {
    await persistSubscriptionLines(
      cartId,
      existing.filter((_, entryIndex) => entryIndex !== index),
    );

    return;
  }

  existing[index] = { ...entry, quantity: nextQuantity };
  await persistSubscriptionLines(cartId, existing);
}

export async function removeSubscriptionLineFromCart(
  cartId: string,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  subscriptionLineKey?: string,
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);

  await persistSubscriptionLines(
    cartId,
    existing.filter((entry) => {
      if (subscriptionLineKey) {
        return subscriptionLineIdentityKey(entry) !== subscriptionLineKey;
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

    return;
  }

  await kv.set(subscriptionLinesKey(cartId), []);
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
