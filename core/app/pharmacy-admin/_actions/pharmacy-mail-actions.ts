'use server';

import { revalidatePath } from 'next/cache';

import { runStaffAction } from '~/lib/action-gateway/session';
import {
  pharmacyEmailConsentApproved,
  pharmacyEmailRoute,
  pharmacyMessageModeOffered,
  pharmacyOutlookMailbox,
} from '~/lib/pharmacy-mail/config';
import {
  isPharmacyContactChoice,
  type PharmacyContactState,
  type SendPlan,
  sendPlanFor,
  wantsEmail,
} from '~/lib/pharmacy-mail/consent';
import { graphErrorCode } from '~/lib/pharmacy-mail/graph-client';
import { outlookFlags } from '~/lib/pharmacy-mail/match';
import { cleanOutboundText } from '~/lib/pharmacy-mail/sanitize';
import { retryThreadEmail, sendThreadEmail, testMailboxConnection } from '~/lib/pharmacy-mail/send';
import { parseSubjectRef } from '~/lib/pharmacy-mail/subject-ref';
import {
  formText,
  recordRegion,
  resolveStaffRecord,
  staffActor,
  type StaffRecord,
} from '~/lib/pharmacy-mail/staff-records';
import { reconnectMailboxes } from '~/lib/pharmacy-mail/subscriptions';
import { enabledMailboxes, syncAllMailboxes } from '~/lib/pharmacy-mail/sync';
import { maskEmail, pharmacistSenderLabel, validateSignAs } from '~/lib/pharmacy-mail/templates';
import { revalidateStaffPortalPaths } from '~/lib/staff-access';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  addConsent,
  addStaffConfirmedVerification,
  readContactState,
} from '~/lib/supabase/pharmacy-email-consent';
import {
  getUnmatchedById,
  resolveUnmatched,
  type UnmatchedRow,
} from '~/lib/supabase/pharmacy-mail-sync';
import {
  getMessageById,
  getOrCreateThread,
  getProfileEmail,
  getThreadById,
  getThreadByRef,
  insertMessage,
  type InsertMessageInput,
  insertMessageOnce,
  insertPharmacyAudit,
  isMessagesMigrationMissing,
  listMessagesForThreads,
  markFlagsReviewed,
  markStaffRead,
  MESSAGES_MIGRATION_HINT,
  noteThreadActivity,
  type PharmacyThreadRow,
  updateMessage,
  updateThread,
} from '~/lib/supabase/pharmacy-threads';

