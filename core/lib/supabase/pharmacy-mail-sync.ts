import 'server-only';

import type { KnownSubscription } from '~/lib/pharmacy-mail/webhook';
import { getSupabaseClient } from '~/lib/supabase/client';

/*
 * =============================================================================
 * PHARMACY MAILBOX SYNC STATE, "EMAIL TO MATCH" AND WEBHOOK NOTIFICATIONS
 * =============================================================================
 * Owner decision Q10, 2026-10-14.
 *   public.pharmacy_mail_sync_state      one row per province mailbox folder
 *                                        (Inbox, Sent Items): the delta cursor,
 *                                        the run lock, the subscription.
 *   public.pharmacy_mail_unmatched       mail that looks like ours but could not
 *                                        be matched safely, for a pharmacist.
 *   public.pharmacy_mail_notifications   Graph notifications, saved before the
 *                                        202 (phase C), removed after 30 days.
 * Throws on query errors; the sync and the routes catch and log a code.
 * =============================================================================
 */

export type SyncFolder = 'inbox' | 'sentitems';

export interface SyncStateRow {
  pharmacy_region: string;
  folder: SyncFolder;
  mailbox_address: string;
  since: string;
  delta_link: string | null;
  next_link: string | null;
  last_run_at: string | null;
  last_success_at: string | null;
  last_error_code: string | null;
  last_error_at: string | null;
  subscription_id: string | null;
  subscription_expires_at: string | null;
  client_state_hash: string | null;
  lock_until: string | null;
  lock_owner: string | null;
  /** Runs in a row that stopped on a message that failed to ingest (the cursor stays on its page). */
  ingest_retry_runs?: number | null;
  /** When that page first failed. */
  ingest_failing_since?: string | null;
  updated_at: string;
}

/* The first sync reads a week back, so a reply that came before it is never skipped. */
const FIRST_SYNC_LOOKBACK_MS = 7 * 86_400_000;

export interface UnmatchedRow {
  id: string;
  pharmacy_region: string;
  mailbox_address: string;
  folder: SyncFolder;
  graph_message_id: string;
  internet_message_id: string | null;
  graph_conversation_id: string | null;
  from_address: string | null;
  to_addresses: string[];
  subject: string | null;
  received_at: string | null;
  body_text: string | null;
  reason: string;
  suggested_profile_id: string | null;
  suggested_thread_id: string | null;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  attached_message_id: string | null;
  created_at: string;
}

function fail(context: string, error: { message?: string; code?: string }): never {
  const wrapped = new Error(`${context}: ${error.message ?? 'query failed'}`);

  Object.assign(wrapped, { code: error.code ?? '' });
  throw wrapped;
}

function isSyncStateRow(value: unknown): value is SyncStateRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pharmacy_region' in value &&
    'folder' in value &&
    'mailbox_address' in value
  );
}

function isUnmatchedRow(value: unknown): value is UnmatchedRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'graph_message_id' in value &&
    'reason' in value
  );
}

export async function listSyncStates(): Promise<SyncStateRow[]> {
  const { data, error } = await getSupabaseClient().from('pharmacy_mail_sync_state').select('*');

  if (error) {
    fail('Mail sync state could not be read', error);
  }

  return Array.isArray(data) ? data.filter(isSyncStateRow) : [];
}

/*
 * The folder's row for this mailbox, created if missing (by the first sync,
 * or the mailbox's first send). A new mailbox address resets the row
 * (cursor, subscription and errors), so a changed mailbox never resumes
 * another mailbox's delta. The first delta reads mail from a week before the
 * row was made, so a reply that came before the first sync is not skipped.
 */
