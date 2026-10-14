import { describe, expect, it } from 'vitest';

import {
  appOriginOf,
  describeMailConfig,
  emailConsentApproved,
  enabledEmailRegions,
  type MailEnv,
  mailtoReasonText,
  messageModeOffered,
  outlookMailboxOf,
  resolvePharmacyEmailRoute,
  webhookHandshakeAllowed,
  webhooksEnabled,
} from './config-rules';

const TENANT = '11111111-2222-3333-4444-555555555555';
const CLIENT = '66666666-7777-8888-9999-000000000000';
const ON_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

/* A complete production setup with the OIDC credential. */
const READY: MailEnv = {
  LIIVV_PHARMACY_EMAIL_ENABLED: 'true',
  LIIVV_PHARMACY_EMAIL_PROVINCES: 'ON,BC,SK,MB,NB,NS,PE,NL',
  LIIVV_GRAPH_TENANT_ID: TENANT,
  LIIVV_GRAPH_CLIENT_ID: CLIENT,
  LIIVV_GRAPH_AUTH: 'oidc',
  VERCEL_ENV: 'production',
  NEXT_PUBLIC_APP_URL: 'https://shop.example.ca/',
  LIIVV_PHARMACY_MAILBOX_ON: 'Pharmacy-ON@example.ca',
  LIIVV_PHARMACY_MAILBOX_ON_ID: ON_ID,
  LIIVV_PHARMACY_MAILBOX_BC: 'pharmacy-bc@example.ca',
  LIIVV_PHARMACY_MAILBOX_AB: 'pharmacy-ab@example.ca',
};

function env(overrides: Record<string, string | undefined>): MailEnv {
  return { ...READY, ...overrides };
}

describe('resolvePharmacyEmailRoute: the feature flag and its fallback reasons', () => {
  it('routes through Graph from the province mailbox when everything is set', () => {
    const route = resolvePharmacyEmailRoute(READY, 'ON');

    expect(route).toEqual({
      kind: 'graph',
      region: 'ON',
      authMode: 'oidc',
      mailbox: { region: 'ON', address: 'pharmacy-on@example.ca', objectId: ON_ID },
    });
  });

  it('sends Quebec and the territories through the Ontario mailbox', () => {
    ['QC', 'Québec', 'YT', 'NT', 'NU', null].forEach((code) => {
      const route = resolvePharmacyEmailRoute(READY, code);

      expect(route.kind).toBe('graph');
      expect(route.region).toBe('ON');
    });
  });

  it('is disabled unless LIIVV_PHARMACY_EMAIL_ENABLED is exactly true', () => {
    [undefined, '', 'TRUE', '1', 'yes', 'false'].forEach((value) => {
      expect(resolvePharmacyEmailRoute(env({ LIIVV_PHARMACY_EMAIL_ENABLED: value }), 'ON')).toEqual(
        {
          kind: 'mailto',
          region: 'ON',
          reason: 'disabled',
          detail: undefined,
        },
      );
    });
  });

  it('never sends from a preview deployment', () => {
    expect(resolvePharmacyEmailRoute(env({ VERCEL_ENV: 'preview' }), 'ON')).toMatchObject({
      kind: 'mailto',
      reason: 'non_production',
    });
  });

  it('allows local development only with a dev secret or certificate, not OIDC', () => {
    expect(resolvePharmacyEmailRoute(env({ VERCEL_ENV: undefined }), 'ON')).toMatchObject({
      reason: 'non_production',
    });

    const local = env({
      VERCEL_ENV: undefined,
      LIIVV_GRAPH_AUTH: 'secret',
      LIIVV_GRAPH_CLIENT_SECRET: 'dev-only',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    });

    expect(resolvePharmacyEmailRoute(local, 'ON')).toMatchObject({
      kind: 'graph',
      authMode: 'secret',
    });
  });

  it('refuses a client secret in production', () => {
    expect(
      resolvePharmacyEmailRoute(
        env({ LIIVV_GRAPH_AUTH: 'secret', LIIVV_GRAPH_CLIENT_SECRET: 'x' }),
        'ON',
      ),
    ).toMatchObject({ reason: 'not_configured', detail: 'secret_in_production' });
  });

  it('names each missing Microsoft setting as not configured', () => {
    expect(resolvePharmacyEmailRoute(env({ LIIVV_GRAPH_AUTH: undefined }), 'ON')).toMatchObject({
      reason: 'not_configured',
      detail: 'auth_mode',
    });
    expect(
      resolvePharmacyEmailRoute(env({ LIIVV_GRAPH_TENANT_ID: 'contoso' }), 'ON'),
    ).toMatchObject({
      reason: 'not_configured',
      detail: 'tenant',
    });
    expect(resolvePharmacyEmailRoute(env({ LIIVV_GRAPH_CLIENT_ID: '' }), 'ON')).toMatchObject({
      reason: 'not_configured',
      detail: 'client',
    });
    expect(resolvePharmacyEmailRoute(env({ LIIVV_GRAPH_AUTH: 'certificate' }), 'ON')).toMatchObject(
      { reason: 'not_configured', detail: 'credential' },
    );
    expect(
      resolvePharmacyEmailRoute(
        env({
          LIIVV_GRAPH_AUTH: 'certificate',
          LIIVV_GRAPH_CERT_PRIVATE_KEY_B64: 'a2V5',
          LIIVV_GRAPH_CERT_THUMBPRINT_SHA256: `${'AB:'.repeat(31)}AB`,
        }),
        'ON',
      ),
    ).toMatchObject({ kind: 'graph', authMode: 'certificate' });
  });

  it('needs the https app URL in production', () => {
    expect(resolvePharmacyEmailRoute(env({ NEXT_PUBLIC_APP_URL: undefined }), 'ON')).toMatchObject({
      reason: 'not_configured',
      detail: 'app_url',
    });
    expect(
      resolvePharmacyEmailRoute(env({ NEXT_PUBLIC_APP_URL: 'http://shop.example.ca' }), 'ON'),
    ).toMatchObject({ reason: 'not_configured', detail: 'app_url' });
    expect(
      resolvePharmacyEmailRoute(env({ NEXT_PUBLIC_APP_URL: 'not a url' }), 'ON'),
    ).toMatchObject({
      detail: 'app_url',
    });
    expect(appOriginOf(READY)).toBe('https://shop.example.ca');
  });

  it('keeps Alberta on the fallback until it is listed (its PIA, D9)', () => {
    expect(resolvePharmacyEmailRoute(READY, 'AB')).toEqual({
      kind: 'mailto',
      region: 'AB',
      reason: 'province_not_enabled',
    });
    expect(
      resolvePharmacyEmailRoute(env({ LIIVV_PHARMACY_EMAIL_PROVINCES: 'on, ab' }), 'Alberta'),
    ).toMatchObject({ kind: 'graph', region: 'AB' });
  });

  it('falls back when the province mailbox is missing or malformed', () => {
    expect(resolvePharmacyEmailRoute(READY, 'SK')).toMatchObject({ reason: 'mailbox_not_set' });
    expect(
      resolvePharmacyEmailRoute(env({ LIIVV_PHARMACY_MAILBOX_BC: 'pharmacy bc' }), 'BC'),
    ).toMatchObject({ reason: 'mailbox_not_set' });
  });

  it('ignores unknown codes in the provinces list', () => {
    expect(enabledEmailRegions(env({ LIIVV_PHARMACY_EMAIL_PROVINCES: 'QC,ON,zz, bc' }))).toEqual([
      'ON',
      'BC',
    ]);
  });

  it('explains each fallback in plain words', () => {
    expect(mailtoReasonText(resolvePharmacyEmailRoute(READY, 'AB'))).toBe(
      'Email isn’t switched on for the Alberta pharmacy yet.',
    );
    expect(mailtoReasonText(resolvePharmacyEmailRoute(READY, 'ON'))).toBe('');
  });
});

