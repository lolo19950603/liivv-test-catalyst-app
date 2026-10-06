/*
 * How a Shop Diabetes Care product is filed on the landing's shelf preview.
 *
 * Read from the product's name, as the landing has always done it, until the
 * server-side rooms exist (D16 in the copy record). Kits are not a room: a
 * listed kit is filed under Kits by the page, whatever its name says.
 *
 * Insulin and glucagon have their own room, since operations confirmed that a
 * pharmacist reviews and dispenses every order (E4 and E5,
 * `insulinReviewConfirmed` in ./landing-meta.ts), and each of their tiles
 * carries the notice. The /fr preview leaves them out (./page.tsx), and they
 * stay in the full shop. Supplies that carry the word "insulin" — pen
 * needles, syringes, cooling wallets, pump accessories — are not insulin and
 * keep their rooms.
 */

import type { SHOP_ROOMS } from './landing-meta';

export type ShopRoom = Exclude<(typeof SHOP_ROOMS)[number], 'all' | 'kits'>;

/* Insulins sold in Canada, by brand or by generic name, and the glucagons. */
const INSULIN_OR_GLUCAGON_NAME =
  /\b(admelog|apidra|basaglar|fiasp|humalog|humulin|kirsty|lantus|levemir|lyumjev|novolin|novorapid|ryzodeg|semglee|soliqua|toujeo|tresiba|trurapi|xultophy|baqsimi|gvoke|zegalogue)\b|insulin(e)? (aspart|asparte|glargine|lispro|degludec|détémir|detemir)|glucagon/i;

const SENSOR_NAME = /dexcom|libre|\bcgm\b|sensor|capteur|guardian|simplera/i;
const PUMP_NAME =
  /pump|pompe|infusion|reservoir|réservoir|paradigm|minimed|t:slim|t:lock|tandem|ypsopump|quick-set|\bmio\b|omnipod/i;
const METER_NAME =
  /meter|lecteur|strip|bandelette|lancet|lancette|onetouch|one touch|verio|contour|accu-chek|glucometer|freestyle lite|freestyle precision/i;
const INJECTION_NAME = /syringe|seringue|needle|aiguille|pen ?tip|pentips|inject/i;
const OVERLAY_NAME = /overlay|patch/i;

/* Whether this product is an insulin or a glucagon: its own room, with the review notice. */
export function isInsulinOrGlucagonName(name: string): boolean {
  return INSULIN_OR_GLUCAGON_NAME.test(name);
}

/*
 * The room a product's name puts it in. An insulin or a glucagon is read
 * first, then sensors and pumps, so a sensor's own name or a pump's wins over
 * the word "patch" or "needle" in it; a FreeStyle meter, strip or lancet is a
 * meter, and only FreeStyle Libre is a sensor.
 */
export function roomForProductName(name: string): ShopRoom {
  if (isInsulinOrGlucagonName(name)) return 'insulin';
  if (SENSOR_NAME.test(name)) return 'sensors';
  if (PUMP_NAME.test(name)) return 'pump';
  if (METER_NAME.test(name) || /freestyle/i.test(name)) return 'meters';
  if (INJECTION_NAME.test(name)) return 'injection';
  if (OVERLAY_NAME.test(name)) return 'sensors';

  return 'accessories';
}
