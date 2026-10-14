/*
 * =============================================================================
 * HOW A CUSTOMER AGREED TO BE CONTACTED BY THEIR LIIVV PHARMACIST
 * =============================================================================
 * Owner decision Q10, 2026-10-14, with the privacy research requirements
 * R1 to R4. The customer chooses a contact mode on the CPAP intake form or on
 * the Pharmacy page:
 *
 *   notice_only       the email only says a message is waiting (recommended);
 *   message_by_email  the pharmacist's text is in the email (offered only when
 *                     the owner turns that mode on, D3);
 *   no_email          phone only.
 *
 * Consents are append-only: the newest row is in force and history is kept,
 * like the health-answers consent (~/lib/onboarding/health-profile-consent.ts).
 * The app emails only the checked account email. The address counts as checked
 * only when ALL of these hold:
 *   - a verification row has that email and a verified_at;
 *   - verified_at is within PHARMACY_EMAIL_REVERIFY_DAYS (365, D11);
 *   - no email to that address has bounced since;
 *   - the account email (profiles.email, refreshed on every visit) still equals it.
 *
 * Pure, shared by the admin, the Pharmacy page, the send pipeline and the tests.
 * =============================================================================
 */

export const PHARMACY_EMAIL_REVERIFY_DAYS = 365;
/** The consent wording on screen; bump it whenever that wording changes (D8). */
export const PHARMACY_EMAIL_CONSENT_WORDING_VERSION = 'pharmacy-email-2026-10-v1';

export type PharmacyContactChoice = 'notice_only' | 'message_by_email' | 'no_email';
export type PharmacyContactMode = PharmacyContactChoice | 'not_chosen';

export type EmailBlockedReason =
  | 'not_chosen'
  | 'no_email'
  | 'account_email_changed'
  | 'unverified'
  | 'verification_stale'
  | 'bounced_since_verified';

export interface ConsentRecord {
  id: string;
  mode: string;
  email: string | null;
  created_at: string;
  source?: string | null;
  wording_version?: string | null;
  locale?: string | null;
}

export interface VerificationRecord {
  email: string;
  method: string;
  verified_at: string | null;
  created_at: string;
}

export interface PharmacyContactState {
  mode: PharmacyContactMode;
  /** The consented address (the account email when consent was given), lower-cased. */
  email: string | null;
  consentId: string | null;
  locale: string | null;
  verified: { at: string; method: 'code' | 'staff_confirmed' } | null;
  emailBlocked: EmailBlockedReason | null;
}

export function isPharmacyContactChoice(value: unknown): value is PharmacyContactChoice {
  return value === 'notice_only' || value === 'message_by_email' || value === 'no_email';
}

