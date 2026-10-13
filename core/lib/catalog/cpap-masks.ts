/*
 * =============================================================================
 * COMPLETE CPAP MASKS: A PRESCRIPTION A LIIVV PHARMACIST VALIDATES
 * =============================================================================
 * Owner ruling C26, option (b), 2026-10-13: parts for a mask the customer
 * already has stay one-click (cushions, pillows, headgear, frames, tubing,
 * filters, water chambers, clips). A COMPLETE mask needs a CPAP prescription
 * that a Liivv pharmacist validates: fit packs, starter packs, complete
 * systems, value packs with a mask, and kits holding one. The pharmacist signs
 * off every complete-mask order, even with a prescription on file. "Get
 * prescription from your doctor or healthcare provider for your CPAP therapy
 * equipment and your settings" (MyHealth.Alberta.ca, Buyer's Information for
 * CPAP Therapy Equipment).
 *
 * This file answers one question: is this product a complete mask, and is it
 * a child's? The rule fails closed, checked in this order:
 *
 *   1. machine  a prescription device (./prescription-devices.ts) stays a
 *               device, never a mask: the machine-and-mask bundles are
 *               refused outright, a stricter rule.
 *   2. register RX_MASK_IDS: the 75 visible complete masks and the 9 hidden
 *               discontinued ones, each read from the BigCommerce catalogue on
 *               2026-10-13 (scratchpad rulings/c26-table.md).
 *   3. reviewed CPAP_PART_IDS (one-click parts) and NOT_RX_MASK_IDS (reviewed,
 *               not masks).
 *   4. shelf    any other product on 1120 Full Face, 1128 Nasal Pillow or
 *               1136 Nasal Masks (or on their parent, 1048 CPAP Masks) is a
 *               complete mask, logged once.
 *   5. name     a name with "mask" and "complete system", "fit pack",
 *               "starter pack", "starter kit", "all-in-one" or "mask system"
 *               is a complete mask, logged once.
 *   6. kit      a curated kit holding a complete mask is one (`components`).
 *
 * Shelf 1142 Mask Parts & Accessories alone never makes a product a part:
 * 4895, a complete total-face mask, is filed there, and the register catches
 * it.
 *
 * What a complete mask is then denied is in ./view-only-rules.ts (no one-click
 * add from a listing, a kit search or the assistant; no Subscribe & save) and
 * ~/lib/checkout/checkout-gates.ts (no payment without an approved, in-date
 * CPAP prescription). What its page says is in ./care-notices.ts.
 *
 * No fetching and no server-only code, so the unit tests and any client
 * module can import it.
 * =============================================================================
 */

import { type DeviceCheckProduct, prescriptionDeviceKindOf } from './prescription-devices';

/** A complete mask for an adult, or one made for a child. */
export type RxMaskKind = 'adult' | 'paediatric';

/*
 * Every complete mask in the catalogue, read 2026-10-13, with its shelf.
 * 'paediatric': the listing says the mask is for children (4210, 4543, 4713).
 */
