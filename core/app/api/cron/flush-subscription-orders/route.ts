import { NextResponse } from 'next/server';

import { flushReadySubscriptionOrderBatches } from '~/lib/stripe/subscription-order-batch';

export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorizedCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  const authorization = request.headers.get('authorization');

  return authorization === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await flushReadySubscriptionOrderBatches();

    // eslint-disable-next-line no-console
    console.info(
      `Subscription order batch cron processed ${result.processed} batch(es); created orders: ${result.orderIds.join(', ') || 'none'}`,
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cron flush failed';

    // eslint-disable-next-line no-console
    console.error('Subscription order batch cron failed:', error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
