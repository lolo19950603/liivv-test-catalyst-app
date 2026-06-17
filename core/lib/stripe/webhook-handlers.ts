import 'server-only';

import type Stripe from 'stripe';

import { fulfillCheckoutStripeSession } from '~/lib/checkout/payment';

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      if (paymentIntent.metadata.checkout_snapshot_id) {
        await fulfillCheckoutStripeSession(paymentIntent.id);
      }

      break;
    }

    default:
      break;
  }
}