/*
 * =============================================================================
 * PHARMACY ADMIN: MESSAGES WITH THE CUSTOMER (owner decision Q10, 2026-10-14)
 * =============================================================================
 * The staff actions for pharmacist messages, kept apart from
 * staff-portal-actions.ts so its dispatcher doesn't grow. Every intent runs
 * behind runStaffAction, checks its ids, and records the pharmacist's typed
 * name and licence number with the login (the admin is one shared login).
 *
 * Send always posts the message to the customer's Pharmacy page first; then
 * the email part follows the send plan (~/lib/pharmacy-mail/consent.ts):
 * Graph from the province mailbox, the Outlook-draft fallback, or no email.
 * Retry runs the send plan again, so it follows the customer's current choice.
 *
 * Mail from "Email to match" is attached STAFF-ONLY by default. It is shown
 * on the customer's Pharmacy page only when the pharmacist asks AND it is
 * this customer's: the thread is the suggested customer's, the sender (or
 * the only To, for Outlook mail) is their checked address, and it passed the
 * spoofing check. Attaching to another customer's thread, or mail not from
 * the checked address, needs an explicit confirmation and stays staff-only.
 *
 * A pharmacist's Outlook email that went to anyone but the customer's checked
 * address alone is staff-only; "Show to customer" is allowed only when the
 * customer's checked address was a To recipient.
 *
 * Known limit (pre-existing): the admin is one shared login, so the typed
 * name and licence number and the "Sign as" name are not verified. Per-
 * pharmacist accounts are an owner and IT decision (see the build summary).
 * =============================================================================
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NOTE_MAX = 500;

export interface MailActionResult {
  ok?: boolean;
  error?: string;
  notice?: string;
  test?: Array<{ region: string; ok: boolean; status: number | null; code: string | null }>;
}

export type MailActionState = MailActionResult | null;

const UNAUTHORIZED = { ok: false, error: 'Unauthorized.' } as const;

const OUTCOMES: Record<string, string> = {
  notice_sent_outlook: 'Notice sent from Outlook',
  phoned_spoke: 'Phoned and spoke with the customer',
  phoned_voicemail: 'Phoned and left a voicemail with no details',
  could_not_reach: 'Couldn’t reach the customer',
};

interface Actor {
  actor: string;
  login: string;
}
type Handler = (formData: FormData, actor: Actor) => Promise<MailActionState>;

function failure(error: unknown, fallback: string): MailActionState {
  return {
    ok: false,
    error: isMessagesMigrationMissing(error) ? MESSAGES_MIGRATION_HINT : fallback,
  };
}

async function recordFrom(formData: FormData): Promise<StaffRecord | null> {
  const recordId = formText(formData, 'recordId');

  return UUID_RE.test(recordId) ? resolveStaffRecord(formText(formData, 'topic'), recordId) : null;
}

async function threadFor(record: StaffRecord, actor: Actor): Promise<PharmacyThreadRow> {
  return getOrCreateThread({
    profileId: record.profileId,
    topic: record.topic,
    recordId: record.recordId,
    region: recordRegion(record),
    createdBy: actor.actor,
  });
}

async function threadFrom(formData: FormData): Promise<PharmacyThreadRow | null> {
  const threadId = formText(formData, 'threadId');

  return UUID_RE.test(threadId) ? getThreadById(threadId) : null;
}

/* The thread named on the form, or the record's thread (created if needed). */
async function threadOrRecord(formData: FormData, actor: Actor): Promise<PharmacyThreadRow | null> {
  const thread = await threadFrom(formData);

  if (thread) {
    return thread;
  }

  const record = await recordFrom(formData);

  return record ? threadFor(record, actor) : null;
}

/* The email step failed after the message was posted: a warning, not a failure. */
class EmailWarning extends Error {}

/* The send plan for a thread now: the customer's current choice and the switches. */
async function currentPlan(
  thread: PharmacyThreadRow,
): Promise<{ contact: PharmacyContactState; plan: SendPlan }> {
  const accountEmail = await getProfileEmail(thread.profile_id);
  const contact = await readContactState(thread.profile_id, accountEmail);
  const route = pharmacyEmailRoute(thread.pharmacy_region);
  const plan = sendPlanFor({
    routeKind: route.kind,
    contact,
    messageModeOn: pharmacyMessageModeOffered(),
    emailApproved: pharmacyEmailConsentApproved(),
    mailtoMailboxSet: pharmacyOutlookMailbox(thread.pharmacy_region) !== null,
  });

  return { contact, plan };
}

/* After the message is posted: the email part, by the send plan. */
async function emailAfterPost(input: {
  thread: PharmacyThreadRow;
  messageId: string;
  signAs: string;
  text: string;
  actor: Actor;
}): Promise<string> {
  const route = pharmacyEmailRoute(input.thread.pharmacy_region);
  const { contact, plan } = await currentPlan(input.thread);

  if (route.kind !== 'graph' || (plan.kind !== 'graph_notice' && plan.kind !== 'graph_message')) {
    return plan.kind === 'none'
      ? 'Posted to the customer’s Pharmacy page. No email: phone the customer and record the outcome.'
      : 'Posted to the customer’s Pharmacy page. Now use the Outlook button, then press “I sent it”.';
  }

  const message = await getMessageById(input.messageId);

  if (!message) {
    return 'Posted to the customer’s Pharmacy page.';
  }

  const sent = await sendThreadEmail({
    thread: input.thread,
    message,
    mailbox: route.mailbox,
    contact,
    delivery: plan.kind === 'graph_message' ? 'message' : 'notice',
    signAs: input.signAs,
    text: input.text,
  });

  await insertPharmacyAudit({
    threadId: input.thread.id,
    profileId: input.thread.profile_id,
    actor: input.actor.actor,
    action: 'send',
    detail: { via: 'graph', delivery: plan.kind, ok: sent.ok },
  });

  if (!sent.ok) {
    throw new EmailWarning(sent.userMessage);
  }

  return plan.kind === 'graph_message'
    ? 'Posted to the Pharmacy page and emailed to the customer.'
    : 'Posted to the Pharmacy page. A notice email went to the customer.';
}

