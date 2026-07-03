'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface AddPaymentMethodFormInnerProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (message: string) => void;
  saveLabel: string;
  secureNote?: string;
}

function AddPaymentMethodFormInner({
  onSuccess,
  onError,
  saveLabel,
  secureNote,
}: AddPaymentMethodFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      onError(submitError.message ?? 'Please check your card details');
      setIsSubmitting(false);

      return;
    }

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Unable to save payment method');
      setIsSubmitting(false);

      return;
    }

    if (setupIntent?.status === 'succeeded') {
      const paymentMethodId =
        typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method?.id;

      if (paymentMethodId) {
        onSuccess(paymentMethodId);
      } else {
        onError('Unable to save payment method');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="subscription-manage-modal__add-payment-form">
      {secureNote ? (
        <p className="subscription-manage-modal__payment-intro">{secureNote}</p>
      ) : null}
      <div className="subscription-manage-modal__payment-element">
        <PaymentElement options={{ wallets: { link: 'never' } }} />
      </div>
      <Button
        className="w-full justify-center"
        disabled={!stripe || !elements}
        loading={isSubmitting}
        onClick={() => {
          void handleSubmit();
        }}
        size="medium"
        type="button"
        variant="primary"
      >
        {saveLabel}
      </Button>
    </div>
  );
}

interface AddPaymentMethodFormProps extends AddPaymentMethodFormInnerProps {
  clientSecret: string;
}

export function AddPaymentMethodForm({ clientSecret, ...props }: AddPaymentMethodFormProps) {
  return (
    <Elements
      key={clientSecret}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
      stripe={stripePromise}
    >
      <AddPaymentMethodFormInner {...props} />
    </Elements>
  );
}
