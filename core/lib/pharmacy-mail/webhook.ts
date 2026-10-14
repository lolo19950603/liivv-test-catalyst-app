/*
 * =============================================================================
 * MICROSOFT GRAPH CHANGE NOTIFICATIONS: HANDSHAKE AND CHECKS (pure)
 * =============================================================================
 * Owner decision Q10, 2026-10-14, phase C (webhooks are optional; the timed
 * sync works without them). Graph validates a notification URL by POSTing to
 * it with ?validationToken=…; the endpoint must answer 200, text/plain, with
 * the URL-decoded token, within 10 seconds. Every later notification carries
 * the subscription's clientState, which we generated (64 random hex
 * characters) and stored only as a sha256 hash.
 *
 * A notification is accepted only when its subscription is ours, the
 * clientState hash matches (timing-safe), the tenant is ours, and the
 * resource points at one of our mailboxes. Its resource data is never
 * trusted: ingest re-fetches the message with our own token, so a forged
 * notification can at most make us read our own mailbox.
 *
 * Also the cron bearer check (CRON_SECRET), timing-safe.
 * =============================================================================
 */

import { createHash, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

export const VALIDATION_TOKEN_MAX = 1024;
export const NOTIFICATION_BODY_MAX_BYTES = 1_048_576;

/*
 * The validation token from the request URL (URLSearchParams decodes it), or
 * null when absent, empty, too long, or holding control characters.
 */
export function validationTokenFrom(url: string | URL): string | null {
  let token: string | null;

  try {
    token = new URL(url).searchParams.get('validationToken');
  } catch {
    return null;
  }

  if (!token || token.length >= VALIDATION_TOKEN_MAX) {
    return null;
  }

  // eslint-disable-next-line no-control-regex
  return /[\u0000-\u001F\u007F]/.test(token) ? null : token;
}

/* The handshake answer: 200, text/plain, the decoded token, never sniffed or cached. */
export function handshakeResponse(token: string): Response {
  return new Response(token, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/* Equal-length, timing-safe comparison of two strings. */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');

  return left.length === right.length && timingSafeEqual(left, right);
}

/* Whether a notification's clientState hashes to the stored hash. */
export function clientStateMatches(
  clientState: string | null | undefined,
  storedHash: string | null,
): boolean {
  if (!clientState || !storedHash || clientState.length > 128) {
    return false;
  }

  return timingSafeStringEqual(sha256Hex(clientState), storedHash.toLowerCase());
}

/* "Authorization: Bearer <CRON_SECRET>", compared timing-safe. */
export function bearerMatches(
  authorization: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  const expected = String(secret ?? '').trim();

  if (!expected) {
    return false;
  }

  return timingSafeStringEqual(String(authorization ?? ''), `Bearer ${expected}`);
}

const NotificationItemSchema = z
  .object({
    subscriptionId: z.string().min(1).max(200),
    clientState: z.string().max(256).nullish(),
    changeType: z.string().max(40).nullish(),
    lifecycleEvent: z.string().max(60).nullish(),
    resource: z.string().max(1000).nullish(),
    tenantId: z.string().max(80).nullish(),
    subscriptionExpirationDateTime: z.string().max(60).nullish(),
    resourceData: z
      .object({ id: z.string().max(500).nullish() })
      .passthrough()
      .nullish(),
  })
  .passthrough();

export const NotificationBodySchema = z.object({
  value: z.array(NotificationItemSchema).max(1000),
});

export type NotificationItem = z.infer<typeof NotificationItemSchema>;

/* The parsed notification batch, or null when it isn't one. */
export function parseNotificationBody(raw: string): NotificationItem[] | null {
  let json: unknown;

  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }

  const parsed = NotificationBodySchema.safeParse(json);

  return parsed.success ? parsed.data.value : null;
}

/*
 * "Users/{mailbox-id}/Messages/{message-id}" (any case, with or without a
 * leading slash or a mailFolders segment) → the mailbox and message ids.
 */
export function parseMessageResource(
  resource: string | null | undefined,
): { mailboxId: string; messageId: string } | null {
  // "Users('id')/Messages('id')" reads the same as "Users/id/Messages/id".
  const normalized = String(resource ?? '').replace(/\('([^']*)'\)/g, '/$1');
  const match = /^\/?users\/([^/]+)\/(?:mailfolders\/[^/]+\/)?messages\/([^/?]+)$/i.exec(
    normalized,
  );

  if (!match?.[1] || !match[2]) {
    return null;
  }

  try {
    return {
      mailboxId: decodeURIComponent(match[1]).toLowerCase(),
      messageId: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

/* A subscription of ours, as stored in pharmacy_mail_sync_state. */
export interface KnownSubscription {
  subscriptionId: string;
  clientStateHash: string | null;
  region: string;
  folder: 'inbox' | 'sentitems';
  /** The mailbox's Entra object id, lower-cased. */
  mailboxObjectId: string | null;
}

export type NotificationCheck =
  | {
      ok: true;
      subscription: KnownSubscription;
      messageId: string | null;
      lifecycleEvent: string | null;
    }
  | {
      ok: false;
      reason: 'unknown_subscription' | 'client_state' | 'tenant' | 'resource';
    };

/* Whether one notification is genuinely ours; resource data is never used beyond the ids. */
export function checkNotification(
  item: NotificationItem,
  context: { subscriptions: ReadonlyMap<string, KnownSubscription>; tenantId: string | null },
): NotificationCheck {
  const subscription = context.subscriptions.get(item.subscriptionId);

  if (!subscription) {
    return { ok: false, reason: 'unknown_subscription' };
  }

  if (!clientStateMatches(item.clientState, subscription.clientStateHash)) {
    return { ok: false, reason: 'client_state' };
  }

  if (
    !context.tenantId ||
    String(item.tenantId ?? '').toLowerCase() !== context.tenantId.toLowerCase()
  ) {
    return { ok: false, reason: 'tenant' };
  }

  const lifecycleEvent = item.lifecycleEvent ?? null;

  if (lifecycleEvent) {
    return { ok: true, subscription, messageId: null, lifecycleEvent };
  }

  const resource = parseMessageResource(item.resource);

  if (
    !resource ||
    !subscription.mailboxObjectId ||
    resource.mailboxId !== subscription.mailboxObjectId
  ) {
    return { ok: false, reason: 'resource' };
  }

  return { ok: true, subscription, messageId: resource.messageId, lifecycleEvent: null };
}