describe('webhooks and the status summary', () => {
  it('turns webhooks on in production only, when asked', () => {
    expect(webhooksEnabled(READY)).toBe(false);
    expect(webhooksEnabled(env({ LIIVV_PHARMACY_EMAIL_WEBHOOKS: 'true' }))).toBe(true);
    expect(
      webhooksEnabled(env({ LIIVV_PHARMACY_EMAIL_WEBHOOKS: 'true', VERCEL_ENV: 'preview' })),
    ).toBe(false);
  });

  it('answers the handshake in production only with webhooks on, and always outside production', () => {
    expect(webhookHandshakeAllowed(READY)).toBe(false);
    expect(webhookHandshakeAllowed(env({ LIIVV_PHARMACY_EMAIL_WEBHOOKS: 'true' }))).toBe(true);
    expect(webhookHandshakeAllowed(env({ VERCEL_ENV: undefined }))).toBe(true);
  });

  it('reports presence only, never a secret', () => {
    const summary = describeMailConfig(
      env({ LIIVV_GRAPH_AUTH: 'secret', LIIVV_GRAPH_CLIENT_SECRET: 'super-secret-value' }),
    );

    expect(JSON.stringify(summary)).not.toContain('super-secret-value');
    expect(summary.credentialSet).toBe(false);
    expect(summary.regions.find((row) => row.region === 'ON')?.objectIdSet).toBe(true);
  });
});

describe('the consent approval switch (D8) and the Outlook mailbox', () => {
  it('offers no email, and no message mode, until the consent wording is approved', () => {
    expect(emailConsentApproved(READY)).toBe(false);
    expect(messageModeOffered(env({ LIIVV_PHARMACY_EMAIL_MESSAGE_MODE: 'true' }))).toBe(false);
    expect(emailConsentApproved(env({ LIIVV_PHARMACY_EMAIL_CONSENT_APPROVED: 'true' }))).toBe(true);
    expect(
      messageModeOffered(
        env({
          LIIVV_PHARMACY_EMAIL_CONSENT_APPROVED: 'true',
          LIIVV_PHARMACY_EMAIL_MESSAGE_MODE: 'true',
        }),
      ),
    ).toBe(true);
    expect(describeMailConfig(READY).consentApproved).toBe(false);
  });

  it('names the province mailbox an Outlook draft must come from, even with Graph off', () => {
    const graphOff = env({ LIIVV_PHARMACY_EMAIL_ENABLED: undefined });

    expect(outlookMailboxOf(graphOff, 'ON')).toBe('pharmacy-on@example.ca');
    // Quebec is served by the Ontario pharmacy.
    expect(outlookMailboxOf(graphOff, 'QC')).toBe('pharmacy-on@example.ca');
    expect(outlookMailboxOf(graphOff, 'NS')).toBeNull();
  });
});
