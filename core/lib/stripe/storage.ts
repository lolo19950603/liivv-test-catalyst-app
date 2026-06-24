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

export async function releaseSubscriptionOrderCreation(referenceId: string): Promise<void> {
  const key = subscriptionOrderKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing === 'pending') {
    await kv.set(key, '');
  }
}

export async function claimSubscriptionOrderCreation(referenceId: string): Promise<boolean> {
  const key = subscriptionOrderKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing && existing !== 'pending') {
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

export async function markCheckoutFulfillmentComplete(referenceId: string): Promise<void> {
  const key = subscriptionOrderKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing && existing !== 'pending') {
    return;
  }

  await kv.set(key, 'complete');
}

export async function getCheckoutFulfillmentOrderId(
  referenceId: string,
): Promise<number | null> {
  const existing = await kv.get<string>(subscriptionOrderKey(referenceId));

  if (!existing || existing === 'pending' || existing === 'complete') {
    return null;
  }

  const orderId = Number(existing);

  return Number.isFinite(orderId) && orderId > 0 ? orderId : null;
}

export async function isCheckoutFulfillmentComplete(referenceId: string): Promise<boolean> {
  const existing = await kv.get<string>(subscriptionOrderKey(referenceId));

  return Boolean(existing && existing !== 'pending');
}

function checkoutStripeSubscriptionsKey(paymentIntentId: string): string {
  return `checkout:stripe-subs:${paymentIntentId}`;
}

export async function hasCheckoutStripeSubscriptions(
  paymentIntentId: string,
): Promise<boolean> {
  return Boolean(await kv.get<string>(checkoutStripeSubscriptionsKey(paymentIntentId)));
}

export async function markCheckoutStripeSubscriptionsCreated(
  paymentIntentId: string,
): Promise<void> {
  await kv.set(checkoutStripeSubscriptionsKey(paymentIntentId), 'created');
}
