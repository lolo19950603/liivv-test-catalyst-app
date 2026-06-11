import 'server-only';

function getAdminConfig(): { storeHash: string; accessToken: string } {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH?.trim();
  const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN?.trim();

  if (!storeHash || !accessToken) {
    throw new Error('BIGCOMMERCE_STORE_HASH and BIGCOMMERCE_ACCESS_TOKEN are required');
  }

  return { storeHash, accessToken };
}

export function isBigCommerceAdminConfigured(): boolean {
  return Boolean(process.env.BIGCOMMERCE_STORE_HASH && process.env.BIGCOMMERCE_ACCESS_TOKEN);
}

export async function bigCommerceAdminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { storeHash, accessToken } = getAdminConfig();
  const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': accessToken,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`BigCommerce API ${response.status}: ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
