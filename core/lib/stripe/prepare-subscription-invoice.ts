import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';

export const DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY = 'dynamic_pricing';

export async function applySubscriptionInvoiceTax(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription,
): Promise<void> {
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
