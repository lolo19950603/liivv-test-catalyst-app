'use server';

import { getLocale, getTranslations } from 'next-intl/server';

import { redirect } from '~/i18n/routing';
import { addToOrCreateCart } from '~/lib/cart';
import { prescriptionDeviceIds } from '~/lib/catalog/view-only';
import { partitionViewOnly } from '~/lib/catalog/view-only-rules';
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

  /*
   * A reorder never adds a prescription device, or a kit holding one (never
   * bought online; owner approval, 2026-10-12). Insulin and glucagon are
   * reordered like anything else (owner decision, 2026-10-13): a pharmacist
   * reviews every insulin and glucagon order, and the checkout still refuses
   * insulin to a Quebec address. Device lines are held back and named, and
   * the rest are added. Fails closed: if the catalogue cannot answer, every
   * line is held.
   */
  const { allowed, held } = partitionViewOnly(
    lines,
    (line) => line.input.productEntityId,
    await prescriptionDeviceIds(lines.map((line) => line.input.productEntityId)),
  );
  // Read on the server: CareNotices is not in the browser's message bundle.
  const care = await getTranslations('CareNotices.reorder');
  const heldMessage =
    held.length > 0 ? care('held', { names: held.map((line) => line.name).join(', ') }) : '';
  const withHeld = (message: string) => [message, heldMessage].filter(Boolean).join(' ');

  if (allowed.length === 0) {
    return { message: heldMessage };
  }

  const { added, skipped } = await allowed.reduce<Promise<{ added: number; skipped: string[] }>>(
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

  if (skipped.length === 0 && held.length === 0) {
    const locale = await getLocale();

    redirect({ href: '/cart', locale });
  }

  if (added === 0) {
    return { message: withHeld(t('reorderFailed', { names: skipped.join(', ') })) };
  }

  if (skipped.length === 0) {
    return { message: withHeld(care('added', { added })), cartHref: '/cart' };
  }

  return {
    message: withHeld(t('reorderPartial', { added, names: skipped.join(', ') })),
    cartHref: '/cart',
  };
}
