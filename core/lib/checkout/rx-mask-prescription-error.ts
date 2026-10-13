/*
 * Why the checkout refuses a cart holding a complete CPAP mask
 * (~/lib/catalog/cpap-masks.ts; owner ruling C26 (b), 2026-10-13):
 *
 *   no-prescription  the customer's account has no CPAP prescription a Liivv
 *                    pharmacist approved with an expiry of today or later;
 *   subscription     a complete mask is on Subscribe & save, which is never
 *                    offered for one (a pharmacist signs off every order);
 *   unavailable      the prescription could not be checked (fails closed).
 *
 * The message the snapshot throws with. The page shows its own, translated
 * (`CareNotices.checkout.rxMaskBlocked`, `rxMaskSubscription`,
 * `rxMaskUnavailable`); this English copy says the same.
 */
export type RxMaskRefusalReason = 'no-prescription' | 'subscription' | 'unavailable';

const MESSAGES: Record<RxMaskRefusalReason, string> = {
  'no-prescription':
    'A complete CPAP mask needs a CPAP prescription on your account that a Liivv pharmacist has approved and that is still in date. Check its status on your Pharmacy page, or remove the mask to continue.',
  subscription:
    'A complete CPAP mask can’t be on Subscribe & save. Remove it and add it again as a one-time purchase.',
  unavailable: 'We can’t check your CPAP prescription right now. Try again in a few minutes.',
};

export class RxMaskPrescriptionError extends Error {
  readonly reason: RxMaskRefusalReason;

  constructor(reason: RxMaskRefusalReason, options?: { cause?: unknown }) {
    super(MESSAGES[reason], options);
    this.name = 'RxMaskPrescriptionError';
    this.reason = reason;
  }
}
