import type { RxMaskKind } from '../catalog/cpap-masks';
import {
  type CpapPrescriptionFacts,
  cpapToday,
  pickValidCpapPrescription,
  rxMaskOrderRegion,
} from '../pharmacy/cpap-prescription';

import { InsulinToQuebecError } from './insulin-to-quebec-error';
import { PrescriptionDeviceError } from './prescription-device-error';
import { RxMaskPrescriptionError } from './rx-mask-prescription-error';

/*
 * =============================================================================
 * WHAT A CART MAY NOT BE PAID FOR ONLINE
 * =============================================================================
 * Three rules, checked by buildCheckoutSnapshot() (./snapshot.ts) before any
 * payment or order is made, and shown on the checkout page with the pay
 * button kept off. The first one a cart breaks is the one named:
 *
 *   PrescriptionDeviceError  any line is a prescription device: a CPAP,
 *                            APAP, bilevel or ASV machine, or a bundle
 *                            holding one (~/lib/catalog/prescription-devices.ts).
 *                            Never bought online; the customer sends their
 *                            prescription through their account and a
 *                            pharmacist contacts them (owner approval,
 *                            2026-10-12).
 *   InsulinToQuebecError     insulin, for delivery in Quebec
 *                            (./quebec-insulin.ts; owner answers A1, B3, B11).
 *   RxMaskPrescriptionError  a complete CPAP mask, or a kit holding one
 *                            (~/lib/catalog/cpap-masks.ts), when the
 *                            signed-in customer's account has no CPAP
 *                            prescription a Liivv pharmacist approved with an
 *                            expiry of today or later
 *                            (~/lib/pharmacy/cpap-prescription.ts), or when a
 *                            complete mask is on Subscribe & save. Owner
 *                            ruling C26 (b), 2026-10-13, phase 1
 *                            ("prescription first"). Parts are not checked.
 *
 * When a cart holding a complete mask passes, the gate returns what the order
 * must carry for the pharmacist's sign-off (`RxMaskOrderCheck`): every paid
 * complete-mask order is recorded for sign-off, even with a prescription on
 * file, and Quebec and territory orders are flagged "always hold".
 *
 * The lookups are passed in, so the order of the rules can be tested without
 * the catalogue or Supabase. A lookup that fails throws, and the order is
 * refused: no rule is waived because it could not be checked.
 * =============================================================================
 */

export { InsulinToQuebecError, PrescriptionDeviceError, RxMaskPrescriptionError };

export interface CheckoutGateLookups {
  /** Which of these products are, or hold, a prescription device. */
  prescriptionDeviceIds: (productEntityIds: readonly number[]) => Promise<ReadonlySet<number>>;
  /** Whether this cart ships insulin to Quebec. */
  shipsInsulinToQuebec: (input: {
    stateOrProvince: string | null | undefined;
    productEntityIds: readonly number[];
  }) => Promise<boolean>;
  /**
   * Which of these products are, or hold, a complete CPAP mask, and whether
   * it is a child's. Throws when the catalogue can't answer.
   */
  rxMaskProducts: (productEntityIds: readonly number[]) => Promise<ReadonlyMap<number, RxMaskKind>>;
  /**
   * The signed-in customer's CPAP prescriptions (rx_kind 'cpap') and their
   * profile id. Throws when they can't be read, and when the sign-off table
   * (rx_order_checks) can't be reached, so a paid order is never left
   * unrecorded because the migration ran only in part.
   */
  cpapPrescriptions: () => Promise<{
    profileId: string | null;
    rows: readonly CpapPrescriptionFacts[];
  }>;
}

/* What a paid order holding a complete mask carries for the pharmacist's sign-off. */
export interface RxMaskOrderCheck {
  /** The complete-mask products in the cart (a kit holding one counts). */
  productIds: number[];
  /** A child's mask is in the cart. */
  paediatric: boolean;
  /** The delivery province or territory code, when known. */
  region: string | null;
  /** Quebec or a territory, by province or postal code: always held for the pharmacist. */
  alwaysHold: boolean;
  /** The approved, in-date CPAP prescription found on file. */
  prescriptionId: string;
  /** Its expiry (YYYY-MM-DD), as the pharmacist set it. */
  validUntil: string;
  /** The customer's Supabase profile. */
  profileId: string;
}

