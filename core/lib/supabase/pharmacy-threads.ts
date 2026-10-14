import 'server-only';

import { randomInt } from 'node:crypto';

import type { PharmacyRegion } from '~/lib/pharmacy-mail/regions';
import { generateSubjectRef } from '~/lib/pharmacy-mail/subject-ref';
import { getSupabaseClient } from '~/lib/supabase/client';

/*
 * =============================================================================
 * PHARMACIST-MESSAGE THREADS AND THEIR MESSAGES
 * =============================================================================
 * Owner decision Q10, 2026-10-14. One thread per CPAP prescription or mask
 * order (public.pharmacy_threads), holding every message about it
 * (public.pharmacy_messages): written in the Pharmacy admin, on the customer's
 * Pharmacy page, emailed back by the customer, sent by a pharmacist straight
 * from Outlook, or recorded by hand. The app thread is the record of the
 * communication; Outlook copies are temporary.
 *
 * Tables: ./pharmacy-messages-migration.sql (run by hand). Service role only.
 * Reads throw on a query error, so each caller decides how to fail: the admin
 * and the Pharmacy page show "Messages could not load" in that panel only
 * (see isMessagesMigrationMissing), and the send pipeline refuses.
 * =============================================================================
 */

export type ThreadTopic = 'cpap_prescription' | 'mask_order';
export type MessageDirection = 'to_customer' | 'from_customer' | 'staff_note' | 'system';
export type MessageSource = 'admin' | 'portal' | 'email' | 'outlook' | 'manual' | 'system';
export type EmailDelivery = 'none' | 'notice' | 'message' | 'mailto';
export type MessageStatus =
  | 'posted'
  | 'queued'
  | 'sent'
  | 'confirmed'
  | 'bounced'
  | 'failed'
  | 'received';

export interface PharmacyThreadRow {
  id: string;
  profile_id: string;
  subject_ref: string;
  topic: ThreadTopic;
  prescription_id: string | null;
  rx_order_check_id: string | null;
  pharmacy_region: string;
  mailbox_address: string | null;
  graph_conversation_id: string | null;
  status: string;
  waiting_on: string;
  last_message_at: string | null;
  created_by: string;
  closed_by: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PharmacyMessageRow {
  id: string;
  thread_id: string;
  direction: MessageDirection;
  source: MessageSource;
  email_delivery: EmailDelivery;
  status: MessageStatus;
  sender_label: string | null;
  staff_author: string | null;
  visible_to_customer: boolean;
  body_text: string;
  full_body_text: string | null;
  subject: string | null;
  mailbox_address: string | null;
  from_address: string | null;
  to_address: string | null;
  consent_id: string | null;
  consent_mode: string | null;
  address_verified_at: string | null;
  graph_message_id: string | null;
  internet_message_id: string | null;
  graph_conversation_id: string | null;
  in_reply_to: string | null;
  has_attachments: boolean;
  flags: string[];
  error_code: string | null;
  client_request_id: string | null;
  sent_at: string | null;
  received_at: string | null;
  customer_read_at: string | null;
  staff_read_at: string | null;
  staff_read_by: string | null;
  flags_reviewed_by?: string | null;
  flags_reviewed_at?: string | null;
  created_at: string;
}

export const MESSAGES_MIGRATION_HINT =
  'Messages could not load. If this is new, run pharmacy-messages-migration.sql in Supabase.';

/* Errors that mean the migration has not run (a table or column is missing). */
export function isMessagesMigrationMissing(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : '';

  return (
    ['42P01', '42703', 'PGRST204', 'PGRST205'].includes(code) ||
    /does not exist|schema cache/i.test(message)
  );
}

class SupabaseQueryError extends Error {
  readonly code: string;

