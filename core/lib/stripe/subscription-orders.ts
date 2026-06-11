import 'server-only';

import type Stripe from 'stripe';

import { createBigCommerceSubscriptionOrder } from '~/lib/bigcommerce/subscription-order';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

import { getStripe } from './client';
import { claimSubscriptionOrderCreation, markSubscriptionOrderCreated } from './storage';

function getBigCommerceCustomerId(metadata: Stripe.Metadata | null | undefined): number | null {
  const value = metadata?.bigcommerce_customer_id;

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function getBigCommerceProductId(metadata: Stripe.Metadata | null | undefined): number | undefined {
  const value = metadata?.bigcommerce_product_id;

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getProductSku(metadata: Stripe.Metadata | null | undefined): string | undefined {
  const sku = metadata?.bigcommerce_sku;

  return sku?.trim() || undefined;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;

  if (typeof parentSubscription === 'string') {
    return parentSubscription;
  }

  if (parentSubscription?.id) {
    return parentSubscription.id;
  }

  const legacySubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (typeof legacySubscription === 'string') {
    return legacySubscription;
  }

  if (legacySubscription?.id) {
    return legacySubscription.id;
  }

  return null;
}

async function getSubscription(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  });
}

async function createOrderFromSubscription({
  subscription,
  stripeReferenceId,
  orderType,
  unitAmount,
  currencyCode,
  productName,
}: {
  subscription: Stripe.Subscription;
  stripeReferenceId: string;
  orderType: 'initial' | 'renewal';
  unitAmount: number;
  currencyCode: string;
  productName: string;
}): Promise<number | null> {
  if (!isBigCommerceAdminConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('Skipping BigCommerce subscription order: admin API not configured');

    return null;
  }

  const customerId = getBigCommerceCustomerId(subscription.metadata);

  if (!customerId) {
    // eslint-disable-next-line no-console
    console.warn('Skipping BigCommerce subscription order: missing bigcommerce_customer_id');

    return null;
  }

  const claimed = await claimSubscriptionOrderCreation(stripeReferenceId);

  if (!claimed) {
    return null;
  }

  try {
    const orderId = await createBigCommerceSubscriptionOrder({
      customerId,
      productEntityId: getBigCommerceProductId(subscription.metadata),
      productName,
      productSku: getProductSku(subscription.metadata),
      unitAmount,
      currencyCode,
      stripeSubscriptionId: subscription.id,
      stripeReferenceId,
      orderType,
    });

    await markSubscriptionOrderCreated(stripeReferenceId, orderId);

    return orderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create BigCommerce subscription order:', error);

    return null;
  }
}

function getSubscriptionProductName(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  const product = item?.price.product;

  if (typeof product === 'string' || !product || product.deleted) {
    return 'Subscription';
  }

  return product.name;
}

function getSubscriptionUnitAmount(subscription: Stripe.Subscription): number {
  const item = subscription.items.data[0];

  return item?.price.unit_amount ?? 0;
}

function getSubscriptionCurrency(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];

  return item?.price.currency?.toUpperCase() ?? 'USD';
}

export async function createBigCommerceOrderFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<number | null> {
  if (session.mode !== 'subscription') {
    return null;
  }

  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

  if (!subscriptionId) {
    return null;
  }

  const subscription = await getSubscription(subscriptionId);
  const unitAmount = session.amount_total ?? getSubscriptionUnitAmount(subscription);
  const currencyCode = (session.currency ?? subscription.currency ?? 'usd').toUpperCase();

  return createOrderFromSubscription({
    subscription,
    stripeReferenceId: `session:${session.id}`,
    orderType: 'initial',
    unitAmount,
    currencyCode,
    productName: getSubscriptionProductName(subscription),
  });
}

export async function createBigCommerceOrderFromInvoice(
  invoice: Stripe.Invoice,
): Promise<number | null> {
  if (invoice.billing_reason !== 'subscription_cycle') {
    return null;
  }

  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return null;
  }

  const subscription = await getSubscription(subscriptionId);
  const unitAmount = invoice.amount_paid ?? getSubscriptionUnitAmount(subscription);
  const currencyCode = (invoice.currency ?? subscription.currency ?? 'usd').toUpperCase();

  return createOrderFromSubscription({
    subscription,
    stripeReferenceId: `invoice:${invoice.id}`,
    orderType: 'renewal',
    unitAmount,
    currencyCode,
    productName: getSubscriptionProductName(subscription),
  });
}
