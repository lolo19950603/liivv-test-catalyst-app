import 'server-only';

import { listCodeVerificationPending } from '~/lib/pharmacy-mail/code-check';
import { readContactState } from '~/lib/supabase/pharmacy-email-consent';
import {
  listOpenUnmatched,
  listSyncStates,
  type SyncStateRow,
} from '~/lib/supabase/pharmacy-mail-sync';
import {
  getThreadByRecord,
  isMessagesMigrationMissing,
  listFlaggedOutlookMessages,
  listMessagesForThreads,
  listReplyIndicators,
  listThreadsForProfile,
  MESSAGES_MIGRATION_HINT,
  type PharmacyMessageRow,
  type PharmacyThreadRow,
  type ThreadTopic,
} from '~/lib/supabase/pharmacy-threads';
import { getSupabaseClient } from '~/lib/supabase/client';

import {
  pharmacyAppOrigin,
  pharmacyEmailConsentApproved,
  pharmacyEmailRoute,
  pharmacyMailConfigSummary,
  pharmacyMessageModeOffered,
  pharmacyOutlookMailbox,
} from './config';
import { mailtoReasonText } from './config-rules';
import { emailBlockedText, type PharmacyContactState, sendPlanFor } from './consent';
import {
  isPharmacyRegion,
  pharmacyPhoneOf,
  type PharmacyRegion,
  pharmacyRegionLabel,
  pharmacyRegionOf,
} from './regions';
import { type AdminTemplateValues, maskEmail } from './templates';
import type {
  CustomerPharmacyMessagesData,
  CustomerThreadView,
  FlaggedOutlookView,
  MailStatusView,
  StaffContactView,
  StaffMessageView,
  ThreadPanelData,
  UnmatchedView,
} from './view-types';

/*
 * =============================================================================
 * WHAT THE ADMIN AND THE PHARMACY PAGE SHOW ABOUT PHARMACIST MESSAGES
 * =============================================================================
 * Owner decision Q10, 2026-10-14. Each part loads on its own terms: a failure
 * (for example the migration not run yet) says so in that panel only, and
 * nothing here throws.
 * =============================================================================
 */

const UNMATCHED_REASON_TEXT: Record<string, string> = {
  sender_mismatch: 'Reply from an address that isn’t the customer’s checked address',
  no_thread: 'From a customer’s address, but not a reply to a Liivv email',
  auth_failed: 'The sender’s address failed the spoofing check, or it couldn’t be confirmed',
  bounce_unmatched: 'A bounce that couldn’t be matched to an email',
  ambiguous: 'Could belong to more than one customer or pharmacy',
  outlook_no_thread: 'Sent from Outlook to a customer, outside any thread',
};

function errorText(error: unknown): string {
  return isMessagesMigrationMissing(error)
    ? MESSAGES_MIGRATION_HINT
    : 'Messages are temporarily unavailable.';
}

function staffMessageView(row: PharmacyMessageRow): StaffMessageView {
  return {
    id: row.id,
    direction: row.direction,
    source: row.source,
    status: row.status,
    emailDelivery: row.email_delivery,
    senderLabel: row.sender_label,
    staffAuthor: row.staff_author,
    visibleToCustomer: row.visible_to_customer,
    bodyText: row.body_text,
    fullBodyText: row.full_body_text,
    createdAt: row.created_at,
    sentAt: row.sent_at,
    receivedAt: row.received_at,
    flags: row.flags,
    flagsReviewed: Boolean(row.flags_reviewed_at),
    hasAttachments: row.has_attachments,
    errorCode: row.error_code,
    toAddressMasked: row.to_address ? maskEmail(row.to_address) : null,
    unread: row.direction === 'from_customer' && !row.staff_read_at,
  };
}

function staffContactView(contact: PharmacyContactState): StaffContactView {
  return {
    mode: contact.mode,
    email: contact.email,
    maskedEmail: maskEmail(contact.email),
    verifiedAt: contact.verified?.at ?? null,
    verifiedMethod: contact.verified?.method ?? null,
    blocked: contact.emailBlocked,
    blockedText: contact.emailBlocked ? emailBlockedText(contact.emailBlocked) : null,
    locale: contact.locale,
  };
}

