'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';

import { getStripeSessionIdFromClientSecret } from '~/lib/stripe/stripe-session-id';

interface CheckoutPaymentContextValue {
  billingFormId: string;
  clientSecret: string | null;
  errorMessage: string | null;
  isInitializing: boolean;
  refreshPaymentIntent: () => Promise<string>;
  prepareOrderConfirmation: () => Promise<void>;
  setConfirmError: (message: string | null) => void;
  returnUrl: string;
}

const CheckoutPaymentContext = createContext<CheckoutPaymentContextValue | null>(null);

const paymentInitializationPromises = new Map<string, Promise<string>>();
const paymentClientSecrets = new Map<string, string>();

export function useCheckoutPayment() {
  const context = useContext(CheckoutPaymentContext);

  if (!context) {
    throw new Error('useCheckoutPayment must be used within CheckoutPaymentProvider');
  }

  return context;
}

interface CheckoutPaymentProviderProps {
  children: ReactNode;
  billingFormId: string;
  initializePaymentAction: (formData: FormData) => Promise<{ clientSecret: string; snapshotId: string }>;
  prepareOrderConfirmationAction: (
    formData: FormData,
    stripeSessionId: string,
  ) => Promise<{ snapshotId: string }>;
  returnUrl: string;
  shippingReady: boolean;
}

export function CheckoutPaymentProvider({
  children,
  billingFormId,
  initializePaymentAction,
  prepareOrderConfirmationAction,
  returnUrl,
  shippingReady,
}: CheckoutPaymentProviderProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(
    () => paymentClientSecrets.get(billingFormId) ?? null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, startInitializing] = useTransition();
  const initializationAttemptedRef = useRef(
    paymentClientSecrets.has(billingFormId) || paymentInitializationPromises.has(billingFormId),
  );

  const commitClientSecret = useCallback(
    (secret: string) => {
      paymentClientSecrets.set(billingFormId, secret);
      setClientSecret(secret);
    },
    [billingFormId],
  );

  const initializeFromBillingForm = useCallback(async () => {
    const existingPromise = paymentInitializationPromises.get(billingFormId);

    if (existingPromise) {
      const existingSecret = await existingPromise;

      commitClientSecret(existingSecret);

      return existingSecret;
    }

    const initPromise = (async () => {
      const form = document.getElementById(billingFormId) as HTMLFormElement | null;

      if (!form) {
        throw new Error('Billing form not found');
      }

      const result = await initializePaymentAction(new FormData(form));

      commitClientSecret(result.clientSecret);

      return result.clientSecret;
    })();

    paymentInitializationPromises.set(billingFormId, initPromise);

    try {
      return await initPromise;
    } finally {
      paymentInitializationPromises.delete(billingFormId);
    }
  }, [billingFormId, commitClientSecret, initializePaymentAction]);

  useEffect(() => {
    if (!shippingReady || clientSecret || initializationAttemptedRef.current) {
      return;
    }

    initializationAttemptedRef.current = true;

    startInitializing(async () => {
      try {
        setErrorMessage(null);
        await initializeFromBillingForm();
      } catch (error) {
        initializationAttemptedRef.current = false;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load payment form');
      }
    });
  }, [clientSecret, initializeFromBillingForm, shippingReady]);

  const refreshPaymentIntent = useCallback(async () => {
    try {
      setErrorMessage(null);
      paymentInitializationPromises.delete(billingFormId);
      paymentClientSecrets.delete(billingFormId);
      initializationAttemptedRef.current = true;

      const nextClientSecret = await initializeFromBillingForm();

      commitClientSecret(nextClientSecret);

      return nextClientSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to prepare payment';

      setErrorMessage(message);
      throw error;
    }
  }, [billingFormId, commitClientSecret, initializeFromBillingForm]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted || !shippingReady) {
        return;
      }

      startInitializing(async () => {
        try {
          setErrorMessage(null);
          await refreshPaymentIntent();
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load payment form');
        }
      });
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [refreshPaymentIntent, shippingReady]);

  const prepareOrderConfirmation = useCallback(async () => {
    if (!clientSecret) {
      throw new Error('Payment is not ready yet');
    }

    const form = document.getElementById(billingFormId) as HTMLFormElement | null;

    if (!form) {
      throw new Error('Billing form not found');
    }

    const stripeSessionId = getStripeSessionIdFromClientSecret(clientSecret);

    await prepareOrderConfirmationAction(new FormData(form), stripeSessionId);
  }, [billingFormId, clientSecret, prepareOrderConfirmationAction]);

  const setConfirmError = useCallback((message: string | null) => {
    setErrorMessage(message);
  }, []);

  const contextValue = useMemo(
    () => ({
      billingFormId,
      clientSecret,
      errorMessage,
      isInitializing,
      refreshPaymentIntent,
      prepareOrderConfirmation,
      setConfirmError,
      returnUrl,
    }),
    [
      billingFormId,
      clientSecret,
      errorMessage,
      isInitializing,
      prepareOrderConfirmation,
      refreshPaymentIntent,
      returnUrl,
      setConfirmError,
    ],
  );

  return (
    <CheckoutPaymentContext.Provider value={contextValue}>
      {children}
    </CheckoutPaymentContext.Provider>
  );
}
