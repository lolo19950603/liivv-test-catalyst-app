'use client';

import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

import { useCheckoutPayment } from './checkout-payment-provider';
import { readBillingDetailsFromForm } from '~/lib/checkout/read-billing-form';
import { getCheckoutStripeModeFromClientSecret } from '~/lib/stripe/stripe-session-id';

interface CheckoutCompleteOrderButtonProps {
  submitLabel: string;
  disabled?: boolean;
  disabledMessage?: string;
  onBeforeConfirm?: () => void;
}

function CheckoutCompleteOrderButtonShell({
  submitLabel,
  disabled = false,
  disabledMessage,
  errorMessage,
  isLoading,
  onClick,
}: {
  submitLabel: string;
  disabled?: boolean;
  disabledMessage?: string;
  errorMessage: string | null;
  isLoading: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="space-y-3 pt-2">
      {disabled && disabledMessage ? (
        <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">{disabledMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-[var(--error,hsl(var(--error)))]">{errorMessage}</p>
      ) : null}
      <Button
        className="w-full"
        disabled={disabled}
        loading={isLoading}
        onClick={onClick}
        size="medium"
        type="button"
        variant="primary"
      >
        {submitLabel}
      </Button>
    </div>
  );
}

export function CheckoutCompleteOrderButtonPlaceholder({
  submitLabel,
  disabledMessage,
}: {
  submitLabel: string;
  disabledMessage?: string;
}) {
  const { errorMessage, isInitializing } = useCheckoutPayment();

  return (
    <CheckoutCompleteOrderButtonShell
      disabled
      disabledMessage={disabledMessage}
      errorMessage={errorMessage}
      isLoading={isInitializing}
      submitLabel={submitLabel}
    />
  );
}

export function CheckoutCompleteOrderButton({
  submitLabel,
  disabled = false,
  disabledMessage,
  onBeforeConfirm,
}: CheckoutCompleteOrderButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const {
    billingFormId,
    clientSecret,
    errorMessage,
    isInitializing,
    prepareOrderConfirmation,
    refreshPaymentIntent,
    returnUrl,
    setConfirmError,
  } = useCheckoutPayment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (!stripe || !elements || !clientSecret || disabled) {
      return;
    }

    setIsSubmitting(true);
    setConfirmError(null);

    try {
      onBeforeConfirm?.();

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setConfirmError(submitError.message ?? 'Please check your payment details');

        return;
      }

      await prepareOrderConfirmation();

      const { error: fetchError } = await elements.fetchUpdates();

      if (fetchError) {
        setConfirmError(fetchError.message ?? 'Unable to refresh payment form');

        return;
      }

      const billingDetails = readBillingDetailsFromForm(billingFormId);

      if (!billingDetails?.name) {
        setConfirmError('Please enter your billing name');

        return;
      }

      const checkoutMode = getCheckoutStripeModeFromClientSecret(clientSecret);
      const confirmParams = {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: billingDetails,
        },
      };

      const result =
        checkoutMode === 'setup'
          ? await stripe.confirmSetup({
              elements,
              confirmParams,
            })
          : await stripe.confirmPayment({
              elements,
              confirmParams,
            });

      if (result.error) {
        setConfirmError(result.error.message ?? 'Payment failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to complete order';

      if (message.toLowerCase().includes('payment session expired')) {
        try {
          await refreshPaymentIntent();
        } catch {
          // refreshPaymentIntent already sets a user-facing error message
        }
      }

      setConfirmError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckoutCompleteOrderButtonShell
      disabled={disabled || !clientSecret || !stripe || !elements}
      disabledMessage={disabledMessage}
      errorMessage={errorMessage}
      isLoading={isSubmitting || isInitializing}
      onClick={() => {
        void handleClick();
      }}
      submitLabel={submitLabel}
    />
  );
}
