import 'server-only';

import type Stripe from 'stripe';

import {
  BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY,
  parseProductOptionSelectionsFromMetadata,
} from '~/lib/bigcommerce/product-options';
import { createBigCommerceSubscriptionOrder } from '~/lib/bigcommerce/subscription-order';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

import { getStripe } from './client';
import {
  queuePaidInvoiceForSubscriptionOrderBatch,
} from './subscription-order-batch';
import {
  claimSubscriptionOrderCreation,
  markSubscriptionOrderCreated,
  releaseSubscriptionOrderCreation,
} from './storage';

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

function getProductOptions(metadata: Stripe.Metadata | null | undefined) {
  return parseProductOptionSelectionsFromMetadata(
    metadata?.[BIGCOMMERCE_PRODUCT_OPTIONS_METADATA_KEY],
  );
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (invoice.parent?.type === 'subscription_details') {
    const parentSubscription = invoice.parent.subscription_details?.subscription;

    if (typeof parentSubscription === 'string') {
      return parentSubscription;
    }

    if (parentSubscription?.id) {
      return parentSubscription.id;
    }
  }

  for (const line of invoice.lines?.data ?? []) {
    if (line.parent?.type !== 'subscription_item_details') {
      continue;
    }

    const lineSubscription = line.parent.subscription_item_details?.subscription;

    if (typeof lineSubscription === 'string') {
      return lineSubscription;
    }

    if (lineSubscription?.id) {
      return lineSubscription.id;
    }
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

function mergeSubscriptionMetadata(
  subscription: Stripe.Subscription,
  invoice: Stripe.Invoice,
): Stripe.Metadata {
  const invoiceMetadata =
    invoice.parent?.type === 'subscription_details'
      ? invoice.parent.subscription_details?.metadata
      : undefined;

  return {
    ...subscription.metadata,
    ...(invoiceMetadata ?? {}),
  };
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
  subscriptionMetadata,
  stripeReferenceId,
  orderType,
  unitAmountExTax,
  unitAmountIncTax,
  currencyCode,
  productName,
}: {
  subscription: Stripe.Subscription;
  subscriptionMetadata?: Stripe.Metadata;
  stripeReferenceId: string;
  orderType: 'initial' | 'renewal';
  unitAmountExTax: number;
  unitAmountIncTax: number;
  currencyCode: string;
  productName: string;
}): Promise<number | null> {
  if (!isBigCommerceAdminConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('Skipping BigCommerce subscription order: admin API not configured');

    return null;
  }

  const metadata = subscriptionMetadata ?? subscription.metadata;
  const customerId = getBigCommerceCustomerId(metadata);

  if (!customerId) {
    // eslint-disable-next-line no-console
    console.warn(
      `Skipping BigCommerce subscription order ${stripeReferenceId}: missing bigcommerce_customer_id`,
    );

    return null;
  }

  const claimed = await claimSubscriptionOrderCreation(stripeReferenceId);

  if (!claimed) {
    // eslint-disable-next-line no-console
    console.info(`BigCommerce subscription order already handled for ${stripeReferenceId}`);

    return null;
  }

  try {
    const quantity = subscription.items.data[0]?.quantity ?? 1;

    const orderId = await createBigCommerceSubscriptionOrder({
      customerId,
      productEntityId: getBigCommerceProductId(metadata),
      productName,
      productSku: getProductSku(metadata),
      productOptions: getProductOptions(metadata),
      quantity,
      unitAmountExTax,
      unitAmountIncTax,
      currencyCode,
      stripeSubscriptionId: subscription.id,
      stripeReferenceId,
      orderType,
    });

    await markSubscriptionOrderCreated(stripeReferenceId, orderId);

    // eslint-disable-next-line no-console
    console.info(`Created BigCommerce subscription order ${orderId} for ${stripeReferenceId}`);

    return orderId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create BigCommerce subscription order:', error);
    await releaseSubscriptionOrderCreation(stripeReferenceId);

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

export async function createBigCommerceOrderFromInvoice(
  invoice: Stripe.Invoice,
): Promise<number | null> {
  if ((invoice.amount_paid ?? 0) <= 0) {
    return null;
  }

  const billableReasons = new Set<Stripe.Invoice.BillingReason | null>([
    'subscription_cycle',
    'subscription_create',
    'subscription_update',
  ]);

  if (!billableReasons.has(invoice.billing_reason)) {
    // eslint-disable-next-line no-console
    console.info(
      `Skipping BigCommerce subscription order for invoice ${invoice.id}: billing_reason=${invoice.billing_reason ?? 'null'}`,
    );

    return null;
  }

  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    // eslint-disable-next-line no-console
    console.warn(
      `Skipping BigCommerce subscription order for invoice ${invoice.id}: missing subscription id`,
    );

    return null;
  }

  const subscription = await getSubscription(subscriptionId);
  const subscriptionMetadata = mergeSubscriptionMetadata(subscription, invoice);
  const orderType = invoice.billing_reason === 'subscription_cycle' ? 'renewal' : 'initial';
  const { unitAmountExTax } = getSubscriptionLineTotals(subscription, subscriptionMetadata);
  const unitAmountIncTax = invoice.amount_paid ?? unitAmountExTax;
  const currencyCode = (invoice.currency ?? subscription.currency ?? 'usd').toUpperCase();

  if (isSubscriptionOrderBatchingEnabled()) {
    await queuePaidInvoiceForSubscriptionOrderBatch({
      invoice,
      subscription,
      subscriptionMetadata,
      orderType,
    });

    return null;
  }

  return createOrderFromSubscription({
    subscription,
    subscriptionMetadata,
    stripeReferenceId: `invoice:${invoice.id}`,
    orderType,
    unitAmountExTax,
    unitAmountIncTax,
    currencyCode,
    productName: getSubscriptionProductName(subscription),
  });
}

function isSubscriptionOrderBatchingEnabled(): boolean {
  return process.env.STRIPE_SUBSCRIPTION_ORDER_BATCHING === 'true';
}

function getSubscriptionLineTotals(
  subscription: Stripe.Subscription,
  metadata: Stripe.Metadata = subscription.metadata,
): {
  quantity: number;
  unitAmountExTax: number;
} {
  const item = subscription.items.data[0];
  const quantity = item?.quantity ?? 1;
  const billedSubtotal = Number(metadata.billed_subtotal_cents ?? '');
  const unitAmount =
    Number.isFinite(billedSubtotal) && billedSubtotal > 0
      ? billedSubtotal
      : (item?.price.unit_amount ?? 0) * quantity;

  return {
    quantity,
    unitAmountExTax: unitAmount,
  };
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
  const { unitAmountExTax } = getSubscriptionLineTotals(subscription);
  const unitAmountIncTax = session.amount_total ?? unitAmountExTax;
  const currencyCode = (session.currency ?? subscription.currency ?? 'usd').toUpperCase();

  return createOrderFromSubscription({
    subscription,
    stripeReferenceId: `session:${session.id}`,
    orderType: 'initial',
    unitAmountExTax,
    unitAmountIncTax,
    currencyCode,
    productName: getSubscriptionProductName(subscription),
  });
}
