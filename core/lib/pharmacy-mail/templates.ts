/*
 * =============================================================================
 * PHARMACIST-MESSAGE EMAIL WORDING (drafts for the owner and privacy officer)
 * =============================================================================
 * Owner decision Q10, 2026-10-14; privacy research R3 and R8. All customer
 * wording here is a DRAFT for the owner (as nurse) and the pharmacy privacy
 * officer to approve (decisions D3, D4, D5, D8, D10, D14). English only until
 * the French is approved (D10).
 *
 * Rules every template keeps:
 *   - the subject is fixed, with only the random reference in it: never CPAP,
 *     mask, sleep, apnea, prescription, a product, an order number or a name;
 *   - "Hello," with no name (PHIPA s.4(1)(b): even "is a patient of" is
 *     health information);
 *   - one plain sign-in link with no token and no query string;
 *   - the province pharmacy's phone number, the pharmacist's sign-as name
 *     (never a licence number), the legal identification line (D5), the
 *     misdirected-email and anti-phishing lines, the policy link (D8);
 *   - plain text; every inserted value comes from a fixed list or is checked.
 *   - mailto: drafts are notice-only: nothing clinical ever goes in a URL.
 *
 * Pure, for the unit tests and the admin's client components.
 * =============================================================================
 */

import { pharmacyLocationForRegion } from '../pharmacy/pharmacy-fax';

import { pharmacyPhoneOf, type PharmacyRegion, pharmacyRegionName } from './regions';

export const PHARMACY_PAGE_PATH = '/account/pharmacy';
export const PHARMACY_EMAIL_POLICY_PATH = '/pharmacy-email';

/* D4: the owner's pick. Only the reference is ever inserted. */
export function pharmacyEmailSubject(ref: string): string {
  return `New message from your Liivv pharmacy team (ref. ${ref})`;
}

export const CODE_EMAIL_SUBJECT = 'Your Liivv email confirmation code';

export function addressCheckSubject(ref: string): string {
  return `Please confirm your email for Liivv (ref. ${ref})`;
}

/* French customers get the French paths (the text itself waits for D10). */
function localePrefix(locale: string | null | undefined): string {
  return String(locale ?? '')
    .toLowerCase()
    .startsWith('fr')
    ? '/fr'
    : '';
}

export function pharmacyPageUrl(origin: string | null, locale?: string | null): string | null {
  return origin ? `${origin}${localePrefix(locale)}${PHARMACY_PAGE_PATH}` : null;
}

export function emailPolicyUrl(origin: string | null, locale?: string | null): string | null {
  return origin ? `${origin}${localePrefix(locale)}${PHARMACY_EMAIL_POLICY_PATH}` : null;
}

/*
 * D5 (draft): the line that identifies the licensed pharmacy holding the
 * record. It names Liivv and the pharmacy's city and province, never the
 * provincial pharmacy's own business name, until the owner rules on the
 * white-label exception (same question as Q15 in C26).
 */
export function legalIdentificationLine(region: PharmacyRegion): string {
  const { city, province } = pharmacyLocationForRegion(region);

  return `Your pharmacy record is held by Liivv's licensed pharmacy in ${city}, ${province}.`;
}

/*
 * The sign-as name the customer sees ("Priya S."): 2 to 40 characters,
 * letters, spaces, apostrophes, hyphens and periods only, so a licence number
 * can't reach the customer.
 */
