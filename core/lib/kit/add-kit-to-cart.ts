'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';
import { appendKitToSession, generateKitId } from '~/lib/kit';
import { kitItemSchema } from '~/lib/kit/kit-item-schema';

const addKitSchema = z.object({
  kitName: z.string().optional(),
  kitHref: z.string().optional(),
  kitImage: z
    .object({
      src: z.string().min(1),
      alt: z.string(),
    })
    .optional(),
  /** Number of complete kits to add. Item quantities stay per-kit (recipe). */
  quantity: z.number().int().positive().optional(),
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
  const t = (await getTranslations('Faceted.CuratedKit')) as unknown as KitMessages;
  const parsed = addKitSchema.safeParse(input);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.emptyKit') };
  }

  const kitId = generateKitId();
  const { items, kitName, kitHref, kitImage } = parsed.data;
  const kitQuantity = parsed.data.quantity && parsed.data.quantity > 0 ? parsed.data.quantity : 1;

  try {
    const result = await addToOrCreateCart({
      lineItems: items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity * kitQuantity,
        ...(item.variantEntityId ? { variantEntityId: item.variantEntityId } : {}),
        ...(item.selectedOptions ? { selectedOptions: item.selectedOptions } : {}),
      })),
    });

    await appendKitToSession(result.cartId, {
      kitId,
      quantity: kitQuantity,
      ...(kitName ? { name: kitName } : {}),
      ...(kitHref ? { href: kitHref } : {}),
      ...(kitImage ? { image: kitImage } : {}),
      items: items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        name: item.name,
        ...(item.sku ? { sku: item.sku } : {}),
        ...(item.variantEntityId ? { variantEntityId: item.variantEntityId } : {}),
        ...(item.selectedOptions ? { selectedOptions: item.selectedOptions } : {}),
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

  return { status: 'success' };
}
