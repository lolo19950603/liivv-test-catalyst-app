import 'server-only';

import { createHmac, createSecretKey, timingSafeEqual } from 'node:crypto';

import { jwtVerify } from 'jose';

import { kv } from '~/lib/kv';

const INSTALL_KEY_PREFIX = 'bc-app:install:';

export type BcAppUser = {
  id: number;
  email: string;
};

export type BcAppSignedPayload = {
  user: BcAppUser;
  owner?: BcAppUser;
  context: string;
  store_hash: string;
  timestamp: number;
};

export type BcAppInstallRecord = {
  accessToken: string;
  scope: string;
  context: string;
  storeHash: string;
  installedAt: string;
};

export type BcAppAuthCallbackQuery = {
  code: string;
  scope: string;
  context: string;
};

export type BcAppTokenResponse = {
  access_token: string;
  scope: string;
  context: string;
  user: BcAppUser;
};

function getClientId(): string | null {
  return process.env.BIGCOMMERCE_APP_CLIENT_ID?.trim() || null;
}

function getClientSecret(): string | null {
  return process.env.BIGCOMMERCE_APP_CLIENT_SECRET?.trim() || null;
}

export function getBcAppPublicUrl(): string | null {
  const fromEnv = process.env.BIGCOMMERCE_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();

  return fromEnv ? fromEnv.replace(/\/$/, '') : null;
}

export function isBcAppConfigured(): boolean {
  return Boolean(getClientId() && getClientSecret() && getBcAppPublicUrl());
}

export function getBcAppAuthCallbackUrl(): string | null {
  const base = getBcAppPublicUrl();

  return base ? `${base}/api/bigcommerce/app/auth` : null;
}

export function getBcAppLoadCallbackUrl(): string | null {
  const base = getBcAppPublicUrl();

  return base ? `${base}/api/bigcommerce/app/load` : null;
}

export function getBcAppUninstallCallbackUrl(): string | null {
  const base = getBcAppPublicUrl();

  return base ? `${base}/api/bigcommerce/app/uninstall` : null;
}

function getConfiguredStoreHash(): string | null {
  return process.env.BIGCOMMERCE_STORE_HASH?.trim() || null;
}

export function assertAllowedStoreHash(storeHash: string): boolean {
  const configured = getConfiguredStoreHash();

  if (!configured) {
    return true;
  }

  return configured === storeHash;
}

function installKey(storeHash: string): string {
  return `${INSTALL_KEY_PREFIX}${storeHash}`;
}

export async function getBcAppInstall(storeHash: string): Promise<BcAppInstallRecord | null> {
  return kv.get<BcAppInstallRecord>(installKey(storeHash));
}

export async function saveBcAppInstall(record: BcAppInstallRecord): Promise<void> {
  await kv.set(installKey(record.storeHash), record);
}

export async function deleteBcAppInstall(storeHash: string): Promise<void> {
  await kv.set(installKey(storeHash), '');
}

export async function getBcAppAccessToken(storeHash: string): Promise<string | null> {
  const install = await getBcAppInstall(storeHash);

  if (install?.accessToken) {
    return install.accessToken;
  }

  const fallback = process.env.BIGCOMMERCE_ACCESS_TOKEN?.trim();

  return fallback || null;
}

export async function verifyBcAppSignedPayload(
  signedPayload: string,
): Promise<BcAppSignedPayload | null> {
  const segmentCount = signedPayload.split('.').length;

  if (segmentCount === 2) {
    return verifyLegacySignedPayload(signedPayload);
  }

  if (segmentCount >= 3) {
    return verifyJwtSignedPayload(signedPayload);
  }

  logBcAppVerifyFailure('signed payload is not a JWT or legacy BC payload');

  return null;
}

type BcJwtPayload = Partial<BcAppSignedPayload> & {
  sub?: string;
  iat?: number;
  user?: {
    id?: number | string;
    email?: string;
  };
  owner?: {
    id?: number | string;
    email?: string;
  };
};

