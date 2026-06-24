import 'server-only';

import type Stripe from 'stripe';

import { fulfillCheckoutStripeSession } from '~/lib/checkout/payment';

import {
  createBigCommerceOrderFromInvoice,
  getInvoiceSubscriptionId,
} from './subscription-orders';
import { getStripe } from './client';
import {
  applySubscriptionInvoiceTax,
  prepareSubscriptionForBillingById,
} from './prepare-subscription-invoice';
import { getStoredStripeCustomerId, storeStripeCustomerId } from './storage';

function getBigCommerceCustomerId(metadata: Stripe.Metadata | null | undefined): number | null {
  const value = metadata?.bigcommerce_customer_id;

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getStripeCustomerIdFromInvoice(invoice: Stripe.Invoice): string | null {
  if (typeof invoice.customer === 'string') {
    return invoice.customer;
  }

  return invoice.customer?.id ?? null;
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

      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      if (paymentIntent.metadata.checkout_snapshot_id) {
        await fulfillCheckoutStripeSession(paymentIntent.id, { clearSessionCart: false });
      }

      break;
    }

    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object;

      if (setupIntent.metadata.checkout_snapshot_id) {
        await fulfillCheckoutStripeSession(setupIntent.id, { clearSessionCart: false });
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

      let stripeCustomerId = getStripeCustomerIdFromInvoice(invoice);
      const bigcommerceCustomerId = getBigCommerceCustomerId(
        invoice.parent?.type === 'subscription_details'
          ? invoice.parent.subscription_details?.metadata
          : invoice.lines?.data[0]?.metadata,
      );

      if (!stripeCustomerId && bigcommerceCustomerId) {
        stripeCustomerId = await getStoredStripeCustomerId(bigcommerceCustomerId);
      }

      if (stripeCustomerId && bigcommerceCustomerId) {
        await storeStripeCustomerId(bigcommerceCustomerId, stripeCustomerId);
      }

      const result = await createBigCommerceOrderFromInvoice(invoice);

      if (result.status === 'created') {
        // eslint-disable-next-line no-console
        console.info(
          `Created BigCommerce subscription order ${result.orderId} for invoice ${invoice.id}`,
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `No BigCommerce subscription order created for invoice ${invoice.id}: ${result.reason}`,
        );
      }

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