export const RX_MASK_IDS: Readonly<Record<number, RxMaskKind>> = {
  4210: 'paediatric', // Respironics Wisp Pediatric Nasal CPAP Mask System (1136)
  4216: 'adult', // Fisher & Paykel Evora Full Face CPAP Mask - Fit Pack (1120)
  4229: 'adult', // Resmed AirTouch F30i Comfort Full Face CPAP Mask - Complete System (1120)
  4233: 'adult', // ResMed Mirage Quattro Full Face CPAP Mask - Complete System (1120)
  4241: 'adult', // ResMed AirTouch F20 Full Face CPAP Mask - Complete System (1120)
  4248: 'adult', // Respironics DreamWear Under the Nose Nasal - FitPack (1136)
  4281: 'adult', // ResMed N20 AirFit & AirTouch All-In-One Mask (1136)
  4291: 'adult', // ResMed Swift FX Bella Gray Nasal Pillows CPAP Mask - Fit Pack (1128)
  4294: 'adult', // Fisher & Paykel FlexiFit 432 Full Face CPAP Mask System (1120)
  4306: 'adult', // Fisher & Paykel Brevida Nasal Pillow CPAP Mask - FitPack (1128)
  4319: 'adult', // ResMed AirFit F20 Full Face Mask with Spare Cushion, Tubing and Mask Wipes (1120)
  4320: 'adult', // Respironics DreamWear Full Face CPAP Mask - Fit Pack (1120)
  4343: 'adult', // Fisher & Paykel FlexiFit 431 Full Face CPAP Mask - Fit Pack (1120)
  4352: 'adult', // ResMed AirFit P30i Nasal Pillow CPAP Mask - Starter Pack (1128)
  4373: 'adult', // ResMed Swift FX for Her Nasal Pillows CPAP Mask - Fit Pack (1128)
  4374: 'adult', // Respironics DreamWear Full Face CPAP Mask - Complete System (1120)
  4386: 'adult', // ResMed Mirage FX Nasal CPAP Mask - Complete System (1136)
  4393: 'adult', // Yuwell Breathwear YF-06 Full Face CPAP Mask - Fit pack (1120)
  4408: 'adult', // ResMed AirFit F20 For Her Full Face CPAP Mask - Complete System (1120)
  4410: 'adult', // Respironics Amara Full Face CPAP Mask with Silicone Cushion (1120)
  4419: 'adult', // ResMed AirFit N30 Nasal CPAP Mask - Complete System FitPack (1136)
  4443: 'adult', // Respironics DreamWear Under the Nose Nasal CPAP Mask - Starter Kit (1136)
  4444: 'adult', // ResMed AirFit P10 Nasal Pillow CPAP Mask - Fit Pack (1128)
  4449: 'adult', // ResMed AirFit F20 NON-MAGNETIC Full Face CPAP Mask - Complete System (1120)
  4462: 'adult', // Fisher & Paykel Opus 360 Nasal Pillow CPAP Mask (1128)
  4472: 'adult', // Respironics ComfortGel Blue Nasal CPAP Mask - Complete System (1136)
  4475: 'adult', // ResMed Quattro Air Full Face CPAP Mask - Complete System (1120)
  4483: 'adult', // ResMed AirTouch F20 For Her Full Face CPAP Mask - Complete System (1120)
  4489: 'adult', // ResMed AirFit F40 Full Face CPAP Mask - Complete System (1120)
  4493: 'adult', // ResMed Mirage FX for Her Nasal CPAP Mask - Complete System (1136)
  4495: 'adult', // Yuwell Breathwear YN-06 Nasal CPAP Mask - Fit pack (1136)
  4515: 'adult', // Yuwell Breathewear YP-06 Nasal Pillow CPAP Mask - Fit Pack (1128)
  4522: 'adult', // Fisher & Paykel Eson 2 Nasal CPAP Mask - Complete System (1136)
  4533: 'adult', // ResMed AirFit F30i NON-MAGNETIC Full Face CPAP Mask - Complete System (1120)
  4543: 'paediatric', // ResMed Pixi Pediatric Nasal CPAP Mask - Complete System (1136)
  4545: 'adult', // ResMed AirFit P10 Nasal Pillow Mask with Spare Pillow, Tubing and Mask Wipes (1128)
  4546: 'adult', // ResMed AirTouch N20 Nasal CPAP Mask - Complete System (1136)
  4550: 'adult', // Fisher & Paykel Vitera Full Face CPAP Mask - Complete System (1120)
  4570: 'adult', // Fisher & Paykel Zest Nasal CPAP Mask - Complete System (1136)
  4580: 'adult', // ResMed AirFit N30i Nasal CPAP Mask - Starter Pack (1136)
  4585: 'adult', // ResMed AirFit F20 Full Face CPAP Mask - Complete System (1120)
  4603: 'adult', // Respironics DreamWear Nasal Pillows CPAP Mask - Starter Pack (1128)
  4620: 'adult', // ResMed AirTouch N30i Nasal CPAP Mask - Starter Pack (1136)
  4622: 'adult', // Fisher & Paykel Nova Micro Nasal Pillows CPAP Mask (1128)
  4624: 'adult', // ResMed AirTouch N20 For Her Nasal CPAP Mask - Complete System (1136)
  4648: 'adult', // Fisher & Paykel Nova Micro Nasal Pillows CPAP Mask - Fit Pack (1128)
  4659: 'adult', // Respironics DreamWear Under the Nose Nasal CPAP Mask (1136)
  4679: 'adult', // Fisher & Paykel Evora Nasal CPAP Mask System (1136)
  4681: 'adult', // ResMed Swift FX Nasal Pillows CPAP Mask - FitPack (1128)
  4682: 'adult', // Fisher & Paykel Pilairo Q Nasal Pillows CPAP Mask with Headgears - FitPack (1128)
  4713: 'paediatric', // ResMed Mirage Kidsta Nasal CPAP Mask - Complete System (1136)
  4749: 'adult', // ResMed AirFit N20 For Her Nasal CPAP Mask - Complete System (1136)
  4763: 'adult', // Fisher & Paykel Forma Full Face CPAP Mask System (1120)
  4771: 'adult', // Fisher & Paykel Eson Nasal CPAP Mask - Complete System (1136)
  4782: 'adult', // ResMed AirFit N30 Nasal CPAP Mask - Complete System (1136)
  4789: 'adult', // Respironics Nuance Pro Gel Nasal Pillow CPAP Mask - Complete System (1128)
  4822: 'adult', // Fisher & Paykel Solo Nasal CPAP Mask - Fit Pack (1136)
  4830: 'adult', // ResMed AirFit P10 for Her Nasal Pillow CPAP Mask - Fit Pack (1128)
  4833: 'adult', // ResMed AirFit N20 Nasal CPAP Mask - Complete System (1136)
  4884: 'adult', // ResMed AirFit X30i Full Face Oral CPAP Mask - Starter Pack (1120)
  4895: 'adult', // Respironics FitLife Total Face CPAP Mask - Complete System (1142, misfiled)
  4929: 'adult', // ResMed Swift FX Bella Nasal Pillow CPAP Mask - FitPack (1128)
  4932: 'adult', // Respironics Amara View Full Face CPAP Mask - Complete System (1120)
  4944: 'adult', // ResMed F20 AirFit & AirTouch All-In-One Mask (1120)
  4952: 'adult', // Respironics Wisp Nasal CPAP Mask - Fit Pack (1136)
  4955: 'adult', // ResMed AirFit F30i Full Face CPAP Mask - Complete System (1120)
  4960: 'adult', // Fisher & Paykel Evora Nasal CPAP Mask - FitPack (1136)
  4969: 'adult', // Fisher & Paykel Evora Full Face CPAP Mask (1120)
  4970: 'adult', // Respironics Pico Nasal CPAP Mask - FitPack (1136)
  4985: 'adult', // Fisher & Paykel Solo Nasal Pillow CPAP Mask - Fit Pack (1128)
  4997: 'adult', // ResMed Quattro Air for Her Full Face CPAP Mask - Complete System (1120)
  5024: 'adult', // Fisher & Paykel Zest Q Nasal CPAP Mask System (1136)
  5027: 'adult', // Respironics DreamWear Nasal Pillows System - FitPack (1128)
  5055: 'adult', // Fisher & Paykel Simplus Full Face CPAP Mask - Complete System (1120)
  5056: 'adult', // Fisher & Paykel Nova Nasal CPAP Mask - FitPack (1136, stock 0)
  // Hidden in the store (discontinued), registered so a re-shown one is caught.
  4377: 'adult', // Respironics DreamWisp Nasal FitPack - DISCONTINUED (1136)
  4389: 'adult', // ResMed Ultra Mirage II Nasal Mask - DISCONTINUED (1136)
  4447: 'adult', // ResMed Mirage Activa LT Nasal CPAP Mask - DISCONTINUED (1136)
  4478: 'adult', // ResMed AirFit F30 Full Face CPAP Mask Complete System - DISCONTINUED (1120)
  4584: 'adult', // ResMed Quattro FX for Her Full Face CPAP Mask - DISCONTINUED (1120)
  4807: 'adult', // ResMed Quattro FX Full Face CPAP Mask - DISCONTINUED (1120)
  4810: 'adult', // ResMed AirFit F10 Full Face CPAP Mask - DISCONTINUED (1120)
  4950: 'adult', // ResMed AirFit F10 for Her Full Face CPAP Mask - DISCONTINUED (1120)
  5023: 'adult', // Respironics Amara Full Face CPAP Mask with Gel Cushion - DISCONTINUED (1120)
};