function logBcAppVerifyFailure(reason: string): void {
  // eslint-disable-next-line no-console
  console.error(`[bc-app] signed payload verification failed: ${reason}`);
}

function verifyLegacySignedPayload(signedRequest: string): BcAppSignedPayload | null {
  const secret = getClientSecret();

  if (!secret) {
    logBcAppVerifyFailure('BIGCOMMERCE_APP_CLIENT_SECRET is not set');

    return null;
  }

  const [encodedJson, encodedSignature] = signedRequest.split('.');

  if (!encodedJson || !encodedSignature) {
    logBcAppVerifyFailure('legacy signed payload is missing data or signature');

    return null;
  }

  try {
    const signature = Buffer.from(encodedSignature, 'base64').toString('utf8');
    const json = Buffer.from(encodedJson, 'base64').toString('utf8');
    const expected = createHmac('sha256', secret).update(json).digest('hex');

    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'))
    ) {
      logBcAppVerifyFailure('legacy signed payload signature mismatch');

      return null;
    }

    const data = JSON.parse(json) as BcJwtPayload;

    return normalizeSignedPayload(data);
  } catch (error) {
    logBcAppVerifyFailure(
      error instanceof Error ? error.message : 'legacy signed payload parse error',
    );

    return null;
  }
}

async function verifyJwtSignedPayload(signedPayload: string): Promise<BcAppSignedPayload | null> {
  const secret = getClientSecret();
  const clientId = getClientId();

  if (!secret) {
    logBcAppVerifyFailure('BIGCOMMERCE_APP_CLIENT_SECRET is not set');

    return null;
  }

  const key = createSecretKey(Buffer.from(secret, 'utf8'));

  try {
    const { payload } = await jwtVerify(signedPayload, key, {
      algorithms: ['HS256'],
      ...(clientId ? { audience: clientId } : {}),
      clockTolerance: 30,
    });

    return normalizeSignedPayload(payload as BcJwtPayload);
  } catch (error) {
    logBcAppVerifyFailure(error instanceof Error ? error.message : 'JWT verification failed');

    return null;
  }
}

function parseStoreHashFromContext(context: string): string | null {
  const match = /^stores\/(.+)$/.exec(context.trim());

  return match?.[1] ?? null;
}

function normalizeSignedPayload(data: BcJwtPayload): BcAppSignedPayload | null {
  const context = data.context?.trim() || data.sub?.trim() || '';
  const storeHash = data.store_hash?.trim() || parseStoreHashFromContext(context) || '';
  const timestamp = typeof data.timestamp === 'number' ? data.timestamp : data.iat;
  const userId = data.user?.id;
  const userEmail = data.user?.email?.trim();

  if (!userId || !userEmail || !context || !storeHash || typeof timestamp !== 'number') {
    logBcAppVerifyFailure('signed payload is missing required user, store, or timestamp fields');

    return null;
  }

  if (!assertAllowedStoreHash(storeHash)) {
    logBcAppVerifyFailure(
      `store hash ${storeHash} does not match BIGCOMMERCE_STORE_HASH ${getConfiguredStoreHash() ?? '(unset)'}`,
    );

    return null;
  }

  return {
    user: { id: Number(userId), email: userEmail },
    owner: data.owner?.id
      ? { id: Number(data.owner.id), email: data.owner.email?.trim() ?? '' }
      : undefined,
    context,
    store_hash: storeHash,
    timestamp,
  };
}

export async function exchangeBcAppAuthCode(
  query: BcAppAuthCallbackQuery,
): Promise<BcAppTokenResponse | null> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const redirectUri = getBcAppAuthCallbackUrl();

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  const storeHash = query.context.replace(/^stores\//, '');

  if (!assertAllowedStoreHash(storeHash)) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: query.code,
    scope: query.scope,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    context: query.context,
  });

  const response = await fetch('https://login.bigcommerce.com/oauth2/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Partial<BcAppTokenResponse>;

  if (!data.access_token || !data.scope || !data.context || !data.user?.id) {
    return null;
  }

  return {
    access_token: data.access_token,
    scope: data.scope,
    context: data.context,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
    },
  };
}
