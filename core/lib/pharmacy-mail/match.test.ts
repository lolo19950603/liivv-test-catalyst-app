import { describe, expect, it } from 'vitest';

import {
  authenticationPassed,
  bouncedRecipient,
  correlationKeys,
  decideInboundMatch,
  decideSentItem,
  firstCandidate,
  isAutoReply,
  isCodeEmail,
  isLiivvSend,
  isNonDeliveryReport,
  isWorthFetching,
  type MailSummary,
  outlookFlags,
  outlookVisibleToCustomer,
  parseMessageIdList,
  referencedMessageIds,
  type ThreadCandidate,
} from './match';

const MAILBOX = 'pharmacy-on@example.ca';
const CUSTOMER = 'jane@example.com';
const OWN = [MAILBOX, 'pharmacy-bc@example.ca'];
// What Exchange Online stamps on a customer's genuine reply.
const AUTH_PASS = {
  name: 'Authentication-Results',
  value:
    'spf=pass (sender IP is 192.0.2.1) smtp.mailfrom=example.com; dkim=pass (signature was verified) header.d=example.com;dmarc=pass action=none header.from=example.com;compauth=pass reason=100',
};

function mail(overrides: Partial<MailSummary> = {}): MailSummary {
  return {
    folder: 'inbox',
    mailboxAddress: MAILBOX,
    graphId: 'AAMk-1',
    internetMessageId: '<reply-1@mail.example.com>',
    conversationId: 'conv-1',
    subject: 'RE: New message from your Liivv pharmacy team (ref. LV-7Q4K2M)',
    from: CUSTOMER,
    to: [MAILBOX],
    cc: [],
    bcc: [],
    headers: [AUTH_PASS],
    isDraft: false,
    ...overrides,
  };
}

const THREAD: ThreadCandidate = {
  threadId: 'thread-1',
  profileId: 'profile-1',
  threadMailbox: MAILBOX,
  checkedEmail: CUSTOMER,
};

describe('correlation keys and their order', () => {
  it('parses In-Reply-To and References', () => {
    expect(parseMessageIdList('<a@x> <b@y>\r\n <c@z>')).toEqual(['<a@x>', '<b@y>', '<c@z>']);
    expect(
      referencedMessageIds([
        { name: 'in-reply-to', value: '<sent-1@liivv>' },
        { name: 'References', value: '<root@liivv> <sent-1@liivv>' },
      ]),
    ).toEqual(['<sent-1@liivv>', '<root@liivv>']);
  });

  it('reads every key from a message', () => {
    expect(
      correlationKeys(
        mail({
          to: ['pharmacy-on+lv-abcdef@example.ca'],
          headers: [{ name: 'In-Reply-To', value: '<sent-1@liivv>' }],
        }),
      ),
    ).toEqual({
      conversationId: 'conv-1',
      referencedIds: ['<sent-1@liivv>'],
      plusRef: 'LV-ABCDEF',
      subjectRef: 'LV-7Q4K2M',
    });
  });

  it('takes conversation first, then references, then the plus token, then the subject', () => {
    const a = { ...THREAD, threadId: 'a' };
    const b = { ...THREAD, threadId: 'b' };
    const c = { ...THREAD, threadId: 'c' };
    const d = { ...THREAD, threadId: 'd' };

    expect(
      firstCandidate({ byConversation: a, byReferences: b, byPlusToken: c, bySubjectRef: d })
        ?.threadId,
    ).toBe('a');
    expect(firstCandidate({ byReferences: b, byPlusToken: c, bySubjectRef: d })?.threadId).toBe(
      'b',
    );
    expect(firstCandidate({ byPlusToken: c, bySubjectRef: d })?.threadId).toBe('c');
    expect(firstCandidate({ bySubjectRef: d })?.threadId).toBe('d');
    expect(firstCandidate({})).toBeNull();
  });
});

