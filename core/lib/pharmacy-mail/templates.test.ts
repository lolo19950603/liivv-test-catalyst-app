import { describe, expect, it } from 'vitest';

import { PHARMACY_REGIONS } from './regions';
import {
  ADMIN_TEMPLATES,
  CODE_EMAIL_SUBJECT,
  codeEmailBody,
  fillAdminTemplate,
  legalIdentificationLine,
  mailtoAddressCheckHref,
  mailtoFromReminder,
  mailtoNoticeHref,
  maskEmail,
  pharmacyEmailBody,
  pharmacyEmailSubject,
  validateSignAs,
} from './templates';

/* Words that must never reach a subject or a notice (privacy research R3). */
const DENY = [
  /cpap/i,
  /mask/i,
  /sleep/i,
  /apn(o)?ea/i,
  /prescription/i,
  /resmed/i,
  /respironics/i,
  /fisher/i,
  /airfit/i,
  /dreamwear/i,
  /order/i,
  /bayshore/i,
  /Jane/,
  /Doe/,
  /12345/,
];

const REF = 'LV-7Q4K2M';
const ORIGIN = 'https://shop.example.ca';

describe('subject', () => {
  it('is fixed, with only the reference inserted', () => {
    expect(pharmacyEmailSubject(REF)).toBe(
      'New message from your Liivv pharmacy team (ref. LV-7Q4K2M)',
    );

    DENY.forEach((word) => {
      expect(pharmacyEmailSubject(REF)).not.toMatch(word);
    });
  });
});

