/*
 * =============================================================================
 * SLEEP APNEA CARE — WHICH SHELF ROOM A PRODUCT GOES IN, AND WHETHER IT SHOWS
 * =============================================================================
 * Pure functions, no imports, so the rules can be read and tested on their own
 * (./sa-shop-classify.test.ts). The landing's loader (./get-sa-catalog.ts)
 * asks the catalogue helpers for the device and mask kinds and passes the
 * answers in.
 *
 * The shelf rules (landing.md A, 1–11) this file holds:
 *   - never a machine or a bundle holding one (N1), so never ASV either;
 *   - never a children's mask (C17), never an ozone or UV cleaner, never the
 *     old compliance-report service, never a discontinued item;
 *   - a product whose description names another retailer is refused by the
 *     loader (chapter-shop.ts `namesAnotherRetailer`).
 * The room is a shopping aid only: an item that fits no room is still under
 * "All".
 * =============================================================================
 */

export type SleepShopRoom =
  | 'masks'
  | 'cushions'
  | 'tubing'
  | 'filters'
  | 'humidifier'
  | 'cleaning'
  | 'travel';

export interface ShelfCandidate {
  entityId: number;
  name: string;
  categoryIds: readonly number[];
  /* `prescriptionDeviceKindOf(...)`: a machine or a bundle holding one. */
  deviceKind: string | null;
  /* `rxMaskKindOf(...)`: a complete mask, and whether it is a child's. */
  rxMaskKind: 'adult' | 'paediatric' | null;
}

/* Names never shown, whatever their category (rules 3, 4 and 7). */
const NEVER_SHOWN = /ozone|\buv\b|ultraviolet|soclean|sanitiz|compliance report|discontinued/i;

/* Whether the landing's shelf may show this product at all. */
export function isShelfable(product: ShelfCandidate, paediatricIds: readonly number[]): boolean {
  if (product.deviceKind !== null) return false;
  if (product.rxMaskKind === 'paediatric') return false;
  if (paediatricIds.includes(product.entityId)) return false;

  return !NEVER_SHOWN.test(product.name);
}

/* Name rules, checked in order: the first that matches files the product. */
const ROOM_RULES: ReadonlyArray<readonly [RegExp, SleepShopRoom]> = [
  [/\btravel\b|\bbag\b|\bcase\b|\bdc\b|power cord|\bbattery\b/i, 'travel'],
  [/\bfilters?\b/i, 'filters'],
  [/humidifier|water chamber|\bchamber\b|\btub\b/i, 'humidifier'],
  [/\btub(e|es|ing)\b|\bhose\b|tube cover|hose cover/i, 'tubing'],
  [/clean|\bwipes?\b|\bbrush\b|\bsoap\b|\bwash\b/i, 'cleaning'],
  [
    /cushion|pillows?\b|headgear|\bstraps?\b|\bframe\b|liner|chin ?strap|\bclips?\b|\belbow\b/i,
    'cushions',
  ],
];

/* The room a shelfable product is filed in, or undefined for "All" only. */
export function roomForSleepProduct(
  product: Pick<ShelfCandidate, 'name' | 'rxMaskKind'>,
): SleepShopRoom | undefined {
  if (product.rxMaskKind === 'adult') return 'masks';

  return ROOM_RULES.find(([rule]) => rule.test(product.name))?.[1];
}