export async function ensureSyncState(input: {
  region: string;
  folder: SyncFolder;
  mailbox: string;
}): Promise<SyncStateRow> {
  const supabase = getSupabaseClient();
  const read = await supabase
    .from('pharmacy_mail_sync_state')
    .select('*')
    .eq('pharmacy_region', input.region)
    .eq('folder', input.folder)
    .maybeSingle();

  if (read.error) {
    fail('Mail sync state could not be read', read.error);
  }

  const existing: unknown = read.data;

  if (isSyncStateRow(existing) && existing.mailbox_address === input.mailbox) {
    return existing;
  }

  const reset = {
    pharmacy_region: input.region,
    folder: input.folder,
    mailbox_address: input.mailbox,
    since: new Date(Date.now() - FIRST_SYNC_LOOKBACK_MS).toISOString(),
    delta_link: null,
    next_link: null,
    last_error_code: null,
    last_error_at: null,
    ingest_retry_runs: 0,
    ingest_failing_since: null,
    subscription_id: null,
    subscription_expires_at: null,
    client_state_hash: null,
    lock_until: null,
    lock_owner: null,
    updated_at: new Date().toISOString(),
  };
  const written = await supabase
    .from('pharmacy_mail_sync_state')
    .upsert(reset, { onConflict: 'pharmacy_region,folder' })
    .select('*')
    .single();

  if (written.error) {
    fail('Mail sync state could not be saved', written.error);
  }

  const row: unknown = written.data;

  if (!isSyncStateRow(row)) {
    throw new Error('Mail sync state could not be saved.');
  }

  return row;
}

/*
 * Takes the folder's run lock for 4 minutes, if it is free or expired.
 * False: another run holds it, so this one skips.
 */
export async function acquireSyncLock(input: {
  region: string;
  folder: SyncFolder;
  owner: string;
  ttlMs?: number;
}): Promise<boolean> {
  const now = new Date();
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_mail_sync_state')
    .update({
      lock_until: new Date(now.getTime() + (input.ttlMs ?? 4 * 60_000)).toISOString(),
      lock_owner: input.owner,
      last_run_at: now.toISOString(),
    })
    .eq('pharmacy_region', input.region)
    .eq('folder', input.folder)
    .or(`lock_until.is.null,lock_until.lt.${now.toISOString()}`)
    .select('pharmacy_region');

  if (error) {
    fail('Mail sync lock could not be taken', error);
  }

  return Array.isArray(data) && data.length > 0;
}

export async function releaseSyncLock(input: {
  region: string;
  folder: SyncFolder;
  owner: string;
}): Promise<void> {
  await getSupabaseClient()
    .from('pharmacy_mail_sync_state')
    .update({ lock_until: null, lock_owner: null })
    .eq('pharmacy_region', input.region)
    .eq('folder', input.folder)
    .eq('lock_owner', input.owner);
}

export async function updateSyncState(
  region: string,
  folder: SyncFolder,
  patch: Partial<Omit<SyncStateRow, 'pharmacy_region' | 'folder'>>,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('pharmacy_mail_sync_state')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('pharmacy_region', region)
    .eq('folder', folder);

  if (error) {
    fail('Mail sync state could not be saved', error);
  }
}

/* Our subscriptions, for checking notifications. */
export async function listKnownSubscriptions(
  objectIdOf: (region: string) => string | null,
): Promise<Map<string, KnownSubscription>> {
  const rows = await listSyncStates();

  return new Map(
    rows.flatMap((row) =>
      row.subscription_id
        ? [
            [
              row.subscription_id,
              {
                subscriptionId: row.subscription_id,
                clientStateHash: row.client_state_hash,
                region: row.pharmacy_region,
                folder: row.folder,
                mailboxObjectId: objectIdOf(row.pharmacy_region),
              },
            ] as const,
          ]
        : [],
    ),
  );
}

export interface InsertUnmatchedInput {
  pharmacy_region: string;
  mailbox_address: string;
  folder: SyncFolder;
  graph_message_id: string;
  internet_message_id: string | null;
  graph_conversation_id: string | null;
  from_address: string | null;
  to_addresses: string[];
  subject: string | null;
  received_at: string | null;
  body_text: string | null;
  reason: string;
  suggested_profile_id: string | null;
  suggested_thread_id: string | null;
}

/* Idempotent on (mailbox, Graph id): a replayed message stays one row. */
export async function insertUnmatched(input: InsertUnmatchedInput): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('pharmacy_mail_unmatched')
    .upsert(input, { onConflict: 'mailbox_address,graph_message_id', ignoreDuplicates: true });

  if (error) {
    fail('Unmatched mail could not be saved', error);
  }
}

