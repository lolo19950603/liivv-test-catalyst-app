import 'server-only';

import {
  isCodeEmailGraphId,
  profilesByConsentedEmail,
  readContactState,
} from '~/lib/supabase/pharmacy-email-consent';
import { insertUnmatched, type SyncFolder } from '~/lib/supabase/pharmacy-mail-sync';
import {
  findMessageByGraphId,
  findMessageByInternetId,
  findThreadIdByConversation,
  findThreadIdByInternetIds,
  getProfileEmail,
  getThreadById,
  getThreadByRef,
  insertAttachmentMeta,
  insertMessage,
  insertPharmacyAudit,
  latestSentEmail,
  noteThreadActivity,
  type PharmacyMessageRow,
  type PharmacyThreadRow,
  updateMessage,
} from '~/lib/supabase/pharmacy-threads';

import { pharmacyEmailRoute, pharmacyOwnMailboxes } from './config';
import type { PharmacyMailbox } from './config-rules';
import { graphErrorCode, graphErrorStatus, graphRequest, mailboxPath } from './graph-client';
import { logPharmacyMail } from './log';
import {
  bouncedRecipient,
  correlationKeys,
  type CorrelationKeys,
  decideInboundMatch,
  decideSentItem,
  firstCandidate,
  headerValue,
  isAutoReply,
  isCodeEmail,
  isLiivvSend,
  isNonDeliveryReport,
  type MailSummary,
  type ThreadCandidate,
} from './match';
import { cleanSubject, messageBodies } from './sanitize';
import { parseSubjectRef } from './subject-ref';
import { CODE_EMAIL_SUBJECT } from './templates';

/*
 * =============================================================================
 * INGESTING ONE MAILBOX MESSAGE (delta sync, webhooks and "Sync now")
 * =============================================================================
 * Owner decision Q10, 2026-10-14. Idempotent: a message already stored (same
 * immutable id or internetMessageId) only has its status updated, so the
 * replays Microsoft warns about do nothing. The rules are in ./match.ts:
 *   Inbox       NDR → the matching outbound message is 'bounced';
 *               auto-reply → a one-line staff-only event, no body;
 *               a reply → attached to the thread, or "Email to match";
 *               our own mailboxes and unrelated mail → ignored, never stored.
 *   Sent Items  our own sends → 'confirmed'; our code emails → ignored, never
 *               stored (the code must not reach staff or the database);
 *               a pharmacist's reply straight from Outlook → added to the
 *               thread ("Sent from Outlook"), shown to the customer only
 *               when it went to their checked address alone, otherwise
 *               staff-only and flagged; or "Email to match" (outlook_no_thread).
 *   Bounces     the body is never stored when unmatched (it quotes the
 *               original email); bounces of a code email are ignored.
 * Bodies are requested as text and cleaned (./sanitize.ts); attachments are
 * metadata only ("open in Outlook").
 * =============================================================================
 */

const FULL_SELECT = [
  'subject',
  'from',
  'sender',
  'toRecipients',
  'ccRecipients',
  'bccRecipients',
  'replyTo',
  'receivedDateTime',
  'sentDateTime',
  'conversationId',
  'internetMessageId',
  'internetMessageHeaders',
  'hasAttachments',
  'isDraft',
  'uniqueBody',
  'body',
].join(',');

const OUTLOOK_SENDER_LABEL = 'Liivv pharmacist (sent from Outlook)';

interface GraphRecipient {
  emailAddress?: { address?: unknown };
}

interface GraphMessage {
  id?: unknown;
  subject?: unknown;
  from?: GraphRecipient;
  toRecipients?: GraphRecipient[];
  ccRecipients?: GraphRecipient[];
  bccRecipients?: GraphRecipient[];
  receivedDateTime?: unknown;
  sentDateTime?: unknown;
  conversationId?: unknown;
  internetMessageId?: unknown;
  internetMessageHeaders?: Array<{ name?: unknown; value?: unknown }>;
  hasAttachments?: unknown;
  isDraft?: unknown;
  uniqueBody?: { content?: unknown };
  body?: { content?: unknown };
}

export type IngestResult =
  | 'known'
  | 'confirmed'
  | 'attached'
  | 'outlook_attached'
  | 'unmatched'
  | 'bounced'
  | 'auto_reply'
  | 'ignored'
  | 'gone';

