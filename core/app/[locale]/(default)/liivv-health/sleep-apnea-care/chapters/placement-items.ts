import 'server-only';

import { isRxMaskId } from '~/lib/catalog/cpap-masks';
import { isPapDeviceId } from '~/lib/catalog/prescription-devices';

import { getPlacementItems } from '../../_microsite/shop/get-placement-items';
import type { PlacementItems } from '../../_microsite/shop/types';
import { isPaediatricMask } from '../sa-ids';

import { namesAnotherRetailer, PLACEMENTS_ON } from './chapter-shop';

/*
 * The catalogue's answer for the products a Sleep page's shelves name
 * (./chapter-shop.ts), for the page locale: visible, purchasable and in stock
 * today, and with nothing in the description that names or leads to another
 * retailer (../../_microsite/shop/get-placement-items.ts).
 *
 * A complete mask is never a one-click add: its card links the product page,
 * where the CPAP prescription check is (ruling C26, "View product"). A
 * paediatric mask never reaches a Sleep shelf (C17: only a paediatric card
 * may carry one, and there is none yet; PAEDIATRIC_SHELF_CARDS in
 * ./chapter-shop.ts). A machine, or a bundle holding one, never does either
 * (N1), whatever the record names: the record is checked for both too
 * (`shelfRuleProblems`), and this is the safety net.
 *
 * `undefined` while placements are switched off (today: no product id is
 * approved), so the page renders with no ShopProvider at all.
 */
export async function getSleepPlacementItems(
  ids: readonly number[],
  locale: string,
): Promise<PlacementItems | undefined> {
  if (!PLACEMENTS_ON) return undefined;

  const items = await getPlacementItems(ids, locale, {
    /* No "from" wording on the Sleep pages yet: the price as the store gives it. */
    fromPrice: (price) => price,
    refuse: namesAnotherRetailer,
  });

  return Object.fromEntries(
    Object.entries(items)
      .filter(([, item]) => !isPaediatricMask(item.entityId) && !isPapDeviceId(item.entityId))
      .map(([id, item]) => [
        id,
        isRxMaskId(item.entityId) ? { ...item, oneClick: false, viewOnly: true } : item,
      ]),
  );
}