export async function listOpenUnmatched(limit = 100): Promise<UnmatchedRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_mail_unmatched')
    .select('*')
    .is('resolution', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    fail('Unmatched mail could not be read', error);
  }

  return Array.isArray(data)
    ? data.filter(isUnmatchedRow).map((row) => ({
        ...row,
        to_addresses: Array.isArray(row.to_addresses) ? row.to_addresses : [],
      }))
    : [];
}

export async function getUnmatchedById(id: string): Promise<UnmatchedRow | null> {
  const result = await getSupabaseClient()
    .from('pharmacy_mail_unmatched')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (result.error) {
    fail('Unmatched mail could not be read', result.error);
  }

  const row: unknown = result.data;

  return isUnmatchedRow(row)
    ? { ...row, to_addresses: Array.isArray(row.to_addresses) ? row.to_addresses : [] }
    : null;
}

/* Marks an open item attached or dismissed; false when someone else already did. */
export async function resolveUnmatched(input: {
  id: string;
  resolution: 'attached' | 'dismissed';
  resolvedBy: string;
  note?: string | null;
  attachedMessageId?: string | null;
}): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_mail_unmatched')
    .update({
      resolution: input.resolution,
      resolved_by: input.resolvedBy,
      resolved_at: new Date().toISOString(),
      resolution_note: input.note ?? null,
      attached_message_id: input.attachedMessageId ?? null,
    })
    .eq('id', input.id)
    .is('resolution', null)
    .select('id');

  if (error) {
    fail('Unmatched mail could not be updated', error);
  }

  return Array.isArray(data) && data.length > 0;
}

export async function insertNotifications(
  rows: Array<{
    subscription_id: string;
    change_type: string | null;
    lifecycle_event: string | null;
    resource_id: string | null;
  }>,
): Promise<Array<{ id: string }>> {
  if (rows.length === 0) {
    return [];
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_mail_notifications')
    .insert(rows)
    .select('id');

  if (error) {
    fail('Mail notifications could not be saved', error);
  }

  const read: unknown[] = Array.isArray(data) ? data : [];

  return read.flatMap((row) =>
    typeof row === 'object' && row !== null && 'id' in row ? [{ id: String(row.id) }] : [],
  );
}

export interface PendingNotification {
  id: string;
  subscription_id: string;
  lifecycle_event: string | null;
  resource_id: string | null;
}

/* Saved notifications not processed after `olderThanMs` (the cron picks these up). */
export async function listPendingNotifications(
  olderThanMs: number,
  limit = 100,
): Promise<PendingNotification[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_mail_notifications')
    .select('id, subscription_id, lifecycle_event, resource_id')
    .is('processed_at', null)
    .lt('received_at', new Date(Date.now() - olderThanMs).toISOString())
    .order('received_at', { ascending: true })
    .limit(limit);

  if (error) {
    fail('Mail notifications could not be read', error);
  }

  const read: unknown[] = Array.isArray(data) ? data : [];

  return read.flatMap((row) =>
    typeof row === 'object' && row !== null && 'id' in row && 'subscription_id' in row
      ? [
          {
            id: String(row.id),
            subscription_id: String(row.subscription_id),
            lifecycle_event:
              'lifecycle_event' in row && typeof row.lifecycle_event === 'string'
                ? row.lifecycle_event
                : null,
            resource_id:
              'resource_id' in row && typeof row.resource_id === 'string' ? row.resource_id : null,
          },
        ]
      : [],
  );
}

export async function markNotificationProcessed(
  id: string,
  errorCode: string | null,
): Promise<void> {
  await getSupabaseClient()
    .from('pharmacy_mail_notifications')
    .update({ processed_at: new Date().toISOString(), error_code: errorCode })
    .eq('id', id);
}

/* Notifications are kept 30 days, then removed (ids only; no content is ever in them). */
export async function purgeOldNotifications(): Promise<void> {
  await getSupabaseClient()
    .from('pharmacy_mail_notifications')
    .delete()
    .lt('received_at', new Date(Date.now() - 30 * 86_400_000).toISOString());
}
