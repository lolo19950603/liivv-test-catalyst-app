import 'server-only';

import { getTranslations } from 'next-intl/server';

import { getPlacementItems } from '../../_microsite/shop/get-placement-items';
import type { PlacementItem, PlacementItems } from '../../_microsite/shop/types';
import { isGlucagonProduct } from '../dc-ids';
import { isInsulinOrGlucagonName } from '../shop-classify';

import { namesAnotherRetailer, PLACEMENTS_ON } from './chapter-shop';

/*
 * The catalogue's answer for the products a Diabetes page's shelves name
 * (./chapter-shop.ts), for the page locale: visible, purchasable and in stock
 * today, and with nothing in the description that names or leads to another
 * retailer (../../_microsite/shop/get-placement-items.ts).
 *
 * On /fr anything that is insulin is dropped as well, whatever the record
 * says: insulin may not be advertised to Quebec (owner answer B11). The record
 * names no insulin product, so this is the second lock, not the first.
 *
 * Insulin and glucagon are never a one-click add from a shelf (owner note 9,
 * 2026-10-07): such a card links its product page, where the pharmacist
 * notice is ("View product"), as every other listing does. Staying Safe
 * card 3's glucagon (Baqsimi) is the one placed today.
 *
 * `undefined` while placements are switched off, so the page renders with no
 * ShopProvider at all.
 */
export async function getDiabetesPlacementItems(
  ids: readonly number[],
  locale: string,
): Promise<PlacementItems | undefined> {
  if (!PLACEMENTS_ON) return undefined;

  const shopT = await getTranslations({ locale, namespace: 'DiabetesCare.ui.landingPage.shop' });
  const items = await getPlacementItems(ids, locale, {
    fromPrice: (price) => shopT('fromPrice', { price }),
    refuse: namesAnotherRetailer,
  });

  const viewOnly = (item: PlacementItem) =>
    isGlucagonProduct(item.entityId) || isInsulinOrGlucagonName(item.name);
  const marked: PlacementItems = Object.fromEntries(
    Object.entries(items).map(([id, item]) => [
      id,
      viewOnly(item) ? { ...item, oneClick: false, viewOnly: true } : item,
    ]),
  );

  if (locale !== 'fr') return marked;

  return Object.fromEntries(
    Object.entries(marked).filter(
      ([, item]) => !isInsulinOrGlucagonName(item.name) || isGlucagonProduct(item.entityId),
    ),
  );
}