  constructor(context: string, error: { code?: string; message?: string }) {
    super(`${context}: ${error.message ?? 'query failed'}`);
    this.name = 'SupabaseQueryError';
    this.code = error.code ?? '';
  }
}

function isThreadRow(value: unknown): value is PharmacyThreadRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'subject_ref' in value &&
    'profile_id' in value &&
    'topic' in value
  );
}

function isMessageRow(value: unknown): value is PharmacyMessageRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'thread_id' in value &&
    'direction' in value &&
    'body_text' in value
  );
}

function threadRows(data: unknown): PharmacyThreadRow[] {
  return Array.isArray(data) ? data.filter(isThreadRow) : [];
}

function messageRows(data: unknown): PharmacyMessageRow[] {
  return Array.isArray(data)
    ? data
        .filter(isMessageRow)
        .map((row) => ({ ...row, flags: Array.isArray(row.flags) ? row.flags : [] }))
    : [];
}

function recordColumn(topic: ThreadTopic): 'prescription_id' | 'rx_order_check_id' {
  return topic === 'cpap_prescription' ? 'prescription_id' : 'rx_order_check_id';
}

/* One thread matching a column, or null. Throws on a query error. */
async function getThreadBy(column: string, value: string): Promise<PharmacyThreadRow | null> {
  const result = await getSupabaseClient()
    .from('pharmacy_threads')
    .select('*')
    .eq(column, value)
    .maybeSingle();

  if (result.error) {
    throw new SupabaseQueryError('Pharmacy thread could not be read', result.error);
  }

  const row: unknown = result.data;

  return isThreadRow(row) ? row : null;
}

/* The thread for a CPAP prescription or mask order, or null when none yet. Throws on error. */
export function getThreadByRecord(
  topic: ThreadTopic,
  recordId: string,
): Promise<PharmacyThreadRow | null> {
  return getThreadBy(recordColumn(topic), recordId);
}

export function getThreadById(threadId: string): Promise<PharmacyThreadRow | null> {
  return getThreadBy('id', threadId);
}

export function getThreadByRef(ref: string): Promise<PharmacyThreadRow | null> {
  return getThreadBy('subject_ref', ref);
}

interface NewThreadInput {
  profileId: string;
  topic: ThreadTopic;
  recordId: string;
  region: PharmacyRegion;
  createdBy: string;
}

/*
 * Inserts the thread with a fresh random reference. On a unique clash either
 * the record got its thread meanwhile (returned), or the reference was taken
 * (another is drawn, up to 5 tries).
 */
async function insertThread(input: NewThreadInput, triesLeft: number): Promise<PharmacyThreadRow> {
  const result = await getSupabaseClient()
    .from('pharmacy_threads')
    .insert({
      profile_id: input.profileId,
      subject_ref: generateSubjectRef(randomInt),
      topic: input.topic,
      [recordColumn(input.topic)]: input.recordId,
      pharmacy_region: input.region,
      created_by: input.createdBy,
    })
    .select('*')
    .single();
  const row: unknown = result.data;

  if (!result.error && isThreadRow(row)) {
    return row;
  }

  if (result.error?.code !== '23505') {
    throw new SupabaseQueryError('Pharmacy thread could not be created', result.error ?? {});
  }

  const raced = await getThreadByRecord(input.topic, input.recordId);

  if (raced) {
    return raced;
  }

  if (triesLeft <= 1) {
    throw new Error('Pharmacy thread could not be created: no free reference.');
  }

  return insertThread(input, triesLeft - 1);
}

/*
 * The record's thread, created with a new random reference if there is none.
 * The province is fixed here and never changes. Two pharmacists opening one at
 * once both get the same thread (the unique index on the record decides).
 */
export async function getOrCreateThread(input: NewThreadInput): Promise<PharmacyThreadRow> {
  const existing = await getThreadByRecord(input.topic, input.recordId);

  return existing ?? insertThread(input, 5);
}

