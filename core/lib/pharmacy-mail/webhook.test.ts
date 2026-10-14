import { describe, expect, it } from 'vitest';

import {
  bearerMatches,
  checkNotification,
  clientStateMatches,
  handshakeResponse,
  type KnownSubscription,
  type NotificationItem,
  parseMessageResource,
  parseNotificationBody,
  sha256Hex,
  validationTokenFrom,
} from './webhook';

const BASE = 'https://shop.example.ca/api/pharmacy-mail/notifications';

describe('validation handshake', () => {
  it('reads and URL-decodes the token', () => {
    expect(
      validationTokenFrom(`${BASE}?validationToken=Validation%3A%20Testing%20client%20application`),
    ).toBe('Validation: Testing client application');
  });

  it('refuses a missing, empty, too long or control-character token', () => {
    expect(validationTokenFrom(BASE)).toBeNull();
    expect(validationTokenFrom(`${BASE}?validationToken=`)).toBeNull();
    expect(validationTokenFrom(`${BASE}?validationToken=${'a'.repeat(1024)}`)).toBeNull();
    expect(validationTokenFrom(`${BASE}?validationToken=${'a'.repeat(1023)}`)).toHaveLength(1023);
    expect(validationTokenFrom(`${BASE}?validationToken=a%0Db`)).toBeNull();
    expect(validationTokenFrom('not a url')).toBeNull();
  });

  it('echoes the token as text/plain with 200, never sniffed', async () => {
    const response = handshakeResponse('<b>token</b>');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await response.text()).toBe('<b>token</b>');
  });
});

describe('clientState and the cron bearer', () => {
  const clientState = 'a'.repeat(64);

  it('matches the stored sha256 hash only', () => {
    expect(clientStateMatches(clientState, sha256Hex(clientState))).toBe(true);
    expect(clientStateMatches(clientState, sha256Hex(clientState).toUpperCase())).toBe(true);
    expect(clientStateMatches('b'.repeat(64), sha256Hex(clientState))).toBe(false);
    expect(clientStateMatches(null, sha256Hex(clientState))).toBe(false);
    expect(clientStateMatches(clientState, null)).toBe(false);
    expect(clientStateMatches(clientState, 'short')).toBe(false);
  });

  it('checks the cron bearer exactly, and refuses when no secret is set', () => {
    expect(bearerMatches('Bearer s3cret', 's3cret')).toBe(true);
    expect(bearerMatches('Bearer s3cret ', 's3cret')).toBe(false);
    expect(bearerMatches('bearer s3cret', 's3cret')).toBe(false);
    expect(bearerMatches(null, 's3cret')).toBe(false);
    expect(bearerMatches('Bearer ', '')).toBe(false);
    expect(bearerMatches('Bearer undefined', undefined)).toBe(false);
  });
});

describe('notifications', () => {
  const MAILBOX_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const TENANT = '11111111-2222-3333-4444-555555555555';
  const SECRET = 'f'.repeat(64);
  const subscription: KnownSubscription = {
    subscriptionId: 'sub-1',
    clientStateHash: sha256Hex(SECRET),
    region: 'ON',
    folder: 'inbox',
    mailboxObjectId: MAILBOX_ID,
  };
  const context = { subscriptions: new Map([['sub-1', subscription]]), tenantId: TENANT };
  const item = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
    subscriptionId: 'sub-1',
    clientState: SECRET,
    changeType: 'created',
    resource: `Users/${MAILBOX_ID}/Messages/AAMkAGI2THVSAAA=`,
    tenantId: TENANT,
    ...overrides,
  });

  it('parses a batch and refuses anything else', () => {
    expect(parseNotificationBody(JSON.stringify({ value: [item()] }))).toHaveLength(1);
    expect(parseNotificationBody('not json')).toBeNull();
    expect(parseNotificationBody(JSON.stringify({ value: [{ nope: 1 }] }))).toBeNull();
    expect(parseNotificationBody(JSON.stringify({}))).toBeNull();
  });

  it('accepts a genuine notification and gives only the message id', () => {
    expect(checkNotification(item(), context)).toEqual({
      ok: true,
      subscription,
      messageId: 'AAMkAGI2THVSAAA=',
      lifecycleEvent: null,
    });
  });

  it('drops a wrong clientState, tenant, subscription or mailbox', () => {
    expect(checkNotification(item({ clientState: 'forged' }), context)).toEqual({
      ok: false,
      reason: 'client_state',
    });
    expect(checkNotification(item({ clientState: undefined }), context)).toEqual({
      ok: false,
      reason: 'client_state',
    });
    expect(checkNotification(item({ tenantId: 'other' }), context)).toEqual({
      ok: false,
      reason: 'tenant',
    });
    expect(checkNotification(item({ subscriptionId: 'sub-2' }), context)).toEqual({
      ok: false,
      reason: 'unknown_subscription',
    });
    expect(checkNotification(item({ resource: 'Users/someone-else/Messages/x' }), context)).toEqual(
      {
        ok: false,
        reason: 'resource',
      },
    );
    expect(checkNotification(item(), { ...context, tenantId: null })).toEqual({
      ok: false,
      reason: 'tenant',
    });
  });

  it('passes lifecycle events through after the same checks', () => {
    expect(
      checkNotification(
        item({ lifecycleEvent: 'reauthorizationRequired', resource: null }),
        context,
      ),
    ).toMatchObject({
      ok: true,
      lifecycleEvent: 'reauthorizationRequired',
      messageId: null,
    });
    expect(
      checkNotification(item({ lifecycleEvent: 'missed', clientState: 'forged' }), context),
    ).toEqual({ ok: false, reason: 'client_state' });
  });

  it('reads both resource shapes', () => {
    expect(
      parseMessageResource(`/users/${MAILBOX_ID.toUpperCase()}/mailFolders/inbox/messages/abc`),
    ).toEqual({
      mailboxId: MAILBOX_ID,
      messageId: 'abc',
    });
    expect(parseMessageResource(`Users('${MAILBOX_ID}')/Messages('abc%3D')`)).toEqual({
      mailboxId: MAILBOX_ID,
      messageId: 'abc=',
    });
    expect(parseMessageResource('Users/x/Events/y')).toBeNull();
    expect(parseMessageResource(null)).toBeNull();
  });
});
