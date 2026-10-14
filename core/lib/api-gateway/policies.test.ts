import { describe, expect, it } from 'vitest';

import { matchApiGatewayRule } from './policies';

/*
 * Every /api path needs a rule, or the gateway answers 404 before the route
 * runs. Owner decision Q10 (2026-10-14) adds the Graph notification routes and
 * the pharmacy mail sync cron.
 */
describe('matchApiGatewayRule: pharmacy mail routes', () => {
  it.each([
    '/api/pharmacy-mail/notifications',
    '/api/pharmacy-mail/lifecycle',
    '/api/pharmacy-mail/lifecycle/',
  ])('sends %s to the Graph webhook policy, GET and POST only', (path) => {
    expect(matchApiGatewayRule(path, 'POST')).toEqual({
      policy: 'webhook-graph',
      methodAllowed: true,
    });
    expect(matchApiGatewayRule(path, 'get')).toEqual({
      policy: 'webhook-graph',
      methodAllowed: true,
    });
    expect(matchApiGatewayRule(path, 'DELETE')).toEqual({
      policy: 'webhook-graph',
      methodAllowed: false,
    });
  });

  it('does not open any other pharmacy-mail path', () => {
    expect(matchApiGatewayRule('/api/pharmacy-mail/other', 'POST')).toBeNull();
    expect(matchApiGatewayRule('/api/pharmacy-mail', 'POST')).toBeNull();
  });

  it('sends the cron to the cron policy, GET only', () => {
    expect(matchApiGatewayRule('/api/cron/pharmacy-mail-sync', 'GET')).toEqual({
      policy: 'cron',
      methodAllowed: true,
    });
    expect(matchApiGatewayRule('/api/cron/pharmacy-mail-sync', 'POST')).toEqual({
      policy: 'cron',
      methodAllowed: false,
    });
  });

  it('leaves the existing rules as they were', () => {
    expect(matchApiGatewayRule('/api/stripe/webhook', 'POST')?.policy).toBe('webhook-stripe');
    expect(matchApiGatewayRule('/api/bigcommerce/webhook', 'POST')?.policy).toBe(
      'webhook-bigcommerce',
    );
    expect(matchApiGatewayRule('/api/live-chat/unread-count', 'GET')?.policy).toBe(
      'customer-optional',
    );
    expect(matchApiGatewayRule('/api/account/notifications/mark-read', 'POST')?.policy).toBe(
      'customer-session',
    );
    expect(matchApiGatewayRule('/api/makeswift/manifest', 'GET')?.policy).toBe('makeswift');
    expect(matchApiGatewayRule('/api/products/123', 'GET')?.policy).toBe('storefront-public');
    expect(matchApiGatewayRule('/api/unknown', 'GET')).toBeNull();
  });
});
