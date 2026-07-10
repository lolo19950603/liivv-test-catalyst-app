import 'server-only';

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
    return false;
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
  const secret = getClientSecret();

  if (!secret) {
    return null;
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(signedPayload, key, {
      algorithms: ['HS256'],
    });

    const data = payload as Partial<BcAppSignedPayload>;

    if (
      !data.user?.id ||
      !data.user.email ||
      !data.context ||
      !data.store_hash ||
      typeof data.timestamp !== 'number'
    ) {
      return null;
    }

    if (!assertAllowedStoreHash(data.store_hash)) {
      return null;
    }

    return {
      user: { id: data.user.id, email: data.user.email },
      owner: data.owner?.id
        ? { id: data.owner.id, email: data.owner.email ?? '' }
        : undefined,
      context: data.context,
      store_hash: data.store_hash,
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
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
