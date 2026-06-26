import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';
import { resolveSubscriptionBilledTaxCents } from './resolve-subscription-billed-tax';

export const DYNAMIC_SUBSCRIPTION_PRICING_METADATA_KEY = 'dynamic_pricing';

export async function applySubscriptionInvoiceTax(
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription,
): Promise<void> {
  if (invoice.status !== 'draft') {
    return;
  }

  const taxAmount = await resolveSubscriptionBilledTaxCents(subscription);

  if (taxAmount <= 0) {
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

  const metadataTax = Number(subscription.metadata.billed_tax_cents ?? '0');

  if (!Number.isFinite(metadataTax) || metadataTax <= 0) {
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        ...subscription.metadata,
        billed_tax_cents: String(taxAmount),
        billed_total_cents: String(
          Number(subscription.metadata.billed_subtotal_cents ?? '0') + taxAmount,
        ),
      },
    });
  }
}
