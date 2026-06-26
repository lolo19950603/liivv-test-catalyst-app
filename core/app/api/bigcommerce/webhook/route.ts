import { NextResponse } from 'next/server';

import { handleBigCommerceWebhookEvent } from '~/lib/bigcommerce/webhook-handlers';

export const runtime = 'nodejs';

function getBigCommerceWebhookSecret(): string | null {
  const secret = process.env.BIGCOMMERCE_WEBHOOK_SECRET?.trim();

  return secret || null;
}

function isAuthorizedWebhookRequest(request: Request, secret: string): boolean {
  const authorization = request.headers.get('authorization');

  return authorization === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  const webhookSecret = getBigCommerceWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'BIGCOMMERCE_WEBHOOK_SECRET is not configured' },
      { status: 503 },
    );
  }

  if (!isAuthorizedWebhookRequest(request, webhookSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: Parameters<typeof handleBigCommerceWebhookEvent>[0];

  try {
    payload = (await request.json()) as Parameters<typeof handleBigCommerceWebhookEvent>[0];
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    const result = await handleBigCommerceWebhookEvent(payload);

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('BigCommerce webhook handler failed:', error);

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
