import 'server-only';

import { createHmac, hkdfSync, randomInt, timingSafeEqual } from 'node:crypto';

import {
  claimVerificationAttempt,
  countCodeSendsSince,
  countRegionCodeSendsSince,
  createCodeVerification,
  listVerifications,
  updateVerification,
  type VerificationRow,
} from '~/lib/supabase/pharmacy-email-consent';
import { countMailboxSendsSince } from '~/lib/supabase/pharmacy-threads';

import { pharmacyEmailRoute } from './config';
import type { PharmacyMailbox } from './config-rules';
import type { PharmacyRegion } from './regions';
import { MAILBOX_EMAILS_PER_MINUTE, sendCodeEmail } from './send';

/*
 * =============================================================================
 * CHECKING A CUSTOMER'S EMAIL ADDRESS WITH A CODE (Graph only)
 * =============================================================================
 * Owner decision Q10, 2026-10-14; privacy research R4 (the IPC's "send a test
 * message and ask for confirmation"). The customer, signed in, asks for a
 * 6-digit code; it is emailed from their pharmacy's mailbox, with no health
 * content, and entered on the Pharmacy page within 30 minutes.
 *   - only an HMAC-SHA256 of the code is stored, keyed by HKDF from
 *     AUTH_SECRET, and compared timing-safe; the sync never stores the code
 *     email itself (it carries x-liivv-kind: code);
 *   - 5 attempts per code; at most 3 codes an hour and 6 a day per profile,
 *     enforced by reserving the row first and then counting, so parallel
 *     requests can't get past the limit; the attempt counter only ever goes
 *     up in the database (never from a value read earlier);
 *   - code emails count toward the province mailbox's 20 a minute, with a
 *     daily cap per mailbox, so they can't crowd out the pharmacists' email
 *     or trip Exchange's outbound-spam limits;
 *   - the customer action also needs an email choice for the account
 *     address and stays under a per-IP limit.
 * While Graph is off, the pharmacist checks the address with the Outlook test
 * email instead ("Customer confirmed this address").
 * =============================================================================
 */

const CODE_TTL_MS = 30 * 60_000;
const MAX_ATTEMPTS = 5;
const CODES_PER_HOUR = 3;
const CODES_PER_DAY = 6;
/** Code emails one province mailbox may send in a day, across every customer. */
const CODES_PER_MAILBOX_PER_DAY = 300;

function codeKey(): Buffer | null {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    return null;
  }

  return Buffer.from(hkdfSync('sha256', secret, 'liivv-pharmacy-email-code', 'v1', 32));
}

export function hashCode(code: string, email: string): string | null {
  const key = codeKey();

  return key
    ? createHmac('sha256', key).update(`${email.toLowerCase()}:${code}`).digest('hex')
    : null;
}

function isOpen(row: VerificationRow, email: string, now: number): boolean {
  return (
    row.method === 'code' &&
    row.email === email &&
    !row.verified_at &&
    row.attempts < MAX_ATTEMPTS &&
    Boolean(row.expires_at) &&
    new Date(String(row.expires_at)).getTime() > now
  );
}

/* Whether a code for this address is waiting to be entered. Never throws. */
export async function listCodeVerificationPending(
  profileId: string,
  accountEmail: string | null,
): Promise<boolean> {
  const email = accountEmail?.trim().toLowerCase();

  if (!email) {
    return false;
  }

  try {
    const now = Date.now();

    return (await listVerifications(profileId)).some((row) => isOpen(row, email, now));
  } catch {
    return false;
  }
}

export type CodeSendResult = { ok: true } | { ok: false; error: string };

/* The province mailbox has sent its share this minute (all email) or today (codes). */
async function mailboxBusy(mailbox: PharmacyMailbox, now: number): Promise<boolean> {
  const minuteAgo = new Date(now - 60_000).toISOString();
  const [codesThisMinute, codesToday, threadEmailsThisMinute] = await Promise.all([
    countRegionCodeSendsSince(mailbox.region, minuteAgo),
    countRegionCodeSendsSince(mailbox.region, new Date(now - 86_400_000).toISOString()),
    countMailboxSendsSince(mailbox.address, minuteAgo),
  ]);

  return (
    codesThisMinute + threadEmailsThisMinute >= MAILBOX_EMAILS_PER_MINUTE ||
    codesToday >= CODES_PER_MAILBOX_PER_DAY
  );
}