/* A profile's threads, newest activity first. */
export async function listThreadsForProfile(profileId: string): Promise<PharmacyThreadRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_threads')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new SupabaseQueryError('Pharmacy threads could not be read', error);
  }

  return threadRows(data);
}

/*
 * The messages of these threads, oldest first. `customerView` keeps only what
 * the customer may see (never staff notes, system events or hidden rows).
 */
export async function listMessagesForThreads(
  threadIds: readonly string[],
  options: { customerView: boolean },
): Promise<PharmacyMessageRow[]> {
  if (threadIds.length === 0) {
    return [];
  }

  let query = getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .in('thread_id', [...threadIds])
    .order('created_at', { ascending: true })
    .limit(1000);

  if (options.customerView) {
    query = query.eq('visible_to_customer', true).in('direction', ['to_customer', 'from_customer']);
  }

  const { data, error } = await query;

  if (error) {
    throw new SupabaseQueryError('Pharmacy messages could not be read', error);
  }

  return messageRows(data);
}

export interface InsertMessageInput {
  thread_id: string;
  direction: MessageDirection;
  source: MessageSource;
  status: MessageStatus;
  body_text: string;
  email_delivery?: EmailDelivery;
  sender_label?: string | null;
  staff_author?: string | null;
  visible_to_customer?: boolean;
  full_body_text?: string | null;
  subject?: string | null;
  mailbox_address?: string | null;
  from_address?: string | null;
  to_address?: string | null;
  consent_id?: string | null;
  consent_mode?: string | null;
  address_verified_at?: string | null;
  graph_message_id?: string | null;
  internet_message_id?: string | null;
  graph_conversation_id?: string | null;
  in_reply_to?: string | null;
  has_attachments?: boolean;
  flags?: string[];
  client_request_id?: string | null;
  sent_at?: string | null;
  received_at?: string | null;
}

/*
 * Stores one message. A repeated client_request_id (a double submit) or a
 * Graph id already stored (a replayed sync) returns the row already there.
 */
export async function insertMessage(input: InsertMessageInput): Promise<PharmacyMessageRow> {
  return (await insertMessageOnce(input)).row;
}

/* As insertMessage, saying whether this call created the row (false: a duplicate). */
export async function insertMessageOnce(
  input: InsertMessageInput,
): Promise<{ row: PharmacyMessageRow; created: boolean }> {
  const result = await getSupabaseClient()
    .from('pharmacy_messages')
    .insert(input)
    .select('*')
    .single();
  const row: unknown = result.data;

  if (!result.error && isMessageRow(row)) {
    return { row: { ...row, flags: Array.isArray(row.flags) ? row.flags : [] }, created: true };
  }

  if (result.error?.code === '23505') {
    const existing = await findDuplicateMessage(input);

    if (existing) {
      return { row: existing, created: false };
    }
  }

  throw new SupabaseQueryError('Pharmacy message could not be saved', result.error ?? {});
}

async function findDuplicateMessage(input: InsertMessageInput): Promise<PharmacyMessageRow | null> {
  if (input.client_request_id) {
    const found = await findMessageBy('client_request_id', input.client_request_id);

    if (found) {
      return found;
    }
  }

  if (input.mailbox_address && input.graph_message_id) {
    const found = await findMessageByGraphId(input.mailbox_address, input.graph_message_id);

    if (found) {
      return found;
    }
  }

  return input.mailbox_address && input.internet_message_id
    ? findMessageByInternetId(input.mailbox_address, input.internet_message_id)
    : null;
}

async function findMessageBy(column: string, value: string): Promise<PharmacyMessageRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq(column, value)
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  return messageRows(data)[0] ?? null;
}

export async function getMessageById(messageId: string): Promise<PharmacyMessageRow | null> {
  return findMessageBy('id', messageId);
}

export async function findMessageByGraphId(
  mailbox: string,
  graphId: string,
): Promise<PharmacyMessageRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq('mailbox_address', mailbox)
    .eq('graph_message_id', graphId)
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  return messageRows(data)[0] ?? null;
}