function str(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

function addressOf(recipient: GraphRecipient | undefined): string | null {
  const address = recipient?.emailAddress?.address;

  return typeof address === 'string' && address ? address.trim().toLowerCase() : null;
}

function addresses(list: GraphRecipient[] | undefined): string[] {
  return (Array.isArray(list) ? list : []).flatMap((recipient) => {
    const address = addressOf(recipient);

    return address ? [address] : [];
  });
}

function summaryOf(
  message: GraphMessage,
  folder: SyncFolder,
  mailbox: PharmacyMailbox,
  graphId: string,
): MailSummary {
  return {
    folder,
    mailboxAddress: mailbox.address,
    graphId,
    internetMessageId: str(message.internetMessageId),
    conversationId: str(message.conversationId),
    subject: str(message.subject),
    from: addressOf(message.from),
    to: addresses(message.toRecipients),
    cc: addresses(message.ccRecipients),
    bcc: addresses(message.bccRecipients),
    headers: (Array.isArray(message.internetMessageHeaders)
      ? message.internetMessageHeaders
      : []
    ).flatMap((header) =>
      typeof header.name === 'string' && typeof header.value === 'string'
        ? [{ name: header.name, value: header.value }]
        : [],
    ),
    isDraft: message.isDraft === true,
  };
}

async function fetchMessage(
  mailbox: PharmacyMailbox,
  graphId: string,
): Promise<GraphMessage | null> {
  try {
    const response = await graphRequest<GraphMessage>({
      path: `${mailboxPath(mailbox)}/messages/${encodeURIComponent(graphId)}?$select=${FULL_SELECT}`,
      prefer: ['outlook.body-content-type="text"'],
      budget: 'sync',
    });

    return response.data;
  } catch (error) {
    if (graphErrorStatus(error) === 404) {
      return null;
    }

    throw error;
  }
}

/* Our own send seen again (Sent Items, or a replay): 'sent'/'queued' become 'confirmed'. */
async function confirmKnown(
  known: PharmacyMessageRow,
  summary: MailSummary,
): Promise<IngestResult> {
  if (summary.folder === 'sentitems' && ['queued', 'sent', 'failed'].includes(known.status)) {
    await updateMessage(known.id, {
      status: 'confirmed',
      // The id may differ between the draft and the sent copy (to verify in
      // the tenant test), so the Sent Items value wins.
      internet_message_id: summary.internetMessageId ?? known.internet_message_id,
      sent_at: known.sent_at ?? new Date().toISOString(),
    });

    return 'confirmed';
  }

  return 'known';
}

/* The customer's checked address (whatever they chose since) and their contact mode. */
async function contactOf(
  thread: PharmacyThreadRow,
): Promise<{ checkedEmail: string | null; mode: string }> {
  const accountEmail = await getProfileEmail(thread.profile_id);
  const contact = await readContactState(thread.profile_id, accountEmail);

  return { checkedEmail: contact.verified ? contact.email : null, mode: contact.mode };
}

async function threadIdFromKeys(mailbox: string, keys: CorrelationKeys) {
  const byConversation = keys.conversationId
    ? await findThreadIdByConversation(mailbox, keys.conversationId)
    : null;
  const byReferences = byConversation
    ? null
    : await findThreadIdByInternetIds(mailbox, keys.referencedIds);
  const plusThread =
    !byConversation && !byReferences && keys.plusRef ? await getThreadByRef(keys.plusRef) : null;
  const subjectThread =
    !byConversation && !byReferences && !plusThread && keys.subjectRef
      ? await getThreadByRef(keys.subjectRef)
      : null;

  return {
    byConversation,
    byReferences,
    byPlusToken: plusThread?.id ?? null,
    bySubjectRef: subjectThread?.id ?? null,
  };
}

/* The thread the message's correlation keys point to, in design order, with the customer's contact. */
async function findCandidate(
  summary: MailSummary,
): Promise<{ candidate: ThreadCandidate | null; thread: PharmacyThreadRow | null; mode: string }> {
  const ids = await threadIdFromKeys(summary.mailboxAddress, correlationKeys(summary));
  const asCandidate = (id: string | null) =>
    id ? { threadId: id, profileId: '', threadMailbox: null, checkedEmail: null } : null;
  const first = firstCandidate({
    byConversation: asCandidate(ids.byConversation),
    byReferences: asCandidate(ids.byReferences),
    byPlusToken: asCandidate(ids.byPlusToken),
    bySubjectRef: asCandidate(ids.bySubjectRef),
  });
  const thread = first ? await getThreadById(first.threadId) : null;

  if (!thread) {
    return { candidate: null, thread: null, mode: 'not_chosen' };
  }

  const route = pharmacyEmailRoute(thread.pharmacy_region);
  const contact = await contactOf(thread);
  // The conversation and References lookups only search messages stored for
  // THIS mailbox, so a match through them is a reply to an email this
  // mailbox sent, even after the province's mailbox address changed.
  const viaThisMailbox = Boolean(ids.byConversation ?? ids.byReferences);

  return {
    thread,
    mode: contact.mode,
    candidate: {
      threadId: thread.id,
      profileId: thread.profile_id,
      threadMailbox: viaThisMailbox
        ? summary.mailboxAddress
        : (thread.mailbox_address ?? (route.kind === 'graph' ? route.mailbox.address : null)),
      checkedEmail: contact.checkedEmail,
    },
  };
}

async function saveUnmatched(
  summary: MailSummary,
  message: GraphMessage,
  reason: string,
  suggestion: { profileId: string | null; threadId: string | null },
  region: string,
  options: { keepBody: boolean } = { keepBody: true },
): Promise<IngestResult> {
  await insertUnmatched({
    pharmacy_region: region,
    mailbox_address: summary.mailboxAddress,
    folder: summary.folder,
    graph_message_id: summary.graphId,
    internet_message_id: summary.internetMessageId,
    graph_conversation_id: summary.conversationId,
    from_address: summary.from,
    to_addresses: summary.to,
    subject: cleanSubject(summary.subject),
    received_at: str(message.receivedDateTime),
    body_text: options.keepBody
      ? messageBodies({
          uniqueBody: str(message.uniqueBody?.content),
          body: str(message.body?.content),
        }).bodyText || null
      : null,
    reason,
    suggested_profile_id: suggestion.profileId,
    suggested_thread_id: suggestion.threadId,
  });
  logPharmacyMail('unmatched', { region, folder: summary.folder, code: reason });

  return 'unmatched';
}

async function saveAttachments(
  mailbox: PharmacyMailbox,
  graphId: string,
  messageId: string,
): Promise<void> {
  try {
    const response = await graphRequest<{ value?: Array<Record<string, unknown>> }>({
      path: `${mailboxPath(mailbox)}/messages/${encodeURIComponent(graphId)}/attachments?$select=id,name,contentType,size,isInline`,
      budget: 'sync',
    });

    await insertAttachmentMeta(
      messageId,
      (response.data?.value ?? []).map((item) => ({
        graph_attachment_id: str(item.id),
        name: str(item.name)?.slice(0, 255) ?? null,
        content_type: str(item.contentType),
        size_bytes: typeof item.size === 'number' ? item.size : null,
        is_inline: item.isInline === true,
        kind: str(item['@odata.type'])?.replace('#microsoft.graph.', '') ?? null,
      })),
    );
  } catch (error) {
    logPharmacyMail('attachments_failed', { messageId, code: graphErrorCode(error) }, 'warn');
  }
}

/* An NDR: the thread's latest outbound email is 'bounced', so the address needs checking again. */
async function handleBounce(
  summary: MailSummary,
  message: GraphMessage,
  region: string,
): Promise<IngestResult> {
  // A code email that bounced: the customer simply asks for a new code. Its
  // report quotes the code, so it is never stored.
  if ((summary.subject ?? '').includes(CODE_EMAIL_SUBJECT)) {
    return 'ignored';
  }

  const ref = parseSubjectRef(summary.subject);
  const thread = ref ? await getThreadByRef(ref) : null;
  const sent = thread ? await latestSentEmail(thread.id) : null;
  const failed = bouncedRecipient(summary.headers);

  if (!thread || !sent || (failed !== null && failed !== sent.to_address)) {
    // A report quotes the original email, so its body is never kept: the
    // pharmacist sees the sender, subject and reason, and opens it in Outlook.
    return saveUnmatched(
      summary,
      message,
      'bounce_unmatched',
      { profileId: thread?.profile_id ?? null, threadId: thread?.id ?? null },
      region,
      { keepBody: false },
    );
  }

  await updateMessage(sent.id, { status: 'bounced' });
  await insertMessage({
    thread_id: thread.id,
    direction: 'system',
    source: 'system',
    status: 'received',
    visible_to_customer: false,
    body_text:
      'The email to the customer bounced. Their address needs checking again before the next email.',
    mailbox_address: summary.mailboxAddress,
    graph_message_id: summary.graphId,
    internet_message_id: summary.internetMessageId,
    received_at: str(message.receivedDateTime),
  });
  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: 'system',
    action: 'receive',
    detail: { kind: 'bounce' },
  });

  return 'bounced';
}

