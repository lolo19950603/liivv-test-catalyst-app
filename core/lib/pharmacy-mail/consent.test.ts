import { describe, expect, it } from 'vitest';

import {
  type ConsentRecord,
  pharmacyContactState,
  sendPlanFor,
  type VerificationRecord,
} from './consent';

const NOW = new Date('2026-10-14T15:00:00Z');
const EMAIL = 'jane@example.com';

function consent(mode: string, createdAt: string, email: string | null = EMAIL): ConsentRecord {
  return { id: `c-${createdAt}`, mode, email, created_at: createdAt, locale: 'en' };
}

function verified(at: string, email = EMAIL, method = 'code'): VerificationRecord {
  return { email, method, verified_at: at, created_at: at };
}

describe('pharmacyContactState', () => {
  it('is not chosen with no consent', () => {
    expect(
      pharmacyContactState({
        consents: [],
        verifications: [],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }),
    ).toMatchObject({ mode: 'not_chosen', email: null, emailBlocked: 'not_chosen' });
  });

  it('uses the newest consent and keeps the history', () => {
    const consents = [
      consent('notice_only', '2026-10-01T00:00:00Z'),
      consent('no_email', '2026-10-10T00:00:00Z', null),
      consent('message_by_email', '2026-09-01T00:00:00Z'),
    ];

    expect(
      pharmacyContactState({
        consents,
        verifications: [],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }),
    ).toMatchObject({
      mode: 'no_email',
      email: null,
      emailBlocked: 'no_email',
      consentId: 'c-2026-10-10T00:00:00Z',
    });
  });

  it('allows email to a checked, current address', () => {
    expect(
      pharmacyContactState({
        consents: [consent('notice_only', '2026-10-01T00:00:00Z', 'Jane@Example.com')],
        verifications: [verified('2026-10-02T00:00:00Z')],
        bouncedAt: [],
        accountEmail: ' JANE@example.com ',
        now: NOW,
      }),
    ).toEqual({
      mode: 'notice_only',
      email: EMAIL,
      consentId: 'c-2026-10-01T00:00:00Z',
      locale: 'en',
      verified: { at: '2026-10-02T00:00:00Z', method: 'code' },
      emailBlocked: null,
    });
  });

  it('blocks an address that was never checked', () => {
    expect(
      pharmacyContactState({
        consents: [consent('notice_only', '2026-10-01T00:00:00Z')],
        verifications: [
          { email: EMAIL, method: 'code', verified_at: null, created_at: '2026-10-02T00:00:00Z' },
        ],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }).emailBlocked,
    ).toBe('unverified');
  });

  it('blocks when the account email changed', () => {
    expect(
      pharmacyContactState({
        consents: [consent('notice_only', '2026-10-01T00:00:00Z')],
        verifications: [verified('2026-10-02T00:00:00Z')],
        bouncedAt: [],
        accountEmail: 'new@example.com',
        now: NOW,
      }).emailBlocked,
    ).toBe('account_email_changed');
  });

  it('goes stale after 365 days', () => {
    const state = (at: string) =>
      pharmacyContactState({
        consents: [consent('notice_only', '2025-01-01T00:00:00Z')],
        verifications: [verified(at)],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }).emailBlocked;

    expect(state('2025-10-20T00:00:00Z')).toBeNull();
    expect(state('2025-10-10T00:00:00Z')).toBe('verification_stale');
  });

  it('blocks after a bounce since the check, until checked again', () => {
    const base = {
      consents: [consent('notice_only', '2026-10-01T00:00:00Z')],
      accountEmail: EMAIL,
      now: NOW,
    };

    expect(
      pharmacyContactState({
        ...base,
        verifications: [verified('2026-10-02T00:00:00Z')],
        bouncedAt: ['2026-10-05T00:00:00Z'],
      }).emailBlocked,
    ).toBe('bounced_since_verified');
    expect(
      pharmacyContactState({
        ...base,
        verifications: [
          verified('2026-10-02T00:00:00Z'),
          verified('2026-10-06T00:00:00Z', EMAIL, 'staff_confirmed'),
        ],
        bouncedAt: ['2026-10-05T00:00:00Z'],
      }),
    ).toMatchObject({ emailBlocked: null, verified: { method: 'staff_confirmed' } });
  });

  it('ignores a check of another address', () => {
    expect(
      pharmacyContactState({
        consents: [consent('notice_only', '2026-10-01T00:00:00Z')],
        verifications: [verified('2026-10-02T00:00:00Z', 'old@example.com')],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }).emailBlocked,
    ).toBe('unverified');
  });

  it('treats an unknown mode as not chosen', () => {
    expect(
      pharmacyContactState({
        consents: [consent('carrier_pigeon', '2026-10-01T00:00:00Z')],
        verifications: [],
        bouncedAt: [],
        accountEmail: EMAIL,
        now: NOW,
      }).mode,
    ).toBe('not_chosen');
  });
});

