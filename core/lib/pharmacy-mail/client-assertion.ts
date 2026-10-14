/*
 * =============================================================================
 * CERTIFICATE CLIENT ASSERTION FOR THE MICROSOFT IDENTITY PLATFORM
 * =============================================================================
 * The certificate credential (LIIVV_GRAPH_AUTH=certificate, IT guide option B)
 * proves the app's identity with a short JWT it signs itself (RS256), sent as
 * client_assertion in the client-credentials token request:
 *
 *   header  { alg: 'RS256', typ: 'JWT', 'x5t#S256': base64url(SHA-256 thumbprint) }
 *   claims  aud = the token URL, iss = sub = the client id, jti = a uuid,
 *           iat, nbf = now, exp = now + 10 minutes.
 *
 * The private key arrives base64-encoded on one line
 * (LIIVV_GRAPH_CERT_PRIVATE_KEY_B64), so stray \r\n in a pasted PEM can't
 * break the signature (AADSTS700027). Pure apart from node:crypto.
 * =============================================================================
 */

import { createPrivateKey, createSign, type KeyObject } from 'node:crypto';

export function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export function tokenEndpoint(tenantId: string): string {
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
}

/* The PEM private key from its one-line base64 form (or a PEM given as is). */
export function privateKeyFromB64(value: string): KeyObject {
  const trimmed = value.trim();
  const pem = trimmed.startsWith('-----BEGIN')
    ? trimmed
    : Buffer.from(trimmed, 'base64').toString('utf8');

  return createPrivateKey({ key: pem.replace(/\r\n?/g, '\n'), format: 'pem' });
}

export function buildClientAssertion(input: {
  tenantId: string;
  clientId: string;
  privateKey: KeyObject;
  thumbprintSha256Hex: string;
  jti: string;
  now?: Date;
}): string {
  const issuedAt = Math.floor((input.now ?? new Date()).getTime() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    'x5t#S256': base64url(Buffer.from(input.thumbprintSha256Hex.replace(/:/g, ''), 'hex')),
  };
  const claims = {
    aud: tokenEndpoint(input.tenantId),
    iss: input.clientId,
    sub: input.clientId,
    jti: input.jti,
    iat: issuedAt,
    nbf: issuedAt,
    exp: issuedAt + 600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = createSign('RSA-SHA256').update(signingInput).sign(input.privateKey);

  return `${signingInput}.${base64url(signature)}`;
}