describe('notice-only body', () => {
  const body = pharmacyEmailBody({ ref: REF, region: 'BC', origin: ORIGIN, signAs: 'Priya S.' });

  it('says only that a message is waiting, with no health words or names', () => {
    DENY.forEach((word) => {
      expect(body).not.toMatch(word);
    });

    expect(body.startsWith('Hello,\n')).toBe(true);
    expect(body).toContain('You have a new message from your Liivv pharmacy team.');
  });

  it('links to the Pharmacy page with no token or query string', () => {
    expect(body).toContain(`${ORIGIN}/account/pharmacy\n`);
    expect(body).not.toMatch(/https?:\/\/\S*[?#]/);
  });

  it('gives the province pharmacy phone, the sign-off, the legal line and the footer', () => {
    expect(body).toContain('Questions? Call us at 1 (855) 237-2473.');
    expect(body).toContain('Priya S., Pharmacist\nLiivv pharmacy team');
    expect(body).toContain(legalIdentificationLine('BC'));
    expect(body).toContain('This email is for the person it was addressed to.');
    expect(body).toContain('Liivv will never ask for your password or card number by email.');
    expect(body).toContain(`How Liivv's pharmacy uses email: ${ORIGIN}/pharmacy-email`);
    expect(body.endsWith(`Reference: ${REF}`)).toBe(true);
  });

  it('uses each province pharmacy phone', () => {
    expect(pharmacyEmailBody({ ref: REF, region: 'AB', origin: ORIGIN, signAs: 'A B' })).toContain(
      '1 (855) 430-0730',
    );
    expect(pharmacyEmailBody({ ref: REF, region: 'ON', origin: ORIGIN, signAs: 'A B' })).toContain(
      '1 (844) 561-1254',
    );
  });

  it('gives French customers the French paths', () => {
    const fr = pharmacyEmailBody({
      ref: REF,
      region: 'NB',
      origin: ORIGIN,
      locale: 'fr',
      signAs: 'A B',
    });

    expect(fr).toContain(`${ORIGIN}/fr/account/pharmacy`);
    expect(fr).toContain(`${ORIGIN}/fr/pharmacy-email`);
  });

  it('carries the pharmacist text only in full-message mode', () => {
    expect(body).not.toContain('Message from your pharmacist:');

    const full = pharmacyEmailBody({
      ref: REF,
      region: 'BC',
      origin: ORIGIN,
      signAs: 'Priya S.',
      messageText: 'Please call us about your refill.',
    });

    expect(full).toContain('Message from your pharmacist:\nPlease call us about your refill.\n');
  });

  it('never names the provincial pharmacy business in the legal line', () => {
    PHARMACY_REGIONS.forEach((region) => {
      const line = legalIdentificationLine(region);

      expect(line).toMatch(
        /^Your pharmacy record is held by Liivv's licensed pharmacy in .+, [A-Z]{2}\.$/,
      );
      expect(line).not.toMatch(/bayshore/i);
    });
  });
});

describe('mailto drafts', () => {
  it('encodes a notice-only draft and stays under 2,000 characters', () => {
    const href = mailtoNoticeHref({
      to: 'jane@example.com',
      ref: REF,
      region: 'NL',
      origin: ORIGIN,
      signAs: 'Priya S.',
      messageText: 'Your CPAP prescription is approved.',
    });

    expect(href.startsWith('mailto:jane@example.com?subject=')).toBe(true);
    expect(href.length).toBeLessThan(2000);
    expect(href).not.toMatch(/[\s<>"]/);

    const url = new URL(href);
    const subject = url.searchParams.get('subject');
    const draftBody = url.searchParams.get('body') ?? '';

    expect(subject).toBe(pharmacyEmailSubject(REF));
    // Notice only: the pharmacist's text never travels in a URL.
    expect(draftBody).not.toMatch(/cpap/i);
    expect(draftBody).toContain('\r\n');
  });

  it('builds the address check with no health content', () => {
    const href = mailtoAddressCheckHref({ to: 'jane@example.com', ref: REF, region: 'ON' });
    const url = new URL(href);

    expect(url.searchParams.get('subject')).toBe(
      'Please confirm your email for Liivv (ref. LV-7Q4K2M)',
    );

    DENY.forEach((word) => {
      expect(url.searchParams.get('body')).not.toMatch(word);
    });
  });

  it('keeps the code email free of the word pharmacy', () => {
    expect(codeEmailBody('482913')).toContain('482913');
    expect(`${CODE_EMAIL_SUBJECT} ${codeEmailBody('482913')}`).not.toMatch(/pharmac/i);
  });
});

describe('sign-as and masking', () => {
  it('accepts a short name and refuses digits', () => {
    expect(validateSignAs('  Priya   S. ')).toEqual({ ok: true, value: 'Priya S.' });
    expect(validateSignAs('Zoë O’Neil-Brûlé')).toEqual({ ok: true, value: 'Zoë O’Neil-Brûlé' });
    expect(validateSignAs('Priya 12345').ok).toBe(false);
    expect(validateSignAs('P').ok).toBe(false);
    expect(validateSignAs('x'.repeat(41)).ok).toBe(false);
    expect(validateSignAs('<b>Priya</b>').ok).toBe(false);
  });

  it('masks an address', () => {
    expect(maskEmail('jane@gmail.com')).toBe('j***@gmail.com');
    expect(maskEmail('')).toBe('');
    expect(maskEmail('weird')).toBe('***');
  });
});

describe('admin quick templates', () => {
  it('fills what is known and leaves the rest as placeholders', () => {
    const template = ADMIN_TEMPLATES.mask_order[0]?.text ?? '';

    expect(fillAdminTemplate(template, { orderNumber: '1234', phone: '1 (844) 561-1254' })).toBe(
      'Hello, before your order #1234 can ship, we need: [what is needed]. You can reply here, or call us at 1 (844) 561-1254.',
    );
    expect(
      fillAdminTemplate(ADMIN_TEMPLATES.cpap_prescription[2]?.text ?? '', { date: '2027-10-14' }),
    ).toContain('until 2027-10-14');
  });
});

describe('the Outlook draft reminder', () => {
  it('names the exact Liivv mailbox to send from, never a personal one', () => {
    const reminder = mailtoFromReminder('ON', 'pharmacy-on@example.ca');

    expect(reminder).toContain('Liivv Pharmacy <pharmacy-on@example.ca>');
    expect(reminder).toContain('Never send it from your own mailbox');
    expect(reminder).not.toMatch(/bayshore/i);
  });
});
