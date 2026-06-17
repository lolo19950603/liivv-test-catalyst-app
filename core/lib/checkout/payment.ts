import 'server-only';

import type Stripe from 'stripe';

import { clearCheckoutCartAfterStripeSession } from '~/lib/cart/clear-checkout-cart';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import {
  buildSubscriptionMetadataFromLine,
  createBigCommerceOrderFromCheckoutSnapshot,
} from '~/lib/bigcommerce/cart-order';
import { kv } from '~/lib/kv';
import { getStripe } from '~/lib/stripe/client';
import { getOrCreateStripeCustomer } from '~/lib/stripe/customers';
import { createStripeProductForCheckoutLine } from '~/lib/stripe/subscription-products';
import { getStripeSubscriptionBillingSchedule } from '~/lib/stripe/subscription-pricing';
import { toStripeRecurring } from '~/lib/stripe/subscription-interval';
import { claimSubscriptionOrderCreation, getCheckoutFulfillmentOrderId, hasCheckoutStripeSubscriptions, isCheckoutFulfillmentComplete, markCheckoutFulfillmentComplete, markCheckoutStripeSubscriptionsCreated, markSubscriptionOrderCreated, releaseSubscriptionOrderCreation } from '~/lib/stripe/storage';

import { addCheckoutBillingAddress } from './billing-address';
import {
  buildCheckoutSnapshot,
  getCheckoutSnapshot,
  storeCheckoutSnapshot,
} from './snapshot';
import { isDeferredSubscriptionLine } from './subscription-charge-timing';
import type {
  CheckoutAddressSnapshot,
  CheckoutSnapshot,
} from './types';

const REUSABLE_PAYMENT_INTENT_STATUSES = new Set<Stripe.PaymentIntent.Status>([
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
]);

const REUSABLE_SETUP_INTENT_STATUSES = new Set<Stripe.SetupIntent.Status>([
  'requires_payment_method',
  'requires_confirmation',
  'requires_action',
]);

function checkoutActiveStripeSessionKey(cartId: string): string {
  return `checkout:active-stripe:${cartId}`;
}

function requiresSetupIntent(snapshot: CheckoutSnapshot): boolean {
  return (
    snapshot.amounts.immediateGrandTotal <= 0 &&
    snapshot.lineItems.some((line) => line.isSubscription)
  );
}

function buildCheckoutStripeMetadata(
  snapshot: CheckoutSnapshot,
  bigcommerceCustomerId: number,
  cartId: string,
): Record<string, string> {
  return {
    checkout_snapshot_id: snapshot.id,
    bigcommerce_customer_id: String(bigcommerceCustomerId),
    cart_id: cartId,
  };
}

async function getStoredActiveStripeSession(
  cartId: string,
): Promise<{ id: string; mode: 'payment' | 'setup' } | null> {
  const stored = await kv.get<string>(checkoutActiveStripeSessionKey(cartId));

  if (!stored) {
    return null;
  }

  const separatorIndex = stored.indexOf(':');

  if (separatorIndex === -1) {
    return null;
  }

  const prefix = stored.slice(0, separatorIndex);
  const id = stored.slice(separatorIndex + 1);

  if (!id) {
    return null;
  }

  return {
    id,
    mode: prefix === 'si' ? 'setup' : 'payment',
  };
}

async function storeActiveStripeSession(
  cartId: string,
  sessionId: string,
  mode: 'payment' | 'setup',
): Promise<void> {
  await kv.set(checkoutActiveStripeSessionKey(cartId), `${mode === 'setup' ? 'si' : 'pi'}:${sessionId}`);
}

export async function clearCheckoutActivePaymentIntent(cartId: string): Promise<void> {
  await kv.set(checkoutActiveStripeSessionKey(cartId), '');
}

