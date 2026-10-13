/*
 * =============================================================================
 * PRESCRIPTION DEVICES: CPAP, APAP, BILEVEL AND ASV MACHINES
 * =============================================================================
 * A sleep apnea machine is never bought online at Liivv. It is a prescribed
 * device: "only use CPAP therapy if you have a prescription" (MyHealth.Alberta.ca,
 * Buyer's Information for CPAP Therapy Equipment); PAP is prescribed after an
 * assessment, APAP and bilevel by a sleep specialist, standard PAP can make
 * central sleep apnea worse, and settings are adjusted only by trained
 * professionals (Government of BC, Positive Airway Pressure Buyer's Guide);
 * ASV is not for some people with heart failure (Health Canada recall
 * RA-53771, 2015). Owner approval of 2026-10-12 (Phase 0 of the sleep plan).
 *
 * This file answers one question: is this product a prescription device, and
 * which kind? Four ways a product counts, checked in this order:
 *
 *   register   PAP_DEVICE_IDS, every machine and machine bundle, each read
 *              from the BigCommerce catalogue on 2026-10-13. Eight bundles
 *              are filed under mask categories (1120, 1128, 1136), and most
 *              machine names also say "tubing" or "mask", so neither the
 *              shelf nor the name rule alone finds them all.
 *   shelf      category 1068 CPAP Machines & Supplies.
 *   name       the fail-closed name rule (DEVICE_NAME / ACCESSORY_NAME).
 *   kit        a curated kit holding any of the above (`components`), the
 *              way a kit holding glucagon is glucagon (dc-ids.ts).
 *
 * A product that counts by shelf or name but is not in the register is
 * treated as a device and logged once, so it can be added to the register
 * (or to NOT_PRESCRIPTION_DEVICE_IDS) after a review.
 *
 * What a device is then denied is in ~/lib/catalog/view-only.ts (listings,
 * cart actions, reorder, kits, subscriptions, the checkout). What its page
 * says is in ~/lib/catalog/care-notices.ts.
 *
 * No fetching and no server-only code: the analytics rule
 * (~/lib/analytics/sensitive-products.ts), which client components import,
 * reads the ids and categories here too.
 * =============================================================================
 */

export type PapDeviceKind = 'cpap-apap' | 'bilevel' | 'asv' | 'travel' | 'bundle';

/* Every machine and machine bundle in the catalogue, read 2026-10-13. */
export const PAP_DEVICE_IDS: Readonly<Record<number, PapDeviceKind>> = {
  // Machines
  4326: 'cpap-apap', // Yuwell BreathCare III Auto CPAP Machine
  4339: 'bilevel', // ResMed AirCurve 11 VAuto with HumidAir 11 & Climate Line 11 Heated Tubing
  4577: 'asv', // ResMed AirCurve 11 ASV with HumidAir 11 & Climate Line Tubing 11
  4641: 'cpap-apap', // ResMed AirSense 11 AutoSet with HumidAir & ClimateLineAir 11 Heated Tubing
  5003: 'cpap-apap', // ResMed AirSense 10 AutoSet with HumidAir & ClimateLineAir Heated Tubing
  4979: 'travel', // ResMed AirMini AutoSet Travel CPAP Machine
  4794: 'cpap-apap', // Respironics DreamStation 2 Auto CPAP Advanced w/ Humidifier & Standard Tubing
  4599: 'travel', // Transcend Micro Travel Auto CPAP Machine
  5041: 'travel', // Transcend Micro 510 Auto Travel CPAP Machine
  4991: 'cpap-apap', // Z2 Auto CPAP
  // Machine bundles (1068, or a mask category: 1120 full face, 1128 nasal pillow, 1136 nasal)
  4652: 'bundle', // ResMed AirSense 10 + AirMini Travel - Exclusive Value Package (1068)
  4983: 'bundle', // Ultimate Machine Package: AirSense 11 + AirMini Travel (1068)
  4422: 'bundle', // AirMini AutoSet Travel CPAP Machine with N20 Setup Pack (1068)
  5018: 'bundle', // AirMini AutoSet Travel CPAP Machine with F20 Setup Pack (1068)
  4372: 'bundle', // AirMini AutoSet Travel CPAP Machine with N30 Mask Pack (1136)
  4394: 'bundle', // AirMini AutoSet with P10 Mask Pack (1128)
  4335: 'bundle', // AirSense 11 & AirFit N30i - Exclusive Value Package (1136)
  4424: 'bundle', // AirSense 11 & AirFit P30i - Exclusive Value Package (1128)
  4632: 'bundle', // AirSense 11 & AirFit P10 - Exclusive Value Package (1128)
  4927: 'bundle', // AirSense 11 & AirFit N20 - Exclusive Value Package (1136)
  5030: 'bundle', // AirSense 11 & AirFit N30 - Exclusive Value Package (1136)
  4992: 'bundle', // AirSense 11 "CPAP Mask" & AirFit F20 - Exclusive Value Package (1120)
  4733: 'bundle', // AirSense 10 & AirFit F20 - Exclusive Value Package (1120)
  5014: 'bundle', // AirSense 10 & AirFit P10 - Exclusive Value Package (1128)
};

/* The shelf every machine is filed on. */
export const PAP_DEVICE_CATEGORY_ID = 1068;

/*
 * Products the shelf or the name rule would catch that were reviewed and are
 * not a device. Read 2026-10-13:
 *   4265  CPAP Compliance Report – ResMed AirSense 10 & 11 (a usage report,
 *         filed in 1068; its name says "AirSense")
 */
export const NOT_PRESCRIPTION_DEVICE_IDS: readonly number[] = [4265];

