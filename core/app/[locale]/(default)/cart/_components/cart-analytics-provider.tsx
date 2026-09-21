'use client';

import { PropsWithChildren, Suspense } from 'react';
import { z } from 'zod';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { EventsProvider } from '~/components/analytics/events';
import { useAnalytics } from '~/lib/analytics/react';

interface AddToCartContext {
  entityId: string;
  id: number;
  name: string;
  brand: string;
  sku?: string;
  currency: string;
  price: number;
  /** Naming this product would reveal something about a person's health. */
  sensitive?: boolean;
}

const AddToCartSchema = z.object({
  id: z.string(),
  quantity: z.number({ coerce: true }).default(1),
});

export function CartAnalyticsProvider(
  props: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>,
) {
  return (
    <Suspense fallback={props.children}>
      <CartAnalyticsProviderResolved {...props} />
    </Suspense>
  );
}

function CartAnalyticsProviderResolved({
  children,
  data,
}: PropsWithChildren<{ data: Streamable<AddToCartContext[]> }>) {
  const analytics = useAnalytics();
  const products = useStreamable(data);

  const onAddToCart = (payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { id, quantity } = parsedPayload.data;

      const product = products.find(({ entityId }) => entityId === id);

      if (product) {
        const { id: productId, name, brand, sku, price, currency, sensitive } = product;

        analytics?.cart.productAdded({
          currency,
          value: quantity * price,
          items: [
            {
              id: productId.toString(),
              name,
              brand,
              sku,
              price,
              quantity,
              sensitive,
            },
          ],
        });
      }
    }
  };

  const onRemoveFromCart = (payload?: FormData) => {
    const parsedPayload = AddToCartSchema.safeParse(Object.fromEntries(payload?.entries() ?? []));

    if (parsedPayload.success) {
      const { id, quantity } = parsedPayload.data;

      const product = products.find(({ entityId }) => entityId === id);

      if (product) {
        const { id: productId, name, brand, sku, price, currency, sensitive } = product;

        analytics?.cart.productRemoved({
          currency,
          value: quantity * price,
          items: [
            {
              id: productId.toString(),
              name,
              brand,
              sku,
              price,
              quantity,
              sensitive,
            },
          ],
        });
      }
    }
  };

  return (
    <EventsProvider onAddToCart={onAddToCart} onRemoveFromCart={onRemoveFromCart}>
      {children}
    </EventsProvider>
  );
}
