'use server';

import { fulfillCheckoutStripeSession } from '~/lib/checkout/payment';
import { kv } from '~/lib/kv';

function checkoutSuccessFulfillmentKey(stripeSessionId: string): string {
  return `checkout:success-fulfillment:${stripeSessionId}`;
}

export async function fulfillCheckoutStripeSessionAction(
  stripeSessionId: string,
): Promise<number | null> {
  const fulfillmentKey = checkoutSuccessFulfillmentKey(stripeSessionId);

  if (await kv.get(fulfillmentKey)) {
    return null;
  }

  const result = await fulfillCheckoutStripeSession(stripeSessionId);

  await kv.set(fulfillmentKey, true);

  return result;
}
