'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type StripeElementsOptions } from '@stripe/stripe-js';
import { useState, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

import { CheckoutPaymentForm } from './checkout-payment-form';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface CheckoutPaymentSectionProps {
  initializePaymentAction: (formData: FormData) => Promise<{ clientSecret: string; snapshotId: string }>;
  billingFormId: string;
  continueLabel: string;
  submitLabel: string;
  returnUrl: string;
}

export function CheckoutPaymentSection({
  initializePaymentAction,
  billingFormId,
  continueLabel,
  submitLabel,
  returnUrl,
}: CheckoutPaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    const form = document.getElementById(billingFormId) as HTMLFormElement | null;

    if (!form) {
      return;
    }

    const formData = new FormData(form);

    startTransition(async () => {
      try {
        setErrorMessage(null);
        const result = await initializePaymentAction(formData);

        setClientSecret(result.clientSecret);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to start payment');
      }
    });
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        {errorMessage ? (
          <p className="text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p>
        ) : null}
        <Button className="w-full" loading={isPending} onClick={handleContinue} size="medium" type="button">
          {continueLabel}
        </Button>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutPaymentForm returnUrl={returnUrl} submitLabel={submitLabel} />
    </Elements>
  );
}
