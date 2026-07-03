'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

interface AddPaymentMethodFormInnerProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (message: string) => void;
  onPendingChange?: (isPending: boolean) => void;
  saveLabel: string;
  secureNote?: string;
}

function AddPaymentMethodFormInner({
  onSuccess,
  onError,
  onPendingChange,
  saveLabel,
  secureNote,
}: AddPaymentMethodFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishWithError = (message: string) => {
    onError(message);
    setIsSubmitting(false);
    onPendingChange?.(false);
  };

  const handleSubmit = async () => {
    if (!stripe || !elements || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    onPendingChange?.(true);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      finishWithError(submitError.message ?? 'Please check your card details');

      return;
    }

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      finishWithError(error.message ?? 'Unable to save payment method');

      return;
    }

    if (setupIntent?.status === 'succeeded') {
      const paymentMethodId =
        typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method?.id;

      if (paymentMethodId) {
        onSuccess(paymentMethodId);

        return;
      }
    }

    finishWithError('Unable to save payment method');
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
