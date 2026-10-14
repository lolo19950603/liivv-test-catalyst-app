import 'server-only';

import {
  insertNotifications,
  listKnownSubscriptions,
  listPendingNotifications,
  markNotificationProcessed,
} from '~/lib/supabase/pharmacy-mail-sync';
import { isMessagesMigrationMissing } from '~/lib/supabase/pharmacy-threads';

import { graphTenantId, pharmacyWebhookHandshakeAllowed } from './config';
import { mailboxOf } from './config-rules';
import { graphErrorCode } from './graph-client';
import { ingestMailboxMessage } from './ingest';
import { logPharmacyMail } from './log';
import { isPharmacyRegion } from './regions';
import { forEachSequential } from './sequential';
import { handleLifecycleEvent } from './subscriptions';
import { enabledMailboxes } from './sync';
import {
  checkNotification,
  handshakeResponse,
  type KnownSubscription,
  NOTIFICATION_BODY_MAX_BYTES,
  parseNotificationBody,
  validationTokenFrom,
} from './webhook';

/*
 * =============================================================================
 * GRAPH NOTIFICATION REQUESTS (both webhook routes share this)
 * =============================================================================
 * Owner decision Q10, 2026-10-14, phase C. In order:
 *   1. ?validationToken=… : the handshake, 200 text/plain with the decoded
 *      token, at once (./config-rules.ts webhookHandshakeAllowed says when);
 *   2. a body over 1 MB: 413; not a notification batch: 400;
 *   3. each item checked (our subscription, clientState hash timing-safe, our
 *      tenant, our mailbox); failures are dropped and counted, never processed;
 *      when nothing passes: 403;
 *   4. the accepted items saved, then 202 at once (Graph wants an answer
 *      within 3 seconds);
 *   5. after the response, each message is re-fetched with our own token and
 *      ingested; lifecycle events renew, recreate or resync.
 * =============================================================================
 */

function objectIdOf(region: string): string | null {
  return isPharmacyRegion(region) ? (mailboxOf(process.env, region)?.objectId ?? null) : null;
}

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/* The handshake answer when the URL carries a validation token; null otherwise. */
export function handshakeFor(request: Request): Response | null {
  const token = validationTokenFrom(request.url);

  if (token === null) {
    return null;
  }

  if (!pharmacyWebhookHandshakeAllowed()) {
    return new Response('Webhooks are not enabled.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return handshakeResponse(token);
}

async function readCappedBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get('content-length') ?? '0');

  if (declared > NOTIFICATION_BODY_MAX_BYTES) {
    return null;
  }

  const text = await request.text();

  return Buffer.byteLength(text, 'utf8') > NOTIFICATION_BODY_MAX_BYTES ? null : text;
}

async function knownSubscriptions(): Promise<Map<string, KnownSubscription>> {
  try {
    return await listKnownSubscriptions(objectIdOf);
  } catch (error) {
    // No sync-state table (migration not run) or Supabase down: nothing is ours.
    logPharmacyMail(
      'subscriptions_unreadable',
      { code: isMessagesMigrationMissing(error) ? 'migration_missing' : 'database' },
      'warn',
    );

    return new Map();
  }
}

export interface AcceptedNotification {
  savedId: string | null;
  subscription: KnownSubscription;
  messageId: string | null;
  lifecycleEvent: string | null;
}

/* Ingests one accepted notification; never throws. */
export async function processNotification(item: AcceptedNotification): Promise<void> {
  let errorCode: string | null = null;

  try {
    if (item.lifecycleEvent) {
      await handleLifecycleEvent(item.subscription, item.lifecycleEvent);
    } else if (item.messageId) {
      const mailbox = enabledMailboxes().find(
        (candidate) => candidate.region === item.subscription.region,
      );

      if (mailbox) {
        await ingestMailboxMessage({
          mailbox,
          folder: item.subscription.folder,
          graphId: item.messageId,
        });
      }
    }
  } catch (error) {
    errorCode = graphErrorCode(error);
    logPharmacyMail(
      'notification_failed',
      { region: item.subscription.region, code: errorCode },
      'warn',
    );
  }

  if (item.savedId) {
    await markNotificationProcessed(item.savedId, errorCode).catch(() => undefined);
  }
}

/*
 * Handles a POST to either webhook route. `defer` runs work after the
 * response (waitUntil on Vercel).
 */
export async function handleNotificationPost(
  request: Request,
  defer: (work: Promise<unknown>) => void,
): Promise<Response> {
  const handshake = handshakeFor(request);

  if (handshake) {
    return handshake;
  }

  const raw = await readCappedBody(request);

  if (raw === null) {
    return json(413, { error: 'too_large' });
  }

  const items = parseNotificationBody(raw);

  if (!items) {
    return json(400, { error: 'invalid_notification' });
  }

  const context = { subscriptions: await knownSubscriptions(), tenantId: graphTenantId() };
  const accepted: AcceptedNotification[] = items.flatMap((item) => {
    const check = checkNotification(item, context);

    return check.ok
      ? [
          {
            savedId: null,
            subscription: check.subscription,
            messageId: check.messageId,
            lifecycleEvent: check.lifecycleEvent,
          },
        ]
      : [];
  });

  const rejected = items.length - accepted.length;

  if (rejected > 0) {
    logPharmacyMail('notifications_rejected', { count: rejected }, 'warn');
  }

  if (accepted.length === 0) {
    return json(403, { accepted: 0, rejected });
  }

  const saved = await insertNotifications(
    accepted.map((item) => ({
      subscription_id: item.subscription.subscriptionId,
      change_type: item.lifecycleEvent ? null : 'created',
      lifecycle_event: item.lifecycleEvent,
      resource_id: item.messageId,
    })),
  ).catch(() => []);

  accepted.forEach((item, index) => {
    item.savedId = saved[index]?.id ?? null;
  });
  defer(Promise.all(accepted.map((item) => processNotification(item))));

  return json(202, { accepted: accepted.length, rejected });
}

/* The cron: notifications saved more than 2 minutes ago and never processed. */
export async function processPendingNotifications(): Promise<number> {
  const pending = await listPendingNotifications(120_000);

  if (pending.length === 0) {
    return 0;
  }

  const subscriptions = await knownSubscriptions();

  await forEachSequential(pending, async (row) => {
    const subscription = subscriptions.get(row.subscription_id);

    if (!subscription) {
      await markNotificationProcessed(row.id, 'unknown_subscription').catch(() => undefined);

      return;
    }

    await processNotification({
      savedId: row.id,
      subscription,
      messageId: row.lifecycle_event ? null : row.resource_id,
      lifecycleEvent: row.lifecycle_event,
    });
  });

  return pending.length;
}
