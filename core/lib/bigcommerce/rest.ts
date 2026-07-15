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
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const { storeHash, accessToken } = getAdminConfig();
  const { timeoutMs = 8_000, ...requestInit } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (requestInit.signal) {
    requestInit.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}${path}`, {
      ...requestInit,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': accessToken,
        ...requestInit.headers,
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
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('BigCommerce request timed out.');
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}
