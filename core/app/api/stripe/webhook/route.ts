import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getStripe, getStripeWebhookSecret } from '~/lib/stripe';
import { handleStripeWebhookEvent } from '~/lib/stripe/webhook-handlers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const webhookSecret = getStripeWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature';

    // eslint-disable-next-line no-console
    console.error('Stripe webhook signature verification failed:', message);

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleStripeWebhookEvent(event);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Stripe webhook handler failed:', error);

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
