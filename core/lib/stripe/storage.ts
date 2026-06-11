import 'server-only';

import { kv } from '~/lib/kv';

function stripeCustomerKey(bigcommerceCustomerId: number): string {
  return `stripe:bc-customer:${bigcommerceCustomerId}`;
}

export async function getStoredStripeCustomerId(
  bigcommerceCustomerId: number,
): Promise<string | null> {
  return kv.get<string>(stripeCustomerKey(bigcommerceCustomerId));
}

export async function storeStripeCustomerId(
  bigcommerceCustomerId: number,
  stripeCustomerId: string,
): Promise<void> {
  await kv.set(stripeCustomerKey(bigcommerceCustomerId), stripeCustomerId);
}

function subscriptionOrderKey(referenceId: string): string {
  return `stripe:bc-order:${referenceId}`;
}

export async function claimSubscriptionOrderCreation(referenceId: string): Promise<boolean> {
  const key = subscriptionOrderKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing != null) {
    return false;
  }

  await kv.set(key, 'pending');

  return true;
}

export async function markSubscriptionOrderCreated(
  referenceId: string,
  orderId: number,
): Promise<void> {
  await kv.set(subscriptionOrderKey(referenceId), String(orderId));
}
