/*
 * The message the snapshot throws with. The page shows its own, translated
 * (`DiabetesCare.ui.commerce.quebecInsulinCheckout`); this English copy says
 * the same, naming Liivv as the service (owner note 5, 2026-10-07).
 */
export class InsulinToQuebecError extends Error {
  constructor() {
    super(
      'Insulin can’t be ordered online for delivery in Quebec. Remove it to continue, or call Liivv at 1-844-561-1254 and a pharmacist will help.',
    );
    this.name = 'InsulinToQuebecError';
  }
}
