/*
 * The message the snapshot throws with. The page shows its own, translated
 * (`CareNotices.checkout.deviceBlocked`); this English copy says the same.
 */
export class PrescriptionDeviceError extends Error {
  constructor() {
    super(
      'Liivv doesn’t sell CPAP or other sleep apnea machines yet. Remove it to continue.',
    );
    this.name = 'PrescriptionDeviceError';
  }
}
