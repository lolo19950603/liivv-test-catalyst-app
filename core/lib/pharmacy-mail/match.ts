/*
 * =============================================================================
 * MATCHING MAILBOX MAIL TO A PHARMACIST-MESSAGE THREAD
 * =============================================================================
 * Owner decision Q10, 2026-10-14; privacy research R6. The pharmacy mailboxes
 * also get unrelated mail, so only mail that is ours is ever read past its
 * cheap fields or stored, and a customer's reply is attached to a thread only
 * when it is safe:
 *
 * The candidate thread is the FIRST of:
 *   1. the Graph conversationId equals one we stored for that mailbox;
 *   2. an In-Reply-To or References id equals an internetMessageId we sent;
 *   3. the "+lv-<ref>" plus token in the To line;
 *   4. the "LV-" reference in the subject.
 *
 * An Inbox message is ATTACHED only when the sender is the thread customer's
 * checked address, the mailbox is the thread's mailbox, and the topmost
 * Authentication-Results header (Exchange Online's own) shows a positive
 * result: dmarc=pass, compauth=pass, or compauth=softpass with SPF or DKIM
 * passing for the From domain. The check fails closed: no header, none,
 * temperror or fail all go to "Email to match". Anything else that looks ours
 * goes there too for a pharmacist (sender_mismatch, no_thread, ambiguous,
 * auth_failed); everything else is ignored and never stored. Mail from our
 * own pharmacy mailboxes is ignored in the Inbox, which prevents loops.
 *
 * Sent Items: our own sends are only confirmed, and our code emails are
 * never stored. Any other message in a known conversation or carrying a
 * reference is a pharmacist replying straight from Outlook: it is added to
 * the thread, but shown on the customer's Pharmacy page ONLY when it went to
 * the customer's checked address alone (To is exactly that address, no Cc or
 * Bcc). Anything else is kept staff-only and flagged for the privacy officer,
 * who decides "Show to customer" or "Keep staff-only". Flags: an unchecked
 * or other address, extra recipients, or against the customer's choice.
 *
 * Pure: the database lookups are done by ./ingest.ts and passed in.
 * =============================================================================
 */

import { parsePlusTokenRef, parseSubjectRef } from './subject-ref';

export type MailFolder = 'inbox' | 'sentitems';

export interface MailHeader {
  name: string;
  value: string;
}

/* What ingest reads from a Graph message, addresses lower-cased. */
export interface MailSummary {
  folder: MailFolder;
  mailboxAddress: string;
  graphId: string;
  internetMessageId: string | null;
  conversationId: string | null;
  subject: string | null;
  from: string | null;
  to: string[];
  cc: string[];
  bcc: string[];
  headers: MailHeader[];
  isDraft: boolean;
}

export type UnmatchedReason =
  | 'sender_mismatch'
  | 'no_thread'
  | 'auth_failed'
  | 'bounce_unmatched'
  | 'ambiguous'
  | 'outlook_no_thread';

export type OutlookFlag =
  | 'outlook_unverified_recipient'
  | 'outlook_extra_recipients'
  | 'outlook_mode_conflict';

/* A header's value (case-insensitive name), or null. */
export function headerValue(headers: readonly MailHeader[], name: string): string | null {
  const wanted = name.toLowerCase();

  return headers.find((header) => header.name.toLowerCase() === wanted)?.value ?? null;
}

/* The <message-id> tokens in an In-Reply-To or References value. */
export function parseMessageIdList(value: string | null | undefined): string[] {
  return [...String(value ?? '').matchAll(/<[^<>\s]+>/g)].map((match) => match[0]);
}

/* Every message id this message says it replies to. */
export function referencedMessageIds(headers: readonly MailHeader[]): string[] {
  return [
    ...new Set([
      ...parseMessageIdList(headerValue(headers, 'In-Reply-To')),
      ...parseMessageIdList(headerValue(headers, 'References')),
    ]),
  ];
}

export interface CorrelationKeys {
  conversationId: string | null;
  referencedIds: string[];
  plusRef: string | null;
  subjectRef: string | null;
}

export function correlationKeys(message: MailSummary): CorrelationKeys {
  return {
    conversationId: message.conversationId,
    referencedIds: referencedMessageIds(message.headers),
    plusRef: parsePlusTokenRef(message.to),
    subjectRef: parseSubjectRef(message.subject),
  };
}

