'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { runCustomerAction } from '~/lib/action-gateway/session';
import { addKitToCart } from '~/lib/kit/add-kit-to-cart';
import {
  deleteSavedKit,
  getSavedKit,
  updateSavedKitName,
} from '~/lib/supabase/saved-kits-store';

type SavedKitMessages = {
  (key: 'Errors.unexpected' | 'Errors.notFound' | 'renameSuccess' | 'deleteSuccess'): string;
};

type SavedKitActionResult = { status: 'success' } | { status: 'error'; message: string };

async function getSavedKitMessages(): Promise<SavedKitMessages> {
  // Namespace typing can lag behind new message keys on large trees.
  return (await getTranslations('Account.SavedKits' as 'Account.Layout')) as unknown as SavedKitMessages;
}

export async function renameSavedKitAction(input: {
  kitId: string;
  name: string;
}): Promise<SavedKitActionResult> {
  const t = await getSavedKitMessages();

  return runCustomerAction({ result: { status: 'error', message: t('Errors.unexpected') } }, async (customer) => {
    const parsed = z
      .object({
        kitId: z.string().min(1),
        name: z.string().trim().min(1).max(200),
      })
      .safeParse(input);

    if (!parsed.success) {
      return { status: 'error', message: t('Errors.unexpected') };
    }

    const ok = await updateSavedKitName(String(customer.entityId), parsed.data.kitId, parsed.data.name);

    if (!ok) {
      return { status: 'error', message: t('Errors.notFound') };
    }

    revalidatePath('/account/wishlists');
    revalidatePath('/account/saved-kits');

    return { status: 'success' };
  });
}

export async function deleteSavedKitAction(kitId: string): Promise<SavedKitActionResult> {
  const t = await getSavedKitMessages();

  return runCustomerAction({ result: { status: 'error', message: t('Errors.unexpected') } }, async (customer) => {
    const parsed = z.string().min(1).safeParse(kitId);

    if (!parsed.success) {
      return { status: 'error', message: t('Errors.unexpected') };
    }

    const ok = await deleteSavedKit(String(customer.entityId), parsed.data);

    if (!ok) {
      return { status: 'error', message: t('Errors.notFound') };
    }

    revalidatePath('/account/wishlists');
    revalidatePath('/account/saved-kits');

    return { status: 'success' };
  });
}

export async function addSavedKitToCartAction(kitId: string): Promise<SavedKitActionResult> {
  const t = await getSavedKitMessages();

  return runCustomerAction({ result: { status: 'error', message: t('Errors.unexpected') } }, async (customer) => {
    const parsed = z.string().min(1).safeParse(kitId);

    if (!parsed.success) {
      return { status: 'error', message: t('Errors.unexpected') };
    }

    const kit = await getSavedKit(String(customer.entityId), parsed.data);

    if (!kit || kit.items.length === 0) {
      return { status: 'error', message: t('Errors.notFound') };
    }

    return addKitToCart({
      kitName: kit.source_kit_name ?? kit.name,
      items: kit.items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: item.quantity,
        name: item.name,
        ...(item.sku ? { sku: item.sku } : {}),
        ...(item.variantEntityId ? { variantEntityId: item.variantEntityId } : {}),
        ...(item.selectedOptions ? { selectedOptions: item.selectedOptions } : {}),
      })),
    });
  });
}