export async function findMessageByInternetId(
  mailbox: string,
  internetMessageId: string,
): Promise<PharmacyMessageRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq('mailbox_address', mailbox)
    .eq('internet_message_id', internetMessageId)
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  return messageRows(data)[0] ?? null;
}

/* The thread of the first stored message with one of these internetMessageIds. */
export async function findThreadIdByInternetIds(
  mailbox: string,
  internetMessageIds: readonly string[],
): Promise<string | null> {
  if (internetMessageIds.length === 0) {
    return null;
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('thread_id')
    .eq('mailbox_address', mailbox)
    .in('internet_message_id', [...internetMessageIds].slice(0, 50))
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  const first: unknown = Array.isArray(data) ? data[0] : null;

  return typeof first === 'object' && first !== null && 'thread_id' in first
    ? String(first.thread_id)
    : null;
}

/* The thread of a Graph conversation we took part in, in this mailbox. */
export async function findThreadIdByConversation(
  mailbox: string,
  conversationId: string,
): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('thread_id')
    .eq('mailbox_address', mailbox)
    .eq('graph_conversation_id', conversationId)
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  const first: unknown = Array.isArray(data) ? data[0] : null;

  return typeof first === 'object' && first !== null && 'thread_id' in first
    ? String(first.thread_id)
    : null;
}

