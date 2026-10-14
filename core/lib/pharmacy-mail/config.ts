import 'server-only';

import {
  allMailboxAddresses,
  appOriginOf,
  describeMailConfig,
  emailConsentApproved,
  graphAuthModeOf,
  type MailConfigSummary,
  type MailEnv,
  messageModeOffered,
  outlookMailboxOf,
  type PharmacyEmailRoute,
  plusReplyToEnabled,
  resolvePharmacyEmailRoute,
  webhookHandshakeAllowed,
  webhooksEnabled,
} from './config-rules';

/*
 * =============================================================================
 * PHARMACY EMAIL SETTINGS FROM THE ENVIRONMENT (server only)
 * =============================================================================
 * The one place that reads the LIIVV_PHARMACY_EMAIL_* and LIIVV_GRAPH_*
 * variables (key names in docs/pharmacy/it-setup-microsoft-365-email.md).
 * The rules are in ./config-rules.ts. Nothing here throws: any missing or
 * malformed setting means the Outlook-draft fallback. No setting reaches the
 * browser except through these derived, secret-free answers.
 * =============================================================================
 */

function env(): MailEnv {
  return process.env;
}

/* Graph (from the province mailbox) or the Outlook-draft fallback, with its reason. */
export function pharmacyEmailRoute(
  provinceOrRegion: string | null | undefined,
): PharmacyEmailRoute {
  return resolvePharmacyEmailRoute(env(), provinceOrRegion);
}

export function pharmacyMailConfigSummary(): MailConfigSummary {
  return describeMailConfig(env());
}

export function pharmacyAppOrigin(): string | null {
  return appOriginOf(env());
}

export function pharmacyMessageModeOffered(): boolean {
  return messageModeOffered(env());
}

/* D8 approved: customers may be offered email, and email may go to them. */
export function pharmacyEmailConsentApproved(): boolean {
  return emailConsentApproved(env());
}

/* The province's Liivv mailbox the Outlook draft must go out from, or null (phone only). */
export function pharmacyOutlookMailbox(provinceOrRegion: string | null | undefined): string | null {
  return outlookMailboxOf(env(), provinceOrRegion);
}

export function pharmacyPlusReplyToEnabled(): boolean {
  return plusReplyToEnabled(env());
}

export function pharmacyWebhooksEnabled(): boolean {
  return webhooksEnabled(env());
}

export function pharmacyWebhookHandshakeAllowed(): boolean {
  return webhookHandshakeAllowed(env());
}

/* Every configured pharmacy mailbox, lower-cased (loop protection in ingest). */
export function pharmacyOwnMailboxes(): string[] {
  return allMailboxAddresses(env());
}

export function graphTenantId(): string | null {
  return process.env.LIIVV_GRAPH_TENANT_ID?.trim() || null;
}

export function graphClientId(): string | null {
  return process.env.LIIVV_GRAPH_CLIENT_ID?.trim() || null;
}

export function graphAuthMode() {
  return graphAuthModeOf(env());
}

export function cronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null;
}
