import 'server-only';

import type Stripe from 'stripe';

import { clearCheckoutCartAfterStripeSession } from '~/lib/cart/clear-checkout-cart';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { createBigCommerceOrderFromCheckoutSnapshot } from '~/lib/bigcommerce/cart-order';
import { kv } from '~/lib/kv';
import { getStripe } from '~/lib/stripe/client';
import { getOrCreateStripeCustomer } from '~/lib/stripe/customers';
import {
  claimCheckoutFulfillment,
  getCheckoutFulfillmentOrderId,
  isCheckoutFulfillmentComplete,
  markCheckoutFulfillmentComplete,
  markCheckoutOrderCreated,
  releaseCheckoutFulfillment,
} from '~/lib/stripe/storage';

import { addCheckoutBillingAddress } from './billing-address';
import {
  buildCheckoutSnapshot,
  getCheckoutSnapshot,
  storeCheckoutSnapshot,
} from './snapshot';
import type { CheckoutAddressSnapshot } from './types';

const REUSABLE_PAYMENT_INTENT_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
]);

function checkoutActivePaymentIntentKey(cartId: string): string {
  return `checkout:active-stripe:${cartId}`;
}

function buildCheckoutStripeMetadata(
  snapshotId: string,
  bigcommerceCustomerId: number,
  cartId: string,
): Record<string, string> {
  return {
    checkout_snapshot_id: snapshotId,
    bigcommerce_customer_id: String(bigcommerceCustomerId),
    cart_id: cartId,
  };
}

async function getStoredActivePaymentIntentId(cartId: string): Promise<string | null> {
  const stored = await kv.get<string>(checkoutActivePaymentIntentKey(cartId));

  if (!stored) {
    return null;
  }

  const separatorIndex = stored.indexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  const id = stored.slice(separatorIndex + 1);

  return id || null;
}

async function storeActivePaymentIntent(cartId: string, paymentIntentId: string): Promise<void> {
  await kv.set(checkoutActivePaymentIntentKey(cartId), `pi:${paymentIntentId}`);
}

export async function clearCheckoutActivePaymentIntent(cartId: string): Promise<void> {
  await kv.set(checkoutActivePaymentIntentKey(cartId), '');
}

async function resolveReusablePaymentIntent(
  stripe: Stripe,
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!REUSABLE_PAYMENT_INTENT_STATUSES.has(paymentIntent.status) || !paymentIntent.client_secret) {
      return null;
    }

    return paymentIntent;
  } catch {
    return null;
  }
}

async function updatePaymentIntentForSnapshot(
  stripe: Stripe,
  paymentIntentId: string,
  snapshot: Awaited<ReturnType<typeof buildCheckoutSnapshot>>,
  bigcommerceCustomerId: number,
  cartId: string,
): Promise<void> {
  const amount = Math.round(snapshot.amounts.grandTotal * 100);

  if (amount <= 0) {
    throw new Error('Payment session outdated. Please refresh checkout.');
  }

  await stripe.paymentIntents.update(paymentIntentId, {
    amount,
    currency: snapshot.currency.toLowerCase(),
    metadata: buildCheckoutStripeMetadata(snapshot.id, bigcommerceCustomerId, cartId),
  });
}

async function assertPaymentIntentIsReusable(
  stripe: Stripe,
  paymentIntentId: string,
  cartId: string,
): Promise<void> {
  const paymentIntent = await resolveReusablePaymentIntent(stripe, paymentIntentId);

  if (!paymentIntent) {
    await clearCheckoutActivePaymentIntent(cartId);
    throw new Error('Payment session expired. Please try again.');
  }
}

async function syncCheckoutBillingSnapshot({
  cartId,
  bigcommerceCustomerId,
  billingAddress,
}: {
  cartId: string;
  bigcommerceCustomerId: number;
  billingAddress: CheckoutAddressSnapshot;
}) {
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

  return snapshot;
}

export async function syncCheckoutBillingForPayment({
  cartId,
  bigcommerceCustomerId,
  billingAddress,
  paymentIntentId,
}: {
  cartId: string;
  bigcommerceCustomerId: number;
  billingAddress: CheckoutAddressSnapshot;
  paymentIntentId: string;
}): Promise<{ snapshotId: string }> {
  const stripe = getStripe();
  const snapshot = await syncCheckoutBillingSnapshot({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
  });

  await assertPaymentIntentIsReusable(stripe, paymentIntentId, cartId);
  await updatePaymentIntentForSnapshot(
    stripe,
    paymentIntentId,
    snapshot,
    bigcommerceCustomerId,
    cartId,
  );

  return { snapshotId: snapshot.id };
}

