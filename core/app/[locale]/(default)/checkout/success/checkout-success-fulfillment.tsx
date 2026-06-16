'use client';

import { useEffect, useRef } from 'react';

import { clearCheckoutCartAfterStripeSessionAction } from '../_actions/clear-checkout-cart';
import { fulfillCheckoutStripeSessionAction } from '../_actions/fulfill-checkout-payment';

interface CheckoutSuccessFulfillmentProps {
  stripeSessionId?: string;
}

function fulfillmentStorageKey(stripeSessionId: string): string {
  return `checkout-fulfilled:${stripeSessionId}`;
}

function hasFulfillmentStarted(stripeSessionId: string): boolean {
  try {
    return sessionStorage.getItem(fulfillmentStorageKey(stripeSessionId)) === '1';
  } catch {
    return false;
  }
}

function markFulfillmentStarted(stripeSessionId: string): void {
  try {
    sessionStorage.setItem(fulfillmentStorageKey(stripeSessionId), '1');
  } catch {
    // Ignore storage errors in private browsing.
  }
}

export function CheckoutSuccessFulfillment({ stripeSessionId }: CheckoutSuccessFulfillmentProps) {
  const fulfillmentAttemptedRef = useRef(false);

  useEffect(() => {
    if (!stripeSessionId || fulfillmentAttemptedRef.current || hasFulfillmentStarted(stripeSessionId)) {
      return;
    }

    fulfillmentAttemptedRef.current = true;
    markFulfillmentStarted(stripeSessionId);

    void (async () => {
      await fulfillCheckoutStripeSessionAction(stripeSessionId);
      await clearCheckoutCartAfterStripeSessionAction(stripeSessionId);
    })();
  }, [stripeSessionId]);

  return null;
}
