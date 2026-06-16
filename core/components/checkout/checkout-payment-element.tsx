'use client';

import { Elements } from '@stripe/react-stripe-js';
import { PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { type ReactNode } from 'react';

import { useCheckoutPayment } from './checkout-payment-provider';
import { checkoutPaymentElementOptions } from '~/lib/stripe/payment-element-options';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export function CheckoutPaymentElements({ children }: { children: ReactNode }) {
  const { clientSecret } = useCheckoutPayment();

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      key={clientSecret}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
      stripe={stripePromise}
    >
      <div className="space-y-5">{children}</div>
    </Elements>
  );
}

export function CheckoutPaymentElement() {
  const { refreshPaymentIntent, setConfirmError } = useCheckoutPayment();

  return (
    <PaymentElement
      onLoadError={(event) => {
        const message = event.error.message ?? 'Unable to load payment form';

        if (message.toLowerCase().includes('terminal state')) {
          void refreshPaymentIntent().catch(() => {
            setConfirmError('Payment session expired. Please try again.');
          });

          return;
        }

        setConfirmError(message);
      }}
      options={checkoutPaymentElementOptions}
    />
  );
}
