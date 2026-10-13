import { InsulinToQuebecError } from './insulin-to-quebec-error';
import { PrescriptionDeviceError } from './prescription-device-error';

/*
 * =============================================================================
 * WHAT A CART MAY NOT BE PAID FOR ONLINE
 * =============================================================================
 * Two rules, checked by buildCheckoutSnapshot() (./snapshot.ts) before any
 * payment or order is made, and shown on the checkout page with the pay
 * button kept off:
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
 *
 * The lookups are passed in, so the order of the two rules can be tested
 * without the catalogue. A lookup that fails throws, and the order is
 * refused: neither rule is waived because it could not be checked.
 * =============================================================================
 */

export { InsulinToQuebecError, PrescriptionDeviceError };

export interface CheckoutGateLookups {
  /** Which of these products are, or hold, a prescription device. */
  prescriptionDeviceIds: (productEntityIds: readonly number[]) => Promise<ReadonlySet<number>>;
  /** Whether this cart ships insulin to Quebec. */
  shipsInsulinToQuebec: (input: {
    stateOrProvince: string | null | undefined;
    productEntityIds: readonly number[];
  }) => Promise<boolean>;
}

/* Throws the first rule this cart breaks; returns when it breaks neither. */
export async function assertCartMayBePaidOnline(
  {
    stateOrProvince,
    productEntityIds,
  }: { stateOrProvince: string | null | undefined; productEntityIds: readonly number[] },
  lookups: CheckoutGateLookups,
): Promise<void> {
  if ((await lookups.prescriptionDeviceIds(productEntityIds)).size > 0) {
    throw new PrescriptionDeviceError();
  }

  if (await lookups.shipsInsulinToQuebec({ stateOrProvince, productEntityIds })) {
    throw new InsulinToQuebecError();
  }
}
