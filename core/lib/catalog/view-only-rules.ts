/*
 * =============================================================================
 * VIEW-ONLY PRODUCTS: THE RULE, WITHOUT THE CATALOGUE
 * =============================================================================
 * A view-only product is never added to a cart in one click from a listing,
 * a kit or the assistant, and a prescription device is never bought online:
 *
 *   insulin, glucagon   a pharmacist reviews and dispenses every order (owner
 *                       note 9, 2026-10-07); never one click from a listing
 *                       or put in a kit. Bought from the product page, as a
 *                       one-time purchase or a subscription, or reordered
 *                       from a past order (owner decision, 2026-10-13:
 *                       `repeatOrderRefusalFor`). Insulin to a Quebec
 *                       address is still refused at checkout.
 *   prescription device a CPAP, APAP, bilevel or ASV machine, or a bundle or
 *                       kit holding one (./prescription-devices.ts); never
 *                       bought online at all (owner approval, 2026-10-12).
 *
 * The answers here are pure, so they can be tested and shared. The catalogue
 * lookups that feed them are in ./view-only.ts.
 *
 * dc-ids.ts is imported by a relative path so the unit tests, which run
 * without the `~` alias, can load this file.
 * =============================================================================
 */

import { pharmacistContentsOf } from '../../app/[locale]/(default)/liivv-health/diabetes-care/dc-ids';

import {
  type DeviceCheckProduct,
  type PapDeviceKind,
  prescriptionDeviceKindOf,
} from './prescription-devices';

export interface ViewOnlyReason {
  insulin: boolean;
  glucagon: boolean;
  /** The kind of prescription device, or null when it is not one. */
  device: PapDeviceKind | null;
}

export interface ViewOnlyCheckProduct extends DeviceCheckProduct {
  categoryIds: readonly number[];
}

/*
 * Why a product is view-only, from its id, name and categories and, for a
 * curated kit, the same for each product it holds. Null when it is not.
 */
export function viewOnlyReasonOf(
  product: ViewOnlyCheckProduct & { components?: readonly ViewOnlyCheckProduct[] },
): ViewOnlyReason | null {
  const { insulin, glucagon } = pharmacistContentsOf(product);
  const device = prescriptionDeviceKindOf(product);

  return insulin || glucagon || device ? { insulin, glucagon, device } : null;
}

/* Every product counts as everything: what a failed lookup answers. */
export const FAIL_CLOSED_REASON: ViewOnlyReason = {
  insulin: true,
  glucagon: true,
  device: 'bundle',
};

export type ViewOnlyRefusal = 'prescription-device' | 'pharmacist';

/*
 * Why a one-click cart action that is not the product page's own (a listing,
 * a kit, the assistant) refuses this product, or null when it may add it.
 * A device is named first: it cannot be bought online at all.
 */
export function viewOnlyRefusalFor(
  entityId: number,
  viewOnly: ReadonlyMap<number, ViewOnlyReason>,
): ViewOnlyRefusal | null {
  const reason = viewOnly.get(entityId);

  if (!reason) {
    return null;
  }

  return reason.device ? 'prescription-device' : 'pharmacist';
}

/*
 * Why a subscription or a reorder from a past order refuses this product, or
 * null when it may add it. Owner decision, 2026-10-13: insulin and glucagon
 * may be subscribed to and reordered (a pharmacist reviews every insulin and
 * glucagon order, and insulin to a Quebec address is still refused at
 * checkout); a prescription device, or a kit holding one, never.
 */
export function repeatOrderRefusalFor(
  entityId: number,
  viewOnly: ReadonlyMap<number, ViewOnlyReason>,
): 'prescription-device' | null {
  return viewOnly.get(entityId)?.device ? 'prescription-device' : null;
}

/*
 * Splits lines into those a cart action may add and those it holds back,
 * keeping each group in its original order.
 */
export function partitionViewOnly<T>(
  lines: readonly T[],
  productIdOf: (line: T) => number,
  viewOnly: ReadonlyMap<number, ViewOnlyReason> | ReadonlySet<number>,
): { allowed: T[]; held: T[] } {
  const allowed: T[] = [];
  const held: T[] = [];

  lines.forEach((line) => {
    (viewOnly.has(productIdOf(line)) ? held : allowed).push(line);
  });

  return { allowed, held };
}
