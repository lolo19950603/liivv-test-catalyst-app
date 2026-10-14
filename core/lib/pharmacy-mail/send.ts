import 'server-only';

import { countRegionCodeSendsSince } from '~/lib/supabase/pharmacy-email-consent';
import { ensureSyncState } from '~/lib/supabase/pharmacy-mail-sync';
import {
  countMailboxSendsSince,
  countThreadEmailsSince,
  latestInboundEmail,
  type PharmacyMessageRow,
  type PharmacyThreadRow,
  updateMessage,
  updateThread,
} from '~/lib/supabase/pharmacy-threads';

import { pharmacyAppOrigin, pharmacyPlusReplyToEnabled } from './config';
import type { PharmacyMailbox } from './config-rules';
import type { PharmacyContactState } from './consent';
import { graphErrorCode, graphErrorStatus, graphRequest, mailboxPath } from './graph-client';
import { logPharmacyMail } from './log';
import { isPharmacyRegion, type PharmacyRegion } from './regions';
import { plusReplyToAddress } from './subject-ref';
import {
  CODE_EMAIL_SUBJECT,
  codeEmailBody,
  pharmacyEmailBody,
  pharmacyEmailSubject,
} from './templates';

/*
 * =============================================================================
 * SENDING A PHARMACIST'S MESSAGE BY EMAIL, FROM THE PROVINCE MAILBOX
 * =============================================================================
 * Owner decision Q10, 2026-10-14. Called after the message row is stored as
 * 'posted', so the message is on the customer's Pharmacy page whatever happens
 * to the email.
 *
 * A new email (the customer has not emailed into this mailbox on this thread):
 *   1. POST /users/{mailbox}/messages: the fixed subject, the text template,
 *      one To (the checked address from the server's contact state, never from
 *      a form), the plus-address Reply-To when on, and x-liivv-ref, which only
 *      helps match our own Sent Items copy.
 *   2. store the draft's id, conversationId and internetMessageId: 'queued'.
 *   3. POST …/messages/{id}/send: 'sent'. The sync later sees the Sent Items
 *      copy under the same immutable id and marks it 'confirmed'.
 * A reply in the same email thread (the customer emailed in):
 *   1. POST …/messages/{latest inbound}/createReply gives a draft;
 *   2. PATCH it: subject "RE: <fixed subject>", the template body (this
 *      REPLACES the quoted history, so earlier messages are never echoed out),
 *      the one checked To, no Cc or Bcc; if the PATCH fails the draft is
 *      deleted, so no draft addressed to the inbound Reply-To with the quoted
 *      history is ever left in Drafts;
 *   3. then as 2 and 3 above. Graph keeps the conversationId.
 *   When the customer's email is gone from the mailbox (the retention policy
 *   purged it, or it was deleted or archived: 404), a new email is sent
 *   instead, so the thread never stays unable to email.
 *
 * Failures: a draft whose row can't be stored is deleted (best effort); a
 * failed send is 'failed' with Graph's error.code. Retry sends the SAME draft
 * again, so no duplicate is created, but only while it still matches the
 * customer's current choice and checked address; otherwise the old draft is
 * deleted and the email made again under the current choice. A 403 means the
 * mailbox is outside the app's RBAC scope, the role is missing, or the RBAC
 * cache hasn't refreshed yet: "Ask IT to check the mailbox permission".
 *
 * Our limits sit well under Exchange's 30 a minute: 5 emails per thread an
 * hour and 20 per mailbox a minute (code emails included), counted in
 * Supabase, on every send and every retry.
 *
 * Never: Cc, Bcc, attachments, quoted history, the customer's name, or an
 * address typed by staff.
 * =============================================================================
 */

const THREAD_EMAILS_PER_HOUR = 5;

export const MAILBOX_EMAILS_PER_MINUTE = 20;

interface GraphDraft {
  id?: unknown;
  conversationId?: unknown;
  internetMessageId?: unknown;
}

