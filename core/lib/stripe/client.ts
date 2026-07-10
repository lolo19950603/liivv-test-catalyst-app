import 'server-only';

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!/^sk_(test|live)_/.test(secretKey)) {
    throw new Error('STRIPE_SECRET_KEY must start with sk_test_ or sk_live_');
  }

  return secretKey;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      telemetry: false,
    });
  }

  return stripeClient;
}
