/*
 * The message the snapshot throws with. The page shows its own, translated
 * (`CareNotices.checkout.deviceBlocked`); this English copy says the same.
 */
export class PrescriptionDeviceError extends Error {
  constructor() {
    super(
      'Prescription machines can’t be bought online. Remove it to continue. To get one, send your prescription through your Liivv account and a pharmacist will contact you.',
    );
    this.name = 'PrescriptionDeviceError';
  }
}