/* Emails a new code to the account email from the customer's pharmacy mailbox. */
export async function sendAddressCode(input: {
  profileId: string;
  accountEmail: string;
  region: PharmacyRegion;
}): Promise<CodeSendResult> {
  const route = pharmacyEmailRoute(input.region);

  if (route.kind !== 'graph') {
    return {
      ok: false,
      error:
        'Codes can’t be emailed yet. Your pharmacist will confirm your address with a short test email.',
    };
  }

  const now = Date.now();

  if (await mailboxBusy(route.mailbox, now)) {
    return {
      ok: false,
      error: 'Codes can’t be sent right now. Please try again in a few minutes.',
    };
  }

  const email = input.accountEmail.trim().toLowerCase();
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = hashCode(code, email);

  if (!codeHash) {
    return { ok: false, error: 'Codes can’t be sent right now. Please try again later.' };
  }

  // Reserve first, then count (this row included): of any requests racing
  // each other, only those still within the limit go on to send.
  const created = await createCodeVerification({
    profileId: input.profileId,
    email,
    codeHash,
    expiresAt: new Date(now + CODE_TTL_MS).toISOString(),
    region: input.region,
  });
  const [lastHour, lastDay] = await Promise.all([
    countCodeSendsSince(input.profileId, new Date(now - 3_600_000).toISOString()),
    countCodeSendsSince(input.profileId, new Date(now - 86_400_000).toISOString()),
  ]);

  if (lastHour > CODES_PER_HOUR || lastDay > CODES_PER_DAY) {
    await updateVerification(created.id, { attempts: MAX_ATTEMPTS }).catch(() => undefined);

    return { ok: false, error: 'Too many codes were sent. Please try again later.' };
  }

  const sent = await sendCodeEmail({ mailbox: route.mailbox, to: email, code });

  if (!sent.ok) {
    // An unsent code can never be entered: close it.
    await updateVerification(created.id, { attempts: MAX_ATTEMPTS }).catch(() => undefined);

    return { ok: false, error: 'The code couldn’t be emailed right now. Please try again later.' };
  }

  await updateVerification(created.id, { graph_message_id: sent.graphId }).catch(() => undefined);

  return { ok: true };
}

/* Checks an entered code against the newest open one for the account email. */
export async function confirmAddressCode(input: {
  profileId: string;
  accountEmail: string;
  code: string;
}): Promise<CodeSendResult> {
  const email = input.accountEmail.trim().toLowerCase();
  const entered = input.code.replace(/\s+/g, '');

  if (!/^\d{6}$/.test(entered)) {
    return { ok: false, error: 'Enter the 6-digit code from the email.' };
  }

  const now = Date.now();
  const open = (await listVerifications(input.profileId)).find((row) => isOpen(row, email, now));

  if (!open?.code_hash) {
    return { ok: false, error: 'That code has expired. Ask for a new one.' };
  }

  // Every guess first takes one attempt, only if no other request took it
  // since this one read the row: parallel guesses can't exceed the 5.
  if (!(await claimVerificationAttempt(open.id, open.attempts))) {
    return { ok: false, error: 'That code didn’t match. Check the email and try again.' };
  }

  const expected = Buffer.from(open.code_hash, 'hex');
  const actual = Buffer.from(hashCode(entered, email) ?? '', 'hex');
  const matches = expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!matches) {
    return {
      ok: false,
      error:
        open.attempts + 1 >= MAX_ATTEMPTS
          ? 'That code didn’t match, and it can’t be used again. Ask for a new one.'
          : 'That code didn’t match. Check the email and try again.',
    };
  }

  await updateVerification(open.id, { verified_at: new Date().toISOString() });

  return { ok: true };
}
