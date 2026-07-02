'use client';

import { useEffect, useRef, useState } from 'react';

import { CustomCheckoutSummarySection } from '@/vibes/soul/sections/custom-checkout';
import { waitForCheckoutSubscriptionMetadata } from '~/app/[locale]/(default)/checkout/_actions/subscription-metadata';
import { useRouter } from '~/i18n/routing';

import { CheckoutSummaryPanel } from './checkout-summary-panel';

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 400;

interface CheckoutSummaryGateProps {
  initialReady: boolean;
  loadingLabel: string;
  summarySections: CustomCheckoutSummarySection[];
  currencyCode?: string;
  labels: {
    shippingTitle: string;
    shippingEmpty: string;
    shippingSelect: string;
    shippingNoOptions: string;
    shippingUpdating: string;
  };
}

function CheckoutSummaryLoading({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="space-y-4 py-2"
    >
      <p className="text-sm text-[var(--contrast-500,hsl(var(--contrast-500)))]">{label}</p>
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-[var(--contrast-100,hsl(var(--contrast-100)))]" />
        <div className="h-16 animate-pulse rounded-2xl bg-[var(--contrast-100,hsl(var(--contrast-100)))]" />
      </div>
      <div className="space-y-2 border-t border-[var(--contrast-200,hsl(var(--contrast-200)))] pt-4">
        <div className="h-4 w-2/5 animate-pulse rounded bg-[var(--contrast-100,hsl(var(--contrast-100)))]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--contrast-100,hsl(var(--contrast-100)))]" />
      </div>
    </div>
  );
}

export function CheckoutSummaryGate({
  initialReady,
  loadingLabel,
  summarySections,
  currencyCode,
  labels,
}: CheckoutSummaryGateProps) {
  const router = useRouter();
  const [ready, setReady] = useState(initialReady);
  const pollInFlightRef = useRef(false);

  useEffect(() => {
    if (ready || pollInFlightRef.current) {
      return;
    }

    pollInFlightRef.current = true;
    let cancelled = false;

    void (async () => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && !cancelled; attempt += 1) {
        const result = await waitForCheckoutSubscriptionMetadata();

        if (result.ready) {
          setReady(true);
          router.refresh();
          break;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, POLL_INTERVAL_MS);
        });
      }

      if (!cancelled) {
        setReady(true);
      }

      pollInFlightRef.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, router]);

  if (!ready) {
    return <CheckoutSummaryLoading label={loadingLabel} />;
  }

  return (
    <CheckoutSummaryPanel
      currencyCode={currencyCode}
      labels={labels}
      summarySections={summarySections}
    />
  );
}
