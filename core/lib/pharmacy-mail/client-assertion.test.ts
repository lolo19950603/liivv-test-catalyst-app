import { createPublicKey, createVerify, generateKeyPairSync } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { buildClientAssertion, privateKeyFromB64, tokenEndpoint } from './client-assertion';

describe('certificate client assertion', () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
  const tenantId = '11111111-2222-3333-4444-555555555555';
  const clientId = '66666666-7777-8888-9999-000000000000';
  const thumbprint = 'ab'.repeat(32);

  it('signs RS256 with the thumbprint, and verifies against the public key', () => {
    const jwt = buildClientAssertion({
      tenantId,
      clientId,
      privateKey: privateKeyFromB64(Buffer.from(pem.replace(/\n/g, '\r\n')).toString('base64')),
      thumbprintSha256Hex: thumbprint,
      jti: 'jti-1',
      now: new Date('2026-10-14T12:00:00Z'),
    });
    const [header = '', claims = '', signature = ''] = jwt.split('.');

    expect(JSON.parse(Buffer.from(header, 'base64url').toString())).toEqual({
      alg: 'RS256',
      typ: 'JWT',
      'x5t#S256': Buffer.from(thumbprint, 'hex').toString('base64url'),
    });
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toEqual({
      aud: tokenEndpoint(tenantId),
      iss: clientId,
      sub: clientId,
      jti: 'jti-1',
      iat: 1_791_979_200,
      nbf: 1_791_979_200,
      exp: 1_791_979_800,
    });

    const verified = createVerify('RSA-SHA256')
      .update(`${header}.${claims}`)
      .verify(createPublicKey(privateKey), Buffer.from(signature, 'base64url'));

    expect(verified).toBe(true);
  });

  it('accepts the PEM given as is', () => {
    expect(privateKeyFromB64(pem).asymmetricKeyType).toBe('rsa');
  });
});
