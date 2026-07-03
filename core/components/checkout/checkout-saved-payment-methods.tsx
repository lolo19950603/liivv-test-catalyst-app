'use client';

import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import type { SavedPaymentMethod } from '~/lib/stripe/payment-methods';

export type CheckoutPaymentMode = 'saved' | 'new';

interface CheckoutSavedPaymentMethodsProps {
  savedPaymentMethods: SavedPaymentMethod[];
  selectedPaymentMethodId: string;
  paymentMode: CheckoutPaymentMode;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  onSelectPaymentMode: (mode: CheckoutPaymentMode) => void;
  addPaymentMethodLabel: string;
  defaultBadgeLabel: string;
}

export function CheckoutSavedPaymentMethods({
  savedPaymentMethods,
  selectedPaymentMethodId,
  paymentMode,
  onSelectPaymentMethod,
  onSelectPaymentMode,
  addPaymentMethodLabel,
  defaultBadgeLabel,
}: CheckoutSavedPaymentMethodsProps) {
  if (savedPaymentMethods.length === 0) {
    return null;
  }

  return (
    <div className="checkout-saved-payment-methods space-y-1">
      <div className="checkout-saved-payment-methods__list max-h-64 space-y-1 overflow-y-auto pr-1">
        {savedPaymentMethods.map((paymentMethod) => {
          const isSelected = paymentMode === 'saved' && selectedPaymentMethodId === paymentMethod.id;

          return (
            <label
              className={clsx(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors',
                isSelected
                  ? 'border-[var(--primary,hsl(var(--primary)))] bg-[var(--primary,hsl(var(--primary)))]/5'
                  : 'border-transparent hover:bg-[var(--contrast-50,hsl(var(--contrast-50)))]',
              )}
              key={paymentMethod.id}
            >
              <input
                checked={isSelected}
                className="mt-0.5"
                name="checkout-payment-method"
                onChange={() => {
                  onSelectPaymentMode('saved');
                  onSelectPaymentMethod(paymentMethod.id);
                }}
                type="radio"
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--foreground,hsl(var(--foreground)))]">
                    {paymentMethod.label}
                  </span>
                  {paymentMethod.isDefault ? <Badge>{defaultBadgeLabel}</Badge> : null}
                </span>
                <span className="mt-0.5 block text-[var(--contrast-500,hsl(var(--contrast-500)))]">
                  {paymentMethod.expiryLabel}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <label
        className={clsx(
          'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors',
          paymentMode === 'new'
            ? 'border-[var(--primary,hsl(var(--primary)))] bg-[var(--primary,hsl(var(--primary)))]/5'
            : 'border-transparent hover:bg-[var(--contrast-50,hsl(var(--contrast-50)))]',
        )}
      >
        <input
          checked={paymentMode === 'new'}
          className="mt-0.5"
          name="checkout-payment-method"
          onChange={() => onSelectPaymentMode('new')}
          type="radio"
        />
        <span className="text-sm font-medium text-[var(--primary,hsl(var(--primary)))]">
          {addPaymentMethodLabel}
        </span>
      </label>
    </div>
  );
}