/*
 * Throws the first rule this cart breaks. Returns what the order must carry
 * for sign-off when it holds a complete mask, and undefined when it holds
 * none.
 */
export async function assertCartMayBePaidOnline(
  {
    stateOrProvince,
    postalCode,
    productEntityIds,
    subscriptionProductEntityIds = [],
    today = cpapToday(),
  }: {
    stateOrProvince: string | null | undefined;
    /** The delivery postal code: a Quebec or territory one always holds a mask order. */
    postalCode?: string | null;
    productEntityIds: readonly number[];
    /** The products on Subscribe & save in this cart. */
    subscriptionProductEntityIds?: readonly number[];
    /** Today's date (YYYY-MM-DD), for the prescription's expiry. */
    today?: string;
  },
  lookups: CheckoutGateLookups,
): Promise<RxMaskOrderCheck | undefined> {
  if ((await lookups.prescriptionDeviceIds(productEntityIds)).size > 0) {
    throw new PrescriptionDeviceError();
  }

  if (await lookups.shipsInsulinToQuebec({ stateOrProvince, productEntityIds })) {
    throw new InsulinToQuebecError();
  }

  return assertRxMasksMayBePaid(
    { stateOrProvince, postalCode, productEntityIds, subscriptionProductEntityIds, today },
    lookups,
  );
}

/*
 * The third rule alone: a complete mask needs an approved, in-date CPAP
 * prescription, and is never on Subscribe & save. The checkout page asks it
 * directly, to say which line applies; the snapshot asks it through
 * `assertCartMayBePaidOnline`, after the device and insulin rules. Lookup
 * failures refuse (RxMaskPrescriptionError 'unavailable').
 */
export async function assertRxMasksMayBePaid(
  {
    stateOrProvince,
    postalCode,
    productEntityIds,
    subscriptionProductEntityIds,
    today,
  }: {
    stateOrProvince: string | null | undefined;
    postalCode?: string | null;
    productEntityIds: readonly number[];
    subscriptionProductEntityIds: readonly number[];
    today: string;
  },
  lookups: Pick<CheckoutGateLookups, 'rxMaskProducts' | 'cpapPrescriptions'>,
): Promise<RxMaskOrderCheck | undefined> {
  let masks: ReadonlyMap<number, RxMaskKind>;

  try {
    masks = await lookups.rxMaskProducts(productEntityIds);
  } catch (error) {
    throw new RxMaskPrescriptionError('unavailable', { cause: error });
  }

  const productIds = [...new Set(productEntityIds)].filter((id) => masks.has(id));

  if (productIds.length === 0) {
    return undefined;
  }

  if (productIds.some((id) => subscriptionProductEntityIds.includes(id))) {
    throw new RxMaskPrescriptionError('subscription');
  }

  let onFile: Awaited<ReturnType<CheckoutGateLookups['cpapPrescriptions']>>;

  try {
    onFile = await lookups.cpapPrescriptions();
  } catch (error) {
    throw new RxMaskPrescriptionError('unavailable', { cause: error });
  }

  const valid = pickValidCpapPrescription(onFile.rows, today);

  if (!valid || !onFile.profileId) {
    throw new RxMaskPrescriptionError('no-prescription');
  }

  const { region, alwaysHold } = rxMaskOrderRegion(stateOrProvince, postalCode);

  return {
    productIds,
    paediatric: productIds.some((id) => masks.get(id) === 'paediatric'),
    region,
    alwaysHold,
    prescriptionId: valid.id,
    validUntil: String(valid.end_date ?? '').slice(0, 10),
    profileId: onFile.profileId,
  };
}