/* A thread the correlation keys point to, as ingest found it. */
export interface ThreadCandidate {
  threadId: string;
  profileId: string;
  /** The mailbox this thread's email goes through (its own, or its region's). */
  threadMailbox: string | null;
  /** The customer's checked address, when email is allowed at all. */
  checkedEmail: string | null;
}

/* The candidate from the first correlation key that found a thread (design 5.2 order). */
export function firstCandidate(found: {
  byConversation?: ThreadCandidate | null;
  byReferences?: ThreadCandidate | null;
  byPlusToken?: ThreadCandidate | null;
  bySubjectRef?: ThreadCandidate | null;
}): ThreadCandidate | null {
  return (
    found.byConversation ?? found.byReferences ?? found.byPlusToken ?? found.bySubjectRef ?? null
  );
}

interface AuthClause {
  method: string;
  result: string;
  rest: string;
}

/* "spf=pass (sender IP is …) smtp.mailfrom=a.ca; dkim=pass … header.d=a.ca;dmarc=pass …" */
function authClauses(value: string): AuthClause[] {
  return value
    .toLowerCase()
    .split(';')
    .flatMap((part) => {
      const match = /^\s*([a-z-]+)\s*=\s*([a-z]+)(.*)$/s.exec(part);

      return match
        ? [{ method: match[1] ?? '', result: match[2] ?? '', rest: match[3] ?? '' }]
        : [];
    });
}

/* The domain of a property such as smtp.mailfrom=user@a.ca or header.d=a.ca. */
function clauseDomain(rest: string, property: string): string {
  const escaped = property.replace(/\./g, '\\.');
  const value = new RegExp(`\\b${escaped}\\s*=\\s*([^\\s;()]+)`).exec(rest)?.[1] ?? '';

  return value.slice(value.lastIndexOf('@') + 1).replace(/\.$/, '');
}

/* Relaxed DMARC alignment: the same domain, or one is a subdomain of the other. */
function aligned(domain: string, fromDomain: string): boolean {
  return (
    domain !== '' &&
    fromDomain !== '' &&
    (domain === fromDomain ||
      domain.endsWith(`.${fromDomain}`) ||
      fromDomain.endsWith(`.${domain}`))
  );
}

/*
 * Spoofing check, failing closed. Only the TOPMOST Authentication-Results
 * header counts: Exchange Online stamps it on arrival, above any header the
 * sender wrote (Graph lists internetMessageHeaders top first; checked in the
 * tenant test, design section 10). It must show dmarc=pass or compauth=pass,
 * or compauth=softpass with SPF or DKIM passing for the From domain. A
 * missing header, none, temperror or any fail does not pass.
 */
export function authenticationPassed(headers: readonly MailHeader[], from: string | null): boolean {
  const top = headers.find((header) => header.name.toLowerCase() === 'authentication-results');

  if (!top) {
    return false;
  }

  const clauses = authClauses(top.value);
  const resultOf = (method: string) => clauses.find((clause) => clause.method === method)?.result;

  if (resultOf('dmarc') === 'fail' || resultOf('compauth') === 'fail') {
    return false;
  }

  if (resultOf('dmarc') === 'pass' || resultOf('compauth') === 'pass') {
    return true;
  }

  if (resultOf('compauth') !== 'softpass') {
    return false;
  }

  const fromDomain = String(from ?? '').slice(String(from ?? '').lastIndexOf('@') + 1);

  return clauses.some(
    (clause) =>
      clause.result === 'pass' &&
      ((clause.method === 'spf' &&
        aligned(clauseDomain(clause.rest, 'smtp.mailfrom'), fromDomain)) ||
        (clause.method === 'dkim' && aligned(clauseDomain(clause.rest, 'header.d'), fromDomain))),
  );
}

/* Our own send: every Liivv email carries an x-liivv-* header (x-liivv-ref, x-liivv-kind). */
export function isLiivvSend(headers: readonly MailHeader[]): boolean {
  return headers.some((header) => header.name.toLowerCase().startsWith('x-liivv-'));
}

/* Our 6-digit address-check code email: never stored, never matched. */
export function isCodeEmail(headers: readonly MailHeader[]): boolean {
  return (headerValue(headers, 'x-liivv-kind') ?? '').trim().toLowerCase() === 'code';
}