const NOT_CHOSEN: PharmacyContactState = {
  mode: 'not_chosen',
  email: null,
  consentId: null,
  locale: null,
  verified: null,
  emailBlocked: 'not_chosen',
};

export interface PanelRecord {
  topic: ThreadTopic;
  recordId: string;
  profileId: string;
  /** Where the province comes from when the thread doesn't exist yet. */
  provinceHint: string | null;
  prefill: AdminTemplateValues;
}

/* The region an existing thread is fixed to, or the record's province mapped to its pharmacy. */
function regionFor(thread: PharmacyThreadRow | null, hint: string | null): PharmacyRegion {
  return thread && isPharmacyRegion(thread.pharmacy_region)
    ? thread.pharmacy_region
    : pharmacyRegionOf(hint);
}

function threadStatusOf(thread: PharmacyThreadRow | null): 'open' | 'closed' | null {
  if (!thread) {
    return null;
  }

  return thread.status === 'closed' ? 'closed' : 'open';
}

/* One record's "Messages with customer" panel. Never throws. */
export async function loadThreadPanel(
  record: PanelRecord,
  accountEmail: string | null,
): Promise<ThreadPanelData> {
  const base = {
    topic: record.topic,
    recordId: record.recordId,
    profileId: record.profileId,
    origin: pharmacyAppOrigin(),
    messageModeOn: pharmacyMessageModeOffered(),
    prefill: record.prefill,
  };
  let thread: PharmacyThreadRow | null = null;
  let messages: PharmacyMessageRow[] = [];
  let contact: PharmacyContactState = NOT_CHOSEN;
  let loadError: string | null = null;

  try {
    [thread, contact] = await Promise.all([
      getThreadByRecord(record.topic, record.recordId),
      readContactState(record.profileId, accountEmail),
    ]);
    messages = thread ? await listMessagesForThreads([thread.id], { customerView: false }) : [];
  } catch (error) {
    loadError = errorText(error);
  }

  const region = regionFor(thread, record.provinceHint);
  const route = pharmacyEmailRoute(region);
  const outlookFrom = pharmacyOutlookMailbox(region);
  const emailApproved = pharmacyEmailConsentApproved();

  return {
    ...base,
    region,
    regionLabel: pharmacyRegionLabel(region),
    threadId: thread?.id ?? null,
    ref: thread?.subject_ref ?? null,
    status: threadStatusOf(thread),
    waitingOn: thread?.waiting_on ?? null,
    messages: messages.map(staffMessageView),
    contact: loadError ? null : staffContactView(contact),
    route: {
      kind: route.kind,
      reasonText: mailtoReasonText(route),
      mailboxAddress: route.kind === 'graph' ? route.mailbox.address : null,
      outlookFrom,
    },
    plan: sendPlanFor({
      routeKind: route.kind,
      contact,
      messageModeOn: base.messageModeOn,
      emailApproved,
      mailtoMailboxSet: outlookFrom !== null,
    }),
    emailApproved,
    phone: pharmacyPhoneOf(region),
    loadError,
  };
}

async function suggestedThreads(
  profileId: string | null,
): Promise<Array<{ id: string; label: string }>> {
  if (!profileId) {
    return [];
  }

  const threads = await listThreadsForProfile(profileId);

  return threads.map((thread) => ({
    id: thread.id,
    label: `${thread.subject_ref} · ${thread.topic === 'cpap_prescription' ? 'CPAP prescription' : 'Mask order'} · ${pharmacyRegionLabel(isPharmacyRegion(thread.pharmacy_region) ? thread.pharmacy_region : 'ON')}`,
  }));
}

