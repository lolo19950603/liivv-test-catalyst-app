'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

interface CheckoutPaymentFormProps {
  returnUrl: string;
  submitLabel: string;
}

export function CheckoutPaymentForm({ returnUrl, submitLabel }: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? 'Payment failed');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage ? <p className="text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p> : null}
      <Button className="w-full" loading={isSubmitting} size="medium" type="submit" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}
