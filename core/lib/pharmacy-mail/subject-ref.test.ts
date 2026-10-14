import { randomInt } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  generateSubjectRef,
  isSubjectRef,
  parsePlusTokenRef,
  parseSubjectRef,
  plusReplyToAddress,
  REF_ALPHABET,
} from './subject-ref';

describe('generateSubjectRef', () => {
  it('is LV- and six Crockford characters (no I, L, O or U)', () => {
    for (let i = 0; i < 500; i += 1) {
      const ref = generateSubjectRef(randomInt);

      expect(ref).toMatch(/^LV-[0-9A-HJKMNP-TV-Z]{6}$/);
      expect(ref.slice(3)).not.toMatch(/[ILOU]/);
      expect(isSubjectRef(ref)).toBe(true);
    }

    expect(REF_ALPHABET).toHaveLength(32);
  });

  it('draws every character from the random source', () => {
    expect(generateSubjectRef(() => 0)).toBe('LV-000000');
    expect(generateSubjectRef(() => 31)).toBe('LV-ZZZZZZ');
  });
});

describe('parseSubjectRef', () => {
  const subject = 'New message from your Liivv pharmacy team (ref. LV-7Q4K2M)';

  it('reads the reference from our subject', () => {
    expect(parseSubjectRef(subject)).toBe('LV-7Q4K2M');
  });

  it.each([
    `RE: ${subject}`,
    `Re: Re: ${subject}`,
    `Fwd: ${subject}`,
    `TR: ${subject}`,
    `FW: [EXTERNAL] ${subject}`,
    subject.toLowerCase(),
    'New message from your Liivv pharmacy team (ref.\r\n LV-7Q4K2M)',
    'RE: New message from your\r\n\tLiivv pharmacy team (ref. lv-7q4k2m)',
    'Undeliverable: New message from your Liivv pharmacy team (ref. LV-7Q4K2M)',
    'LV-7Q4K2M',
    '[LV-7Q4K2M] question',
  ])('finds it in %j', (value) => {
    expect(parseSubjectRef(value)).toBe('LV-7Q4K2M');
  });

  it.each([
    'LV-7Q4K2MX',
    'XLV-7Q4K2M',
    'LV-7Q4K2',
    'LV-7Q4K2I',
    'LV-7Q4K2L',
    'LV-OOOOOO',
    'LV-UUUUUU',
    'LV 7Q4K2M',
    'LV_7Q4K2M',
    'LV-7Q4K2M9',
    'order 12345',
    '',
    null,
    undefined,
  ])('does not match %j', (value) => {
    expect(parseSubjectRef(value)).toBeNull();
  });

  it('takes the first reference when two appear', () => {
    expect(parseSubjectRef('LV-AAAAAA and LV-BBBBBB')).toBe('LV-AAAAAA');
  });
});

describe('plus-address token', () => {
  it('builds the Reply-To from the mailbox and the reference', () => {
    expect(plusReplyToAddress('Pharmacy-ON@Example.ca', 'LV-7Q4K2M')).toBe(
      'pharmacy-on+lv-7q4k2m@example.ca',
    );
    expect(plusReplyToAddress('pharmacy-on+old@example.ca', 'LV-7Q4K2M')).toBe(
      'pharmacy-on+lv-7q4k2m@example.ca',
    );
    expect(plusReplyToAddress('no-at-sign', 'LV-7Q4K2M')).toBeNull();
    expect(plusReplyToAddress('pharmacy-on@example.ca', 'not-a-ref')).toBeNull();
  });

  it('reads the reference back from the To line', () => {
    expect(parsePlusTokenRef(['someone@else.ca', 'pharmacy-on+lv-7q4k2m@example.ca'])).toBe(
      'LV-7Q4K2M',
    );
    expect(parsePlusTokenRef(['PHARMACY-ON+LV-7Q4K2M@EXAMPLE.CA'])).toBe('LV-7Q4K2M');
    expect(parsePlusTokenRef(['pharmacy-on+lv-7q4k2@example.ca'])).toBeNull();
    expect(parsePlusTokenRef(['pharmacy-on+news@example.ca'])).toBeNull();
    expect(parsePlusTokenRef([])).toBeNull();
  });
});
