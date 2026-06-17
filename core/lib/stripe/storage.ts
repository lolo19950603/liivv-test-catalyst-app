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

function checkoutFulfillmentKey(referenceId: string): string {
  return `checkout:fulfillment:${referenceId}`;
}

export async function releaseCheckoutFulfillment(referenceId: string): Promise<void> {
  const key = checkoutFulfillmentKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing === 'pending') {
    await kv.set(key, '');
  }
}

export async function claimCheckoutFulfillment(referenceId: string): Promise<boolean> {
  const key = checkoutFulfillmentKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing) {
    return false;
  }

  await kv.set(key, 'pending');

  return true;
}

export async function markCheckoutOrderCreated(
  referenceId: string,
  orderId: number,
): Promise<void> {
  await kv.set(checkoutFulfillmentKey(referenceId), String(orderId));
}

export async function markCheckoutFulfillmentComplete(referenceId: string): Promise<void> {
  const key = checkoutFulfillmentKey(referenceId);
  const existing = await kv.get<string>(key);

  if (existing && existing !== 'pending') {
    return;
  }

  await kv.set(key, 'complete');
}

export async function getCheckoutFulfillmentOrderId(
  referenceId: string,
): Promise<number | null> {
  const existing = await kv.get<string>(checkoutFulfillmentKey(referenceId));

  if (!existing || existing === 'pending' || existing === 'complete') {
    return null;
  }

  const orderId = Number(existing);

  return Number.isFinite(orderId) && orderId > 0 ? orderId : null;
}

export async function isCheckoutFulfillmentComplete(referenceId: string): Promise<boolean> {
  const existing = await kv.get<string>(checkoutFulfillmentKey(referenceId));

  return Boolean(existing && existing !== 'pending');
}

/** @deprecated Use claimCheckoutFulfillment */
export const claimSubscriptionOrderCreation = claimCheckoutFulfillment;

/** @deprecated Use releaseCheckoutFulfillment */
export const releaseSubscriptionOrderCreation = releaseCheckoutFulfillment;

/** @deprecated Use markCheckoutOrderCreated */
export const markSubscriptionOrderCreated = markCheckoutOrderCreated;
