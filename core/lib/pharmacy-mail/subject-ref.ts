/*
 * =============================================================================
 * THE THREAD REFERENCE ("LV-7Q4K2M") AND THE PLUS-ADDRESS TOKEN
 * =============================================================================
 * Every pharmacist-message thread has a random reference: "LV-" and six
 * characters from Crockford base32 (no I, L, O or U), about 1.07 billion
 * possibilities. It is never derived from an order or customer number, so it
 * says nothing about the customer. It goes in the fixed email subject and,
 * when IT has confirmed plus addressing, in the Reply-To as
 * <local>+lv-7q4k2m@<domain>, so a customer's reply can be matched even if
 * their mail program drops the threading headers.
 *
 * Pure: the random source is passed in (crypto.randomInt on the server).
 * =============================================================================
 */

export const REF_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const REF_LENGTH = 6;

/* Anywhere in a subject: "LV-" then six Crockford characters, standing alone. */
const SUBJECT_REF_RE = /(?:^|[^0-9A-Za-z])LV-([0-9A-HJKMNP-TV-Z]{6})(?![0-9A-Za-z])/i;
const EXACT_REF_RE = /^LV-[0-9A-HJKMNP-TV-Z]{6}$/;
const PLUS_TOKEN_RE = /\+lv-([0-9a-hjkmnp-tv-z]{6})@/i;

/* A new reference. `randomInt(max)` returns an integer in [0, max). */
export function generateSubjectRef(randomInt: (max: number) => number): string {
  let ref = 'LV-';

  for (let index = 0; index < REF_LENGTH; index += 1) {
    ref += REF_ALPHABET.charAt(randomInt(REF_ALPHABET.length));
  }

  return ref;
}

/* Whether a value is a well-formed reference, as stored (upper case). */
export function isSubjectRef(value: unknown): value is string {
  return typeof value === 'string' && EXACT_REF_RE.test(value);
}

/*
 * The reference in a subject, upper-cased ("LV-7Q4K2M"), or null. Works on
 * replies and forwards ("RE:", "Fwd:", "TR:"), any letter case, and subjects
 * folded over several lines; a longer run of characters ("LV-7Q4K2MX") or a
 * letter outside the alphabet ("LV-7Q4K2I") is not a reference.
 */
export function parseSubjectRef(subject: string | null | undefined): string | null {
  const flat = String(subject ?? '').replace(/\s+/g, ' ');
  const match = SUBJECT_REF_RE.exec(flat);

  return match?.[1] ? `LV-${match[1].toUpperCase()}` : null;
}

/* "LV-7Q4K2M" → "lv-7q4k2m": the plus-address tag. */
export function plusTagOf(ref: string): string {
  return ref.toLowerCase();
}

/*
 * The Reply-To address carrying the reference: "pharmacy-on+lv-7q4k2m@x.ca".
 * Null when the mailbox address has no usable local part.
 */
export function plusReplyToAddress(mailboxAddress: string, ref: string): string | null {
  const at = mailboxAddress.lastIndexOf('@');

  if (at <= 0 || !isSubjectRef(ref)) {
    return null;
  }

  const local = mailboxAddress.slice(0, at).split('+')[0] ?? '';
  const domain = mailboxAddress.slice(at + 1);

  return local && domain ? `${local}+${plusTagOf(ref)}@${domain}`.toLowerCase() : null;
}

/* The reference carried by a plus address among these recipients, or null. */
export function parsePlusTokenRef(addresses: readonly string[]): string | null {
  const tag = addresses.map((address) => PLUS_TOKEN_RE.exec(address)?.[1]).find(Boolean);

  return tag ? `LV-${tag.toUpperCase()}` : null;
}
