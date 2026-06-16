'use server';

import { clearCheckoutCartAfterStripeSession } from '~/lib/cart/clear-checkout-cart';

export async function clearCheckoutCartAfterStripeSessionAction(
  stripeSessionId: string,
): Promise<void> {
  await clearCheckoutCartAfterStripeSession(stripeSessionId);
}

/** @deprecated Use clearCheckoutCartAfterStripeSessionAction */
export const clearCheckoutCartAfterPaymentAction = clearCheckoutCartAfterStripeSessionAction;