/* A non-delivery report (bounce) in the Inbox. */
export function isNonDeliveryReport(
  message: Pick<MailSummary, 'headers' | 'subject' | 'from'>,
): boolean {
  const contentType = (headerValue(message.headers, 'Content-Type') ?? '').toLowerCase();

  if (contentType.includes('multipart/report') && contentType.includes('delivery-status')) {
    return true;
  }

  if (headerValue(message.headers, 'X-MS-Exchange-Message-Is-Ndr') !== null) {
    return true;
  }

  return (
    looksLikeBounceSender(message.from) && /^\s*undeliverable\s*:/i.test(message.subject ?? '')
  );
}

/* postmaster@, mailer-daemon@, or Exchange's MicrosoftExchange…@ system sender. */
export function looksLikeBounceSender(from: string | null | undefined): boolean {
  return /^(postmaster|mailer-daemon|microsoftexchange[0-9a-f]*)@/i.test(String(from ?? ''));
}

/* An automatic reply (out of office and the like). Liivv never auto-replies. */
export function isAutoReply(message: Pick<MailSummary, 'headers' | 'subject'>): boolean {
  const autoSubmitted = (headerValue(message.headers, 'Auto-Submitted') ?? '').trim().toLowerCase();
  const precedence = (headerValue(message.headers, 'Precedence') ?? '').trim().toLowerCase();

  return (
    (autoSubmitted !== '' && autoSubmitted !== 'no') ||
    headerValue(message.headers, 'X-Autoreply') !== null ||
    headerValue(message.headers, 'X-Autorespond') !== null ||
    precedence === 'auto_reply' ||
    /^\s*(automatic reply|auto(matic)?[- ]?reply|out of (the )?office|réponse automatique)\b/i.test(
      message.subject ?? '',
    )
  );
}

export function isFromOwnMailbox(from: string | null, ownMailboxes: readonly string[]): boolean {
  return from !== null && ownMailboxes.includes(from.toLowerCase());
}

/*
 * Cheap pre-filter, on the fields a delta page carries (no body, no headers):
 * whether this message could be ours, so its full content is worth fetching.
 */
export function isWorthFetching(input: {
  folder: MailFolder;
  conversationId: string | null;
  subject: string | null;
  from: string | null;
  to: readonly string[];
  knownConversationIds: ReadonlySet<string>;
  consentedAddresses: ReadonlySet<string>;
}): boolean {
  if (input.conversationId && input.knownConversationIds.has(input.conversationId)) {
    return true;
  }

  if (parseSubjectRef(input.subject) || parsePlusTokenRef(input.to)) {
    return true;
  }

  if (input.folder === 'sentitems') {
    return input.to.some((address) => input.consentedAddresses.has(address.toLowerCase()));
  }

  return (
    (input.from !== null && input.consentedAddresses.has(input.from.toLowerCase())) ||
    looksLikeBounceSender(input.from)
  );
}

export type InboundDecision =
  | { action: 'ignore' }
  | { action: 'attach'; threadId: string; profileId: string }
  | {
      action: 'unmatched';
      reason: UnmatchedReason;
      suggestedProfileId: string | null;
      suggestedThreadId: string | null;
    };

/*
 * An Inbox message (not an NDR or an auto-reply, which ingest sorts first).
 * `senderProfileIds`: the profiles whose consented address is the sender.
 */
export function decideInboundMatch(input: {
  message: MailSummary;
  candidate: ThreadCandidate | null;
  senderProfileIds: readonly string[];
  ownMailboxes: readonly string[];
}): InboundDecision {
  const { message, candidate } = input;

  if (message.isDraft || isFromOwnMailbox(message.from, input.ownMailboxes)) {
    return { action: 'ignore' };
  }

  const looksOurs = candidate !== null || input.senderProfileIds.length > 0;

  if (!looksOurs) {
    return { action: 'ignore' };
  }

  const suggestion = {
    suggestedProfileId:
      candidate?.profileId ??
      (input.senderProfileIds.length === 1 ? (input.senderProfileIds[0] ?? null) : null),
    suggestedThreadId: candidate?.threadId ?? null,
  };

  if (!authenticationPassed(message.headers, message.from)) {
    return { action: 'unmatched', reason: 'auth_failed', ...suggestion };
  }

  if (!candidate) {
    return {
      action: 'unmatched',
      reason: input.senderProfileIds.length === 1 ? 'no_thread' : 'ambiguous',
      ...suggestion,
    };
  }

  if (candidate.threadMailbox !== null && candidate.threadMailbox !== message.mailboxAddress) {
    return { action: 'unmatched', reason: 'ambiguous', ...suggestion };
  }

  if (!candidate.checkedEmail || message.from !== candidate.checkedEmail) {
    return { action: 'unmatched', reason: 'sender_mismatch', ...suggestion };
  }

  return { action: 'attach', threadId: candidate.threadId, profileId: candidate.profileId };
}

