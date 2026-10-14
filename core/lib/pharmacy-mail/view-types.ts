/*
 * The shapes the Pharmacy admin and the customer's Pharmacy page receive for
 * pharmacist messages (owner decision Q10, 2026-10-14). Plain, serialisable
 * data: no secrets, and the customer's shapes never carry staff notes, flags,
 * staff authors, full email bodies or other customers' threads.
 */

import type { EmailBlockedReason, PharmacyContactMode, SendPlan } from './consent';
import type { PharmacyRegion } from './regions';
import type { AdminTemplateValues } from './templates';

export type ThreadTopicView = 'cpap_prescription' | 'mask_order';

export interface StaffMessageView {
  id: string;
  direction: string;
  source: string;
  status: string;
  emailDelivery: string;
  senderLabel: string | null;
  staffAuthor: string | null;
  visibleToCustomer: boolean;
  bodyText: string;
  fullBodyText: string | null;
  createdAt: string;
  sentAt: string | null;
  receivedAt: string | null;
  flags: string[];
  flagsReviewed: boolean;
  hasAttachments: boolean;
  errorCode: string | null;
  toAddressMasked: string | null;
  /** A customer message no pharmacist has opened yet. */
  unread: boolean;
}

export interface StaffContactView {
  mode: PharmacyContactMode;
  /** The consented address in full (staff only), for the Outlook draft's To line. */
  email: string | null;
  maskedEmail: string;
  verifiedAt: string | null;
  verifiedMethod: 'code' | 'staff_confirmed' | null;
  blocked: EmailBlockedReason | null;
  blockedText: string | null;
  locale: string | null;
}

export interface ThreadPanelData {
  topic: ThreadTopicView;
  recordId: string;
  profileId: string;
  region: PharmacyRegion;
  regionLabel: string;
  threadId: string | null;
  ref: string | null;
  status: 'open' | 'closed' | null;
  waitingOn: string | null;
  messages: StaffMessageView[];
  contact: StaffContactView | null;
  route: {
    kind: 'graph' | 'mailto';
    reasonText: string;
    mailboxAddress: string | null;
    /** The province's Liivv mailbox an Outlook draft must be sent from (null: not set). */
    outlookFrom: string | null;
  };
  plan: SendPlan;
  /** D8 approved: email may be offered and sent at all. */
  emailApproved: boolean;
  phone: string;
  origin: string | null;
  messageModeOn: boolean;
  prefill: AdminTemplateValues;
  /** This panel alone could not load (for example, its migration has not run). */
  loadError: string | null;
}

export interface UnmatchedView {
  id: string;
  region: string;
  regionLabel: string;
  folder: string;
  from: string | null;
  to: string[];
  subject: string | null;
  receivedAt: string | null;
  bodyText: string | null;
  reason: string;
  reasonText: string;
  suggestedProfileId: string | null;
  suggestedThreads: Array<{ id: string; label: string }>;
}

export interface FlaggedOutlookView {
  id: string;
  threadId: string;
  region: string | null;
  createdAt: string;
  toAddressMasked: string | null;
  flags: string[];
  bodyText: string;
  /** False: kept staff-only until the privacy officer chooses "Show to customer". */
  visibleToCustomer: boolean;
}

export interface MailStatusRegionView {
  region: PharmacyRegion;
  label: string;
  routeKind: 'graph' | 'mailto';
  reasonText: string;
  mailboxAddress: string | null;
  objectIdSet: boolean;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastErrorCode: string | null;
  subscriptionExpiresAt: string | null;
}

export interface MailStatusView {
  enabled: boolean;
  deployment: 'production' | 'preview' | 'local';
  authMode: string | null;
  tenantSet: boolean;
  clientSet: boolean;
  credentialSet: boolean;
  appUrlOk: boolean;
  webhooks: boolean;
  plusReplyTo: boolean;
  messageMode: boolean;
  consentApproved: boolean;
  cronSecretSet: boolean;
  regions: MailStatusRegionView[];
  syncStateError: string | null;
}

export interface StaffMailData {
  /** Keyed `${topic}:${recordId}`. */
  panels: Record<string, ThreadPanelData>;
  replied: { prescriptionIds: string[]; rxOrderCheckIds: string[] };
  unmatched: UnmatchedView[];
  flagged: FlaggedOutlookView[];
  queuesError: string | null;
  status: MailStatusView;
}

export function panelKey(topic: ThreadTopicView, recordId: string): string {
  return `${topic}:${recordId}`;
}

export interface CustomerMessageView {
  id: string;
  mine: boolean;
  senderLabel: string;
  bodyText: string;
  createdAt: string;
  /** "Received by Liivv pharmacy" on the customer's own messages. */
  received: boolean;
  unread: boolean;
}

export interface CustomerThreadView {
  id: string;
  topicLabel: string;
  closed: boolean;
  messages: CustomerMessageView[];
}

export interface CustomerContactView {
  mode: PharmacyContactMode;
  maskedEmail: string | null;
  accountEmailMasked: string;
  verified: boolean;
  verifiedAt: string | null;
  blocked: EmailBlockedReason | null;
  /** A code can be emailed (Graph is on for the customer's pharmacy). */
  codeAvailable: boolean;
  /** A code was sent and is still waiting to be entered. */
  codePending: boolean;
  messageModeOffered: boolean;
}

/*
 * What the customer's contact choice needs: the account email it names, and
 * which modes are offered. No email mode at all until the owner approves the
 * consent wording (D8): the pharmacist phones.
 */
export interface PharmacyContactIntake {
  accountEmail: string;
  messageModeOffered: boolean;
  emailOffered: boolean;
}

export interface CustomerPharmacyMessagesData {
  ready: boolean;
  error: string | null;
  threads: CustomerThreadView[];
  contact: CustomerContactView | null;
  phone: string;
  hasUnread: boolean;
}
