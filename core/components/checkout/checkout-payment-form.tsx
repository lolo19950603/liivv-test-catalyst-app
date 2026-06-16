'use client';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FormEvent, useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { checkoutPaymentElementOptions } from '~/lib/stripe/payment-element-options';
import { readBillingDetailsFromForm } from '~/lib/checkout/read-billing-form';

interface CheckoutPaymentFormProps {
  billingFormId: string;
  returnUrl: string;
  submitLabel: string;
}

export function CheckoutPaymentForm({ billingFormId, returnUrl, submitLabel }: CheckoutPaymentFormProps) {
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

    const billingDetails = readBillingDetailsFromForm(billingFormId);

    if (!billingDetails?.name) {
      setErrorMessage('Please enter your billing name');
      setIsSubmitting(false);

      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: billingDetails,
        },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? 'Payment failed');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <PaymentElement options={checkoutPaymentElementOptions} />
      {errorMessage ? <p className="text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p> : null}
      <Button className="w-full" loading={isSubmitting} size="medium" type="submit" variant="primary">
        {submitLabel}
      </Button>
    </form>
  );
}
