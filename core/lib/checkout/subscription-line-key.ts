import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import { productOptionsCover, productOptionsKey } from './product-options-key';
import type { CheckoutLineItemSnapshot, SubscriptionLineMeta } from './types';

export type SubscriptionLineIdentity = {
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
};

/** Distinguishes billing plans: interval, interval count, and start date. */
export function subscriptionBillingKey({
  billingInterval,
  billingCycleAnchor,
}: {
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
}): string {
  return `${billingInterval.interval}-${billingInterval.intervalCount}-${billingCycleAnchor ?? 'today'}`;
}

/** Unique key for a subscription plan on a product (options + billing schedule). */
export function subscriptionLineIdentityKey(line: SubscriptionLineIdentity): string {
  return [
    line.productEntityId,
    productOptionsKey(line.productOptions) || 'default',
    subscriptionBillingKey(line),
  ].join('~');
}

export function checkoutSnapshotKey(snapshot: CheckoutLineItemSnapshot): string {
  if (snapshot.isSubscription) {
    if (snapshot.billingInterval) {
      return [
        snapshot.lineItemEntityId,
        subscriptionLineIdentityKey({
          productEntityId: snapshot.productEntityId,
          productOptions: snapshot.productOptions,
          billingInterval: snapshot.billingInterval,
          billingCycleAnchor: snapshot.billingCycleAnchor,
        }),
        String(snapshot.quantity),
      ].join(':');
    }

    return [
      snapshot.lineItemEntityId,
      'subscription',
      String(snapshot.productEntityId),
      productOptionsKey(snapshot.productOptions) || 'default',
      String(snapshot.billingCycleAnchor ?? 'today'),
      String(snapshot.quantity),
    ].join(':');
  }

  return [
    snapshot.lineItemEntityId,
    'one-time',
    String(snapshot.productEntityId),
    productOptionsKey(snapshot.productOptions) || 'default',
    String(snapshot.quantity),
  ].join(':');
}

export function productOptionsMatch(
  stored: ProductOptionSelection[],
  cart: ProductOptionSelection[],
): boolean {
  const storedKey = productOptionsKey(stored);
  const cartKey = productOptionsKey(cart);

  if (storedKey === cartKey) {
    return true;
  }

  return productOptionsCover(stored, cart) || productOptionsCover(cart, stored);
}

export function subscriptionLineMatchesCartLine(
  line: SubscriptionLineMeta,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  cartLineItemEntityId?: string,
): boolean {
  if (line.productEntityId !== productEntityId) {
    return false;
  }

  if ((line.quantity ?? 0) <= 0) {
    return false;
  }

  if (!productOptionsMatch(line.productOptions, productOptions)) {
    return false;
  }

  if (!cartLineItemEntityId) {
    return true;
  }

  if (line.cartLineItemEntityId && line.cartLineItemEntityId !== cartLineItemEntityId) {
    return false;
  }

  return true;
}

/** All subscription rows for a product variant, regardless of BC cart line assignment. */
export function getSubscriptionLinesForProductGroup(
  lines: SubscriptionLineMeta[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): SubscriptionLineMeta[] {
  return lines
    .filter(
      (line) =>
        line.productEntityId === productEntityId &&
        (line.quantity ?? 0) > 0 &&
        productOptionsMatch(line.productOptions, productOptions),
    )
    .sort((left, right) =>
      subscriptionLineIdentityKey(left).localeCompare(subscriptionLineIdentityKey(right)),
    );
}

export function getSubscriptionLinesForCartLine(
  lines: SubscriptionLineMeta[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  cartLineItemEntityId?: string,
): SubscriptionLineMeta[] {
  const matchingLines = getSubscriptionLinesForProductGroup(
    lines,
    productEntityId,
    productOptions,
  );

  if (!cartLineItemEntityId || matchingLines.length === 0) {
    return matchingLines.sort((left, right) =>
      subscriptionLineIdentityKey(left).localeCompare(subscriptionLineIdentityKey(right)),
    );
  }

  const scopedLines = matchingLines.filter(
    (line) => !line.cartLineItemEntityId || line.cartLineItemEntityId === cartLineItemEntityId,
  );

  const resolvedLines =
    scopedLines.length > 0
      ? scopedLines
      : matchingLines.filter((line) => !line.cartLineItemEntityId);

  return resolvedLines.sort((left, right) =>
    subscriptionLineIdentityKey(left).localeCompare(subscriptionLineIdentityKey(right)),
  );
}

export function getTotalSubscriptionQuantityForCartLine(
  lines: SubscriptionLineMeta[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
  cartLineItemEntityId?: string,
): number {
  return getSubscriptionLinesForCartLine(
    lines,
    productEntityId,
    productOptions,
    cartLineItemEntityId,
  ).reduce((total, line) => total + line.quantity, 0);
}

/** Merge only rows with the exact same subscription identity (never across billing plans). */
export function mergeSubscriptionLinesByIdentity<T extends SubscriptionLineMeta>(
  lines: T[],
): T[] {
  const merged = new Map<string, T>();

  for (const line of lines) {
    const mergeKey = subscriptionLineIdentityKey(line);
    const existing = merged.get(mergeKey);

    if (!existing) {
      merged.set(mergeKey, line);
      continue;
    }

    merged.set(mergeKey, {
      ...existing,
      ...line,
      cartLineItemEntityId: line.cartLineItemEntityId ?? existing.cartLineItemEntityId,
      productOptions:
        line.productOptions.length >= existing.productOptions.length
          ? line.productOptions
          : existing.productOptions,
      quantity: existing.quantity + line.quantity,
    });
  }

  return [...merged.values()];
}