/*
 * The name rule. A name that names a machine family or a machine type is a
 * device, unless it also says it is a mask, a part or an accessory. A name
 * that says "machine" is a device even when it also names a mask or tubing
 * ("AirSense 11 CPAP Machine & AirFit N30i Nasal CPAP Mask"): it fails
 * closed.
 */
const DEVICE_NAME =
  /airsense|aircurve|airmini|dreamstation|transcend|\bz2\b|breathcare|bipap|bilevel|\bapap\b|vauto|\basv\b|auto ?cpap/i;
const ACCESSORY_NAME =
  /mask|cushion|pillow|filter|tub(e|ing)?\b|chamber|battery|bag|case|wipe|strap|liner|headgear|frame|adapter|connector|hose/i;
const MACHINE_NAME = /\bmachines?\b/i;

/* Whether a product's name says it is a machine, by the rule above. */
export function matchesDeviceNameRule(name: string | null | undefined): boolean {
  if (!name || !DEVICE_NAME.test(name)) {
    return false;
  }

  return MACHINE_NAME.test(name) || !ACCESSORY_NAME.test(name);
}

/* The kind a device found by its shelf or name alone is taken to be. */
function kindFromName(name: string | null | undefined): PapDeviceKind {
  if (name && /\basv\b/i.test(name)) {
    return 'asv';
  }

  if (name && /bipap|bilevel|vauto|aircurve/i.test(name)) {
    return 'bilevel';
  }

  return 'cpap-apap';
}

const warned = new Set<number>();

/* Logs, once per product per process, a device the register does not name. */
function warnUnregistered(entityId: number, name: string | null | undefined, why: string) {
  if (warned.has(entityId)) {
    return;
  }

  warned.add(entityId);
  // eslint-disable-next-line no-console
  console.warn(
    `[prescription-devices] ${entityId} "${name ?? ''}" is treated as a prescription device (${why}) but is not in PAP_DEVICE_IDS. Review it and add it to the register or to NOT_PRESCRIPTION_DEVICE_IDS.`,
  );
}

export interface DeviceCheckProduct {
  entityId: number;
  /** The product's name, where the caller knows it. */
  name?: string | null;
  /** Every category the product is in, where the caller knows them. */
  categoryIds?: readonly number[];
}

/* Whether one product, by itself, is a prescription device, and which kind. */
function ownDeviceKind(product: DeviceCheckProduct): PapDeviceKind | null {
  const registered = PAP_DEVICE_IDS[product.entityId];

  if (registered) {
    return registered;
  }

  if (NOT_PRESCRIPTION_DEVICE_IDS.includes(product.entityId)) {
    return null;
  }

  if (product.categoryIds?.includes(PAP_DEVICE_CATEGORY_ID)) {
    warnUnregistered(product.entityId, product.name, `category ${PAP_DEVICE_CATEGORY_ID}`);

    return kindFromName(product.name);
  }

  if (matchesDeviceNameRule(product.name)) {
    warnUnregistered(product.entityId, product.name, 'name rule');

    return kindFromName(product.name);
  }

  return null;
}

/*
 * Whether a product is, or contains, a prescription device, and which kind.
 * `components` is a curated kit's contents (its related products), left out
 * for a product that is not a kit. A kit holding a device is the device's
 * kind, or 'bundle' when it holds more than one kind.
 */
export function prescriptionDeviceKindOf(
  product: DeviceCheckProduct & { components?: readonly DeviceCheckProduct[] },
): PapDeviceKind | null {
  const own = ownDeviceKind(product);

  if (own) {
    return own;
  }

  const held = [
    ...new Set((product.components ?? []).map(ownDeviceKind).filter((kind) => kind != null)),
  ];

  if (held.length === 0) {
    return null;
  }

  return held.length === 1 && held[0] ? held[0] : 'bundle';
}

/* Whether this product id is in the register. */
export function isPapDeviceId(entityId: number): boolean {
  return entityId in PAP_DEVICE_IDS;
}

/*
 * =============================================================================
 * Categories that make a product health-revealing (ad signals)
 * =============================================================================
 * The whole 1031 Sleep Apnea + CPAP subtree, read from the category tree on
 * 2026-10-13. Every shelf is named, not only the root, for the reason given
 * for DIABETES_ANALYTICS_CATEGORY_IDS in diabetes-care/dc-ids.ts: a cart line,
 * a wishlist or a compare row is answered from the categories the product is
 * *in*, and BigCommerce does not return their parents.
 *
 *   1031  Sleep Apnea + CPAP          (Liivv Your Life > Sleep + Breath)
 *   1048    CPAP Masks
 *   1120      Full Face Masks
 *   1128      Nasal Pillow Masks
 *   1136      Nasal Masks
 *   1142      Mask Parts & Accessories
 *   1068    CPAP Machines & Supplies
 *   1087    CPAP Cleaning & Accessories
 *
 * Used by ~/lib/analytics/sensitive-products.ts. A shelf added under 1031
 * later must be added here too.
 */
export const CPAP_ANALYTICS_CATEGORY_IDS: readonly number[] = [
  1031, // Sleep Apnea + CPAP
  1048, // CPAP Masks
  1120, // Full Face Masks
  1128, // Nasal Pillow Masks
  1136, // Nasal Masks
  1142, // Mask Parts & Accessories
  PAP_DEVICE_CATEGORY_ID, // 1068 CPAP Machines & Supplies
  1087, // CPAP Cleaning & Accessories
];

/* Whether any of these categories is a CPAP shelf. */
export function isCpapCategoryIds(entityIds: readonly number[]): boolean {
  return entityIds.some((entityId) => CPAP_ANALYTICS_CATEGORY_IDS.includes(entityId));
}