export async function syncCheckoutBillingForStripeSession({
  cartId,
  bigcommerceCustomerId,
  billingAddress,
  stripeSessionId,
}: {
  cartId: string;
  bigcommerceCustomerId: number;
  billingAddress: CheckoutAddressSnapshot;
  stripeSessionId: string;
}): Promise<{ snapshotId: string }> {
  return syncCheckoutBillingForPayment({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
    paymentIntentId: stripeSessionId,
  });
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

  const snapshot = await syncCheckoutBillingSnapshot({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
  });

  const stripeCustomerId = await getOrCreateStripeCustomer({
    bigcommerceCustomerId,
    email,
    name,
  });

  const metadata = buildCheckoutStripeMetadata(snapshot.id, bigcommerceCustomerId, cartId);
  const activePaymentIntentId = await getStoredActivePaymentIntentId(cartId);
  const amount = Math.round(snapshot.amounts.grandTotal * 100);

  if (amount <= 0) {
    throw new Error('Checkout total must be greater than zero');
  }

  if (activePaymentIntentId) {
    const reusablePaymentIntent = await resolveReusablePaymentIntent(stripe, activePaymentIntentId);

    if (reusablePaymentIntent?.client_secret) {
      await updatePaymentIntentForSnapshot(
        stripe,
        reusablePaymentIntent.id,
        snapshot,
        bigcommerceCustomerId,
        cartId,
      );

      return {
        clientSecret: reusablePaymentIntent.client_secret,
        snapshotId: snapshot.id,
      };
    }

    await clearCheckoutActivePaymentIntent(cartId);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: snapshot.currency.toLowerCase(),
    customer: stripeCustomerId,
    metadata,
    payment_method_types: ['card'],
  });

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return a client secret');
  }

  await storeActivePaymentIntent(cartId, paymentIntent.id);

  return {
    clientSecret: paymentIntent.client_secret,
    snapshotId: snapshot.id,
  };
}

export async function fulfillCheckoutStripeSession(paymentIntentId: string): Promise<number | null> {
  return fulfillCheckoutPayment(paymentIntentId);
}

export async function fulfillCheckoutPayment(paymentIntentId: string): Promise<number | null> {
  if (!isBigCommerceAdminConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('Skipping checkout fulfillment: BigCommerce admin API not configured');

    return null;
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return null;
  }

  const snapshotId = paymentIntent.metadata.checkout_snapshot_id;

  if (!snapshotId) {
    return null;
  }

  const fulfillmentRef = `payment:${paymentIntentId}`;
  const existingOrderId = await getCheckoutFulfillmentOrderId(fulfillmentRef);
  const fulfillmentComplete = await isCheckoutFulfillmentComplete(fulfillmentRef);
  let claimed = false;

  if (!fulfillmentComplete) {
    claimed = await claimCheckoutFulfillment(fulfillmentRef);

    if (!claimed) {
      const pendingOrderId = await getCheckoutFulfillmentOrderId(fulfillmentRef);

      if (!pendingOrderId) {
        return null;
      }
    }
  }

  const snapshot = await getCheckoutSnapshot(snapshotId);

  if (!snapshot) {
    if (claimed) {
      await releaseCheckoutFulfillment(fulfillmentRef);
    }

    throw new Error(`Checkout snapshot ${snapshotId} not found`);
  }

  try {
    let orderId = existingOrderId;

    if (!orderId && snapshot.lineItems.length > 0) {
      orderId = await createBigCommerceOrderFromCheckoutSnapshot(snapshot, paymentIntentId);
      await markCheckoutOrderCreated(fulfillmentRef, orderId);
    }

    await markCheckoutFulfillmentComplete(fulfillmentRef);
    await clearCheckoutActivePaymentIntent(snapshot.cartId);
    await clearCheckoutCartAfterStripeSession(paymentIntentId);

    return orderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fulfill checkout payment:', error);

    if (claimed) {
      await releaseCheckoutFulfillment(fulfillmentRef);
    }

    return null;
  }
}
