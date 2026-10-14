import { waitUntil } from '@vercel/functions';

import { handleNotificationPost, handshakeFor } from '~/lib/pharmacy-mail/notifications';

/*
 * Microsoft Graph lifecycle notifications for the pharmacy mailbox
 * subscriptions (owner decision Q10, 2026-10-14, phase C):
 * reauthorizationRequired renews, subscriptionRemoved recreates and resyncs,
 * missed resyncs. Validated and checked exactly like the notification route.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export function GET(request: Request): Response {
  return (
    handshakeFor(request) ??
    new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } })
  );
}

export async function POST(request: Request): Promise<Response> {
  return handleNotificationPost(request, waitUntil);
}