async function handleAutoReply(summary: MailSummary, message: GraphMessage): Promise<IngestResult> {
  const { candidate, thread } = await findCandidate(summary);

  if (!candidate || !thread || summary.from !== candidate.checkedEmail) {
    return 'ignored';
  }

  await insertMessage({
    thread_id: thread.id,
    direction: 'system',
    source: 'system',
    status: 'received',
    visible_to_customer: false,
    body_text: 'The customer’s email sent an automatic reply.',
    mailbox_address: summary.mailboxAddress,
    graph_message_id: summary.graphId,
    internet_message_id: summary.internetMessageId,
    received_at: str(message.receivedDateTime),
  });

  return 'auto_reply';
}

async function attachInbound(
  summary: MailSummary,
  message: GraphMessage,
  thread: PharmacyThreadRow,
  mailbox: PharmacyMailbox,
): Promise<IngestResult> {
  const bodies = messageBodies({
    uniqueBody: str(message.uniqueBody?.content),
    body: str(message.body?.content),
  });
  const stored = await insertMessage({
    thread_id: thread.id,
    direction: 'from_customer',
    source: 'email',
    status: 'received',
    sender_label: 'You',
    visible_to_customer: true,
    body_text: bodies.bodyText || '(No text: open in Outlook.)',
    full_body_text: bodies.fullBodyText,
    subject: cleanSubject(summary.subject),
    mailbox_address: summary.mailboxAddress,
    from_address: summary.from,
    to_address: summary.mailboxAddress,
    graph_message_id: summary.graphId,
    internet_message_id: summary.internetMessageId,
    graph_conversation_id: summary.conversationId,
    in_reply_to: headerValue(summary.headers, 'In-Reply-To')?.slice(0, 500) ?? null,
    has_attachments: message.hasAttachments === true,
    received_at: str(message.receivedDateTime) ?? new Date().toISOString(),
  });

  await noteThreadActivity(thread, 'pharmacist');

  if (message.hasAttachments === true) {
    await saveAttachments(mailbox, summary.graphId, stored.id);
  }

  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: 'system',
    action: 'match',
    detail: { source: 'email' },
  });

  return 'attached';
}

