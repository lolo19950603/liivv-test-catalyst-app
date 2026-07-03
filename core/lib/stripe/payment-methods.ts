import 'server-only';

import type Stripe from 'stripe';

import { getStripe } from './client';

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  label: string;
  expiryLabel: string;
  isDefault: boolean;
}

function formatCardBrand(brand: string): string {
  const normalized = brand.trim().toLowerCase();

  if (!normalized) {
    return 'Card';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatSavedPaymentMethodLabel(
  paymentMethod: Pick<Stripe.PaymentMethod, 'card'> & { card: NonNullable<Stripe.PaymentMethod['card']> },
): string {
  return `${formatCardBrand(paymentMethod.card.brand)} •••• ${paymentMethod.card.last4}`;
}

export async function createCustomerSetupIntent(stripeCustomerId: string): Promise<string> {
  const stripe = getStripe();
  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    usage: 'off_session',
  });

  if (!setupIntent.client_secret) {
    throw new Error('Stripe did not return a client secret');
  }

  return setupIntent.client_secret;
}

export async function getCustomerSavedPaymentMethods(
  stripeCustomerId: string,
): Promise<SavedPaymentMethod[]> {
  const stripe = getStripe();
  const [customer, paymentMethods] = await Promise.all([
    stripe.customers.retrieve(stripeCustomerId),
    listCustomerCardPaymentMethods(stripe, stripeCustomerId),
  ]);

  if ('deleted' in customer && customer.deleted) {
    return [];
  }

  const defaultPaymentMethodId =
    typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings?.default_payment_method?.id;

  const dedupedPaymentMethods = dedupeCardPaymentMethods(paymentMethods);

  return dedupedPaymentMethods.map((paymentMethod) => ({
    id: paymentMethod.id,
    brand: formatCardBrand(paymentMethod.card.brand),
    last4: paymentMethod.card.last4,
    expMonth: paymentMethod.card.exp_month,
    expYear: paymentMethod.card.exp_year,
    label: formatSavedPaymentMethodLabel(paymentMethod),
    expiryLabel: `Expires ${String(paymentMethod.card.exp_month).padStart(2, '0')}/${paymentMethod.card.exp_year}`,
    isDefault: paymentMethod.id === defaultPaymentMethodId,
  }));
}

async function listCustomerCardPaymentMethods(
  stripe: ReturnType<typeof getStripe>,
  stripeCustomerId: string,
): Promise<Array<Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card }>> {
  const paymentMethods: Array<Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card }> = [];
  let startingAfter: string | undefined;

  while (paymentMethods.length < 100) {
    const page = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const paymentMethod of page.data) {
      if (paymentMethod.card) {
        paymentMethods.push(
          paymentMethod as Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card },
        );
      }
    }

    if (!page.has_more || page.data.length === 0) {
      break;
    }

    startingAfter = page.data.at(-1)?.id;
  }

  return paymentMethods;
}

function dedupeCardPaymentMethods(
  paymentMethods: Array<Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card }>,
): Array<Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card }> {
  const seen = new Set<string>();
  const deduped: Array<Stripe.PaymentMethod & { card: Stripe.PaymentMethod.Card }> = [];

  for (const paymentMethod of paymentMethods) {
    const fingerprint =
      paymentMethod.card.fingerprint ??
      `${paymentMethod.card.brand}:${paymentMethod.card.last4}:${paymentMethod.card.exp_month}:${paymentMethod.card.exp_year}`;

    if (seen.has(fingerprint)) {
      continue;
    }

    seen.add(fingerprint);
    deduped.push(paymentMethod);
  }

  return deduped;
}