async function unmatchedViews(): Promise<UnmatchedView[]> {
  const rows = await listOpenUnmatched(100);

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      region: row.pharmacy_region,
      regionLabel: isPharmacyRegion(row.pharmacy_region)
        ? pharmacyRegionLabel(row.pharmacy_region)
        : row.pharmacy_region,
      folder: row.folder,
      from: row.from_address,
      to: row.to_addresses,
      subject: row.subject,
      receivedAt: row.received_at,
      bodyText: row.body_text,
      reason: row.reason,
      reasonText: UNMATCHED_REASON_TEXT[row.reason] ?? row.reason,
      suggestedProfileId: row.suggested_profile_id,
      suggestedThreads: await suggestedThreads(row.suggested_profile_id).catch(() => []),
    })),
  );
}

function flaggedViews(rows: PharmacyMessageRow[]): FlaggedOutlookView[] {
  return rows.map((row) => ({
    id: row.id,
    threadId: row.thread_id,
    region: null,
    createdAt: row.created_at,
    toAddressMasked: row.to_address
      ? row.to_address
          .split(',')
          .map((address) => maskEmail(address.trim()))
          .join(', ')
      : null,
    flags: row.flags,
    bodyText: row.body_text,
    visibleToCustomer: row.visible_to_customer,
  }));
}

/* "Email to match" and "Sent from Outlook: check". Never throws. */
export async function loadMailQueues(): Promise<{
  unmatched: UnmatchedView[];
  flagged: FlaggedOutlookView[];
  error: string | null;
}> {
  try {
    const [unmatched, flagged] = await Promise.all([
      unmatchedViews(),
      listFlaggedOutlookMessages(100),
    ]);

    return { unmatched, flagged: flaggedViews(flagged), error: null };
  } catch (error) {
    return { unmatched: [], flagged: [], error: errorText(error) };
  }
}

/* The Replied badges. Never throws (no badges when unreadable). */
export async function loadReplyIndicators(): Promise<{
  prescriptionIds: string[];
  rxOrderCheckIds: string[];
}> {
  try {
    const indicators = await listReplyIndicators();

    return {
      prescriptionIds: [...indicators.prescriptionIds],
      rxOrderCheckIds: [...indicators.rxOrderCheckIds],
    };
  } catch {
    return { prescriptionIds: [], rxOrderCheckIds: [] };
  }
}

/* The Mail status panel: presence of settings, routes, and the sync state. Never throws. */
export async function loadMailStatus(): Promise<MailStatusView> {
  const summary = pharmacyMailConfigSummary();
  let states: SyncStateRow[] = [];
  let syncStateError: string | null = null;

  try {
    states = await listSyncStates();
  } catch (error) {
    syncStateError = errorText(error);
  }

  return {
    ...summary,
    syncStateError,
    regions: summary.regions.map((row) => {
      const inbox = states.find(
        (state) => state.pharmacy_region === row.region && state.folder === 'inbox',
      );
      const sent = states.find(
        (state) => state.pharmacy_region === row.region && state.folder === 'sentitems',
      );

      return {
        region: row.region,
        label: pharmacyRegionLabel(row.region),
        routeKind: row.route.kind,
        reasonText: row.reasonText,
        mailboxAddress: row.mailboxAddress,
        objectIdSet: row.objectIdSet,
        lastRunAt: inbox?.last_run_at ?? null,
        lastSuccessAt: inbox?.last_success_at ?? null,
        lastErrorCode: inbox?.last_error_code ?? sent?.last_error_code ?? null,
        subscriptionExpiresAt: inbox?.subscription_expires_at ?? null,
      };
    }),
  };
}

/* "About order #1234": the order numbers of a profile's mask-order threads. */
async function orderNumbersFor(
  threads: readonly PharmacyThreadRow[],
): Promise<Map<string, string>> {
  const ids = threads.flatMap((thread) =>
    thread.rx_order_check_id ? [thread.rx_order_check_id] : [],
  );

  if (ids.length === 0) {
    return new Map();
  }

  const { data } = await getSupabaseClient()
    .from('rx_order_checks')
    .select('id, bigcommerce_order_id')
    .in('id', ids);
  const rows: unknown[] = Array.isArray(data) ? data : [];

  return new Map(
    rows.flatMap((row) =>
      typeof row === 'object' && row !== null && 'id' in row && 'bigcommerce_order_id' in row
        ? [[String(row.id), String(row.bigcommerce_order_id)] as const]
        : [],
    ),
  );
}

