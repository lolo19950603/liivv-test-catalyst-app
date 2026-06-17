import 'server-only';

import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import { kv } from '~/lib/kv';
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

export async function getSubscriptionLinesForCart(
  cartId: string,
): Promise<SubscriptionLineMeta[]> {
  const lines = (await kv.get<SubscriptionLineMeta[]>(subscriptionLinesKey(cartId))) ?? [];

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
    await kv.set(subscriptionLinesKey(cartId), existing);

    return;
  }

  await kv.set(subscriptionLinesKey(cartId), [...existing, line]);
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
    await kv.set(
      subscriptionLinesKey(cartId),
      existing.filter((_, entryIndex) => entryIndex !== index),
    );

    return;
  }

  existing[index] = { ...entry, quantity: nextQuantity };
  await kv.set(subscriptionLinesKey(cartId), existing);
}

export async function removeSubscriptionLineFromCart(
  cartId: string,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  subscriptionLineKey?: string,
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);

  await kv.set(
    subscriptionLinesKey(cartId),
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