function lower(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function newestFirst<T extends { created_at: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/* The newest verification of this address that was completed, or null. */
function latestVerified(
  verifications: readonly VerificationRecord[],
  email: string,
): VerificationRecord | null {
  return (
    newestFirst(
      verifications.filter((row) => lower(row.email) === email && Boolean(row.verified_at)),
    ).sort((a, b) => String(b.verified_at).localeCompare(String(a.verified_at)))[0] ?? null
  );
}

function verificationMethod(method: string): 'code' | 'staff_confirmed' {
  return method === 'staff_confirmed' ? 'staff_confirmed' : 'code';
}

function daysBetween(fromIso: string, to: Date): number {
  return (to.getTime() - new Date(fromIso).getTime()) / 86_400_000;
}

/* Why email to a consented address is blocked, given its latest check. */
function emailModeBlock(input: {
  email: string;
  accountEmail: string;
  verified: VerificationRecord | null;
  bouncedAt: readonly string[];
  now: Date;
  reverifyDays: number;
}): EmailBlockedReason | null {
  if (!input.accountEmail || input.accountEmail !== input.email) {
    return 'account_email_changed';
  }

  if (!input.verified?.verified_at) {
    return 'unverified';
  }

  const verifiedAt = input.verified.verified_at;

  if (daysBetween(verifiedAt, input.now) > input.reverifyDays) {
    return 'verification_stale';
  }

  if (input.bouncedAt.some((at) => at > verifiedAt)) {
    return 'bounced_since_verified';
  }

  return null;
}

/*
 * The contact state in force: the newest consent, whether its address is
 * checked, and why email is blocked if it is.
 */
export function pharmacyContactState(input: {
  consents: readonly ConsentRecord[];
  verifications: readonly VerificationRecord[];
  /** When outbound email to the consented address bounced (ISO times). */
  bouncedAt: readonly string[];
  /** profiles.email now. */
  accountEmail: string | null;
  now?: Date;
  reverifyDays?: number;
}): PharmacyContactState {
  const latest = newestFirst(input.consents)[0];
  const mode: PharmacyContactMode =
    latest && isPharmacyContactChoice(latest.mode) ? latest.mode : 'not_chosen';
  const email = latest && mode !== 'no_email' ? lower(latest.email) || null : null;
  const verified = email ? latestVerified(input.verifications, email) : null;
  const base = {
    mode,
    email,
    consentId: latest?.id ?? null,
    locale: latest?.locale ?? null,
    verified: verified?.verified_at
      ? { at: verified.verified_at, method: verificationMethod(verified.method) }
      : null,
  };

  if (mode === 'not_chosen' || mode === 'no_email') {
    return { ...base, emailBlocked: mode };
  }

  if (!email) {
    return { ...base, emailBlocked: 'unverified' };
  }

  return {
    ...base,
    emailBlocked: emailModeBlock({
      email,
      accountEmail: lower(input.accountEmail),
      verified,
      bouncedAt: input.bouncedAt,
      now: input.now ?? new Date(),
      reverifyDays: input.reverifyDays ?? PHARMACY_EMAIL_REVERIFY_DAYS,
    }),
  };
}

/* Whether the customer chose an email mode (checked or not). */
export function wantsEmail(state: PharmacyContactState): boolean {
  return state.mode === 'notice_only' || state.mode === 'message_by_email';
}

/* What the pharmacist and the customer are told about a blocked address. */
export function emailBlockedText(reason: EmailBlockedReason): string {
  switch (reason) {
    case 'not_chosen':
      return 'Not chosen yet: phone the customer, or ask them to choose on their Pharmacy page.';

    case 'no_email':
      return 'Customer chose: don’t email. Phone them.';

    case 'account_email_changed':
      return 'The customer’s account email changed since it was checked.';

    case 'unverified':
      return 'The customer’s email address hasn’t been checked yet.';

    case 'verification_stale':
      return 'The customer’s email address was checked more than a year ago and needs checking again.';

    default:
      return 'An email to the customer bounced. The address needs checking again.';
  }
}

/*
 * What happens when the pharmacist presses Send (design section 4.4). The
 * message is always posted to the Pharmacy page; this is the email part.
 *   graph_notice / graph_message   Liivv emails from the province mailbox;
 *   mailto_notice                  "Email customer (Outlook)" draft, then "I sent it";
 *   mailto_address_check           "Send address check (Outlook)" first;
 *   none                           no email: phone, then "Record outcome".
 * No email of any kind until the owner approves the consent wording (D8), and
 * no Outlook draft until the province's Liivv mailbox is set, so a pharmacist
 * never emails a customer from their own mailbox (privacy research R5).
 */
export type SendPlan =
  | { kind: 'graph_notice' }
  | { kind: 'graph_message' }
  | { kind: 'mailto_notice' }
  | { kind: 'mailto_address_check' }
  | {
      kind: 'none';
      reason: EmailBlockedReason | 'route_blocked' | 'email_not_approved' | 'mailbox_not_set';
    };

export function sendPlanFor(input: {
  routeKind: 'graph' | 'mailto';
  contact: PharmacyContactState;
  messageModeOn: boolean;
  /** D8: the consent wording and email policy are approved. */
  emailApproved: boolean;
  /** Outlook draft only: the province's Liivv mailbox address is set. */
  mailtoMailboxSet: boolean;
}): SendPlan {
  const { contact } = input;

  if (!wantsEmail(contact)) {
    return { kind: 'none', reason: contact.mode === 'no_email' ? 'no_email' : 'not_chosen' };
  }

  if (!input.emailApproved) {
    return { kind: 'none', reason: 'email_not_approved' };
  }

  if (input.routeKind === 'graph') {
    if (contact.emailBlocked) {
      return { kind: 'none', reason: contact.emailBlocked };
    }

    return contact.mode === 'message_by_email' && input.messageModeOn
      ? { kind: 'graph_message' }
      : { kind: 'graph_notice' };
  }

  // The Outlook draft: a checked address gets the notice; an unchecked one
  // (never checked, stale, bounced) gets the address check first. A changed
  // account email needs the customer's own choice again on the Pharmacy page:
  // the consent named the old address, and staff never pick an address.
  if (contact.emailBlocked === 'account_email_changed') {
    return { kind: 'none', reason: 'account_email_changed' };
  }

  if (!input.mailtoMailboxSet) {
    return { kind: 'none', reason: 'mailbox_not_set' };
  }

  return contact.emailBlocked ? { kind: 'mailto_address_check' } : { kind: 'mailto_notice' };
}