/* "You", "Priya S., Liivv pharmacist", or "Liivv pharmacist (sent to you by email)". */
function customerSenderLabel(message: PharmacyMessageRow): string {
  if (message.direction === 'from_customer') {
    return 'You';
  }

  if (message.source === 'outlook') {
    return 'Liivv pharmacist (sent to you by email)';
  }

  return (message.sender_label ?? 'Liivv pharmacist').replace(
    /, Pharmacist$/,
    ', Liivv pharmacist',
  );
}

function customerThreadView(
  thread: PharmacyThreadRow,
  messages: readonly PharmacyMessageRow[],
  orderNumbers: Map<string, string>,
): CustomerThreadView {
  const orderNumber = thread.rx_order_check_id
    ? orderNumbers.get(thread.rx_order_check_id)
    : undefined;

  return {
    id: thread.id,
    topicLabel:
      thread.topic === 'cpap_prescription'
        ? 'About your CPAP prescription'
        : `About order #${orderNumber ?? '…'}`,
    closed: thread.status === 'closed',
    messages: messages
      .filter((message) => message.thread_id === thread.id)
      .map((message) => ({
        id: message.id,
        mine: message.direction === 'from_customer',
        senderLabel: customerSenderLabel(message),
        bodyText: message.body_text,
        createdAt: message.received_at ?? message.sent_at ?? message.created_at,
        received: message.direction === 'from_customer',
        unread: message.direction === 'to_customer' && !message.customer_read_at,
      })),
  };
}

/* The region a customer's code email comes from: their newest thread's, else their address's. */
export function customerRegion(
  threads: readonly PharmacyThreadRow[],
  province: string | null,
): PharmacyRegion {
  const newest = threads[0];

  return newest && isPharmacyRegion(newest.pharmacy_region)
    ? newest.pharmacy_region
    : pharmacyRegionOf(province);
}

/* The customer's "Messages from your pharmacist" and contact preferences. Never throws. */
export async function loadCustomerPharmacyMessages(input: {
  profileId: string;
  accountEmail: string | null;
  province: string | null;
}): Promise<CustomerPharmacyMessagesData> {
  const fallbackRegion = pharmacyRegionOf(input.province);

  try {
    const [threads, contact] = await Promise.all([
      listThreadsForProfile(input.profileId),
      readContactState(input.profileId, input.accountEmail),
    ]);
    const visibleThreads = threads.slice(0, 20);
    const [messages, orderNumbers, codePending] = await Promise.all([
      listMessagesForThreads(
        visibleThreads.map((thread) => thread.id),
        { customerView: true },
      ),
      orderNumbersFor(visibleThreads),
      listCodeVerificationPending(input.profileId, input.accountEmail),
    ]);
    const region = customerRegion(threads, input.province);
    const views = visibleThreads
      .map((thread) => customerThreadView(thread, messages, orderNumbers))
      .filter((view) => view.messages.length > 0);

    return {
      ready: true,
      error: null,
      threads: views,
      phone: pharmacyPhoneOf(region),
      hasUnread: views.some((view) => view.messages.some((message) => message.unread)),
      contact: {
        mode: contact.mode,
        maskedEmail: contact.email ? maskEmail(contact.email) : null,
        accountEmailMasked: maskEmail(input.accountEmail),
        verified: Boolean(contact.verified) && !contact.emailBlocked,
        verifiedAt: contact.verified?.at ?? null,
        blocked: contact.emailBlocked,
        codeAvailable: pharmacyEmailRoute(region).kind === 'graph',
        codePending,
        messageModeOffered: pharmacyMessageModeOffered(),
      },
    };
  } catch (error) {
    return {
      ready: false,
      // Before pharmacy-messages-migration.sql has run the card stays hidden.
      error: isMessagesMigrationMissing(error)
        ? null
        : 'Messages from your pharmacist can’t be shown right now. Please try again later.',
      threads: [],
      contact: null,
      phone: pharmacyPhoneOf(fallbackRegion),
      hasUnread: false,
    };
  }
}
