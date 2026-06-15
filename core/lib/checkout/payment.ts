import 'server-only';

import { clearCartId } from '~/lib/cart';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import {
  buildSubscriptionMetadataFromLine,
  createBigCommerceOrderFromCheckoutSnapshot,
} from '~/lib/bigcommerce/cart-order';
import { getStripe } from '~/lib/stripe/client';
import { getOrCreateStripeCustomer } from '~/lib/stripe/customers';
import { toStripeRecurring } from '~/lib/stripe/subscription-interval';
import { claimSubscriptionOrderCreation, markSubscriptionOrderCreated } from '~/lib/stripe/storage';

import { addCheckoutBillingAddress } from './billing-address';
import {
  buildCheckoutSnapshot,
  getCheckoutSnapshot,
  storeCheckoutSnapshot,
} from './snapshot';
import { clearSubscriptionLinesForCart } from './subscription-lines';
import type {
  CheckoutAddressSnapshot,
  CheckoutLineItemSnapshot,
  CheckoutSnapshot,
} from './types';

function getSubscriptionTrialEnd(line: CheckoutLineItemSnapshot): number {
  if (line.billingCycleAnchor) {
    return line.billingCycleAnchor;
  }

  if (!line.billingInterval) {
    return Math.floor(Date.now() / 1000);
  }

  const date = new Date();
  const { interval, intervalCount } = line.billingInterval;

  switch (interval) {
    case 'day':
      date.setUTCDate(date.getUTCDate() + intervalCount);
      break;
    case 'week':
      date.setUTCDate(date.getUTCDate() + 7 * intervalCount);
      break;
    case 'month':
      date.setUTCMonth(date.getUTCMonth() + intervalCount);
      break;
    case 'year':
      date.setUTCFullYear(date.getUTCFullYear() + intervalCount);
      break;
  }

  return Math.floor(date.getTime() / 1000);
}

export async function initializeCheckoutPayment({
  cartId,
  bigcommerceCustomerId,
  email,
  name,
  billingAddress,
}: {
  cartId: string;
  bigcommerceCustomerId: number;
  email: string;
  name: string;
  billingAddress: CheckoutAddressSnapshot;
}): Promise<{ clientSecret: string; snapshotId: string }> {
  const stripe = getStripe();

  await addCheckoutBillingAddress({
    checkoutEntityId: cartId,
    address: billingAddress,
  });

  const snapshot = await buildCheckoutSnapshot({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
  });

  await storeCheckoutSnapshot(snapshot);

  const stripeCustomerId = await getOrCreateStripeCustomer({
    bigcommerceCustomerId,
    email,
    name,
  });

  const hasSubscriptions = snapshot.lineItems.some((line) => line.isSubscription);
  const amount = Math.round(snapshot.grandTotal * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: snapshot.currency.toLowerCase(),
    customer: stripeCustomerId,
    setup_future_usage: hasSubscriptions ? 'off_session' : undefined,
    metadata: {
      checkout_snapshot_id: snapshot.id,
      bigcommerce_customer_id: String(bigcommerceCustomerId),
      cart_id: cartId,
    },
    automatic_payment_methods: { enabled: true },
  });

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return a client secret');
  }

  return {
    clientSecret: paymentIntent.client_secret,
    snapshotId: snapshot.id,
  };
}

export async function fulfillCheckoutPayment(paymentIntentId: string): Promise<number | null> {
  if (!isBigCommerceAdminConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('Skipping checkout fulfillment: BigCommerce admin API not configured');

    return null;
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const snapshotId = paymentIntent.metadata.checkout_snapshot_id;

  if (!snapshotId) {
    return null;
  }

  const claimed = await claimSubscriptionOrderCreation(`payment:${paymentIntentId}`);

  if (!claimed) {
    return null;
  }

  const snapshot = await getCheckoutSnapshot(snapshotId);

  if (!snapshot) {
    throw new Error(`Checkout snapshot ${snapshotId} not found`);
  }

  try {
    const orderId = await createBigCommerceOrderFromCheckoutSnapshot(snapshot, paymentIntentId);

    await createStripeSubscriptionsForSnapshot({
      snapshot,
      paymentIntentId,
    });

    await markSubscriptionOrderCreated(`payment:${paymentIntentId}`, orderId);
    await clearSubscriptionLinesForCart(snapshot.cartId);
    await clearCartId();

    return orderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fulfill checkout payment:', error);

    return null;
  }
}

async function createStripeSubscriptionsForSnapshot({
  snapshot,
  paymentIntentId,
}: {
  snapshot: CheckoutSnapshot;
  paymentIntentId: string;
}): Promise<void> {
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const paymentMethodId =
    typeof paymentIntent.payment_method === 'string'
      ? paymentIntent.payment_method
      : paymentIntent.payment_method?.id;

  if (!paymentMethodId) {
    return;
  }

  const stripeCustomerId =
    typeof paymentIntent.customer === 'string'
      ? paymentIntent.customer
      : paymentIntent.customer?.id;

  if (!stripeCustomerId) {
    return;
  }

  const subscriptionLines = snapshot.lineItems.filter((line) => line.isSubscription);

  await Promise.all(
    subscriptionLines.map(async (line) => {
      if (!line.billingInterval) {
        return;
      }

      const metadata = buildSubscriptionMetadataFromLine(snapshot, line);

      const trialEnd = getSubscriptionTrialEnd(line);

      await stripe.subscriptions.create({
        customer: stripeCustomerId,
        default_payment_method: paymentMethodId,
        items: [
          {
            quantity: line.quantity,
            price_data: {
              currency: line.currency.toLowerCase(),
              unit_amount: line.unitAmount,
              recurring: toStripeRecurring(line.billingInterval),
              product_data: {
                name: line.name,
                metadata: {
                  bigcommerce_product_id: String(line.productEntityId),
                  bigcommerce_sku: line.sku ?? '',
                },
              },
            },
          },
        ],
        metadata,
        trial_end: trialEnd,
        billing_cycle_anchor: trialEnd,
        proration_behavior: 'none',
      });
    }),
  );
}