describe('sendPlanFor (what Send does, design 4.4)', () => {
  const state = (overrides: Partial<ReturnType<typeof pharmacyContactState>>) => ({
    mode: 'notice_only' as const,
    email: EMAIL,
    consentId: 'c',
    locale: null,
    verified: { at: '2026-10-02T00:00:00Z', method: 'code' as const },
    emailBlocked: null,
    ...overrides,
  });
  // D8 approved and the province's Liivv mailbox set.
  const READY = { emailApproved: true, mailtoMailboxSet: true };

  it('emails the notice through Graph to a checked address', () => {
    expect(
      sendPlanFor({ routeKind: 'graph', contact: state({}), messageModeOn: false, ...READY }),
    ).toEqual({
      kind: 'graph_notice',
    });
  });

  it('emails the text only when chosen and the mode is on', () => {
    expect(
      sendPlanFor({
        routeKind: 'graph',
        contact: state({ mode: 'message_by_email' }),
        messageModeOn: true,
        ...READY,
      }),
    ).toEqual({
      kind: 'graph_message',
    });
    expect(
      sendPlanFor({
        routeKind: 'graph',
        contact: state({ mode: 'message_by_email' }),
        messageModeOn: false,
        ...READY,
      }),
    ).toEqual({
      kind: 'graph_notice',
    });
  });

  it('sends nothing through Graph when email is blocked', () => {
    expect(
      sendPlanFor({
        routeKind: 'graph',
        contact: state({ emailBlocked: 'unverified' }),
        messageModeOn: false,
        ...READY,
      }),
    ).toEqual({
      kind: 'none',
      reason: 'unverified',
    });
  });

  it('offers the Outlook notice or the address check in fallback mode', () => {
    expect(
      sendPlanFor({ routeKind: 'mailto', contact: state({}), messageModeOn: false, ...READY }),
    ).toEqual({
      kind: 'mailto_notice',
    });
    expect(
      sendPlanFor({
        routeKind: 'mailto',
        contact: state({ emailBlocked: 'unverified' }),
        messageModeOn: false,
        ...READY,
      }),
    ).toEqual({
      kind: 'mailto_address_check',
    });
    expect(
      sendPlanFor({
        routeKind: 'mailto',
        contact: state({ emailBlocked: 'account_email_changed' }),
        messageModeOn: false,
        ...READY,
      }),
    ).toEqual({ kind: 'none', reason: 'account_email_changed' });
  });

  it('never emails a customer who chose no email or nothing yet', () => {
    (['graph', 'mailto'] as const).forEach((routeKind) => {
      expect(
        sendPlanFor({
          routeKind,
          contact: state({ mode: 'no_email', emailBlocked: 'no_email' }),
          messageModeOn: true,
          ...READY,
        }),
      ).toEqual({
        kind: 'none',
        reason: 'no_email',
      });
      expect(
        sendPlanFor({
          routeKind,
          contact: state({ mode: 'not_chosen', emailBlocked: 'not_chosen' }),
          messageModeOn: true,
          ...READY,
        }),
      ).toEqual({ kind: 'none', reason: 'not_chosen' });
    });
  });

  it('sends no email of any kind until the consent wording is approved (D8)', () => {
    (['graph', 'mailto'] as const).forEach((routeKind) => {
      expect(
        sendPlanFor({
          routeKind,
          contact: state({}),
          messageModeOn: true,
          emailApproved: false,
          mailtoMailboxSet: true,
        }),
      ).toEqual({ kind: 'none', reason: 'email_not_approved' });
    });
  });

  it('offers no Outlook draft until the province mailbox is set (never a personal mailbox)', () => {
    expect(
      sendPlanFor({
        routeKind: 'mailto',
        contact: state({}),
        messageModeOn: false,
        emailApproved: true,
        mailtoMailboxSet: false,
      }),
    ).toEqual({ kind: 'none', reason: 'mailbox_not_set' });
    expect(
      sendPlanFor({
        routeKind: 'graph',
        contact: state({}),
        messageModeOn: false,
        emailApproved: true,
        mailtoMailboxSet: false,
      }),
    ).toEqual({ kind: 'graph_notice' });
  });
});