async function clearCheckoutActiveStripeSession(cartId: string): Promise<void> {
  await clearCheckoutActivePaymentIntent(cartId);
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

async function resolveReusableSetupIntent(
  stripe: Stripe,
  setupIntentId: string,
): Promise<Stripe.SetupIntent | null> {
  try {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (!REUSABLE_SETUP_INTENT_STATUSES.has(setupIntent.status) || !setupIntent.client_secret) {
      return null;
    }

    return setupIntent;
  } catch {
    return null;
  }
}

async function updatePaymentIntentForSnapshot(
  stripe: Stripe,
  paymentIntentId: string,
  snapshot: CheckoutSnapshot,
  bigcommerceCustomerId: number,
  cartId: string,
): Promise<void> {
  const amount = Math.round(snapshot.amounts.immediateGrandTotal * 100);

  if (amount <= 0) {
    throw new Error('Payment session outdated. Please refresh checkout.');
  }

  await stripe.paymentIntents.update(paymentIntentId, {
    amount: Math.round(snapshot.amounts.immediateGrandTotal * 100),
    currency: snapshot.currency.toLowerCase(),
    metadata: buildCheckoutStripeMetadata(snapshot, bigcommerceCustomerId, cartId),
  });
}

async function updateSetupIntentForSnapshot(
  stripe: Stripe,
  setupIntentId: string,
  snapshot: CheckoutSnapshot,
  bigcommerceCustomerId: number,
  cartId: string,
): Promise<void> {
  await stripe.setupIntents.update(setupIntentId, {
    metadata: buildCheckoutStripeMetadata(snapshot, bigcommerceCustomerId, cartId),
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

async function assertSetupIntentIsReusable(
  stripe: Stripe,
  setupIntentId: string,
  cartId: string,
): Promise<void> {
  const setupIntent = await resolveReusableSetupIntent(stripe, setupIntentId);

  if (!setupIntent) {
    await clearCheckoutActiveStripeSession(cartId);
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
  return syncCheckoutBillingForStripeSession({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
    stripeSessionId: paymentIntentId,
  });
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
  const stripe = getStripe();
  const snapshot = await syncCheckoutBillingSnapshot({
    cartId,
    bigcommerceCustomerId,
    billingAddress,
  });

  if (stripeSessionId.startsWith('seti_')) {
    await assertSetupIntentIsReusable(stripe, stripeSessionId, cartId);
    await updateSetupIntentForSnapshot(
      stripe,
      stripeSessionId,
      snapshot,
      bigcommerceCustomerId,
      cartId,
    );

    return { snapshotId: snapshot.id };
  }

  await assertPaymentIntentIsReusable(stripe, stripeSessionId, cartId);
  await updatePaymentIntentForSnapshot(
    stripe,
    stripeSessionId,
    snapshot,
    bigcommerceCustomerId,
    cartId,
  );

  return { snapshotId: snapshot.id };
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

  const useSetupIntent = requiresSetupIntent(snapshot);
  const metadata = buildCheckoutStripeMetadata(snapshot, bigcommerceCustomerId, cartId);
  const storedSession = await getStoredActiveStripeSession(cartId);

  if (storedSession && storedSession.mode !== (useSetupIntent ? 'setup' : 'payment')) {
    await clearCheckoutActiveStripeSession(cartId);
  }

  const activeSession =
    storedSession && storedSession.mode === (useSetupIntent ? 'setup' : 'payment')
      ? storedSession
      : null;

  if (useSetupIntent) {
    if (activeSession) {
      const reusableSetupIntent = await resolveReusableSetupIntent(stripe, activeSession.id);

      if (reusableSetupIntent?.client_secret) {
        await updateSetupIntentForSnapshot(
          stripe,
          reusableSetupIntent.id,
          snapshot,
          bigcommerceCustomerId,
          cartId,
        );

        return {
          clientSecret: reusableSetupIntent.client_secret,
          snapshotId: snapshot.id,
        };
      }

      await clearCheckoutActiveStripeSession(cartId);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      metadata,
      payment_method_types: ['card'],
    });

    if (!setupIntent.client_secret) {
      throw new Error('Stripe did not return a client secret');
    }

    await storeActiveStripeSession(cartId, setupIntent.id, 'setup');

    return {
      clientSecret: setupIntent.client_secret,
      snapshotId: snapshot.id,
    };
  }

  const hasSubscriptions = snapshot.lineItems.some((line) => line.isSubscription);
  const amount = Math.round(snapshot.amounts.immediateGrandTotal * 100);

  if (amount <= 0) {
    throw new Error('Checkout total must be greater than zero');
  }

  if (activeSession) {
    const reusablePaymentIntent = await resolveReusablePaymentIntent(stripe, activeSession.id);

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

    await clearCheckoutActiveStripeSession(cartId);
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: snapshot.currency.toLowerCase(),
    customer: stripeCustomerId,
    setup_future_usage: hasSubscriptions ? 'off_session' : undefined,
    metadata,
    payment_method_types: ['card'],
  });

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return a client secret');
  }

  await storeActiveStripeSession(cartId, paymentIntent.id, 'payment');

  return {
    clientSecret: paymentIntent.client_secret,
    snapshotId: snapshot.id,
  };
}

export async function fulfillCheckoutStripeSession(stripeSessionId: string): Promise<number | null> {
  if (stripeSessionId.startsWith('seti_')) {
    return fulfillCheckoutSetup(stripeSessionId);
  }

  return fulfillCheckoutPayment(stripeSessionId);
}

export async function fulfillCheckoutSetup(setupIntentId: string): Promise<number | null> {
  if (!isBigCommerceAdminConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('Skipping checkout fulfillment: BigCommerce admin API not configured');

    return null;
  }

  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
    expand: ['payment_method'],
  });

  if (setupIntent.status !== 'succeeded') {
    return null;
  }

  const snapshotId = setupIntent.metadata.checkout_snapshot_id;

  if (!snapshotId) {
    return null;
  }

  const fulfillmentRef = `setup:${setupIntentId}`;
  const existingOrderId = await getCheckoutFulfillmentOrderId(fulfillmentRef);
  const fulfillmentComplete = await isCheckoutFulfillmentComplete(fulfillmentRef);
  let claimed = false;

  if (!fulfillmentComplete) {
    claimed = await claimSubscriptionOrderCreation(fulfillmentRef);

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
      await releaseSubscriptionOrderCreation(fulfillmentRef);
    }

    throw new Error(`Checkout snapshot ${snapshotId} not found`);
  }

  try {
    const needsStripeSubscriptions = snapshot.lineItems.some((line) => line.isSubscription);
    let stripeReady =
      !needsStripeSubscriptions || (await hasCheckoutStripeSubscriptions(setupIntentId));

    if (!stripeReady) {
      try {
        await createStripeSubscriptionsForCheckout({
          snapshot,
          stripeSessionId: setupIntentId,
          paymentMethodId: getPaymentMethodIdFromSetupIntent(setupIntent),
          stripeCustomerId: getStripeCustomerIdFromSetupIntent(setupIntent),
        });
        stripeReady = true;
      } catch (subscriptionError) {
        // eslint-disable-next-line no-console
        console.error('Failed to create Stripe subscriptions after checkout:', subscriptionError);
      }
    }

    if (!stripeReady) {
      return null;
    }

    await markCheckoutFulfillmentComplete(fulfillmentRef);
    await clearCheckoutActiveStripeSession(snapshot.cartId);
    await clearCheckoutCartAfterStripeSession(setupIntentId);

    return existingOrderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fulfill checkout setup:', error);

    if (claimed) {
      await releaseSubscriptionOrderCreation(fulfillmentRef);
    }

    return null;
  }
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
    claimed = await claimSubscriptionOrderCreation(fulfillmentRef);

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
      await releaseSubscriptionOrderCreation(fulfillmentRef);
    }

    throw new Error(`Checkout snapshot ${snapshotId} not found`);
  }

  try {
    const immediateLines = snapshot.lineItems.filter((line) => !isDeferredSubscriptionLine(line));
    let orderId = existingOrderId;

    if (!orderId && immediateLines.length > 0) {
      orderId = await createBigCommerceOrderFromCheckoutSnapshot(snapshot, paymentIntentId);
      await markSubscriptionOrderCreated(fulfillmentRef, orderId);
    }

    const needsStripeSubscriptions = snapshot.lineItems.some((line) => line.isSubscription);
    let stripeReady =
      !needsStripeSubscriptions || (await hasCheckoutStripeSubscriptions(paymentIntentId));

    if (!stripeReady) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['payment_method'],
      });

      try {
        await createStripeSubscriptionsForCheckout({
          snapshot,
          stripeSessionId: paymentIntentId,
          paymentMethodId: getPaymentMethodIdFromPaymentIntent(paymentIntent),
          stripeCustomerId: getStripeCustomerIdFromPaymentIntent(paymentIntent),
        });
        stripeReady = true;
      } catch (subscriptionError) {
        // eslint-disable-next-line no-console
        console.error('Failed to create Stripe subscriptions after checkout:', subscriptionError);
      }
    }

    if (!stripeReady) {
      return orderId;
    }

    if (!orderId) {
      await markCheckoutFulfillmentComplete(fulfillmentRef);
    }

    await clearCheckoutActiveStripeSession(snapshot.cartId);
    await clearCheckoutCartAfterStripeSession(paymentIntentId);

    return orderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fulfill checkout payment:', error);

    if (claimed) {
      await releaseSubscriptionOrderCreation(fulfillmentRef);
    }

    return null;
  }
}

