import 'server-only';

import {
  type ConsentRecord,
  PHARMACY_EMAIL_CONSENT_WORDING_VERSION,
  type PharmacyContactChoice,
  type PharmacyContactState,
  pharmacyContactState,
  type VerificationRecord,
} from '~/lib/pharmacy-mail/consent';
import { getSupabaseClient } from '~/lib/supabase/client';

/*
 * =============================================================================
 * PHARMACY EMAIL CONSENT AND ADDRESS CHECKS (owner decision Q10, 2026-10-14)
 * =============================================================================
 * public.pharmacy_email_consents is append-only: each choice is a new row and
 * the newest is in force (~/lib/pharmacy-mail/consent.ts reads it), so a
 * withdrawal keeps the history. public.pharmacy_email_verifications holds the
 * address checks: a 6-digit code emailed through Graph (only its HMAC is
 * stored), or a pharmacist's "Customer confirmed this address" after the
 * Outlook-draft test email.
 *
 * Reads throw on a query error; callers fail soft (see pharmacy-threads.ts).
 * =============================================================================
 */

export interface VerificationRow extends VerificationRecord {
  id: string;
  profile_id: string;
  code_hash: string | null;
  attempts: number;
  expires_at: string | null;
  pharmacy_region: string | null;
}

function fail(context: string, error: { message?: string; code?: string }): never {
  const wrapped = new Error(`${context}: ${error.message ?? 'query failed'}`);

  Object.assign(wrapped, { code: error.code ?? '' });
  throw wrapped;
}

function isConsentRecord(value: unknown): value is ConsentRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'mode' in value &&
    'created_at' in value &&
    typeof value.created_at === 'string'
  );
}

function isVerificationRow(value: unknown): value is VerificationRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'method' in value &&
    'created_at' in value
  );
}

export async function listConsents(profileId: string): Promise<ConsentRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_consents')
    .select('id, mode, email, created_at, source, wording_version, locale')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    fail('Pharmacy email consent could not be read', error);
  }

  return Array.isArray(data) ? data.filter(isConsentRecord) : [];
}

/* A new choice. The email is the account email (never typed), lower-cased; none for no_email. */
export async function addConsent(input: {
  profileId: string;
  mode: PharmacyContactChoice;
  accountEmail: string | null;
  locale: string | null;
  source: 'cpap_intake' | 'pharmacy_page' | 'staff_phone';
  recordedBy?: string | null;
}): Promise<{ id: string }> {
  const email = input.mode === 'no_email' ? null : (input.accountEmail ?? '').trim().toLowerCase();

  if (input.mode !== 'no_email' && !email) {
    throw new Error('An email choice needs the account email.');
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_consents')
    .insert({
      profile_id: input.profileId,
      mode: input.mode,
      email,
      wording_version: PHARMACY_EMAIL_CONSENT_WORDING_VERSION,
      locale: input.locale,
      source: input.source,
      recorded_by: input.recordedBy ?? null,
    })
    .select('id')
    .single();

  if (error) {
    fail('Pharmacy email consent could not be saved', error);
  }

  const row: unknown = data;

  return { id: typeof row === 'object' && row !== null && 'id' in row ? String(row.id) : '' };
}

export async function listVerifications(profileId: string): Promise<VerificationRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    fail('Pharmacy email checks could not be read', error);
  }

  return Array.isArray(data) ? data.filter(isVerificationRow) : [];
}

export async function createCodeVerification(input: {
  profileId: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  region: string;
}): Promise<{ id: string }> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .insert({
      profile_id: input.profileId,
      email: input.email.toLowerCase(),
      method: 'code',
      code_hash: input.codeHash,
      expires_at: input.expiresAt,
      pharmacy_region: input.region,
    })
    .select('id')
    .single();

  if (error) {
    fail('Pharmacy email check could not be saved', error);
  }

  const row: unknown = data;

  return { id: typeof row === 'object' && row !== null && 'id' in row ? String(row.id) : '' };
}

export async function updateVerification(
  id: string,
  patch: Partial<Pick<VerificationRow, 'attempts' | 'verified_at'>> & {
    graph_message_id?: string | null;
  },
): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .update(patch)
    .eq('id', id);

  if (error) {
    fail('Pharmacy email check could not be updated', error);
  }
}

/*
 * Takes one attempt on a code check: attempts goes from `seen` to seen + 1
 * only if it is still `seen` (no other guess took it meanwhile). False: the
 * row changed, so this guess is not checked.
 */
export async function claimVerificationAttempt(id: string, seen: number): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .update({ attempts: seen + 1 })
    .eq('id', id)
    .eq('attempts', seen)
    .is('verified_at', null)
    .select('id');

  if (error) {
    fail('Pharmacy email check could not be updated', error);
  }

  return Array.isArray(data) && data.length > 0;
}

