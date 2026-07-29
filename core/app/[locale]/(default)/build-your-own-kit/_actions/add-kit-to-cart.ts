'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';
import { appendKitToSession, generateKitId } from '~/lib/kit';
import { serverToast } from '~/lib/server-toast';

const kitItemSchema = z.object({
  productEntityId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  name: z.string().min(1),
  sku: z.string().optional(),
});

const addKitSchema = z.object({
  items: z.array(kitItemSchema).min(1),
});

export type AddKitToCartInput = z.infer<typeof addKitSchema>;

export type AddKitToCartResult =
  | { status: 'success' }
  | { status: 'error'; message: string };

type KitMessages = {
  (key: 'Errors.emptyKit' | 'Errors.missingCart' | 'Errors.addFailed' | 'Errors.unexpected'): string;
  (key: 'successMessage', values: { kitId: string }): string;
};

export async function addKitToCart(input: AddKitToCartInput): Promise<AddKitToCartResult> {
  // Namespace typing hits TS depth limits on this large messages tree; cast is intentional.
  const t = (await getTranslations('Faceted.BuildYourOwnKit')) as unknown as KitMessages;
  const parsed = addKitSchema.safeParse(input);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.emptyKit') };
  }

  const kitId = generateKitId();
  const { items } = parsed.data;

  try {
    const result = await addToOrCreateCart({
      lineItems: items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
      })),
    });

    await appendKitToSession(result.cartId, {
      kitId,
      items: items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        name: item.name,
        ...(item.sku ? { sku: item.sku } : {}),
      })),
    });
  } catch (error) {
    if (error instanceof MissingCartError) {
      return { status: 'error', message: t('Errors.missingCart') };
    }

    if (error instanceof BigCommerceGQLError) {
      return { status: 'error', message: t('Errors.addFailed') };
    }

    return { status: 'error', message: t('Errors.unexpected') };
  }

  await serverToast.success(t('successMessage', { kitId }));
  redirect('/cart');

  return { status: 'success' };
}
