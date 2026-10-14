import { waitUntil } from '@vercel/functions';

import { handleNotificationPost, handshakeFor } from '~/lib/pharmacy-mail/notifications';

/*
 * Microsoft Graph change notifications for the pharmacy mailboxes (owner
 * decision Q10, 2026-10-14, phase C). Graph validates this URL with
 * ?validationToken=… when a subscription is created; then each notification
 * is checked (clientState, tenant, mailbox), saved, answered 202 at once and
 * ingested after the response. See ~/lib/pharmacy-mail/notifications.ts.
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
