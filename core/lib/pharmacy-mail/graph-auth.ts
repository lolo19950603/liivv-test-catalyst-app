import 'server-only';

import { randomUUID } from 'node:crypto';

import { buildClientAssertion, privateKeyFromB64, tokenEndpoint } from './client-assertion';
import { type GraphAuthMode, graphReadiness } from './config-rules';

/*
 * =============================================================================
 * AN APP-ONLY MICROSOFT GRAPH TOKEN (client-credentials flow, fetch only)
 * =============================================================================
 * POST https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token with
 * grant_type=client_credentials and scope=https://graph.microsoft.com/.default.
 * How the app proves itself depends on LIIVV_GRAPH_AUTH:
 *
 *   oidc         Vercel's OIDC token as the client assertion (no stored
 *                secret). It comes from @vercel/oidc through the
 *                @vercel/functions/oidc re-export, because @vercel/functions is
 *                already a direct dependency and @vercel/oidc is not: no new
 *                package and no lockfile change. That version takes no
 *                audience argument, so the token's audience is Vercel's default,
 *                https://vercel.com/<team-slug>, and the Entra federated
 *                credential must use that audience (IT guide, option A).
 *   certificate  a JWT signed with the certificate's private key
 *                (./client-assertion.ts).
 *   secret       a client secret: local development only; refused in production
 *                by ./config-rules.ts.
 *
 * The token is cached in memory until 5 minutes before it expires (about an
 * hour) and is never logged, returned to a client or stored. Client
 * credentials give no refresh token: a new one is requested on expiry, or once
 * after a 401 (forceRefresh).
 * =============================================================================
 */

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const JWT_BEARER = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
const EARLY_REFRESH_MS = 5 * 60 * 1000;

export class GraphAuthError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`Microsoft sign-in failed (${code}).`);
    this.name = 'GraphAuthError';
    this.code = code;
  }
}

let cached: { key: string; token: string; expiresAt: number } | null = null;

async function vercelOidcAssertion(): Promise<string> {
  try {
    const { getVercelOidcToken } = await import('@vercel/functions/oidc');

    return await getVercelOidcToken();
  } catch {
    throw new GraphAuthError('oidc_token_unavailable');
  }
}

function certificateAssertion(tenantId: string, clientId: string): string {
  try {
    return buildClientAssertion({
      tenantId,
      clientId,
      privateKey: privateKeyFromB64(process.env.LIIVV_GRAPH_CERT_PRIVATE_KEY_B64 ?? ''),
      thumbprintSha256Hex: (process.env.LIIVV_GRAPH_CERT_THUMBPRINT_SHA256 ?? '').trim(),
      jti: randomUUID(),
    });
  } catch {
    throw new GraphAuthError('certificate_unreadable');
  }
}

/* The form fields that prove the app's identity for this auth mode. */
async function clientProof(
  mode: GraphAuthMode,
  tenantId: string,
  clientId: string,
): Promise<Record<string, string>> {
  if (mode === 'secret') {
    return { client_secret: (process.env.LIIVV_GRAPH_CLIENT_SECRET ?? '').trim() };
  }

  const assertion =
    mode === 'oidc' ? await vercelOidcAssertion() : certificateAssertion(tenantId, clientId);

  return { client_assertion_type: JWT_BEARER, client_assertion: assertion };
}

/* The token endpoint's error, as a code only ("invalid_client/AADSTS700027"). */
function tokenErrorCode(status: number, body: unknown): string {
  if (typeof body !== 'object' || body === null) {
    return `token_http_${status}`;
  }

  const error = 'error' in body && typeof body.error === 'string' ? body.error : `http_${status}`;
  const codes = 'error_codes' in body && Array.isArray(body.error_codes) ? body.error_codes : [];
  const first: unknown = codes[0];

  return typeof first === 'number' ? `${error}/AADSTS${first}` : error;
}

async function requestToken(mode: GraphAuthMode, tenantId: string, clientId: string) {
  const form = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: GRAPH_SCOPE,
    client_id: clientId,
    ...(await clientProof(mode, tenantId, clientId)),
  });
  let response: Response;

  try {
    response = await fetch(tokenEndpoint(tenantId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new GraphAuthError('token_network');
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new GraphAuthError(tokenErrorCode(response.status, body));
  }

  const token =
    typeof body === 'object' && body !== null && 'access_token' in body ? body.access_token : null;
  const expiresIn =
    typeof body === 'object' && body !== null && 'expires_in' in body ? Number(body.expires_in) : 0;

  if (typeof token !== 'string' || !token) {
    throw new GraphAuthError('token_missing');
  }

  return { token, expiresInSec: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 3599 };
}

/*
 * A Graph access token. Throws GraphAuthError (a code, never a secret) when
 * Graph is not usable in this deployment or sign-in fails.
 */
export async function getGraphToken(options: { forceRefresh?: boolean } = {}): Promise<string> {
  const readiness = graphReadiness(process.env);

  if (!readiness.ready) {
    throw new GraphAuthError(`not_ready_${readiness.reason}`);
  }

  const tenantId = (process.env.LIIVV_GRAPH_TENANT_ID ?? '').trim();
  const clientId = (process.env.LIIVV_GRAPH_CLIENT_ID ?? '').trim();
  const key = `${tenantId}:${clientId}:${readiness.authMode}`;
  const now = Date.now();

  if (!options.forceRefresh && cached?.key === key && cached.expiresAt - EARLY_REFRESH_MS > now) {
    return cached.token;
  }

  const fresh = await requestToken(readiness.authMode, tenantId, clientId);

  cached = { key, token: fresh.token, expiresAt: now + fresh.expiresInSec * 1000 };

  return fresh.token;
}

/* Forget the cached token (tests, or after the credential changes). */
export function clearGraphTokenCache(): void {
  cached = null;
}