const sendMessage: Handler = async (formData, actor) => {
  const text = cleanOutboundText(formText(formData, 'text'));
  const signAs = validateSignAs(formText(formData, 'signAs'));
  const clientRequestId = formText(formData, 'clientRequestId');

  if (!text) {
    return { ok: false, error: 'Write a message of up to 2,000 characters.' };
  }

  if (!signAs.ok) {
    return { ok: false, error: signAs.error };
  }

  const record = await recordFrom(formData);

  if (!record || !UUID_RE.test(clientRequestId)) {
    return { ok: false, error: 'Invalid message payload.' };
  }

  const thread = await threadFor(record, actor);
  const { row: message, created } = await insertMessageOnce({
    thread_id: thread.id,
    direction: 'to_customer',
    source: 'admin',
    status: 'posted',
    sender_label: pharmacistSenderLabel(signAs.value),
    staff_author: actor.actor,
    visible_to_customer: true,
    body_text: text,
    client_request_id: clientRequestId,
  });

  if (!created) {
    // A double submit: the first one posted (and emailed) it already.
    return { ok: true, notice: 'This message was already posted.' };
  }

  await noteThreadActivity(thread, 'customer');
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'post',
  });

  try {
    return {
      ok: true,
      notice: await emailAfterPost({
        thread,
        messageId: message.id,
        signAs: signAs.value,
        text,
        actor,
      }),
    };
  } catch (error) {
    return {
      ok: true,
      error:
        error instanceof EmailWarning
          ? error.message
          : `Posted, but the email step failed (${graphErrorCode(error)}).`,
    };
  }
};

const retryEmail: Handler = async (formData, actor) => {
  const messageId = formText(formData, 'messageId');
  const signAs = validateSignAs(formText(formData, 'signAs'));
  const message = UUID_RE.test(messageId) ? await getMessageById(messageId) : null;
  const thread = message ? await getThreadById(message.thread_id) : null;

  if (!message || !thread) {
    return { ok: false, error: 'Message not found.' };
  }

  if (!signAs.ok) {
    return { ok: false, error: signAs.error };
  }

  // The customer's CURRENT choice decides, not what was stored at first send.
  const route = pharmacyEmailRoute(thread.pharmacy_region);
  const { contact, plan } = await currentPlan(thread);

  if (route.kind !== 'graph' || (plan.kind !== 'graph_notice' && plan.kind !== 'graph_message')) {
    return { ok: false, error: 'Email can’t be sent to this customer now. Phone them instead.' };
  }

  const result = await retryThreadEmail({
    thread,
    message,
    mailbox: route.mailbox,
    contact,
    delivery: plan.kind === 'graph_message' ? 'message' : 'notice',
    signAs: signAs.value,
    text: message.body_text,
  });

  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'retry',
    detail: { delivery: plan.kind, ok: result.ok },
  });

  return result.ok
    ? { ok: true, notice: 'The email was sent.' }
    : { ok: false, error: result.userMessage };
};

const recordOutcome: Handler = async (formData, actor) => {
  const outcome = OUTCOMES[formText(formData, 'outcome')];
  const note = cleanOutboundText(formText(formData, 'note'))?.slice(0, NOTE_MAX) ?? '';
  const record = await recordFrom(formData);

  if (!outcome || !record) {
    return { ok: false, error: 'Choose what happened.' };
  }

  const thread = await threadFor(record, actor);

  await insertMessage({
    thread_id: thread.id,
    direction: 'staff_note',
    source: 'manual',
    status: 'posted',
    staff_author: actor.actor,
    visible_to_customer: false,
    body_text: note ? `${outcome}: ${note}` : outcome,
  });
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'outcome',
  });

  return { ok: true, notice: 'Outcome recorded (staff only).' };
};

