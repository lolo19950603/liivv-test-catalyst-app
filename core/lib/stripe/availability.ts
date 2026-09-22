import 'server-only';

import { cache } from 'react';
import Stripe from 'stripe';

import { isGatewayStatus, isNetworkFailure, logVendorOutage } from '~/lib/vendor-outage';

import { getStripe, isStripeConfigured } from './client';

export function isStripeOutage(error: unknown): boolean {
  if (isNetworkFailure(error)) {
    return true;
  }

  if (error instanceof Stripe.errors.StripeConnectionError) {
    return true;
  }

  if (error instanceof Stripe.errors.StripeAPIError) {
    return isGatewayStatus(error.statusCode);
  }

  return false;
}

export const isStripeReachable = cache(async (): Promise<boolean> => {
  if (!isStripeConfigured()) {
    return false;
  }

  try {
    await getStripe().balance.retrieve({}, { timeout: 4000 });

    return true;
  } catch (error) {
    logVendorOutage('stripe', error);

    return false;
  }
});
