import 'server-only';

import type Stripe from 'stripe';

import { fulfillCheckoutStripeSession } from '~/lib/checkout/payment';

import {
  createBigCommerceOrderFromCheckoutSession,
  createBigCommerceOrderFromInvoice,
  getInvoiceSubscriptionId,
} from './subscription-orders';
import { getStripe } from './client';
import {
  applySubscriptionInvoiceTax,
  prepareSubscriptionForBillingById,
} from './prepare-subscription-invoice';
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
        await fulfillCheckoutStripeSession(paymentIntent.id);
      }

      break;
    }

    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object;

      if (setupIntent.metadata.checkout_snapshot_id) {
        await fulfillCheckoutStripeSession(setupIntent.id);
      }

      break;
    }

    case 'invoice.upcoming': {
      const invoice = event.data.object;
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (subscriptionId) {
        await prepareSubscriptionForBillingById(subscriptionId);
      }

      break;
    }

    case 'invoice.created': {
      const invoice = event.data.object;
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (subscriptionId) {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await applySubscriptionInvoiceTax(invoice, subscription);
      }

      break;
    }

    case 'invoice.paid': {
      const invoiceEvent = event.data.object;
      const stripe = getStripe();
      const invoice = await stripe.invoices.retrieve(invoiceEvent.id);

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
