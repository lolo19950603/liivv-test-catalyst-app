'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { getDashboardCustomer } from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { addKitToCart } from '~/lib/kit/add-kit-to-cart';
import {
  deleteSavedKit,
  getSavedKit,
  updateSavedKitName,
} from '~/lib/supabase/saved-kits-store';

type SavedKitMessages = {
  (key: 'Errors.unexpected' | 'Errors.notFound' | 'renameSuccess' | 'deleteSuccess'): string;
};

async function getSavedKitMessages(): Promise<SavedKitMessages> {
  // Namespace typing can lag behind new message keys on large trees.
  return (await getTranslations('Account.SavedKits' as 'Account.Layout')) as unknown as SavedKitMessages;
}

async function requireCustomerId(): Promise<string | null> {
  const customer = await getDashboardCustomer();

  return customer ? String(customer.entityId) : null;
}

export async function renameSavedKitAction(input: {
  kitId: string;
  name: string;
}): Promise<{ status: 'success' } | { status: 'error'; message: string }> {
  const t = await getSavedKitMessages();
  const parsed = z
    .object({
      kitId: z.string().min(1),
      name: z.string().trim().min(1).max(200),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const customerId = await requireCustomerId();

  if (!customerId) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const ok = await updateSavedKitName(customerId, parsed.data.kitId, parsed.data.name);

  if (!ok) {
    return { status: 'error', message: t('Errors.notFound') };
  }

  revalidatePath('/account/wishlists');
  revalidatePath('/account/saved-kits');

  return { status: 'success' };
}

export async function deleteSavedKitAction(
  kitId: string,
): Promise<{ status: 'success' } | { status: 'error'; message: string }> {
  const t = await getSavedKitMessages();
  const parsed = z.string().min(1).safeParse(kitId);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const customerId = await requireCustomerId();

  if (!customerId) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const ok = await deleteSavedKit(customerId, parsed.data);

  if (!ok) {
    return { status: 'error', message: t('Errors.notFound') };
  }

  revalidatePath('/account/wishlists');
  revalidatePath('/account/saved-kits');

  return { status: 'success' };
}

export async function addSavedKitToCartAction(
  kitId: string,
): Promise<{ status: 'success' } | { status: 'error'; message: string }> {
  const t = await getSavedKitMessages();
  const parsed = z.string().min(1).safeParse(kitId);

  if (!parsed.success) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const customerId = await requireCustomerId();

  if (!customerId) {
    return { status: 'error', message: t('Errors.unexpected') };
  }

  const kit = await getSavedKit(customerId, parsed.data);

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
}
