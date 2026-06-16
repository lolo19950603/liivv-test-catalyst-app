'use client';

import { useEffect, useRef } from 'react';

import { quoteAllCheckoutSectionShipping } from '~/app/[locale]/(default)/checkout/_actions/section-shipping';
import { useRouter } from '~/i18n/routing';

export function CheckoutSectionShippingQuoter({
  needsQuote,
  quoteKey,
}: {
  needsQuote: boolean;
  quoteKey?: string;
}) {
  const router = useRouter();
  const quoteInFlightRef = useRef(false);
  const lastAttemptedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    lastAttemptedKeyRef.current = null;
  }, [quoteKey]);

  useEffect(() => {
    if (!needsQuote || !quoteKey || quoteInFlightRef.current) {
      return;
    }

    if (lastAttemptedKeyRef.current === quoteKey) {
      return;
    }

    quoteInFlightRef.current = true;
    lastAttemptedKeyRef.current = quoteKey;

    void (async () => {
      try {
        await quoteAllCheckoutSectionShipping();
      } finally {
        quoteInFlightRef.current = false;
        router.refresh();
      }
    })();
  }, [needsQuote, quoteKey, router]);

  return null;
}