async function ingestInbox(
  summary: MailSummary,
  message: GraphMessage,
  mailbox: PharmacyMailbox,
): Promise<IngestResult> {
  const own = pharmacyOwnMailboxes();

  if (summary.from && own.includes(summary.from)) {
    return 'ignored';
  }

  if (isNonDeliveryReport(summary)) {
    return handleBounce(summary, message, mailbox.region);
  }

  if (isAutoReply(summary)) {
    return handleAutoReply(summary, message);
  }

  const [{ candidate, thread }, senders] = await Promise.all([
    findCandidate(summary),
    profilesByConsentedEmail(summary.from ? [summary.from] : []),
  ]);
  const decision = decideInboundMatch({
    message: summary,
    candidate,
    senderProfileIds: summary.from ? (senders.get(summary.from) ?? []) : [],
    ownMailboxes: own,
  });

  if (decision.action === 'attach' && thread) {
    return attachInbound(summary, message, thread, mailbox);
  }

  if (decision.action === 'unmatched') {
    return saveUnmatched(
      summary,
      message,
      decision.reason,
      { profileId: decision.suggestedProfileId, threadId: decision.suggestedThreadId },
      mailbox.region,
    );
  }

  return 'ignored';
}

/*
 * A pharmacist's email sent straight from Outlook, in a thread's conversation
 * or carrying its reference. Shown on the customer's Pharmacy page only when
 * it went to their checked address alone; otherwise it is kept staff-only
 * (a forward to a prescriber, an email to another customer that reused the
 * subject) and flagged for the privacy officer, and the thread's
 * "waiting on" is left alone.
 */