/* "I sent it" after the Outlook draft: the latest posted message is marked as emailed from Outlook. */
const mailtoSent: Handler = async (formData, actor) => {
  const thread = await threadOrRecord(formData, actor);
  const kind = formText(formData, 'kind');

  if (!thread) {
    return { ok: false, error: 'Thread not found.' };
  }

  const contact = await readContactState(
    thread.profile_id,
    await getProfileEmail(thread.profile_id),
  );

  if (kind === 'address_check') {
    await insertMessage({
      thread_id: thread.id,
      direction: 'staff_note',
      source: 'manual',
      status: 'posted',
      staff_author: actor.actor,
      visible_to_customer: false,
      body_text: `Address check sent from Outlook to ${maskEmail(contact.email)}.`,
    });

    return {
      ok: true,
      notice: 'Recorded. When the customer replies “yes”, press “Customer confirmed this address”.',
    };
  }

  const messages = await listMessagesForThreads([thread.id], { customerView: false });
  const latest = [...messages]
    .reverse()
    .find(
      (message) =>
        message.direction === 'to_customer' &&
        message.source === 'admin' &&
        message.email_delivery === 'none',
    );

  if (!latest) {
    return { ok: false, error: 'Post the message first, then send the Outlook notice.' };
  }

  await updateMessage(latest.id, {
    email_delivery: 'mailto',
    status: 'sent',
    sent_at: new Date().toISOString(),
    to_address: contact.email,
    consent_id: contact.consentId,
    consent_mode: contact.mode,
    address_verified_at: contact.verified?.at ?? null,
  });
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'send',
    detail: { via: 'mailto' },
  });

  return { ok: true, notice: 'Recorded: the notice was sent from Outlook.' };
};

const setThreadStatus =
  (status: 'open' | 'closed'): Handler =>
  async (formData, actor) => {
    const thread = await threadFrom(formData);

    if (!thread) {
      return { ok: false, error: 'Thread not found.' };
    }

    await updateThread(thread.id, {
      status,
      closed_by: status === 'closed' ? actor.actor : null,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
      waiting_on: status === 'closed' ? 'none' : thread.waiting_on,
    });
    await insertPharmacyAudit({
      threadId: thread.id,
      profileId: thread.profile_id,
      actor: actor.actor,
      action: status === 'closed' ? 'close' : 'reopen',
    });

    return { ok: true };
  };

/* After the Outlook test email: the customer replied "yes" from the consented address. */
const staffConfirmedAddress: Handler = async (formData, actor) => {
  const thread = await threadOrRecord(formData, actor);

  if (!thread) {
    return { ok: false, error: 'Thread not found.' };
  }

  const accountEmail = await getProfileEmail(thread.profile_id);
  const contact = await readContactState(thread.profile_id, accountEmail);

  if (!wantsEmail(contact) || !contact.email || contact.email !== accountEmail) {
    return {
      ok: false,
      error: 'The customer hasn’t chosen email for their current account address.',
    };
  }

  await addStaffConfirmedVerification({
    profileId: thread.profile_id,
    email: contact.email,
    confirmedBy: actor.actor,
    region: thread.pharmacy_region,
  });
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'verify',
    detail: { method: 'staff_confirmed' },
  });

  return { ok: true, notice: 'Address recorded as checked.' };
};

/* A contact choice the customer gave on the phone. */
const staffPhoneConsent: Handler = async (formData, actor) => {
  const thread = await threadOrRecord(formData, actor);
  const mode = formText(formData, 'mode');

  if (!thread || !isPharmacyContactChoice(mode)) {
    return { ok: false, error: 'Choose how the customer wants to be contacted.' };
  }

  if (mode !== 'no_email' && !pharmacyEmailConsentApproved()) {
    return {
      ok: false,
      error:
        'Email can’t be offered until the consent wording is approved. Record “Don’t email me”.',
    };
  }

  if (mode === 'message_by_email' && !pharmacyMessageModeOffered()) {
    return { ok: false, error: 'Emailing the pharmacist’s message isn’t switched on.' };
  }

  const accountEmail = await getProfileEmail(thread.profile_id);

  if (mode !== 'no_email' && !accountEmail) {
    return { ok: false, error: 'The customer’s account has no email address.' };
  }

  await addConsent({
    profileId: thread.profile_id,
    mode,
    accountEmail,
    locale: null,
    source: 'staff_phone',
    recordedBy: actor.actor,
  });
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'consent',
    detail: { mode, source: 'staff_phone' },
  });

  return { ok: true, notice: 'Contact choice recorded.' };
};