describe('decideInboundMatch', () => {
  it('attaches a reply from the checked address in the thread mailbox', () => {
    expect(
      decideInboundMatch({
        message: mail(),
        candidate: THREAD,
        senderProfileIds: ['profile-1'],
        ownMailboxes: OWN,
      }),
    ).toEqual({ action: 'attach', threadId: 'thread-1', profileId: 'profile-1' });
  });

  it('never attaches another sender, such as a family member', () => {
    expect(
      decideInboundMatch({
        message: mail({ from: 'partner@example.com' }),
        candidate: THREAD,
        senderProfileIds: [],
        ownMailboxes: OWN,
      }),
    ).toEqual({
      action: 'unmatched',
      reason: 'sender_mismatch',
      suggestedProfileId: 'profile-1',
      suggestedThreadId: 'thread-1',
    });
  });

  it('does not attach when the customer has no checked address', () => {
    expect(
      decideInboundMatch({
        message: mail(),
        candidate: { ...THREAD, checkedEmail: null },
        senderProfileIds: [],
        ownMailboxes: OWN,
      }),
    ).toMatchObject({ action: 'unmatched', reason: 'sender_mismatch' });
  });

  it('does not attach a reply that reached another province mailbox', () => {
    expect(
      decideInboundMatch({
        message: mail({ mailboxAddress: 'pharmacy-bc@example.ca' }),
        candidate: THREAD,
        senderProfileIds: ['profile-1'],
        ownMailboxes: OWN,
      }),
    ).toMatchObject({ action: 'unmatched', reason: 'ambiguous' });
  });

  it('sends a DMARC or composite-auth failure to Email to match', () => {
    [
      'mx.example; dmarc=fail action=none header.from=example.com',
      'spf=pass; compauth=fail reason=000',
    ].forEach((value) => {
      expect(
        decideInboundMatch({
          message: mail({ headers: [{ name: 'Authentication-Results', value }] }),
          candidate: THREAD,
          senderProfileIds: ['profile-1'],
          ownMailboxes: OWN,
        }),
      ).toMatchObject({ action: 'unmatched', reason: 'auth_failed' });
    });
  });

  it('fails closed: a reply with no positive authentication result is never attached', () => {
    [
      [],
      [
        {
          name: 'Authentication-Results',
          value: 'spf=none; dkim=none; dmarc=none action=none; compauth=none reason=905',
        },
      ],
      [{ name: 'Authentication-Results', value: 'spf=temperror; dmarc=temperror' }],
    ].forEach((headers) => {
      expect(
        decideInboundMatch({
          message: mail({ headers }),
          candidate: THREAD,
          senderProfileIds: ['profile-1'],
          ownMailboxes: OWN,
        }),
      ).toMatchObject({ action: 'unmatched', reason: 'auth_failed' });
    });
  });
});

describe('authenticationPassed (topmost Authentication-Results only)', () => {
  const header = (value: string) => ({ name: 'Authentication-Results', value });

  it('passes on dmarc=pass or compauth=pass', () => {
    expect(authenticationPassed([AUTH_PASS], CUSTOMER)).toBe(true);
    expect(
      authenticationPassed(
        [header('spf=none; dmarc=none action=none; compauth=pass reason=109')],
        CUSTOMER,
      ),
    ).toBe(true);
  });

  it('passes compauth=softpass only with SPF or DKIM aligned to the From domain', () => {
    expect(
      authenticationPassed(
        [
          header(
            'spf=fail smtp.mailfrom=bulk.net; dkim=pass header.d=mail.example.com; dmarc=none; compauth=softpass reason=201',
          ),
        ],
        CUSTOMER,
      ),
    ).toBe(true);
    expect(
      authenticationPassed(
        [
          header(
            'spf=pass smtp.mailfrom=bulk.net; dkim=pass header.d=other.org; dmarc=none; compauth=softpass reason=201',
          ),
        ],
        CUSTOMER,
      ),
    ).toBe(false);
  });

  it('ignores a forged pass written by the sender below the header Exchange stamped', () => {
    expect(
      authenticationPassed(
        [
          header('spf=fail; dmarc=fail action=quarantine; compauth=fail reason=000'),
          header('dmarc=pass; compauth=pass'),
        ],
        CUSTOMER,
      ),
    ).toBe(false);
    expect(
      authenticationPassed(
        [header('dmarc=none; compauth=none reason=905'), header('dmarc=pass')],
        CUSTOMER,
      ),
    ).toBe(false);
  });

  it('never passes a dmarc fail, even with compauth=pass', () => {
    expect(authenticationPassed([header('dmarc=fail; compauth=pass reason=130')], CUSTOMER)).toBe(
      false,
    );
  });
});