async function attachOutlookSent(
  summary: MailSummary,
  message: GraphMessage,
  thread: PharmacyThreadRow,
  decision: { flags: string[]; visibleToCustomer: boolean },
): Promise<IngestResult> {
  const bodies = messageBodies({
    uniqueBody: str(message.uniqueBody?.content),
    body: str(message.body?.content),
  });

  await insertMessage({
    thread_id: thread.id,
    direction: 'to_customer',
    source: 'outlook',
    status: 'sent',
    email_delivery: 'message',
    sender_label: OUTLOOK_SENDER_LABEL,
    visible_to_customer: decision.visibleToCustomer,
    body_text: bodies.bodyText || '(No text: open in Outlook.)',
    full_body_text: bodies.fullBodyText,
    subject: cleanSubject(summary.subject),
    mailbox_address: summary.mailboxAddress,
    from_address: summary.mailboxAddress,
    to_address: summary.to.join(', ').slice(0, 500) || null,
    graph_message_id: summary.graphId,
    internet_message_id: summary.internetMessageId,
    graph_conversation_id: summary.conversationId,
    has_attachments: message.hasAttachments === true,
    flags: decision.flags,
    sent_at: str(message.sentDateTime) ?? new Date().toISOString(),
  });

  if (decision.visibleToCustomer) {
    await noteThreadActivity(thread, 'customer');
  }

  await insertPharmacyAudit({
    threadId: thread.id,
    profileId: thread.profile_id,
    actor: 'system',
    action: 'match',
    detail: {
      source: 'outlook',
      flags: decision.flags.length,
      visible: decision.visibleToCustomer,
    },
  });

  return 'outlook_attached';
}

async function ingestSentItem(
  summary: MailSummary,
  message: GraphMessage,
  mailbox: PharmacyMailbox,
): Promise<IngestResult> {
  // The code email: never matched, never stored (the code would reach staff).
  if (isCodeEmail(summary.headers)) {
    return 'ignored';
  }

  const ownSend = isLiivvSend(summary.headers);
  const [{ candidate, thread, mode }, recipients] = await Promise.all([
    findCandidate(summary),
    profilesByConsentedEmail(summary.to),
  ]);
  const decision = decideSentItem({
    message: summary,
    ownSend,
    candidate,
    candidateContactMode: mode,
    recipientProfileIds: [
      ...new Set(summary.to.flatMap((address) => recipients.get(address) ?? [])),
    ],
  });

  if (decision.action === 'attach_outlook' && thread) {
    return attachOutlookSent(summary, message, thread, decision);
  }

  if (decision.action === 'unmatched') {
    return saveUnmatched(
      summary,
      message,
      decision.reason,
      { profileId: decision.suggestedProfileId, threadId: null },
      mailbox.region,
    );
  }

  return decision.action === 'confirm_own' ? 'known' : 'ignored';
}

/*
 * Reads one message from a province mailbox folder and files it. Throws only
 * on Graph or database errors (the caller logs a code and moves on).
 */
export async function ingestMailboxMessage(input: {
  mailbox: PharmacyMailbox;
  folder: SyncFolder;
  graphId: string;
  /** The internetMessageId from the delta page, when the caller has it. */
  internetMessageId?: string | null;
}): Promise<IngestResult> {
  const known = await findMessageByGraphId(input.mailbox.address, input.graphId);

  if (known) {
    // Graph returns the same immutable id for our draft and its Sent Items copy.
    return confirmKnown(known, {
      ...emptySummary(input),
      folder: input.folder,
      internetMessageId: input.internetMessageId ?? null,
    });
  }

  // Our code email's Sent Items copy (the same immutable id): not even fetched.
  if (input.folder === 'sentitems' && (await isCodeEmailGraphId(input.graphId))) {
    return 'ignored';
  }

  const message = await fetchMessage(input.mailbox, input.graphId);

  if (!message) {
    return 'gone';
  }

  const summary = summaryOf(message, input.folder, input.mailbox, input.graphId);

  if (summary.isDraft) {
    return 'ignored';
  }

  const byInternetId = summary.internetMessageId
    ? await findMessageByInternetId(input.mailbox.address, summary.internetMessageId)
    : null;

  if (byInternetId) {
    // A replay, or Outlook's second copy of the same sent message.
    return confirmKnown(byInternetId, summary);
  }

  return input.folder === 'inbox'
    ? ingestInbox(summary, message, input.mailbox)
    : ingestSentItem(summary, message, input.mailbox);
}

function emptySummary(input: { mailbox: PharmacyMailbox; graphId: string }): MailSummary {
  return {
    folder: 'inbox',
    mailboxAddress: input.mailbox.address,
    graphId: input.graphId,
    internetMessageId: null,
    conversationId: null,
    subject: null,
    from: null,
    to: [],
    cc: [],
    bcc: [],
    headers: [],
    isDraft: false,
  };
}