/* The checked address of a thread's customer, or null. */
async function checkedEmailOf(thread: PharmacyThreadRow): Promise<string | null> {
  const contact = await readContactState(
    thread.profile_id,
    await getProfileEmail(thread.profile_id),
  );

  return contact.verified ? contact.email : null;
}

/*
 * Whether an unmatched email is this thread customer's own: the suggested
 * customer (when there is one), and sent from (or, from Outlook, only to)
 * their checked address.
 */
function belongsToThread(item: UnmatchedRow, thread: PharmacyThreadRow, checked: string | null) {
  const sameCustomer =
    item.suggested_profile_id === null || item.suggested_profile_id === thread.profile_id;
  const addressMatches =
    checked !== null &&
    (item.folder === 'inbox'
      ? item.from_address === checked
      : item.to_addresses.length === 1 && item.to_addresses[0] === checked);

  return { sameCustomer, addressMatches };
}

/* Why an unmatched email can't be shown to the customer, or null when it can. */
function showRefusal(
  item: UnmatchedRow,
  match: { sameCustomer: boolean; addressMatches: boolean },
): string | null {
  if (item.reason === 'auth_failed') {
    return 'This email didn’t pass the spoofing check, so it can only be attached staff-only.';
  }

  if (!match.sameCustomer) {
    return 'This email was suggested for another customer, so it can only be attached staff-only.';
  }

  return match.addressMatches
    ? null
    : 'This email isn’t from (or only to) the customer’s checked address, so it can only be attached staff-only.';
}

/* The sender label of an attached email: "You" only on the customer's own shown email. */
function attachedSenderLabel(item: UnmatchedRow, show: boolean): string {
  if (item.folder !== 'inbox') {
    return 'Liivv pharmacist (sent from Outlook)';
  }

  return show ? 'You' : `Email from ${maskEmail(item.from_address)}`;
}

/* The message row for an attached unmatched email: shown to the customer, or staff-only. */
function attachedMessageInput(
  item: UnmatchedRow,
  thread: PharmacyThreadRow,
  input: { show: boolean; actor: string; flags: string[] },
): InsertMessageInput {
  const fromCustomer = item.folder === 'inbox';
  const shownDirection = fromCustomer ? 'from_customer' : 'to_customer';

  return {
    thread_id: thread.id,
    direction: input.show ? shownDirection : 'staff_note',
    source: fromCustomer ? 'email' : 'outlook',
    status: fromCustomer ? 'received' : 'sent',
    sender_label: attachedSenderLabel(item, input.show),
    staff_author: input.actor,
    visible_to_customer: input.show,
    body_text: item.body_text || '(No text: open in Outlook.)',
    subject: item.subject,
    mailbox_address: item.mailbox_address,
    from_address: item.from_address,
    to_address: item.to_addresses.join(', ').slice(0, 500) || null,
    graph_message_id: item.graph_message_id,
    internet_message_id: item.internet_message_id,
    graph_conversation_id: item.graph_conversation_id,
    flags: input.flags,
    received_at: fromCustomer ? item.received_at : null,
    sent_at: fromCustomer ? null : item.received_at,
  };
}

/* The privacy officer's flags on an Outlook email attached by hand. */
async function attachFlags(
  item: UnmatchedRow,
  thread: PharmacyThreadRow,
  checked: string | null,
): Promise<string[]> {
  if (item.folder !== 'sentitems') {
    return [];
  }

  const { contact } = await currentPlan(thread);

  return outlookFlags({
    to: item.to_addresses,
    cc: [],
    bcc: [],
    checkedEmail: checked,
    contactMode: contact.mode,
  });
}