export function validateSignAs(
  raw: string | null | undefined,
): { ok: true; value: string } | { ok: false; error: string } {
  const value = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (value.length < 2 || value.length > 40) {
    return { ok: false, error: 'Sign as: 2 to 40 letters, for example “Priya S.”.' };
  }

  if (!/^[\p{L}][\p{L} .'’-]*$/u.test(value)) {
    return {
      ok: false,
      error: 'Sign as: letters only, no numbers (your licence number stays private).',
    };
  }

  return { ok: true, value };
}

/* How the customer sees a pharmacist: "Priya S., Pharmacist". */
export function pharmacistSenderLabel(signAs: string): string {
  return `${signAs}, Pharmacist`;
}

/* "jane@example.com" → "j***@example.com". Staff see only this in lists and logs. */
export function maskEmail(email: string | null | undefined): string {
  const address = String(email ?? '').trim();
  const at = address.lastIndexOf('@');

  if (at <= 0) {
    return address ? '***' : '';
  }

  return `${address.charAt(0)}***${address.slice(at)}`;
}

export interface NoticeEmailInput {
  ref: string;
  region: PharmacyRegion;
  origin: string | null;
  locale?: string | null;
  signAs: string;
  /** Full-message mode only (D3, opt-in): the pharmacist's text. */
  messageText?: string | null;
}

/*
 * The notice-only email (the default), or the full-message email when
 * `messageText` is given: the same notice with the pharmacist's text before
 * the sign-in line.
 */
export function pharmacyEmailBody(input: NoticeEmailInput): string {
  const phone = pharmacyPhoneOf(input.region);
  const pageUrl = pharmacyPageUrl(input.origin, input.locale);
  const policyUrl = emailPolicyUrl(input.origin, input.locale);
  const message = input.messageText?.trim()
    ? ['Message from your pharmacist:', input.messageText.trim(), '']
    : [];
  const signIn = pageUrl
    ? ['To read it and reply, sign in to your Liivv account and open Pharmacy:', pageUrl]
    : ['To read it and reply, sign in to your Liivv account and open Pharmacy.'];

  return [
    'Hello,',
    '',
    'You have a new message from your Liivv pharmacy team.',
    '',
    ...message,
    ...signIn,
    '',
    `Questions? Call us at ${phone}.`,
    '',
    pharmacistSenderLabel(input.signAs),
    'Liivv pharmacy team',
    '',
    legalIdentificationLine(input.region),
    '',
    `This email is for the person it was addressed to. If you got it by mistake, please tell us by replying or calling ${phone}, then delete it.`,
    'Liivv will never ask for your password or card number by email.',
    ...(policyUrl ? [`How Liivv's pharmacy uses email: ${policyUrl}`] : []),
    `Reference: ${input.ref}`,
  ].join('\n');
}

/* The address-check code email (Graph). It never says "pharmacy". */
export function codeEmailBody(code: string): string {
  return [
    'Hello,',
    '',
    `Your code is ${code}. Enter it in your Liivv account within 30 minutes.`,
    '',
    'If you didn’t ask for this, ignore this email. Nothing else will be sent.',
  ].join('\n');
}

/* The Outlook-draft address check: no health content, asks for a "yes" reply. */
export function addressCheckBody(input: { ref: string; region: PharmacyRegion }): string {
  const phone = pharmacyPhoneOf(input.region);

  return [
    'Hello,',
    '',
    'You asked Liivv to email you when your Liivv pharmacy team has a message for you.',
    'To confirm this is the right address, please reply to this email with "yes".',
    '',
    `If you didn't ask for this, ignore this email or call us at ${phone}.`,
    'Liivv will never ask for your password or card number by email.',
    `Reference: ${input.ref}`,
  ].join('\n');
}

/* RFC 6068: CRLF line breaks, percent-encoded. */
function mailtoEncode(text: string): string {
  return encodeURIComponent(text.replace(/\r?\n/g, '\r\n'));
}

/*
 * A mailto: link for an Outlook draft. The To address must already be a
 * checked, strictly-shaped address (the caller passes the contact state's).
 */
export function mailtoHref(input: { to: string; subject: string; body: string }): string {
  return `mailto:${input.to}?subject=${mailtoEncode(input.subject)}&body=${mailtoEncode(input.body)}`;
}

export function mailtoNoticeHref(input: NoticeEmailInput & { to: string }): string {
  return mailtoHref({
    to: input.to,
    subject: pharmacyEmailSubject(input.ref),
    // Notice only, always: the draft travels as a URL.
    body: pharmacyEmailBody({ ...input, messageText: null }),
  });
}

export function mailtoAddressCheckHref(input: {
  to: string;
  ref: string;
  region: PharmacyRegion;
}): string {
  return mailtoHref({
    to: input.to,
    subject: addressCheckSubject(input.ref),
    body: addressCheckBody(input),
  });
}

/*
 * The reminder shown beside every mailto button: the exact Liivv mailbox to
 * send from. Never the pharmacist's own mailbox (privacy research R5): the
 * customer must see "Liivv Pharmacy", and their reply must reach the
 * province mailbox, not a personal inbox.
 */
export function mailtoFromReminder(region: PharmacyRegion, fromAddress: string): string {
  return `In Outlook, set From to Liivv Pharmacy <${fromAddress}> (the ${pharmacyRegionName(region)} pharmacy mailbox) before you send. Never send it from your own mailbox.`;
}

/*
 * =============================================================================
 * Admin quick templates (D14: wording for the owner, as nurse, to approve)
 * =============================================================================
 * They prefill the composer and are always editable. They go to the Pharmacy
 * page, and into an email only in full-message mode.
 */
export type AdminTemplateTopic = 'cpap_prescription' | 'mask_order';

export interface AdminTemplate {
  id: string;
  label: string;
  text: string;
}

export const ADMIN_TEMPLATES: Readonly<Record<AdminTemplateTopic, readonly AdminTemplate[]>> = {
  cpap_prescription: [
    {
      id: 'needs_info',
      label: 'Needs information',
      text: 'Hello, we need a little more information before we can check your CPAP prescription: [what is needed]. You can reply here, or call us at [phone].',
    },
    {
      id: 'not_accepted',
      label: 'Not accepted',
      text: 'Hello, we couldn’t accept the CPAP prescription we received: [reason]. You can send a new one from your Pharmacy page, or call us at [phone] and we’ll help.',
    },
    {
      id: 'approved',
      label: 'Approved',
      text: 'Hello, a Liivv pharmacist has checked your CPAP prescription. It’s on file until [date], and you can now order a complete CPAP mask. A pharmacist still checks each mask order before it ships.',
    },
  ],
  mask_order: [
    {
      id: 'needs_info',
      label: 'Needs information',
      text: 'Hello, before your order #[n] can ship, we need: [what is needed]. You can reply here, or call us at [phone].',
    },
    {
      id: 'not_accepted',
      label: 'Not accepted',
      text: 'Hello, we couldn’t approve your order #[n]: [reason]. [Refund wording: owner to confirm; phase 1 refunds by hand.] Call us at [phone] with any questions.',
    },
    {
      id: 'signed_off',
      label: 'Signed off',
      text: 'Hello, a Liivv pharmacist has checked your order #[n]. It will ship soon.',
    },
  ],
};

export interface AdminTemplateValues {
  phone?: string | null;
  reason?: string | null;
  date?: string | null;
  orderNumber?: string | null;
}

/*
 * A template with what is known filled in: the phone, the order number, and
 * the phase 1 decision fields (review_reason / rx_order_checks.reason as
 * [reason] and [what is needed], end_date as [date]). Anything unknown stays
 * as its [placeholder] for the pharmacist to fill.
 */
export function fillAdminTemplate(text: string, values: AdminTemplateValues): string {
  const fills: Array<[string, string | null | undefined]> = [
    ['[phone]', values.phone],
    ['[n]', values.orderNumber],
    ['[reason]', values.reason],
    ['[what is needed]', values.reason],
    ['[date]', values.date],
  ];

  return fills.reduce(
    (result, [placeholder, value]) =>
      value?.trim() ? result.split(placeholder).join(value.trim()) : result,
    text,
  );
}
