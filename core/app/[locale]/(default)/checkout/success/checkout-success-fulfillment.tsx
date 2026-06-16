'use client';

import { useEffect, useRef } from 'react';

import { fulfillCheckoutStripeSessionAction } from '../_actions/fulfill-checkout-payment';

interface CheckoutSuccessFulfillmentProps {
  stripeSessionId?: string;
}

export function CheckoutSuccessFulfillment({ stripeSessionId }: CheckoutSuccessFulfillmentProps) {
  const fulfillmentAttemptedRef = useRef(false);

  useEffect(() => {
    if (!stripeSessionId || fulfillmentAttemptedRef.current) {
      return;
    }

    fulfillmentAttemptedRef.current = true;

    void fulfillCheckoutStripeSessionAction(stripeSessionId);
  }, [stripeSessionId]);

  return null;
}