async function createStripeSubscriptionsForCheckout({
  snapshot,
  stripeSessionId,
  paymentMethodId,
  stripeCustomerId,
}: {
  snapshot: CheckoutSnapshot;
  stripeSessionId: string;
  paymentMethodId: string;
  stripeCustomerId: string;
}): Promise<void> {
  if (await hasCheckoutStripeSubscriptions(stripeSessionId)) {
    return;
  }

  const stripe = getStripe();
  const subscriptionLines = snapshot.lineItems.filter((line) => line.isSubscription);

  if (subscriptionLines.length === 0) {
    return;
  }

  await Promise.all(
    subscriptionLines.map(async (line) => {
      if (!line.billingInterval) {
        return;
      }

      const metadata = buildSubscriptionMetadataFromLine(snapshot, line);
      const billingSchedule = getStripeSubscriptionBillingSchedule(line);
      const productId = await createStripeProductForCheckoutLine(stripe, line);

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
              product: productId,
            },
          },
        ],
        metadata,
        ...billingSchedule,
        proration_behavior: 'none',
      });
    }),
  );

  await markCheckoutStripeSubscriptionsCreated(stripeSessionId);
}

function getPaymentMethodIdFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): string {
  const paymentMethodId =
    typeof paymentIntent.payment_method === 'string'
      ? paymentIntent.payment_method
      : paymentIntent.payment_method?.id;

  if (!paymentMethodId) {
    throw new Error('Checkout payment is missing a saved payment method for subscriptions');
  }

  return paymentMethodId;
}

function getStripeCustomerIdFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): string {
  const stripeCustomerId =
    typeof paymentIntent.customer === 'string'
      ? paymentIntent.customer
      : paymentIntent.customer?.id;

  if (!stripeCustomerId) {
    throw new Error('Checkout payment is missing a Stripe customer');
  }

  return stripeCustomerId;
}

function getPaymentMethodIdFromSetupIntent(setupIntent: Stripe.SetupIntent): string {
  const paymentMethodId =
    typeof setupIntent.payment_method === 'string'
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

  if (!paymentMethodId) {
    throw new Error('Checkout setup is missing a saved payment method for subscriptions');
  }

  return paymentMethodId;
}

function getStripeCustomerIdFromSetupIntent(setupIntent: Stripe.SetupIntent): string {
  const stripeCustomerId =
    typeof setupIntent.customer === 'string'
      ? setupIntent.customer
      : setupIntent.customer?.id;

  if (!stripeCustomerId) {
    throw new Error('Checkout setup is missing a Stripe customer');
  }

  return stripeCustomerId;
}
