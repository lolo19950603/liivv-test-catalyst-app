'use server';

import { addKitToCart } from '~/lib/kit/add-kit-to-cart';
import { addToOrCreateCart } from '~/lib/cart';

import { CHAPTER_CART_BUNDLES } from '../chapter-cart';

/*
 * A chapter button names a bundle, and this action adds that bundle.
 * The form cannot send a product id. An unknown key is refused before any
 * cart call, so a tampered request cannot add an arbitrary product.
 */

export type ChapterAddState = { status: 'idle' } | { status: 'added'; key: string } | { status: 'error' };

export async function addChapterBundleToCart(
  _prev: ChapterAddState,
  formData: FormData,
): Promise<ChapterAddState> {
  const key = formData.get('bundle');
  const bundle = typeof key === 'string' ? CHAPTER_CART_BUNDLES[key] : undefined;

  if (!bundle) return { status: 'error' };

  try {
    if (bundle.kind === 'kit') {
      const result = await addKitToCart({
        kitName: bundle.kitName,
        items: bundle.lines.map((line) => ({
          productEntityId: line.productEntityId,
          variantEntityId: line.variantEntityId,
          quantity: 1,
          name: line.name,
          ...(line.sku ? { sku: line.sku } : {}),
        })),
      });

      if (result.status !== 'success') return { status: 'error' };

      return { status: 'added', key: bundle.key };
    }

    await addToOrCreateCart({
      lineItems: bundle.lines.map((line) => ({
        productEntityId: line.productEntityId,
        variantEntityId: line.variantEntityId,
        quantity: 1,
      })),
    });

    return { status: 'added', key: bundle.key };
  } catch {
    return { status: 'error' };
  }
}