describe('our own sends', () => {
  it('recognises any x-liivv header, and the code email', () => {
    expect(isLiivvSend([{ name: 'X-Liivv-Ref', value: 'LV-7Q4K2M' }])).toBe(true);
    expect(isLiivvSend([{ name: 'x-liivv-kind', value: 'code' }])).toBe(true);
    expect(isLiivvSend([AUTH_PASS])).toBe(false);
    expect(isCodeEmail([{ name: 'X-Liivv-Kind', value: 'code' }])).toBe(true);
    expect(isCodeEmail([{ name: 'x-liivv-ref', value: 'LV-7Q4K2M' }])).toBe(false);
  });

  it('suggests the one customer whose consented address sent unthreaded mail', () => {
    expect(
      decideInboundMatch({
        message: mail({ conversationId: 'other', subject: 'Question' }),
        candidate: null,
        senderProfileIds: ['profile-9'],
        ownMailboxes: OWN,
      }),
    ).toEqual({
      action: 'unmatched',
      reason: 'no_thread',
      suggestedProfileId: 'profile-9',
      suggestedThreadId: null,
    });
  });

  it('calls it ambiguous when several profiles share the address', () => {
    expect(
      decideInboundMatch({
        message: mail({ subject: 'Question' }),
        candidate: null,
        senderProfileIds: ['p1', 'p2'],
        ownMailboxes: OWN,
      }),
    ).toMatchObject({ action: 'unmatched', reason: 'ambiguous', suggestedProfileId: null });
  });

  it('ignores unrelated mail, our own mailboxes and drafts', () => {
    expect(
      decideInboundMatch({
        message: mail({ from: 'vendor@supplier.ca' }),
        candidate: null,
        senderProfileIds: [],
        ownMailboxes: OWN,
      }),
    ).toEqual({ action: 'ignore' });
    expect(
      decideInboundMatch({
        message: mail({ from: 'pharmacy-bc@example.ca' }),
        candidate: THREAD,
        senderProfileIds: [],
        ownMailboxes: OWN,
      }),
    ).toEqual({ action: 'ignore' });
    expect(
      decideInboundMatch({
        message: mail({ isDraft: true }),
        candidate: THREAD,
        senderProfileIds: ['profile-1'],
        ownMailboxes: OWN,
      }),
    ).toEqual({ action: 'ignore' });
  });
});

describe('cheap pre-filter', () => {
  const base = {
    folder: 'inbox' as const,
    conversationId: 'unknown',
    subject: 'Invoice from a supplier',
    from: 'vendor@supplier.ca',
    to: [MAILBOX],
    knownConversationIds: new Set(['conv-1']),
    consentedAddresses: new Set([CUSTOMER]),
  };

  it('skips unrelated mail, so its body is never read', () => {
    expect(isWorthFetching(base)).toBe(false);
  });

  it('fetches a known conversation, a reference, a plus token, a consented sender or a bounce', () => {
    expect(isWorthFetching({ ...base, conversationId: 'conv-1' })).toBe(true);
    expect(isWorthFetching({ ...base, subject: 'RE: (ref. LV-7Q4K2M)' })).toBe(true);
    expect(isWorthFetching({ ...base, to: ['pharmacy-on+lv-7q4k2m@example.ca'] })).toBe(true);
    expect(isWorthFetching({ ...base, from: 'Jane@Example.com' })).toBe(true);
    expect(isWorthFetching({ ...base, from: 'postmaster@example.ca' })).toBe(true);
  });

  it('in Sent Items, looks at recipients instead of the sender', () => {
    expect(isWorthFetching({ ...base, folder: 'sentitems', from: MAILBOX, to: [CUSTOMER] })).toBe(
      true,
    );
    expect(
      isWorthFetching({ ...base, folder: 'sentitems', from: MAILBOX, to: ['vendor@supplier.ca'] }),
    ).toBe(false);
  });
});

describe('bounces and automatic replies', () => {
  it('spots a non-delivery report', () => {
    expect(
      isNonDeliveryReport({
        headers: [
          {
            name: 'Content-Type',
            value: 'multipart/report; report-type=delivery-status; boundary=x',
          },
        ],
        subject: 'whatever',
        from: 'x@y.z',
      }),
    ).toBe(true);
    expect(
      isNonDeliveryReport({
        headers: [{ name: 'X-MS-Exchange-Message-Is-Ndr', value: '' }],
        subject: '',
        from: null,
      }),
    ).toBe(true);
    expect(
      isNonDeliveryReport({
        headers: [],
        subject: 'Undeliverable: New message (ref. LV-7Q4K2M)',
        from: 'postmaster@example.ca',
      }),
    ).toBe(true);
    expect(isNonDeliveryReport({ headers: [], subject: 'Undeliverable: hi', from: CUSTOMER })).toBe(
      false,
    );
    expect(
      bouncedRecipient([{ name: 'X-Failed-Recipients', value: 'Jane@Example.com, b@c.d' }]),
    ).toBe(CUSTOMER);
  });

  it('spots an automatic reply', () => {
    expect(
      isAutoReply({ headers: [{ name: 'Auto-Submitted', value: 'auto-replied' }], subject: '' }),
    ).toBe(true);
    expect(
      isAutoReply({ headers: [{ name: 'Auto-Submitted', value: 'no' }], subject: 'Thanks' }),
    ).toBe(false);
    expect(isAutoReply({ headers: [{ name: 'X-Autoreply', value: 'yes' }], subject: '' })).toBe(
      true,
    );
    expect(
      isAutoReply({ headers: [{ name: 'Precedence', value: 'auto_reply' }], subject: '' }),
    ).toBe(true);
    expect(isAutoReply({ headers: [], subject: 'Automatic reply: New message' })).toBe(true);
    expect(isAutoReply({ headers: [], subject: 'Out of Office: away' })).toBe(true);
    expect(isAutoReply({ headers: [], subject: 'RE: New message' })).toBe(false);
  });
});

