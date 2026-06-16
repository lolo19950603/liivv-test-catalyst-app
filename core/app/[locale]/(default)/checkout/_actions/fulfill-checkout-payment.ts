'use server';

import { fulfillCheckoutStripeSession } from '~/lib/checkout/payment';

export async function fulfillCheckoutStripeSessionAction(
  stripeSessionId: string,
): Promise<number | null> {
  return fulfillCheckoutStripeSession(stripeSessionId);
}