/* The privacy officer's flags on a pharmacist's reply sent straight from Outlook. */
export function outlookFlags(input: {
  to: readonly string[];
  cc: readonly string[];
  bcc: readonly string[];
  checkedEmail: string | null;
  contactMode: string;
}): OutlookFlag[] {
  const flags: OutlookFlag[] = [];

  if (!input.checkedEmail || input.to.some((address) => address !== input.checkedEmail)) {
    flags.push('outlook_unverified_recipient');
  }

  if (input.to.length > 1 || input.cc.length > 0 || input.bcc.length > 0) {
    flags.push('outlook_extra_recipients');
  }

  if (input.contactMode !== 'message_by_email') {
    flags.push('outlook_mode_conflict');
  }

  return flags;
}

/*
 * Whether a pharmacist's Outlook email may be shown on the customer's
 * Pharmacy page: only when it went to the customer's checked address alone.
 * A forward to a prescriber, an email to another customer that reused the
 * subject, or one with Cc or Bcc stays staff-only.
 */
export function outlookVisibleToCustomer(input: {
  to: readonly string[];
  cc: readonly string[];
  bcc: readonly string[];
  checkedEmail: string | null;
}): boolean {
  return (
    input.checkedEmail !== null &&
    input.checkedEmail !== '' &&
    input.to.length === 1 &&
    input.to[0] === input.checkedEmail &&
    input.cc.length === 0 &&
    input.bcc.length === 0
  );
}

export type SentItemDecision =
  | { action: 'ignore' }
  | { action: 'confirm_own' }
  | {
      action: 'attach_outlook';
      threadId: string;
      profileId: string;
      flags: OutlookFlag[];
      visibleToCustomer: boolean;
    }
  | { action: 'unmatched'; reason: 'outlook_no_thread'; suggestedProfileId: string | null };

/*
 * A Sent Items message. `ownSend`: it is one of ours (known immutable id,
 * our x-liivv-ref header, or a known internetMessageId).
 */
export function decideSentItem(input: {
  message: MailSummary;
  ownSend: boolean;
  candidate: ThreadCandidate | null;
  candidateContactMode: string;
  recipientProfileIds: readonly string[];
}): SentItemDecision {
  if (input.message.isDraft) {
    return { action: 'ignore' };
  }

  if (input.ownSend) {
    return { action: 'confirm_own' };
  }

  if (input.candidate) {
    const recipients = {
      to: input.message.to,
      cc: input.message.cc,
      bcc: input.message.bcc,
      checkedEmail: input.candidate.checkedEmail,
    };

    return {
      action: 'attach_outlook',
      threadId: input.candidate.threadId,
      profileId: input.candidate.profileId,
      flags: outlookFlags({ ...recipients, contactMode: input.candidateContactMode }),
      visibleToCustomer: outlookVisibleToCustomer(recipients),
    };
  }

  if (input.recipientProfileIds.length > 0) {
    return {
      action: 'unmatched',
      reason: 'outlook_no_thread',
      suggestedProfileId:
        input.recipientProfileIds.length === 1 ? (input.recipientProfileIds[0] ?? null) : null,
    };
  }

  return { action: 'ignore' };
}

/* The failed recipient of an NDR, from X-Failed-Recipients, lower-cased, or null. */
export function bouncedRecipient(headers: readonly MailHeader[]): string | null {
  const value = headerValue(headers, 'X-Failed-Recipients');
  const address = value?.split(',')[0]?.trim().toLowerCase();

  return address || null;
}