describe('pharmacist replies sent straight from Outlook', () => {
  it('only confirms our own sends', () => {
    expect(
      decideSentItem({
        message: mail({ folder: 'sentitems' }),
        ownSend: true,
        candidate: THREAD,
        candidateContactMode: 'notice_only',
        recipientProfileIds: [],
      }),
    ).toEqual({ action: 'confirm_own' });
  });

  it('adds an Outlook reply to the thread with the privacy flags', () => {
    expect(
      decideSentItem({
        message: mail({
          folder: 'sentitems',
          from: MAILBOX,
          to: [CUSTOMER, 'other@example.com'],
          cc: ['x@y.z'],
        }),
        ownSend: false,
        candidate: THREAD,
        candidateContactMode: 'notice_only',
        recipientProfileIds: [],
      }),
    ).toEqual({
      action: 'attach_outlook',
      threadId: 'thread-1',
      profileId: 'profile-1',
      flags: ['outlook_unverified_recipient', 'outlook_extra_recipients', 'outlook_mode_conflict'],
      visibleToCustomer: false,
    });
  });

  it('shows an Outlook email to the customer only when it went to their checked address alone', () => {
    expect(
      decideSentItem({
        message: mail({ folder: 'sentitems', from: MAILBOX, to: [CUSTOMER] }),
        ownSend: false,
        candidate: THREAD,
        candidateContactMode: 'message_by_email',
        recipientProfileIds: ['profile-1'],
      }),
    ).toEqual({
      action: 'attach_outlook',
      threadId: 'thread-1',
      profileId: 'profile-1',
      flags: [],
      visibleToCustomer: true,
    });

    const recipients = { to: [CUSTOMER], cc: [], bcc: [], checkedEmail: CUSTOMER };

    // A forward to the prescriber that kept the thread's subject or conversation.
    expect(outlookVisibleToCustomer({ ...recipients, to: ['clinic@example.org'] })).toBe(false);
    expect(outlookVisibleToCustomer({ ...recipients, cc: ['colleague@example.ca'] })).toBe(false);
    expect(outlookVisibleToCustomer({ ...recipients, bcc: ['other@example.com'] })).toBe(false);
    expect(outlookVisibleToCustomer({ ...recipients, checkedEmail: null })).toBe(false);
    expect(outlookVisibleToCustomer(recipients)).toBe(true);
  });

  it('raises no flag for a clean reply to a message-by-email customer', () => {
    expect(
      outlookFlags({
        to: [CUSTOMER],
        cc: [],
        bcc: [],
        checkedEmail: CUSTOMER,
        contactMode: 'message_by_email',
      }),
    ).toEqual([]);
    expect(
      outlookFlags({
        to: [CUSTOMER],
        cc: [],
        bcc: [],
        checkedEmail: null,
        contactMode: 'not_chosen',
      }),
    ).toEqual(['outlook_unverified_recipient', 'outlook_mode_conflict']);
  });

  it('queues an Outlook message to a consented customer with no thread', () => {
    expect(
      decideSentItem({
        message: mail({ folder: 'sentitems', subject: 'Hello', to: [CUSTOMER] }),
        ownSend: false,
        candidate: null,
        candidateContactMode: 'not_chosen',
        recipientProfileIds: ['profile-1'],
      }),
    ).toEqual({
      action: 'unmatched',
      reason: 'outlook_no_thread',
      suggestedProfileId: 'profile-1',
    });
    expect(
      decideSentItem({
        message: mail({ folder: 'sentitems', to: ['vendor@x.ca'] }),
        ownSend: false,
        candidate: null,
        candidateContactMode: 'not_chosen',
        recipientProfileIds: [],
      }),
    ).toEqual({ action: 'ignore' });
  });
});
