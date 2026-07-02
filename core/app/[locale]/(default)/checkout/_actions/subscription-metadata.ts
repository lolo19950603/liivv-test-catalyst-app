'use server';

import { ensureCheckoutSubscriptionMetadataReady } from '~/lib/checkout/subscription-metadata-readiness';

export async function waitForCheckoutSubscriptionMetadata(): Promise<{ ready: boolean }> {
  return ensureCheckoutSubscriptionMetadataReady();
}