export type SendOutcome = { ok: true } | { ok: false; code: string; userMessage: string };

export interface ThreadEmailInput {
  thread: PharmacyThreadRow;
  /** The message row, already posted to the Pharmacy page. */
  message: PharmacyMessageRow;
  mailbox: PharmacyMailbox;
  contact: PharmacyContactState;
  delivery: 'notice' | 'message';
  signAs: string;
  /** The pharmacist's text; in the email only when delivery is 'message'. */
  text: string;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function userMessageFor(code: string, status: number | null): string {
  if (status === 403) {
    return 'The email could not be sent: ask IT to check the mailbox permission. The message is on the customer’s Pharmacy page.';
  }

  if (code === 'thread_rate_limit') {
    return 'This thread has had 5 emails in the last hour, so no email was sent. The message is on the customer’s Pharmacy page.';
  }

  if (code === 'mailbox_rate_limit') {
    return 'This mailbox is busy, so no email was sent. Try Retry in a minute. The message is on the customer’s Pharmacy page.';
  }

  return `The email could not be sent (${code}). The message is on the customer’s Pharmacy page. Try Retry, or phone the customer.`;
}

/* Our limits, counted in Supabase (code emails count toward the mailbox's). Null when the email may go. */
async function rateLimitCode(threadId: string, mailbox: PharmacyMailbox): Promise<string | null> {
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const [threadCount, mailboxCount, codeCount] = await Promise.all([
    countThreadEmailsSince(threadId, new Date(now - 3_600_000).toISOString()),
    countMailboxSendsSince(mailbox.address, minuteAgo),
    countRegionCodeSendsSince(mailbox.region, minuteAgo),
  ]);

  if (threadCount >= THREAD_EMAILS_PER_HOUR) {
    return 'thread_rate_limit';
  }

  return mailboxCount + codeCount >= MAILBOX_EMAILS_PER_MINUTE ? 'mailbox_rate_limit' : null;
}

function regionOf(thread: PharmacyThreadRow): PharmacyRegion {
  return isPharmacyRegion(thread.pharmacy_region) ? thread.pharmacy_region : 'ON';
}

/* The fields every outbound draft carries: subject, text body, one To, the Reply-To. */
function draftFields(input: ThreadEmailInput, to: string) {
  const subject = pharmacyEmailSubject(input.thread.subject_ref);
  const replyTo = pharmacyPlusReplyToEnabled()
    ? plusReplyToAddress(input.mailbox.address, input.thread.subject_ref)
    : null;
  const body = pharmacyEmailBody({
    ref: input.thread.subject_ref,
    region: regionOf(input.thread),
    origin: pharmacyAppOrigin(),
    locale: input.contact.locale,
    signAs: input.signAs,
    messageText: input.delivery === 'message' ? input.text : null,
  });

  return {
    subject,
    body: { contentType: 'Text', content: body },
    toRecipients: [{ emailAddress: { address: to } }],
    ccRecipients: [],
    bccRecipients: [],
    ...(replyTo ? { replyTo: [{ emailAddress: { address: replyTo } }] } : {}),
  };
}

async function deleteDraft(mailbox: PharmacyMailbox, draftId: string): Promise<void> {
  try {
    await graphRequest({
      method: 'DELETE',
      path: `${mailboxPath(mailbox)}/messages/${encodeURIComponent(draftId)}`,
    });
  } catch (error) {
    logPharmacyMail('draft_delete_failed', { code: graphErrorCode(error) }, 'warn');
  }
}

function isGone(error: unknown): boolean {
  return graphErrorStatus(error) === 404 || graphErrorCode(error) === 'ErrorItemNotFound';
}

/*
 * A reply draft to the customer's latest emailed reply, or null when that
 * email is gone from the mailbox (retention, deletion or archive: 404), so
 * the caller sends a new email instead. A draft whose PATCH fails is deleted.
 */
async function createReplyDraft(
  input: ThreadEmailInput,
  fields: ReturnType<typeof draftFields>,
  inboundGraphId: string,
): Promise<GraphDraft | null> {
  const base = mailboxPath(input.mailbox);
  let reply: { data: GraphDraft | null };

  try {
    reply = await graphRequest<GraphDraft>({
      method: 'POST',
      path: `${base}/messages/${encodeURIComponent(inboundGraphId)}/createReply`,
      json: {},
    });
  } catch (error) {
    if (isGone(error)) {
      logPharmacyMail('reply_source_gone', { threadId: input.thread.id }, 'warn');

      return null;
    }

    throw error;
  }

  const draftId = text(reply.data?.id);

  if (!draftId) {
    throw new Error('createReply returned no draft id.');
  }

  try {
    // Replace the subject (the customer may have added health words), the
    // body (no quoted history) and the recipients (only the checked address).
    const patched = await graphRequest<GraphDraft>({
      method: 'PATCH',
      path: `${base}/messages/${encodeURIComponent(draftId)}`,
      json: { ...fields, subject: `RE: ${fields.subject}` },
    });

    return { ...reply.data, ...patched.data, id: draftId };
  } catch (error) {
    // The unpatched draft is addressed to the inbound Reply-To and quotes the
    // history: it must never stay in Drafts for someone to send by hand.
    await deleteDraft(input.mailbox, draftId);
    throw error;
  }
}

/* Creates the draft: a reply in the customer's email thread, or a new email. */
async function createDraft(input: ThreadEmailInput, to: string): Promise<GraphDraft> {
  const base = mailboxPath(input.mailbox);
  const fields = draftFields(input, to);
  const inbound = await latestInboundEmail(input.thread.id, input.mailbox.address);
  const reply = inbound?.graph_message_id
    ? await createReplyDraft(input, fields, inbound.graph_message_id)
    : null;

  if (reply) {
    return reply;
  }

  const created = await graphRequest<GraphDraft>({
    method: 'POST',
    path: `${base}/messages`,
    json: {
      ...fields,
      internetMessageHeaders: [{ name: 'x-liivv-ref', value: input.thread.subject_ref }],
    },
  });

  return created.data ?? {};
}

/* POST …/send on a stored draft, then 'sent' (or 'failed' with the code). */
async function sendDraft(
  input: Pick<ThreadEmailInput, 'thread' | 'message' | 'mailbox'>,
  draft: { id: string; conversationId: string | null },
): Promise<SendOutcome> {
  try {
    await graphRequest({
      method: 'POST',
      path: `${mailboxPath(input.mailbox)}/messages/${encodeURIComponent(draft.id)}/send`,
    });
  } catch (error) {
    const code = graphErrorCode(error);
    const status = graphErrorStatus(error);

    await updateMessage(input.message.id, { status: 'failed', error_code: code }).catch(
      () => undefined,
    );
    logPharmacyMail('send_failed', { threadId: input.thread.id, code, status }, 'warn');

    return { ok: false, code, userMessage: userMessageFor(code, status) };
  }

  // If this status update fails, the sync still confirms it from Sent Items.
  await updateMessage(input.message.id, {
    status: 'sent',
    sent_at: new Date().toISOString(),
    error_code: null,
  }).catch(() => undefined);

  // The thread follows the mailbox it last emailed from, so when a province's
  // mailbox address changes, replies to the new mailbox still match the thread.
  const mailboxChanged = input.thread.mailbox_address !== input.mailbox.address;

  if (mailboxChanged || !input.thread.graph_conversation_id) {
    await updateThread(input.thread.id, {
      mailbox_address: input.mailbox.address,
      graph_conversation_id: mailboxChanged
        ? draft.conversationId
        : (input.thread.graph_conversation_id ?? draft.conversationId),
    }).catch(() => undefined);
  }

  await ensureMailboxSyncRows(input.mailbox);
  logPharmacyMail('sent', { threadId: input.thread.id, region: input.thread.pharmacy_region });

  return { ok: true };
}

/*
 * The mailbox's sync rows exist from its first send, so the sync reads mail
 * from then on (and a week before), even when the first sync runs later.
 * Best effort: the next sync creates them otherwise.
 */
async function ensureMailboxSyncRows(mailbox: PharmacyMailbox): Promise<void> {
  await Promise.all(
    (['inbox', 'sentitems'] as const).map((folder) =>
      ensureSyncState({ region: mailbox.region, folder, mailbox: mailbox.address }).catch(
        () => undefined,
      ),
    ),
  );
}

/*
 * Emails the customer about a posted message. The contact state must allow
 * email (the caller checked sendPlanFor); the To address is its checked email.
 */
export async function sendThreadEmail(input: ThreadEmailInput): Promise<SendOutcome> {
  const to = input.contact.email;

  if (!to || input.contact.emailBlocked) {
    return {
      ok: false,
      code: 'email_not_allowed',
      userMessage: 'Email isn’t allowed for this customer.',
    };
  }

  const limited = await rateLimitCode(input.thread.id, input.mailbox);

  if (limited) {
    return { ok: false, code: limited, userMessage: userMessageFor(limited, null) };
  }

  let draft: GraphDraft;

  try {
    draft = await createDraft(input, to);
  } catch (error) {
    const code = graphErrorCode(error);
    const status = graphErrorStatus(error);

    await updateMessage(input.message.id, {
      status: 'failed',
      error_code: code,
      email_delivery: input.delivery,
      mailbox_address: input.mailbox.address,
      to_address: to,
    }).catch(() => undefined);
    logPharmacyMail('draft_failed', { threadId: input.thread.id, code, status }, 'warn');

    return { ok: false, code, userMessage: userMessageFor(code, status) };
  }

  const draftId = text(draft.id);

  if (!draftId) {
    return {
      ok: false,
      code: 'draft_missing_id',
      userMessage: userMessageFor('draft_missing_id', null),
    };
  }

  const conversationId = text(draft.conversationId);

  try {
    await updateMessage(input.message.id, {
      status: 'queued',
      email_delivery: input.delivery,
      subject: pharmacyEmailSubject(input.thread.subject_ref),
      mailbox_address: input.mailbox.address,
      from_address: input.mailbox.address,
      to_address: to,
      consent_id: input.contact.consentId,
      consent_mode: input.contact.mode,
      address_verified_at: input.contact.verified?.at ?? null,
      graph_message_id: draftId,
      internet_message_id: text(draft.internetMessageId),
      graph_conversation_id: conversationId,
    });
  } catch {
    await deleteDraft(input.mailbox, draftId);

    return { ok: false, code: 'store_failed', userMessage: userMessageFor('store_failed', null) };
  }

  return sendDraft(input, { id: draftId, conversationId });
}

/*
 * Whether a failed message's stored draft still matches what may be sent now:
 * the same checked address, the same email type (notice or message, from a
 * fresh send plan) and the same mailbox.
 */
function draftStillValid(input: ThreadEmailInput): boolean {
  return (
    input.message.to_address === input.contact.email &&
    input.message.email_delivery === input.delivery &&
    input.message.mailbox_address === input.mailbox.address
  );
}

/* Forgets a failed message's stored draft (deleted from the mailbox when it is this one). */
async function discardStoredDraft(input: ThreadEmailInput, draftId: string): Promise<void> {
  if (input.message.mailbox_address === input.mailbox.address) {
    await deleteDraft(input.mailbox, draftId);
  } else {
    logPharmacyMail('stale_draft_other_mailbox', { threadId: input.thread.id }, 'warn');
  }

  await updateMessage(input.message.id, {
    graph_message_id: null,
    internet_message_id: null,
    graph_conversation_id: null,
  }).catch(() => undefined);
}

/*
 * Retry after a failure. `input.contact` and `input.delivery` are the
 * customer's CURRENT choice (the caller ran sendPlanFor again). The same draft
 * is sent again when it still matches them, so no duplicate is created;
 * otherwise (the customer changed to notice-only, the owner turned the
 * message mode off, the address changed) the old draft is deleted and the
 * email made again under the current choice. The limits apply as on a send.
 */
export async function retryThreadEmail(input: ThreadEmailInput): Promise<SendOutcome> {
  const draftId = input.message.graph_message_id;

  if (input.message.status !== 'failed') {
    return { ok: false, code: 'not_failed', userMessage: 'Only a failed email can be retried.' };
  }

  if (!input.contact.email || input.contact.emailBlocked) {
    return {
      ok: false,
      code: 'email_not_allowed',
      userMessage: 'Email isn’t allowed for this customer.',
    };
  }

  if (draftId && !draftStillValid(input)) {
    await discardStoredDraft(input, draftId);

    return sendThreadEmail({ ...input, message: { ...input.message, graph_message_id: null } });
  }

  if (!draftId) {
    return sendThreadEmail(input);
  }

  const limited = await rateLimitCode(input.thread.id, input.mailbox);

  if (limited) {
    return { ok: false, code: limited, userMessage: userMessageFor(limited, null) };
  }

  const outcome = await sendDraft(input, {
    id: draftId,
    conversationId: input.message.graph_conversation_id,
  });

  if (!outcome.ok && outcome.code === 'ErrorItemNotFound') {
    await updateMessage(input.message.id, {
      graph_message_id: null,
      internet_message_id: null,
    }).catch(() => undefined);

    return sendThreadEmail({ ...input, message: { ...input.message, graph_message_id: null } });
  }

  return outcome;
}

/*
 * The 6-digit address-check code email, from the province mailbox. Returns
 * the Graph id. It carries x-liivv-kind: code, so the Sent Items sync knows
 * it as ours and never stores it (the code must not reach staff).
 */
export async function sendCodeEmail(input: {
  mailbox: PharmacyMailbox;
  to: string;
  code: string;
}): Promise<{ ok: true; graphId: string | null } | { ok: false; code: string }> {
  try {
    const created = await graphRequest<GraphDraft>({
      method: 'POST',
      path: `${mailboxPath(input.mailbox)}/messages`,
      json: {
        subject: CODE_EMAIL_SUBJECT,
        body: { contentType: 'Text', content: codeEmailBody(input.code) },
        toRecipients: [{ emailAddress: { address: input.to } }],
        internetMessageHeaders: [{ name: 'x-liivv-kind', value: 'code' }],
      },
    });
    const draftId = text(created.data?.id);

    if (!draftId) {
      return { ok: false, code: 'draft_missing_id' };
    }

    await graphRequest({
      method: 'POST',
      path: `${mailboxPath(input.mailbox)}/messages/${encodeURIComponent(draftId)}/send`,
    });

    return { ok: true, graphId: draftId };
  } catch (error) {
    const code = graphErrorCode(error);

    logPharmacyMail('code_email_failed', { region: input.mailbox.region, code }, 'warn');

    return { ok: false, code };
  }
}

/*
 * Mail status → Test connection: a token, then the Inbox's id. OK, 403 (the
 * RBAC scope, or the 2-hour cache), 404 (wrong mailbox) or a sign-in code.
 */
export async function testMailboxConnection(
  mailbox: PharmacyMailbox,
): Promise<{ ok: boolean; status: number | null; code: string | null }> {
  try {
    await graphRequest({
      path: `${mailboxPath(mailbox)}/mailFolders('Inbox')?$select=id`,
    });

    return { ok: true, status: 200, code: null };
  } catch (error) {
    return { ok: false, status: graphErrorStatus(error), code: graphErrorCode(error) };
  }
}
