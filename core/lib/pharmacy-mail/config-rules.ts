/*
 * =============================================================================
 * PHARMACY EMAIL: FEATURE FLAG AND AUTOMATIC FALLBACK (pure rules)
 * =============================================================================
 * Owner decision Q10, 2026-10-14. One decision is used everywhere: for a
 * thread's province, does Liivv send through Microsoft Graph from that
 * province's pharmacy mailbox, or does the pharmacist fall back to an
 * Outlook draft ("Email customer (Outlook)", a mailto: link)? The checks run
 * in order and the first that fails names the fallback reason. A missing or
 * malformed setting always means the fallback: nothing here throws.
 *
 *   1. LIIVV_PHARMACY_EMAIL_ENABLED !== 'true'                    → disabled
 *   2. VERCEL_ENV 'preview', or local development with the OIDC
 *      credential (it only trusts production)                    → non_production
 *   3. tenant, client id or the auth mode's credential missing,
 *      or a client secret in production                           → not_configured
 *   4. NEXT_PUBLIC_APP_URL not a URL (or not https in production)  → not_configured
 *   5. the region not in LIIVV_PHARMACY_EMAIL_PROVINCES (Alberta
 *      stays out until its PIA covers this system)                → province_not_enabled
 *   6. LIIVV_PHARMACY_MAILBOX_<REGION> missing or not an address   → mailbox_not_set
 *
 * Pure: it reads an env-like object passed in, so the unit tests can drive
 * every reason. ./config.ts is the server-only wrapper over process.env.
 * =============================================================================
 */

import {
  isPharmacyRegion,
  mailboxEnvName,
  mailboxObjectIdEnvName,
  PHARMACY_REGIONS,
  type PharmacyRegion,
  pharmacyRegionName,
  pharmacyRegionOf,
} from './regions';

export type MailEnv = Readonly<Record<string, string | undefined>>;

export type GraphAuthMode = 'oidc' | 'certificate' | 'secret';

export type MailtoReason =
  | 'disabled'
  | 'non_production'
  | 'not_configured'
  | 'province_not_enabled'
  | 'mailbox_not_set';

export type NotConfiguredDetail =
  | 'auth_mode'
  | 'tenant'
  | 'client'
  | 'credential'
  | 'secret_in_production'
  | 'app_url';

export interface PharmacyMailbox {
  region: PharmacyRegion;
  /** The SMTP address, lower-cased. */
  address: string;
  /** The Entra object id, when set (recommended; required for webhooks). */
  objectId: string | null;
}

export type PharmacyEmailRoute =
  | { kind: 'graph'; region: PharmacyRegion; mailbox: PharmacyMailbox; authMode: GraphAuthMode }
  | {
      kind: 'mailto';
      region: PharmacyRegion;
      reason: MailtoReason;
      detail?: NotConfiguredDetail;
    };

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function setting(env: MailEnv, name: string): string {
  return String(env[name] ?? '').trim();
}

/* A strictly-shaped email address, lower-cased, or null. */
export function normalizeEmailAddress(value: string | null | undefined): string | null {
  const address = String(value ?? '')
    .trim()
    .toLowerCase();

  return address.length <= 254 && EMAIL_RE.test(address) ? address : null;
}

export function graphAuthModeOf(env: MailEnv): GraphAuthMode | null {
  const mode = setting(env, 'LIIVV_GRAPH_AUTH').toLowerCase();

  return mode === 'oidc' || mode === 'certificate' || mode === 'secret' ? mode : null;
}

/* 'production', 'preview', or 'local' (VERCEL_ENV unset or 'development'). */
export function deploymentKind(env: MailEnv): 'production' | 'preview' | 'local' {
  const vercelEnv = setting(env, 'VERCEL_ENV');

  if (vercelEnv === 'production') {
    return 'production';
  }

  return vercelEnv === 'preview' ? 'preview' : 'local';
}

function isNonProduction(env: MailEnv, mode: GraphAuthMode | null): boolean {
  const kind = deploymentKind(env);

  // Preview never sends real pharmacy mail. Locally, only a dev app's secret
  // or certificate can sign in: the OIDC trust is production-only.
  return kind === 'preview' || (kind === 'local' && mode === 'oidc');
}

