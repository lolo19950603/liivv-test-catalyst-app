/*
 * =============================================================================
 * WHICH PROVINCIAL PHARMACY (AND SO WHICH OUTLOOK MAILBOX) OWNS A THREAD
 * =============================================================================
 * Owner decision Q10, 2026-10-14: pharmacist messages go out from, and replies
 * come back to, the pharmacy mailbox of the customer's province. Nine
 * provinces have their own Liivv pharmacy (the same nine as the fax map in
 * ~/lib/pharmacy/pharmacy-fax.ts). Quebec, the territories and anything
 * unknown are served by the Ontario pharmacy (owner note, 2026-10-06), as the
 * fax requests already are.
 *
 * Pure (no server imports), so the unit tests and client components can use it.
 * =============================================================================
 */

import { canadianRegionCode } from '../pharmacy/cpap-prescription';
import { pharmacyPhoneForRegion, provinceAbbreviations } from '../pharmacy/pharmacy-fax';

export const PHARMACY_REGIONS = ['ON', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL'] as const;

export type PharmacyRegion = (typeof PHARMACY_REGIONS)[number];

const REGION_SET: ReadonlySet<string> = new Set(PHARMACY_REGIONS);

export function isPharmacyRegion(value: unknown): value is PharmacyRegion {
  return typeof value === 'string' && REGION_SET.has(value);
}

/*
 * The pharmacy that serves a province or territory, from a code or a name in
 * English or French ("Québec", "PQ", "Colombie-Britannique"). The nine with a
 * pharmacy of their own map to themselves; Quebec, Yukon, the Northwest
 * Territories, Nunavut, null and anything unknown map to Ontario.
 */
export function pharmacyRegionOf(provinceOrCode: string | null | undefined): PharmacyRegion {
  const code = canadianRegionCode(provinceOrCode);

  return isPharmacyRegion(code) ? code : 'ON';
}

/* "Ontario", "British Columbia", … */
export function pharmacyRegionName(region: PharmacyRegion): string {
  return provinceAbbreviations[region] ?? 'Ontario';
}

/* "Ontario pharmacy": how staff see the thread's pharmacy. Customers only see "Liivv". */
export function pharmacyRegionLabel(region: PharmacyRegion): string {
  return `${pharmacyRegionName(region)} pharmacy`;
}

/* "1(855) 237-2473" → "1 (855) 237-2473". Anything else is returned trimmed. */
export function formatPharmacyPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return raw.trim();
}

/* The province pharmacy's phone number, formatted for customers. */
export function pharmacyPhoneOf(region: PharmacyRegion): string {
  return formatPharmacyPhone(pharmacyPhoneForRegion(region));
}

/* The env-var suffix for a region's mailbox: LIIVV_PHARMACY_MAILBOX_<REGION>. */
export function mailboxEnvName(region: PharmacyRegion): string {
  return `LIIVV_PHARMACY_MAILBOX_${region}`;
}

export function mailboxObjectIdEnvName(region: PharmacyRegion): string {
  return `LIIVV_PHARMACY_MAILBOX_${region}_ID`;
}