/*
 * Reviewed parts for a mask the customer already has: one-click, no
 * prescription check. Read 2026-10-13:
 *   4232  Nasal Pillow for RespCare Aloha Nasal Pillow CPAP Mask - Large
 *         ("1 x large nasal pillow cushion"; filed under 1128)
 */
export const CPAP_PART_IDS: readonly number[] = [4232];

/*
 * Reviewed, not masks and not mask parts, so no check. Read 2026-10-13:
 *   4416  ZephAir CPAP Hose Connector for ResMed AirMini (machine-side, 1087)
 *   7999  MedPro Defense Cleansing Wipes for CPAP & Nebulizer Masks (1087)
 *   4265  CPAP Compliance Report – ResMed AirSense 10 & 11 (1068, hidden)
 */
export const NOT_RX_MASK_IDS: readonly number[] = [4416, 7999, 4265];

/*
 * The mask shelves a product is a complete mask on, unless reviewed otherwise.
 * 1048 is their parent, CPAP Masks: no product was filed on it directly on
 * 2026-10-13, so one filed there later is a complete mask until reviewed
 * (fails closed). 1142 Mask Parts & Accessories is never one of them.
 */
export const RX_MASK_CATEGORY_IDS: readonly number[] = [
  1048, // CPAP Masks (the parent shelf)
  1120, // Full Face Masks
  1128, // Nasal Pillow Masks
  1136, // Nasal Masks
];

/*
 * The name rule: "mask" and a word that says the box holds the whole mask.
 * "fit ?pack" covers "Fit Pack", "FitPack" and "Fit pack".
 */