const attachUnmatched: Handler = async (formData, actor) => {
  const unmatchedId = formText(formData, 'unmatchedId');
  const item = UUID_RE.test(unmatchedId) ? await getUnmatchedById(unmatchedId) : null;
  const ref = parseSubjectRef(formText(formData, 'threadRef'));
  const thread = (await threadFrom(formData)) ?? (ref ? await getThreadByRef(ref) : null);

  if (!item || item.resolution || !thread) {
    return { ok: false, error: 'Choose an open email and a thread.' };
  }

  const wantShow = formText(formData, 'show') === 'yes';
  const checked = await checkedEmailOf(thread);
  const match = belongsToThread(item, thread, checked);

  if ((!match.sameCustomer || !match.addressMatches) && formText(formData, 'confirm') !== 'yes') {
    return {
      ok: false,
      error:
        'This email isn’t from this customer’s checked address, or was suggested for another customer. Check the reference, then tick “I checked this email belongs to this thread” to attach it staff-only.',
    };
  }

  const refusal = wantShow ? showRefusal(item, match) : null;

  if (refusal) {
    return { ok: false, error: refusal };
  }

  const flags = await attachFlags(item, thread, checked);
  const message = await insertMessage(
    attachedMessageInput(item, thread, { show: wantShow, actor: actor.actor, flags }),
  );
  const resolved = await resolveUnmatched({
    id: item.id,
    resolution: 'attached',
    resolvedBy: actor.actor,
    attachedMessageId: message.id,
  });

  if (wantShow && item.folder === 'inbox') {
    await noteThreadActivity(thread, 'pharmacist');
  }

  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'attach',
    detail: { shown: wantShow, reason: item.reason, flags: flags.length },
  });

  if (!resolved) {
    return { ok: false, error: 'Someone already handled this email.' };
  }

  return {
    ok: true,
    notice: wantShow
      ? 'Attached and shown on the customer’s Pharmacy page.'
      : 'Attached to the thread, staff only.',
  };
};

const dismissUnmatched: Handler = async (formData, actor) => {
  const unmatchedId = formText(formData, 'unmatchedId');
  const reason = formText(formData, 'reason').slice(0, NOTE_MAX);

  if (!UUID_RE.test(unmatchedId) || !reason) {
    return { ok: false, error: 'Give a reason for dismissing this email.' };
  }

  const resolved = await resolveUnmatched({
    id: unmatchedId,
    resolution: 'dismissed',
    resolvedBy: actor.actor,
    note: reason,
  });

  await insertPharmacyAudit({ actor: actor.actor, action: 'dismiss', detail: { unmatchedId } });

  return resolved ? { ok: true } : { ok: false, error: 'Someone already handled this email.' };
};

/* "Reviewed" or "Keep staff-only" on a flagged Outlook email. */
const outlookReviewed: Handler = async (formData, actor) => {
  const messageId = formText(formData, 'messageId');

  if (!UUID_RE.test(messageId)) {
    return { ok: false, error: 'Message not found.' };
  }

  await markFlagsReviewed(messageId, actor.actor);

  return { ok: true };
};

/*
 * "Show to customer" on a staff-only Outlook email: only when the customer's
 * checked address was one of its To recipients, so the customer's page never
 * shows an email they didn't receive.
 */
const outlookShow: Handler = async (formData, actor) => {
  const messageId = formText(formData, 'messageId');
  const message = UUID_RE.test(messageId) ? await getMessageById(messageId) : null;
  const thread = message ? await getThreadById(message.thread_id) : null;

  // A pharmacist's Outlook email: synced from Sent Items, or attached staff-only from Email to match.
  const outlookEmail =
    message?.source === 'outlook' &&
    (message.direction === 'to_customer' || message.direction === 'staff_note');

  if (!message || !thread || !outlookEmail) {
    return { ok: false, error: 'Message not found.' };
  }

  const checked = await checkedEmailOf(thread);
  const recipients = String(message.to_address ?? '')
    .split(',')
    .map((address) => address.trim().toLowerCase());

  if (!checked || !recipients.includes(checked)) {
    return {
      ok: false,
      error:
        'The customer’s checked address wasn’t a recipient of this email, so it stays staff-only.',
    };
  }

  await updateMessage(message.id, {
    direction: 'to_customer',
    sender_label: 'Liivv pharmacist (sent from Outlook)',
    visible_to_customer: true,
  });
  await markFlagsReviewed(message.id, actor.actor);
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'show',
    detail: { flags: message.flags.length },
  });

  return { ok: true, notice: 'Shown on the customer’s Pharmacy page.' };
};

/* Opening the panel: audits the view, and the customer's unread messages are read. */
const markRead: Handler = async (formData, actor) => {
  const thread = await threadFrom(formData);

  if (!thread) {
    return { ok: false };
  }

  const count = await markStaffRead([thread.id], actor.actor);

  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: actor.actor,
    action: 'view',
    detail: { marked: count },
  });

  // Only a change refreshes the admin (ok: true revalidates); a plain view does not.
  return { ok: count > 0 };
};

