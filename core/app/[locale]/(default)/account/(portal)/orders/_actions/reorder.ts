'use server';

import { getLocale, getTranslations } from 'next-intl/server';

import { redirect } from '~/i18n/routing';
import { addToOrCreateCart } from '~/lib/cart';
import { toReorderCartLines } from '~/lib/orders/reorder-line-items';

import { getReorderOrderLines } from './reorder-order';

interface ReorderState {
  message?: string;
  cartHref?: string;
}

export async function reorderOrder(
  _prevState: ReorderState,
  formData: FormData,
): Promise<ReorderState> {
  const t = await getTranslations('Account.Orders');
  const orderId = Number(formData.get('orderId'));

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return { message: t('reorderError') };
  }

  let sourceLines;

  try {
    sourceLines = await getReorderOrderLines(orderId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return { message: t('reorderError') };
  }

  if (!sourceLines) {
    return { message: t('reorderError') };
  }

  const lines = toReorderCartLines(sourceLines);

  if (lines.length === 0) {
    return { message: t('reorderEmpty') };
  }

  const { added, skipped } = await lines.reduce<Promise<{ added: number; skipped: string[] }>>(
    async (previous, line) => {
      const current = await previous;

      try {
        await addToOrCreateCart({ lineItems: [line.input] });

        return { added: current.added + 1, skipped: current.skipped };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        return { added: current.added, skipped: [...current.skipped, line.name] };
      }
    },
    Promise.resolve({ added: 0, skipped: [] }),
  );

  if (skipped.length === 0) {
    const locale = await getLocale();

    redirect({ href: '/cart', locale });
  }

  if (added === 0) {
    return { message: t('reorderFailed', { names: skipped.join(', ') }) };
  }

  return {
    message: t('reorderPartial', { added, names: skipped.join(', ') }),
    cartHref: '/cart',
  };
}