/* Which of these conversation ids we know in this mailbox (one query per delta page). */
export async function knownConversationIds(
  mailbox: string,
  conversationIds: readonly string[],
): Promise<Set<string>> {
  const ids = [...new Set(conversationIds.filter(Boolean))];

  if (ids.length === 0) {
    return new Set();
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('graph_conversation_id')
    .eq('mailbox_address', mailbox)
    .in('graph_conversation_id', ids.slice(0, 200));

  if (error) {
    throw new SupabaseQueryError('Pharmacy conversations could not be read', error);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return new Set(
    rows.flatMap((row) =>
      typeof row === 'object' && row !== null && 'graph_conversation_id' in row
        ? [String(row.graph_conversation_id)]
        : [],
    ),
  );
}

export async function updateMessage(
  messageId: string,
  patch: Partial<Omit<PharmacyMessageRow, 'id' | 'thread_id' | 'created_at'>>,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .update(patch)
    .eq('id', messageId);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be updated', error);
  }
}

export async function updateThread(
  threadId: string,
  patch: Partial<
    Pick<
      PharmacyThreadRow,
      | 'mailbox_address'
      | 'graph_conversation_id'
      | 'status'
      | 'waiting_on'
      | 'last_message_at'
      | 'closed_by'
      | 'closed_at'
    >
  >,
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('pharmacy_threads')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', threadId);

  if (error) {
    throw new SupabaseQueryError('Pharmacy thread could not be updated', error);
  }
}

/*
 * After a message: who the thread now waits on, and its last activity. A
 * message from the customer reopens a closed thread.
 */
export async function noteThreadActivity(
  thread: Pick<PharmacyThreadRow, 'id' | 'status'>,
  waitingOn: 'none' | 'customer' | 'pharmacist',
): Promise<void> {
  const reopen = waitingOn === 'pharmacist' && thread.status === 'closed';

  await updateThread(thread.id, {
    waiting_on: waitingOn,
    last_message_at: new Date().toISOString(),
    ...(reopen ? { status: 'open', closed_at: null, closed_by: null } : {}),
  });
}

/* Opening the panel: the customer's unread messages are now read by this pharmacist. */
export async function markStaffRead(threadIds: readonly string[], readBy: string): Promise<number> {
  if (threadIds.length === 0) {
    return 0;
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .update({ staff_read_at: new Date().toISOString(), staff_read_by: readBy })
    .in('thread_id', [...threadIds])
    .eq('direction', 'from_customer')
    .is('staff_read_at', null)
    .select('id');

  if (error) {
    throw new SupabaseQueryError('Pharmacy messages could not be marked read', error);
  }

  return Array.isArray(data) ? data.length : 0;
}

/* The customer saw their Pharmacy page: their pharmacist's messages are read. */
export async function markCustomerRead(threadIds: readonly string[]): Promise<void> {
  if (threadIds.length === 0) {
    return;
  }

  const { error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .update({ customer_read_at: new Date().toISOString() })
    .in('thread_id', [...threadIds])
    .eq('direction', 'to_customer')
    .eq('visible_to_customer', true)
    .is('customer_read_at', null);

  if (error) {
    throw new SupabaseQueryError('Pharmacy messages could not be marked read', error);
  }
}

function countOf(result: {
  count: number | null;
  error: { code?: string; message?: string } | null;
}): number {
  if (result.error) {
    throw new SupabaseQueryError('Pharmacy messages could not be counted', result.error);
  }

  return result.count ?? 0;
}

/* Emails (Graph) on this thread since a time: at most 5 an hour. */
export async function countThreadEmailsSince(threadId: string, sinceIso: string): Promise<number> {
  return countOf(
    await getSupabaseClient()
      .from('pharmacy_messages')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', threadId)
      .in('email_delivery', ['notice', 'message'])
      .gte('created_at', sinceIso),
  );
}

/* Emails sent from one mailbox since a time: at most 20 a minute. */
export async function countMailboxSendsSince(mailbox: string, sinceIso: string): Promise<number> {
  return countOf(
    await getSupabaseClient()
      .from('pharmacy_messages')
      .select('id', { count: 'exact', head: true })
      .eq('mailbox_address', mailbox)
      .in('email_delivery', ['notice', 'message'])
      .gte('created_at', sinceIso),
  );
}

/* Replies a customer wrote on the Pharmacy page since a time, across their threads. */
export async function countPortalRepliesSince(
  threadIds: readonly string[],
  sinceIso: string,
): Promise<number> {
  if (threadIds.length === 0) {
    return 0;
  }

  return countOf(
    await getSupabaseClient()
      .from('pharmacy_messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', [...threadIds])
      .eq('source', 'portal')
      .gte('created_at', sinceIso),
  );
}

/* The newest reply the customer emailed into this mailbox on this thread (for createReply). */
export async function latestInboundEmail(
  threadId: string,
  mailbox: string,
): Promise<PharmacyMessageRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq('thread_id', threadId)
    .eq('mailbox_address', mailbox)
    .eq('direction', 'from_customer')
    .eq('source', 'email')
    .not('graph_message_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  return messageRows(data)[0] ?? null;
}

/* The newest Graph email sent on a thread (an NDR marks it bounced). */
export async function latestSentEmail(threadId: string): Promise<PharmacyMessageRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq('thread_id', threadId)
    .eq('direction', 'to_customer')
    .in('status', ['sent', 'confirmed', 'queued'])
    .not('to_address', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new SupabaseQueryError('Pharmacy message could not be read', error);
  }

  return messageRows(data)[0] ?? null;
}

export interface ReplyIndicators {
  /** CPAP prescription ids and mask-order (rx_order_checks) ids with unread customer replies. */
  prescriptionIds: Set<string>;
  rxOrderCheckIds: Set<string>;
}

/* For the "Replied" badges: records whose thread has unread customer messages. One grouped read. */
export async function listReplyIndicators(): Promise<ReplyIndicators> {
  const supabase = getSupabaseClient();
  const unread = await supabase
    .from('pharmacy_messages')
    .select('thread_id')
    .eq('direction', 'from_customer')
    .is('staff_read_at', null)
    .limit(1000);

  if (unread.error) {
    throw new SupabaseQueryError('Unread replies could not be read', unread.error);
  }

  const rows: unknown[] = Array.isArray(unread.data) ? unread.data : [];
  const threadIds = [
    ...new Set(
      rows.flatMap((row) =>
        typeof row === 'object' && row !== null && 'thread_id' in row
          ? [String(row.thread_id)]
          : [],
      ),
    ),
  ];
  const indicators: ReplyIndicators = { prescriptionIds: new Set(), rxOrderCheckIds: new Set() };

  if (threadIds.length === 0) {
    return indicators;
  }

  const threads = await supabase
    .from('pharmacy_threads')
    .select('id, prescription_id, rx_order_check_id')
    .in('id', threadIds.slice(0, 500));

  if (threads.error) {
    throw new SupabaseQueryError('Pharmacy threads could not be read', threads.error);
  }

  const read: unknown[] = Array.isArray(threads.data) ? threads.data : [];

  read.forEach((value) => {
    if (typeof value !== 'object' || value === null) {
      return;
    }

    if ('prescription_id' in value && typeof value.prescription_id === 'string') {
      indicators.prescriptionIds.add(value.prescription_id);
    }

    if ('rx_order_check_id' in value && typeof value.rx_order_check_id === 'string') {
      indicators.rxOrderCheckIds.add(value.rx_order_check_id);
    }
  });

  return indicators;
}

/* Outlook-direct messages flagged for the privacy officer and not yet reviewed. */
export async function listFlaggedOutlookMessages(limit = 100): Promise<PharmacyMessageRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('*')
    .eq('source', 'outlook')
    .neq('flags', '{}')
    .is('flags_reviewed_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new SupabaseQueryError('Flagged Outlook messages could not be read', error);
  }

  return messageRows(data);
}

export async function markFlagsReviewed(messageId: string, reviewedBy: string): Promise<void> {
  await updateMessage(messageId, {
    flags_reviewed_by: reviewedBy,
    flags_reviewed_at: new Date().toISOString(),
  });
}

/*
 * One audit row: ids and counts only, never message text. Best effort: an
 * audit failure is logged and never undoes or blocks the action itself.
 */
export async function insertPharmacyAudit(input: {
  threadId?: string | null;
  profileId?: string | null;
  actor: string;
  action: string;
  detail?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  try {
    const { error } = await getSupabaseClient()
      .from('pharmacy_message_audit')
      .insert({
        thread_id: input.threadId ?? null,
        profile_id: input.profileId ?? null,
        actor: input.actor.slice(0, 200),
        action: input.action,
        detail: input.detail ?? {},
      });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[pharmacy-mail] audit row could not be written', {
        action: input.action,
        code: error.code,
      });
    }
  } catch {
    // eslint-disable-next-line no-console
    console.error('[pharmacy-mail] audit row could not be written', { action: input.action });
  }
}

/* Attachment metadata of a synced email (phase B): the admin shows "open in Outlook". */
export async function insertAttachmentMeta(
  messageId: string,
  attachments: ReadonlyArray<{
    graph_attachment_id: string | null;
    name: string | null;
    content_type: string | null;
    size_bytes: number | null;
    is_inline: boolean;
    kind: string | null;
  }>,
): Promise<void> {
  if (attachments.length === 0) {
    return;
  }

  const { error } = await getSupabaseClient()
    .from('pharmacy_message_attachments')
    .insert(attachments.map((attachment) => ({ ...attachment, message_id: messageId })));

  if (error) {
    throw new SupabaseQueryError('Attachment details could not be saved', error);
  }
}

/* The account email of a profile (profiles.email, refreshed on every visit), lower-cased. */
export async function getProfileEmail(profileId: string): Promise<string | null> {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .maybeSingle();

  if (error) {
    throw new SupabaseQueryError('Customer profile could not be read', error);
  }

  const row: unknown = data;
  const email =
    typeof row === 'object' && row !== null && 'email' in row && typeof row.email === 'string'
      ? row.email.trim().toLowerCase()
      : '';

  return email || null;
}