const syncNow: Handler = async () => {
  if (enabledMailboxes().length === 0) {
    return {
      ok: false,
      error: 'Email from the website isn’t switched on, so there is nothing to sync.',
    };
  }

  const results = await syncAllMailboxes(20_000);
  const failed = results.filter((result) => result.outcome === 'error');

  return failed.length > 0
    ? {
        ok: true,
        error: `Synced, with errors: ${failed.map((result) => `${result.region} ${result.folder} ${result.code ?? ''}`).join('; ')}`,
      }
    : { ok: true, notice: `Synced ${results.length} mailbox folders.` };
};

const reconnect: Handler = async (_formData, actor) => {
  if (enabledMailboxes().length === 0) {
    return { ok: false, error: 'Email from the website isn’t switched on.' };
  }

  await reconnectMailboxes();
  await syncAllMailboxes(20_000);
  await insertPharmacyAudit({ actor: actor.actor, action: 'reconnect' });

  return { ok: true, notice: 'Reconnected and synced.' };
};

const testConnection: Handler = async () => {
  const mailboxes = enabledMailboxes();

  if (mailboxes.length === 0) {
    return { ok: false, error: 'No province has Microsoft 365 email switched on yet.' };
  }

  const test = await Promise.all(
    mailboxes.map(async (mailbox) => ({
      region: mailbox.region,
      ...(await testMailboxConnection(mailbox)),
    })),
  );

  return { ok: true, test };
};

/* Which intents need the pharmacist's typed name and licence number. */
const HANDLERS: Record<string, { handler: Handler; requireName: boolean }> = {
  pharmacy_thread_send: { handler: sendMessage, requireName: true },
  pharmacy_thread_retry: { handler: retryEmail, requireName: true },
  pharmacy_thread_record_outcome: { handler: recordOutcome, requireName: true },
  pharmacy_thread_mailto_sent: { handler: mailtoSent, requireName: true },
  pharmacy_thread_close: { handler: setThreadStatus('closed'), requireName: true },
  pharmacy_thread_reopen: { handler: setThreadStatus('open'), requireName: true },
  pharmacy_address_staff_confirmed: { handler: staffConfirmedAddress, requireName: true },
  pharmacy_contact_staff_phone: { handler: staffPhoneConsent, requireName: true },
  pharmacy_unmatched_attach: { handler: attachUnmatched, requireName: true },
  pharmacy_unmatched_dismiss: { handler: dismissUnmatched, requireName: true },
  pharmacy_outlook_reviewed: { handler: outlookReviewed, requireName: true },
  pharmacy_outlook_show: { handler: outlookShow, requireName: true },
  pharmacy_thread_mark_read: { handler: markRead, requireName: false },
  pharmacy_mail_sync_now: { handler: syncNow, requireName: false },
  pharmacy_mail_reconnect: { handler: reconnect, requireName: true },
  pharmacy_mail_test: { handler: testConnection, requireName: false },
};

export async function pharmacyMailStaffAction(
  _prevState: MailActionState,
  formData: FormData,
): Promise<MailActionState> {
  return runStaffAction(UNAUTHORIZED, async (): Promise<MailActionState> => {
    if (!isSupabaseConfigured()) {
      return { ok: false, error: 'Supabase is not configured.' };
    }

    const entry = HANDLERS[formText(formData, 'intent')];

    if (!entry) {
      return { ok: false, error: 'Invalid request.' };
    }

    const actor = await staffActor(formData, { requireName: entry.requireName });

    if ('unauthorized' in actor) {
      return UNAUTHORIZED;
    }

    if ('error' in actor) {
      return { ok: false, error: actor.error };
    }

    try {
      const result = await entry.handler(formData, actor);

      if (result?.ok) {
        revalidateStaffPortalPaths(revalidatePath);
      }

      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[pharmacy-mail] staff action failed', {
        intent: formText(formData, 'intent'),
        code: graphErrorCode(error),
      });

      return failure(error, 'That didn’t work. Please try again.');
    }
  });
}
