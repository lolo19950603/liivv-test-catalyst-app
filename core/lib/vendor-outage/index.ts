export type VendorName = 'bigcommerce' | 'supabase' | 'stripe';

export const VENDOR_OUTAGE_DIGEST = {
  bigcommerce: 'LIIVV_BIGCOMMERCE_UNAVAILABLE',
  supabase: 'LIIVV_SUPABASE_UNAVAILABLE',
  stripe: 'LIIVV_STRIPE_UNAVAILABLE',
} as const;

const DIGEST_TO_VENDOR: Record<string, VendorName> = {
  [VENDOR_OUTAGE_DIGEST.bigcommerce]: 'bigcommerce',
  [VENDOR_OUTAGE_DIGEST.supabase]: 'supabase',
  [VENDOR_OUTAGE_DIGEST.stripe]: 'stripe',
};

export class VendorOutageError extends Error {
  readonly vendor: VendorName;
  readonly digest: string;

  constructor(vendor: VendorName, cause?: unknown) {
    super(`${vendor} is temporarily unavailable`);
    this.name = 'VendorOutageError';
    this.vendor = vendor;
    this.digest = VENDOR_OUTAGE_DIGEST[vendor];

    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export function isVendorOutageError(error: unknown): error is VendorOutageError {
  return error instanceof VendorOutageError;
}

export function vendorFromDigest(digest?: string | null): VendorName | null {
  if (!digest) {
    return null;
  }

  return DIGEST_TO_VENDOR[digest] ?? null;
}

export function isNetworkFailure(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const cause =
    error.cause instanceof Error ? error.cause.message.toLowerCase() : '';

  return (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('etimedout') ||
    message.includes('econnreset') ||
    message.includes('socket') ||
    message.includes('aborted') ||
    cause.includes('fetch failed') ||
    cause.includes('econnrefused') ||
    cause.includes('enotfound') ||
    cause.includes('etimedout')
  );
}

export function isGatewayStatus(status: number | undefined): boolean {
  return status === 500 || status === 502 || status === 503 || status === 504;
}

export function logVendorOutage(vendor: VendorName, error: unknown): void {
  console.error(`[${vendor}] temporarily unavailable`, error);
}

export async function withVendorFallback<T>(
  vendor: VendorName,
  fallback: T,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (isVendorOutageError(error) && error.vendor === vendor) {
      logVendorOutage(vendor, error);

      return fallback;
    }

    throw error;
  }
}
