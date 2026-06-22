import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';
import {
  parseSubscriptionBillingContext,
  resolveSubscriptionBillingQuote,
} from './subscription-billing-quote';

export const DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY = 'dynamic_pricing';

function getSubscriptionItemProductId(item: Stripe.SubscriptionItem): string {
  const product = item.price.product;

  if (typeof product === 'string') {
    return product;
  }

  if (!product || product.deleted) {
    throw new Error('Subscription item is missing a Stripe product');
  }

  return product.id;
}

export async function prepareSubscriptionForBilling(
  subscription: Stripe.Subscription,
): Promise<'ready' | 'out_of_stock' | 'skipped'> {
  if (subscription.metadata[DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY] !== 'true') {
    return 'skipped';
  }

  const billingContext = parseSubscriptionBillingContext(subscription.metadata);

  if (!billingContext) {
    return 'skipped';
  }

  const item = subscription.items.data[0];

  if (!item?.price.recurring) {
    return 'skipped';
  }

  const quote = await resolveSubscriptionBillingQuote({
    customerId: billingContext.customerId,
    productEntityId: billingContext.productEntityId,
    productOptions: billingContext.productOptions,
    quantity: billingContext.quantity,
  });

  if (!quote) {
    return 'skipped';
  }

  const stripe = getStripe();

  if (!quote.inStock || quote.unitAmountExTaxPerUnit <= 0) {
    await stripe.subscriptions.update(subscription.id, {
      pause_collection: { behavior: 'void' },
      metadata: {
        ...subscription.metadata,
        subscription_paused_reason: 'out_of_stock',
      },
    });

    return 'out_of_stock';
  }

  await stripe.subscriptionItems.update(item.id, {
    price_data: {
      currency: quote.currency.toLowerCase(),
      unit_amount: quote.unitAmountExTaxPerUnit,
      recurring: {
        interval: item.price.recurring.interval,
        interval_count: item.price.recurring.interval_count ?? 1,
      },
      product: getSubscriptionItemProductId(item),
    },
    quantity: billingContext.quantity,
    proration_behavior: 'none',
  });

  await stripe.subscriptions.update(subscription.id, {
    pause_collection: null,
    metadata: {
      ...subscription.metadata,
      billed_subtotal_cents: String(quote.unitAmountExTax),
      billed_tax_cents: String(quote.taxAmount),
      billed_total_cents: String(quote.unitAmountIncTax),
      subscription_paused_reason: '',
    },
  });

  return 'ready';
}

export async function applySubscriptionInvoiceTax(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription,
): Promise<void> {
  if (subscription.metadata[DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY] !== 'true') {
    return;
  }

  if (invoice.status !== 'draft') {
    return;
  }

  const taxAmount = Number(subscription.metadata.billed_tax_cents ?? '0');

  if (!Number.isFinite(taxAmount) || taxAmount <= 0) {
    return;
  }

  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!customerId) {
    return;
  }

  const stripe = getStripe();
  const hasTaxLine = invoice.lines?.data.some((line) => line.description === 'Sales tax');

  if (hasTaxLine) {
    return;
  }

  await stripe.invoiceItems.create({
    customer: customerId,
    invoice: invoice.id,
    amount: taxAmount,
    currency: invoice.currency ?? subscription.currency,
    description: 'Sales tax',
  });
}

export async function prepareSubscriptionForBillingById(
  subscriptionId: string,
): Promise<'ready' | 'out_of_stock' | 'skipped'> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price.product'],
  });

  return prepareSubscriptionForBilling(subscription);
}
