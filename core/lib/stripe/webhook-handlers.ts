import 'server-only';

import type Stripe from 'stripe';

import { fulfillCheckoutPayment } from '~/lib/checkout/payment';

import {
  createBigCommerceOrderFromCheckoutSession,
  createBigCommerceOrderFromInvoice,
} from './subscription-orders';
import { storeStripeCustomerId } from './storage';

function getBigCommerceCustomerId(metadata: Stripe.Metadata | null | undefined): number | null {
  const value = metadata?.bigcommerce_customer_id;

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if (session.mode !== 'subscription') {
        break;
      }

      const bigcommerceCustomerId = getBigCommerceCustomerId(session.metadata);
      const stripeCustomerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (bigcommerceCustomerId && stripeCustomerId) {
        await storeStripeCustomerId(bigcommerceCustomerId, stripeCustomerId);
      }

      await createBigCommerceOrderFromCheckoutSession(session);

      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      if (paymentIntent.metadata.checkout_snapshot_id) {
        await fulfillCheckoutPayment(paymentIntent.id);
      }

      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;

      await createBigCommerceOrderFromInvoice(invoice);

      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const bigcommerceCustomerId = getBigCommerceCustomerId(subscription.metadata);
      const stripeCustomerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      if (bigcommerceCustomerId && stripeCustomerId) {
        await storeStripeCustomerId(bigcommerceCustomerId, stripeCustomerId);
      }

      break;
    }

    default:
      break;
  }
}