/* The first missing credential setting for the auth mode, or null when complete. */
function credentialGap(env: MailEnv, mode: GraphAuthMode | null): NotConfiguredDetail | null {
  if (!mode) {
    return 'auth_mode';
  }

  if (!GUID_RE.test(setting(env, 'LIIVV_GRAPH_TENANT_ID'))) {
    return 'tenant';
  }

  if (!GUID_RE.test(setting(env, 'LIIVV_GRAPH_CLIENT_ID'))) {
    return 'client';
  }

  if (mode === 'secret') {
    if (deploymentKind(env) === 'production') {
      return 'secret_in_production';
    }

    return setting(env, 'LIIVV_GRAPH_CLIENT_SECRET') ? null : 'credential';
  }

  if (mode === 'certificate') {
    const hasKey = setting(env, 'LIIVV_GRAPH_CERT_PRIVATE_KEY_B64').length > 0;
    const thumbprint = setting(env, 'LIIVV_GRAPH_CERT_THUMBPRINT_SHA256').replace(/:/g, '');

    return hasKey && /^[0-9a-f]{64}$/i.test(thumbprint) ? null : 'credential';
  }

  return null;
}

/*
 * The production origin every email link is built from, or null when it is
 * not usable: it must be a URL, and https in production.
 */
export function appOriginOf(env: MailEnv): string | null {
  const raw = setting(env, 'NEXT_PUBLIC_APP_URL');

  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    const httpsOnly = deploymentKind(env) === 'production';

    if (url.protocol !== 'https:' && (httpsOnly || url.protocol !== 'http:')) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

/* The regions listed in LIIVV_PHARMACY_EMAIL_PROVINCES (unknown codes ignored). */
export function enabledEmailRegions(env: MailEnv): PharmacyRegion[] {
  const listed = setting(env, 'LIIVV_PHARMACY_EMAIL_PROVINCES')
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(isPharmacyRegion);

  return PHARMACY_REGIONS.filter((region) => listed.includes(region));
}

/* The province's mailbox, when its address is set and well formed. */
export function mailboxOf(env: MailEnv, region: PharmacyRegion): PharmacyMailbox | null {
  const address = normalizeEmailAddress(setting(env, mailboxEnvName(region)));

  if (!address) {
    return null;
  }

  const objectId = setting(env, mailboxObjectIdEnvName(region));

  return { region, address, objectId: GUID_RE.test(objectId) ? objectId.toLowerCase() : null };
}

/* Every configured pharmacy mailbox address (lower-cased), for loop protection. */
export function allMailboxAddresses(env: MailEnv): string[] {
  return PHARMACY_REGIONS.flatMap((region) => {
    const mailbox = mailboxOf(env, region);

    return mailbox ? [mailbox.address] : [];
  });
}

/* Steps 1 to 4: whether Graph email is usable at all in this deployment. */
export function graphReadiness(
  env: MailEnv,
):
  | { ready: true; authMode: GraphAuthMode }
  | { ready: false; reason: MailtoReason; detail?: NotConfiguredDetail } {
  if (setting(env, 'LIIVV_PHARMACY_EMAIL_ENABLED') !== 'true') {
    return { ready: false, reason: 'disabled' };
  }

  const mode = graphAuthModeOf(env);

  if (isNonProduction(env, mode)) {
    return { ready: false, reason: 'non_production' };
  }

  const gap = credentialGap(env, mode);

  if (gap || !mode) {
    return { ready: false, reason: 'not_configured', detail: gap ?? 'auth_mode' };
  }

  if (!appOriginOf(env)) {
    return { ready: false, reason: 'not_configured', detail: 'app_url' };
  }

  return { ready: true, authMode: mode };
}

/*
 * The email route for a thread's province (or any province or territory
 * code or name, which is mapped to its pharmacy first: QC uses ON).
 */
export function resolvePharmacyEmailRoute(
  env: MailEnv,
  provinceOrRegion: string | null | undefined,
): PharmacyEmailRoute {
  const region = pharmacyRegionOf(provinceOrRegion);
  const readiness = graphReadiness(env);

  if (!readiness.ready) {
    return { kind: 'mailto', region, reason: readiness.reason, detail: readiness.detail };
  }

  if (!enabledEmailRegions(env).includes(region)) {
    return { kind: 'mailto', region, reason: 'province_not_enabled' };
  }

  const mailbox = mailboxOf(env, region);

  if (!mailbox) {
    return { kind: 'mailto', region, reason: 'mailbox_not_set' };
  }

  return { kind: 'graph', region, mailbox, authMode: readiness.authMode };
}

/*
 * Graph change notifications (phase C): production only, and only when the
 * owner turns them on. Without them the timed sync and the admin-load sync
 * carry replies in.
 */
export function webhooksEnabled(env: MailEnv): boolean {
  return (
    setting(env, 'LIIVV_PHARMACY_EMAIL_WEBHOOKS') === 'true' && deploymentKind(env) === 'production'
  );
}

/*
 * Whether the webhook routes answer Graph's validation handshake. Graph only
 * validates while a subscription is being created, which happens only with
 * webhooks on, so production answers only then. Outside production the
 * handshake is always answered, so it can be checked by hand on a dev server;
 * the echo is a capped text/plain body with no-sniff, so it can't carry markup.
 */
export function webhookHandshakeAllowed(env: MailEnv): boolean {
  return webhooksEnabled(env) || deploymentKind(env) !== 'production';
}

/*
 * The owner and the pharmacy privacy officer approved the consent wording and
 * the email policy page (D8). Until then no email of any kind goes to a
 * customer (Graph or the Outlook draft), the customer is offered no email
 * choice, and the server refuses one: privacy research R2, R9 and R10 expect
 * an approved written policy before consent is collected.
 */
export function emailConsentApproved(env: MailEnv): boolean {
  return setting(env, 'LIIVV_PHARMACY_EMAIL_CONSENT_APPROVED') === 'true';
}

/* "Email me the pharmacist's message" is offered only when the owner allows it (D3). */
export function messageModeOffered(env: MailEnv): boolean {
  return emailConsentApproved(env) && setting(env, 'LIIVV_PHARMACY_EMAIL_MESSAGE_MODE') === 'true';
}

/*
 * The province's Liivv mailbox for the Outlook-draft fallback: the address
 * the pharmacist must send from (never their own mailbox), or null when it
 * isn't set yet, in which case there is no Outlook draft at all (phone only).
 */
export function outlookMailboxOf(
  env: MailEnv,
  provinceOrRegion: string | null | undefined,
): string | null {
  return mailboxOf(env, pharmacyRegionOf(provinceOrRegion))?.address ?? null;
}

/* Reply-To <local>+lv-<ref>@<domain>, only after IT confirms plus addressing is on. */
export function plusReplyToEnabled(env: MailEnv): boolean {
  return setting(env, 'LIIVV_PHARMACY_EMAIL_PLUS_REPLY_TO') === 'true';
}

/* What the pharmacist is told when email can't go through Graph for this province. */
export function mailtoReasonText(route: PharmacyEmailRoute): string {
  if (route.kind === 'graph') {
    return '';
  }

  const province = pharmacyRegionName(route.region);

  switch (route.reason) {
    case 'disabled':
      return 'Email from the website isn’t switched on yet.';

    case 'non_production':
      return 'This isn’t the live website, so it sends no pharmacy email.';

    case 'province_not_enabled':
      return `Email isn’t switched on for the ${province} pharmacy yet.`;

    case 'mailbox_not_set':
      return `The ${province} pharmacy mailbox isn’t set up yet.`;

    default:
      return route.detail === 'app_url'
        ? 'Email is switched on, but the website address isn’t set (app URL not set).'
        : 'Email is switched on, but the Microsoft 365 connection isn’t complete. Ask IT to check the settings.';
  }
}

export interface MailConfigSummary {
  enabled: boolean;
  deployment: 'production' | 'preview' | 'local';
  authMode: GraphAuthMode | null;
  tenantSet: boolean;
  clientSet: boolean;
  credentialSet: boolean;
  appUrlOk: boolean;
  webhooks: boolean;
  plusReplyTo: boolean;
  messageMode: boolean;
  /** D8: the consent wording and email policy are approved, so email may be offered. */
  consentApproved: boolean;
  cronSecretSet: boolean;
  regions: Array<{
    region: PharmacyRegion;
    route: PharmacyEmailRoute;
    reasonText: string;
    mailboxAddress: string | null;
    objectIdSet: boolean;
  }>;
}

/*
 * What the Mail status panel shows: whether each setting is present and which
 * auth mode is in use. Never a secret, a token or a key.
 */
export function describeMailConfig(env: MailEnv): MailConfigSummary {
  const authMode = graphAuthModeOf(env);
  const gap = credentialGap(env, authMode);

  return {
    enabled: setting(env, 'LIIVV_PHARMACY_EMAIL_ENABLED') === 'true',
    deployment: deploymentKind(env),
    authMode,
    tenantSet: GUID_RE.test(setting(env, 'LIIVV_GRAPH_TENANT_ID')),
    clientSet: GUID_RE.test(setting(env, 'LIIVV_GRAPH_CLIENT_ID')),
    credentialSet: authMode !== null && gap !== 'credential' && gap !== 'secret_in_production',
    appUrlOk: appOriginOf(env) !== null,
    webhooks: webhooksEnabled(env),
    plusReplyTo: plusReplyToEnabled(env),
    messageMode: messageModeOffered(env),
    consentApproved: emailConsentApproved(env),
    cronSecretSet: setting(env, 'CRON_SECRET').length > 0,
    regions: PHARMACY_REGIONS.map((region) => {
      const route = resolvePharmacyEmailRoute(env, region);
      const mailbox = mailboxOf(env, region);

      return {
        region,
        route,
        reasonText: mailtoReasonText(route),
        mailboxAddress: mailbox?.address ?? null,
        objectIdSet: Boolean(mailbox?.objectId),
      };
    }),
  };
}
