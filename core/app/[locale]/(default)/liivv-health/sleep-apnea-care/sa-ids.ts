/*
 * Catalogue ids the Sleep Apnea Care landing reads (spec 3.10). Client and
 * server safe: plain numbers, no imports.
 *
 * The landing's shelf shows CPAP masks and supplies from the store's own
 * sleep apnea categories, never the machine category (1068): Liivv sells no
 * machine (ruling N1). Its "Open the full shop" link goes to the existing
 * category page, SHOP_SLEEP_HREF in ./landing-meta.ts.
 */

/* Sleep & Breath › Sleep Apnea & CPAP. */
export const SLEEP_CATEGORY_ID = 1031;

/* The shelf's categories: masks, cushions and headgear, tubing, filters, humidifier parts, cleaning. Never 1068 (machines). */
export const SLEEP_SHELF_CATEGORY_IDS = [1048, 1120, 1128, 1136, 1142, 1087] as const;

/* Children's masks: never on a Sleep shelf (ruling C17: only ever on a paediatric card). */
export const PAEDIATRIC_MASK_IDS: readonly number[] = [4210, 4543, 4713];

/*
 * Masks a Health Canada magnet notice names (landing B.2; ruling N7: Health
 * Canada notices only). 4624 waits on the nurse.
 */
export const MAGNET_NOTICE_MASK_IDS: Readonly<Record<number, 'philips2022' | 'resmed2023'>> = {
  4320: 'philips2022',
  4374: 'philips2022',
  4932: 'philips2022',
  4952: 'philips2022',
  4241: 'resmed2023',
  4281: 'resmed2023',
  4319: 'resmed2023',
  4408: 'resmed2023',
  4483: 'resmed2023',
  4546: 'resmed2023',
  4585: 'resmed2023',
  4749: 'resmed2023',
  4833: 'resmed2023',
  4944: 'resmed2023',
  4955: 'resmed2023',
};

export function isPaediatricMask(entityId: number): boolean {
  return PAEDIATRIC_MASK_IDS.includes(entityId);
}
