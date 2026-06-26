import 'server-only';

import type Stripe from 'stripe';

import { parseSubscriptionShippingAddressFromMetadata } from '~/lib/checkout/subscription-shipping-metadata';
import type { CheckoutAddressSnapshot } from '~/lib/checkout/types';

import { getStripe } from './client';
import {
  parseSubscriptionBillingContext,
  resolveSubscriptionBillingQuote,
} from './subscription-billing-quote';

function readMetadataTaxCents(metadata: Stripe.Metadata): number {
  const taxAmount = Number(metadata.billed_tax_cents ?? '0');

  return Number.isFinite(taxAmount) && taxAmount > 0 ? taxAmount : 0;
}

async function getStripeCustomerEmail(
  subscription: Stripe.Subscription,
): Promise<string | undefined> {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return undefined;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    return undefined;
  }

  return customer.email ?? undefined;
}

export async function resolveSubscriptionBilledTaxCents(
  subscription: Stripe.Subscription,
  options: { quoteAddress?: CheckoutAddressSnapshot } = {},
): Promise<number> {
  const metadataTax = readMetadataTaxCents(subscription.metadata);

  if (metadataTax > 0) {
    return metadataTax;
  }

  const billingContext = parseSubscriptionBillingContext(subscription.metadata);

  if (!billingContext) {
    return 0;
  }

  const email = await getStripeCustomerEmail(subscription);
  const quoteAddress =
    options.quoteAddress ??
    (email
      ? parseSubscriptionShippingAddressFromMetadata(subscription.metadata, email)
      : undefined);

  const quote = await resolveSubscriptionBillingQuote({
    ...billingContext,
    billingAddress: quoteAddress,
  });

  return quote?.taxAmount ?? 0;
}