/* A pharmacist confirmed the address after the customer answered the Outlook test email. */
export async function addStaffConfirmedVerification(input: {
  profileId: string;
  email: string;
  confirmedBy: string;
  region: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await getSupabaseClient().from('pharmacy_email_verifications').insert({
    profile_id: input.profileId,
    email: input.email.toLowerCase(),
    method: 'staff_confirmed',
    confirmed_by: input.confirmedBy,
    pharmacy_region: input.region,
    verified_at: now,
  });

  if (error) {
    fail('Pharmacy email check could not be saved', error);
  }
}

/* Code emails sent to a profile since a time: at most 3 an hour and 6 a day. */
export async function countCodeSendsSince(profileId: string, sinceIso: string): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('method', 'code')
    .gte('created_at', sinceIso);

  if (error) {
    fail('Pharmacy email checks could not be counted', error);
  }

  return count ?? 0;
}

/*
 * Code emails sent from one province's pharmacy mailbox since a time, across
 * every profile: they count toward that mailbox's sending limits.
 */
export async function countRegionCodeSendsSince(region: string, sinceIso: string): Promise<number> {
  const { count, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('pharmacy_region', region)
    .eq('method', 'code')
    .gte('created_at', sinceIso);

  if (error) {
    fail('Pharmacy email checks could not be counted', error);
  }

  return count ?? 0;
}

/* Whether a Graph message id is one of our code emails (its Sent Items copy keeps the id). */
export async function isCodeEmailGraphId(graphId: string): Promise<boolean> {
  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_verifications')
    .select('id')
    .eq('graph_message_id', graphId)
    .limit(1);

  if (error) {
    fail('Pharmacy email checks could not be read', error);
  }

  return Array.isArray(data) && data.length > 0;
}

/* When email to this address bounced (from the NDRs the sync matched). */
export async function listBouncedAt(email: string | null): Promise<string[]> {
  if (!email) {
    return [];
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_messages')
    .select('sent_at, created_at')
    .eq('to_address', email.toLowerCase())
    .eq('status', 'bounced')
    .limit(50);

  if (error) {
    fail('Bounced pharmacy email could not be read', error);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return rows.flatMap((row) => {
    if (typeof row !== 'object' || row === null) {
      return [];
    }

    if ('sent_at' in row && typeof row.sent_at === 'string') {
      return [row.sent_at];
    }

    return 'created_at' in row && typeof row.created_at === 'string' ? [row.created_at] : [];
  });
}

/* The contact state in force for a profile, given its account email now. Throws on error. */
export async function readContactState(
  profileId: string,
  accountEmail: string | null,
): Promise<PharmacyContactState> {
  const [consents, verifications] = await Promise.all([
    listConsents(profileId),
    listVerifications(profileId),
  ]);
  const latestEmail = consents[0]?.email ?? null;
  const bouncedAt = await listBouncedAt(latestEmail);

  return pharmacyContactState({ consents, verifications, bouncedAt, accountEmail });
}

/*
 * The profiles whose consent in force names one of these addresses, by
 * address (lower-cased). Used to recognise a customer's email and to keep
 * unrelated mail out of the sync.
 */
export async function profilesByConsentedEmail(
  addresses: readonly string[],
): Promise<Map<string, string[]>> {
  const wanted = [...new Set(addresses.map((address) => address.toLowerCase()).filter(Boolean))];
  const result = new Map<string, string[]>();

  if (wanted.length === 0) {
    return result;
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_consents')
    .select('profile_id, email, mode, created_at')
    .in('email', wanted.slice(0, 200))
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    fail('Pharmacy email consent could not be read', error);
  }

  const read: unknown[] = Array.isArray(data) ? data : [];
  const candidates = new Set(
    read.flatMap((value) =>
      typeof value === 'object' &&
      value !== null &&
      'profile_id' in value &&
      typeof value.profile_id === 'string'
        ? [value.profile_id]
        : [],
    ),
  );

  // Only the consent in force counts: a later "don't email me" or a new
  // address takes a profile off the list.
  const latest = await latestConsentByProfile([...candidates]);

  latest.forEach((consent, profileId) => {
    const email = consent.email?.toLowerCase();

    if (email && consent.mode !== 'no_email' && wanted.includes(email)) {
      result.set(email, [...(result.get(email) ?? []), profileId]);
    }
  });

  return result;
}

async function latestConsentByProfile(profileIds: string[]): Promise<Map<string, ConsentRecord>> {
  const latest = new Map<string, ConsentRecord>();

  if (profileIds.length === 0) {
    return latest;
  }

  const { data, error } = await getSupabaseClient()
    .from('pharmacy_email_consents')
    .select('id, profile_id, mode, email, created_at')
    .in('profile_id', profileIds.slice(0, 200))
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) {
    fail('Pharmacy email consent could not be read', error);
  }

  const read: unknown[] = Array.isArray(data) ? data : [];

  // Newest first, so the first row seen for a profile is its consent in force.
  read.forEach((value) => {
    if (isConsentRecord(value) && 'profile_id' in value && typeof value.profile_id === 'string') {
      if (!latest.has(value.profile_id)) {
        latest.set(value.profile_id, value);
      }
    }
  });

  return latest;
}
