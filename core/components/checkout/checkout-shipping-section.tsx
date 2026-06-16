'use client';

import { ComponentProps, useCallback } from 'react';

import { ShippingForm, type ShippingFormState } from '@/vibes/soul/sections/cart/shipping-form';
import { useRouter } from '~/i18n/routing';

type ShippingFormProps = ComponentProps<typeof ShippingForm>;

interface CheckoutShippingSectionProps extends Omit<ShippingFormProps, 'action'> {
  action: (prevState: ShippingFormState, formData: FormData) => Promise<ShippingFormState>;
}

export function CheckoutShippingSection({ action, ...props }: CheckoutShippingSectionProps) {
  const router = useRouter();

  const handleAction = useCallback(
    async (prevState: ShippingFormState, formData: FormData) => {
      const result = await action(prevState, formData);

      if (result.lastResult?.status === 'success') {
        router.refresh();
      }

      return result;
    },
    [action, router],
  );

  return <ShippingForm {...props} action={handleAction} />;
}
