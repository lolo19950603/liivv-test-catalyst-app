import 'server-only';

import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';
import { kv } from '~/lib/kv';
import type { SubscriptionBillingInterval } from '~/lib/stripe/subscription-interval';

import type { SubscriptionLineMeta } from './types';

function subscriptionLinesKey(cartId: string): string {
  return `checkout:subscription-lines:${cartId}`;
}

export async function getSubscriptionLinesForCart(
  cartId: string,
): Promise<SubscriptionLineMeta[]> {
  return (await kv.get<SubscriptionLineMeta[]>(subscriptionLinesKey(cartId))) ?? [];
}

export async function addSubscriptionLineToCart(
  cartId: string,
  line: SubscriptionLineMeta,
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);
  const withoutDuplicate = existing.filter(
    (entry) =>
      !(
        entry.productEntityId === line.productEntityId &&
        optionsKey(entry.productOptions) === optionsKey(line.productOptions)
      ),
  );

  await kv.set(subscriptionLinesKey(cartId), [...withoutDuplicate, line]);
}

export async function removeSubscriptionLineFromCart(
  cartId: string,
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): Promise<void> {
  const existing = await getSubscriptionLinesForCart(cartId);
  const key = optionsKey(productOptions);

  await kv.set(
    subscriptionLinesKey(cartId),
    existing.filter(
      (entry) =>
        !(entry.productEntityId === productEntityId && optionsKey(entry.productOptions) === key),
    ),
  );
}

export async function clearSubscriptionLinesForCart(cartId: string): Promise<void> {
  await kv.set(subscriptionLinesKey(cartId), []);
}

function optionsKey(options: ProductOptionSelection[]): string {
  return options
    .map((option) => `${option.optionEntityId}:${option.valueEntityId}`)
    .sort()
    .join('|');
}

export function matchSubscriptionLine(
  lines: SubscriptionLineMeta[],
  productEntityId: number,
  productOptions: ProductOptionSelection[],
): SubscriptionLineMeta | undefined {
  const key = optionsKey(productOptions);

  return lines.find(
    (line) => line.productEntityId === productEntityId && optionsKey(line.productOptions) === key,
  );
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
}: {
  productEntityId: number;
  sku: string;
  productName: string;
  productOptions: ProductOptionSelection[];
  billingInterval: SubscriptionBillingInterval;
  billingCycleAnchor?: number;
  unitAmount: number;
  currency: string;
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
  };
}