const MASK_WORD = /\bmasks?\b/i;
const COMPLETE_WORDS =
  /complete system|fit ?pack|starter pack|starter kit|all-in-one|all in one|mask system/i;

/* Whether a product's name says it is a complete mask, by the rule above. */
export function matchesRxMaskNameRule(name: string | null | undefined): boolean {
  return Boolean(name && MASK_WORD.test(name) && COMPLETE_WORDS.test(name));
}

/* A child's mask found by its shelf or name alone: the listing says so. */
const PAEDIATRIC_NAME = /p(a)?ediatric|\bkids?\b|kidsta|\bchild(ren)?\b|\bpixi\b/i;

function kindFromName(name: string | null | undefined): RxMaskKind {
  return name && PAEDIATRIC_NAME.test(name) ? 'paediatric' : 'adult';
}

const warned = new Set<number>();

/* Logs, once per product per process, a complete mask the register does not name. */
function warnUnregistered(entityId: number, name: string | null | undefined, why: string) {
  if (warned.has(entityId)) {
    return;
  }

  warned.add(entityId);
  // eslint-disable-next-line no-console
  console.warn(
    `[cpap-masks] ${entityId} "${name ?? ''}" is treated as a complete CPAP mask (${why}) but is not in RX_MASK_IDS. Review it and add it to the register, CPAP_PART_IDS or NOT_RX_MASK_IDS.`,
  );
}

export type RxMaskCheckProduct = DeviceCheckProduct;

/* Whether one product, by itself, is a complete mask (rules 2 to 5). */
function ownRxMaskKind(product: RxMaskCheckProduct): RxMaskKind | null {
  const registered = RX_MASK_IDS[product.entityId];

  if (registered) {
    return registered;
  }

  if (CPAP_PART_IDS.includes(product.entityId) || NOT_RX_MASK_IDS.includes(product.entityId)) {
    return null;
  }

  const shelf = product.categoryIds?.find((id) => RX_MASK_CATEGORY_IDS.includes(id));

  if (shelf !== undefined) {
    warnUnregistered(product.entityId, product.name, `category ${shelf}`);

    return kindFromName(product.name);
  }

  if (matchesRxMaskNameRule(product.name)) {
    warnUnregistered(product.entityId, product.name, 'name rule');

    return kindFromName(product.name);
  }

  return null;
}

/*
 * Whether a product is, or contains, a complete mask, and whether it is a
 * child's. Null for a machine or a bundle holding one (rule 1: a device stays
 * a device), for a part, and for anything else. `components` is a curated
 * kit's contents (its related products), left out for a product that is not
 * a kit. A kit holding a child's mask is 'paediatric'.
 */
export function rxMaskKindOf(
  product: RxMaskCheckProduct & { components?: readonly RxMaskCheckProduct[] },
): RxMaskKind | null {
  if (prescriptionDeviceKindOf(product)) {
    return null;
  }

  const own = ownRxMaskKind(product);

  if (own) {
    return own;
  }

  const held = (product.components ?? [])
    .filter((component) => !prescriptionDeviceKindOf(component))
    .map(ownRxMaskKind)
    .filter((kind) => kind != null);

  if (held.length === 0) {
    return null;
  }

  return held.includes('paediatric') ? 'paediatric' : 'adult';
}

/* Whether this product id is in the register. */
export function isRxMaskId(entityId: number): boolean {
  return entityId in RX_MASK_IDS;
}

/*
 * The complete masks among cart or order lines, keyed by product id: the
 * catalogue's answer (`fromCatalogue`, from ./view-only.ts), and beside it
 * the register and the name rule read from each line's own name. So a
 * product the storefront does not return (hidden, or not in the customer's
 * group, which the catalogue read can only judge by its id) is still caught
 * when it is registered or named as a complete mask, and an order made
 * without the catalogue (a renewal while it is down) still finds every
 * registered mask. A child's mask wins. A line with no product id is keyed 0.
 */
export function rxMasksOfLines(
  lines: ReadonlyArray<{ productEntityId?: number | null; name?: string | null }>,
  fromCatalogue: ReadonlyMap<number, RxMaskKind> = new Map(),
): Map<number, RxMaskKind> {
  const found = new Map<number, RxMaskKind>();
  const add = (id: number, kind: RxMaskKind) => {
    found.set(id, found.get(id) === 'paediatric' ? 'paediatric' : kind);
  };

  lines.forEach((line) => {
    const entityId = line.productEntityId ?? 0;
    const fromCatalogueKind = fromCatalogue.get(entityId);
    const fromLine = rxMaskKindOf({ entityId, name: line.name ?? undefined, categoryIds: [] });

    if (fromCatalogueKind) {
      add(entityId, fromCatalogueKind);
    }

    if (fromLine) {
      add(entityId, fromLine);
    }
  });

  return found;
}
