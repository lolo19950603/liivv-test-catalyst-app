import { describe, expect, it } from 'vitest';

import {
  BODY_TEXT_MAX,
  capText,
  cleanMailText,
  cleanOutboundText,
  cleanSubject,
  CUT_SHORT_NOTE,
  FULL_BODY_TEXT_MAX,
  messageBodies,
  stripQuotedHistory,
} from './sanitize';

describe('cleanMailText', () => {
  it('normalises line breaks and trims', () => {
    expect(cleanMailText('  Hello\r\nthere\rfriend  \n')).toBe('Hello\nthere\nfriend');
  });

  it('drops control, zero-width and bidi characters but keeps tabs and newlines', () => {
    expect(cleanMailText('a\u0000b\u0007c\u200Bd\u200De\uFEFFf\u202Eg\u2066h\tI\nJ')).toBe(
      'abcdefgh\tI\nJ',
    );
    expect(cleanMailText('x\u00ADy\u0085z')).toBe('xyz');
  });

  it('collapses more than two blank lines', () => {
    expect(cleanMailText('one\n\n\n\n\ntwo\n \n\t\n\nthree')).toBe('one\n\ntwo\n\nthree');
  });

  it('keeps HTML-looking text as inert text', () => {
    const html = '<script>alert(1)</script><img src=x onerror=alert(2)>';

    expect(cleanMailText(html)).toBe(html);
  });

  it('handles null and undefined', () => {
    expect(cleanMailText(null)).toBe('');
    expect(cleanMailText(undefined)).toBe('');
  });
});

describe('capText', () => {
  it('leaves short text alone', () => {
    expect(capText('short', 10)).toBe('short');
  });

  it('cuts long text with the note, staying within the cap', () => {
    const long = 'a'.repeat(BODY_TEXT_MAX + 500);
    const capped = capText(long, BODY_TEXT_MAX);

    expect(capped.length).toBeLessThanOrEqual(BODY_TEXT_MAX);
    expect(capped.endsWith(CUT_SHORT_NOTE)).toBe(true);
  });
});

describe('stripQuotedHistory', () => {
  it('cuts at a Gmail "On … wrote:" line, even when wrapped', () => {
    expect(
      stripQuotedHistory(
        'Yes, that works.\n\nOn Mon, Oct 14, 2026 at 10:42 AM Liivv Pharmacy <\npharmacy-on@example.ca> wrote:\n> Hello,\n> You have a new message',
      ),
    ).toBe('Yes, that works.');
  });

  it('cuts at an Outlook header block and the underscore rule', () => {
    expect(
      stripQuotedHistory(
        'Thanks!\n________________________________\nFrom: Liivv Pharmacy <pharmacy-on@example.ca>\nSent: Monday, October 14, 2026 10:42 AM\nSubject: New message',
      ),
    ).toBe('Thanks!');
    expect(
      stripQuotedHistory('My answer\nFrom: Liivv Pharmacy\nSent: Monday\nTo: me\n\nold text'),
    ).toBe('My answer');
  });

  it('cuts at -----Original Message-----', () => {
    expect(stripQuotedHistory('See below\n-----Original Message-----\nold')).toBe('See below');
  });

  it('drops lines quoted with >', () => {
    expect(stripQuotedHistory('> quoted\nmine\n>> older')).toBe('mine');
  });

  it('reads French clients', () => {
    expect(
      stripQuotedHistory('Oui merci\n\nLe lun. 14 oct. 2026, Liivv a écrit :\n> Bonjour'),
    ).toBe('Oui merci');
  });

  it('keeps the text when stripping would leave nothing', () => {
    expect(stripQuotedHistory('> only quoted')).toBe('> only quoted');
  });

  it('keeps a "From:" line that is not a header block', () => {
    expect(stripQuotedHistory('From: my doctor, the dose is the same.')).toBe(
      'From: my doctor, the dose is the same.',
    );
  });
});

describe('messageBodies', () => {
  it('prefers uniqueBody and keeps the whole body for the admin', () => {
    expect(
      messageBodies({ uniqueBody: 'New part', body: 'New part\n\nOn x wrote:\n> old' }),
    ).toEqual({
      bodyText: 'New part',
      fullBodyText: 'New part\n\nOn x wrote:\n> old',
    });
  });

  it('strips history from body when uniqueBody is empty', () => {
    expect(messageBodies({ uniqueBody: '  ', body: 'Reply\n\nOn x wrote:\n> old' }).bodyText).toBe(
      'Reply',
    );
  });

  it('caps both fields', () => {
    const result = messageBodies({ uniqueBody: null, body: 'b'.repeat(FULL_BODY_TEXT_MAX + 10) });

    expect(result.bodyText.length).toBeLessThanOrEqual(BODY_TEXT_MAX);
    expect(result.fullBodyText?.length).toBeLessThanOrEqual(FULL_BODY_TEXT_MAX);
    expect(result.fullBodyText?.endsWith(CUT_SHORT_NOTE)).toBe(true);
  });

  it('returns empty text for an empty message', () => {
    expect(messageBodies({ uniqueBody: null, body: null })).toEqual({
      bodyText: '',
      fullBodyText: null,
    });
  });
});

describe('subjects and outbound text', () => {
  it('flattens and caps subjects', () => {
    expect(cleanSubject('RE:\r\n  hello\u200B there')).toBe('RE: hello there');
    expect(cleanSubject('x'.repeat(300))).toHaveLength(255);
    expect(cleanSubject('   ')).toBeNull();
  });

  it('refuses empty or over-long outbound messages', () => {
    expect(cleanOutboundText('  hi  ')).toBe('hi');
    expect(cleanOutboundText('\u200B')).toBeNull();
    expect(cleanOutboundText('a'.repeat(2001))).toBeNull();
    expect(cleanOutboundText('a'.repeat(2000))).toHaveLength(2000);
  });
});
