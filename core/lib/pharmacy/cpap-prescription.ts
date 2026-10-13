/*
 * =============================================================================
 * A CUSTOMER'S CPAP PRESCRIPTION: WHAT COUNTS AS VALID TODAY
 * =============================================================================
 * Owner ruling C26 (b), 2026-10-13, phase 1 ("prescription first"): a complete
 * CPAP mask (~/lib/catalog/cpap-masks.ts) can't be paid for until the
 * customer's account holds a CPAP prescription a Liivv pharmacist approved,
 * with an expiry the pharmacist set that is today or later. Intake is by
 * transfer or prescriber fax, from the account Pharmacy page; there is no
 * upload.
 *
 * One answer, shared by the checkout gate (~/lib/checkout/checkout-gates.ts),
 * the checkout page and the account Pharmacy page's "CPAP prescription" card,
 * so they never disagree about the same row on the same day.
 *
 * Rows are `public.prescriptions` with `rx_kind = 'cpap'`
 * (~/lib/supabase/cpap-prescriptions-migration.sql). Pure: no fetching, so the
 * unit tests and client components can import it.
 * =============================================================================
 */

/** What the rule reads from a prescriptions row. */
export interface CpapPrescriptionFacts {
  id: string;
  approval_status: string | null;
  status?: string | null;
  /** The expiry the pharmacist set when approving (YYYY-MM-DD). */
  end_date: string | null;
  created_at?: string | null;
  submission_method?: string | null;
}

/*
 * Today's date in Ontario (YYYY-MM-DD), where Liivv's pharmacists sign off.
 * A prescription "valid until" a date is valid through the whole of that day.
 */
export function cpapToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')}`;
}

function dateOnly(value: string | null | undefined): string {
  const raw = String(value ?? '')
    .trim()
    .slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
}

function approvalOf(row: CpapPrescriptionFacts): string {
  return String(row.approval_status ?? '')
    .trim()
    .toLowerCase();
}

/*
 * Whether this row lets a complete mask be paid for today: approved by a
 * pharmacist, with an expiry that is today or later. An approved row with no
 * expiry does not count (the pharmacist sets one when approving).
 */
export function isCpapPrescriptionValid(row: CpapPrescriptionFacts, today: string): boolean {
  const endDate = dateOnly(row.end_date);

  return approvalOf(row) === 'approved' && endDate !== '' && endDate >= today;
}

/* The valid row that runs longest, or null when none is valid today. */
export function pickValidCpapPrescription<T extends CpapPrescriptionFacts>(
  rows: readonly T[],
  today: string,
): T | null {
  return (
    rows
      .filter((row) => isCpapPrescriptionValid(row, today))
      .sort((a, b) => dateOnly(b.end_date).localeCompare(dateOnly(a.end_date)))[0] ?? null
  );
}

/*
 * Whether this row is still with a pharmacist: sent and not yet decided,
 * sent back for more information, or approved with no expiry set yet.
 */
export function isCpapPrescriptionWaiting(row: CpapPrescriptionFacts): boolean {
  const approval = approvalOf(row);

  return (
    approval === '' ||
    approval.includes('pending') ||
    approval === 'needs_info' ||
    (approval === 'approved' && dateOnly(row.end_date) === '')
  );
}

export type CpapPrescriptionState =
  | { kind: 'none' }
  | { kind: 'pending'; submittedAt: string | null; method: string | null }
  | { kind: 'valid'; validUntil: string; prescriptionId: string }
  | { kind: 'expired'; expiredOn: string | null }
  | { kind: 'rejected' };

/*
 * What the customer's Pharmacy page says about their CPAP prescription:
 *   valid     an approved row runs to today or later ("valid until {date}");
 *   pending   otherwise, a row is waiting for a pharmacist (sent, or approved
 *             with no expiry yet);
 *   expired   otherwise, the latest row ran out or was marked expired;
 *   rejected  otherwise, the latest row was not accepted;
 *   none      no CPAP row at all.
 */
export function cpapPrescriptionState(
  rows: readonly CpapPrescriptionFacts[],
  today: string,
): CpapPrescriptionState {
  if (rows.length === 0) {
    return { kind: 'none' };
  }

  const valid = pickValidCpapPrescription(rows, today);

  if (valid) {
    return { kind: 'valid', validUntil: dateOnly(valid.end_date), prescriptionId: valid.id };
  }

  const newestFirst = [...rows].sort((a, b) =>
    String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')),
  );
  const waiting = newestFirst.find(isCpapPrescriptionWaiting);

  if (waiting) {
    return {
      kind: 'pending',
      submittedAt: waiting.created_at ?? null,
      method: waiting.submission_method ?? null,
    };
  }

  const latest = newestFirst[0];

  if (latest && approvalOf(latest) === 'rejected') {
    return { kind: 'rejected' };
  }

  // A row marked expired before its expiry date says only that it expired:
  // never a "ran until" date that has not come yet.
  const lastDay = latest ? dateOnly(latest.end_date) : '';

  return { kind: 'expired', expiredOn: lastDay && lastDay < today ? lastDay : null };
}

/*
 * =============================================================================
 * Where a complete-mask order ships
 * =============================================================================
 * Owner ruling, 2026-10-13: Quebec, Yukon, the Northwest Territories and
 * Nunavut orders are always held for the pharmacist. In phase 1 every
 * complete-mask order is recorded for sign-off anyway; these are flagged
 * "Always hold" on the worklist and in the order's staff note. The province
 * field and the postal code are both read (`rxMaskOrderRegion`).
 */
export const RX_MASK_ALWAYS_HOLD_REGIONS: readonly string[] = ['QC', 'YT', 'NT', 'NU'];

const REGION_NAMES: Readonly<Record<string, string>> = {
  ontario: 'ON',
  quebec: 'QC',
  'british columbia': 'BC',
  'colombie-britannique': 'BC',
  alberta: 'AB',
  manitoba: 'MB',
  saskatchewan: 'SK',
  'nova scotia': 'NS',
  'nouvelle-ecosse': 'NS',
  'new brunswick': 'NB',
  'nouveau-brunswick': 'NB',
  'newfoundland and labrador': 'NL',
  'terre-neuve-et-labrador': 'NL',
  'prince edward island': 'PE',
  'ile-du-prince-edouard': 'PE',
  yukon: 'YT',
  'northwest territories': 'NT',
  'territoires du nord-ouest': 'NT',
  nunavut: 'NU',
};

const REGION_CODES = new Set([
  'ON',
  'QC',
  'BC',
  'AB',
  'MB',
  'SK',
  'NS',
  'NB',
  'NL',
  'PE',
  'YT',
  'NT',
  'NU',
]);

/*
 * The two-letter code for a Canadian province or territory, from a code or a
 * name in English or French ("Québec", "QC", "PQ"). Null when it is neither.
 */
export function canadianRegionCode(stateOrProvince: string | null | undefined): string | null {
  const plain = String(stateOrProvince ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

  if (!plain) {
    return null;
  }

  const upper = plain.toUpperCase();

  if (upper === 'PQ') {
    return 'QC';
  }

  if (REGION_CODES.has(upper)) {
    return upper;
  }

  return REGION_NAMES[plain.toLowerCase()] ?? null;
}

/* Whether a complete-mask order to this province or territory is always held. */
export function isRxMaskAlwaysHoldRegion(region: string | null | undefined): boolean {
  return region != null && RX_MASK_ALWAYS_HOLD_REGIONS.includes(region);
}

/*
 * The province or territory a Canadian postal code is in, from its first
 * letter, for the regions held for the pharmacist only: G, H and J are
 * Quebec, Y is Yukon, and X is Nunavut (X0A, X0B, X0C) or the Northwest
 * Territories (the rest). Null for anything else.
 */
export function holdRegionOfPostalCode(postalCode: string | null | undefined): string | null {
  const code = String(postalCode ?? '')
    .replace(/\s+/g, '')
    .toUpperCase();

  if (!/^[A-Z]\d[A-Z]/.test(code)) {
    return null;
  }

  const letter = code.charAt(0);

  if (letter === 'G' || letter === 'H' || letter === 'J') {
    return 'QC';
  }

  if (letter === 'Y') {
    return 'YT';
  }

  if (letter === 'X') {
    return ['X0A', 'X0B', 'X0C'].includes(code.slice(0, 3)) ? 'NU' : 'NT';
  }

  return null;
}

/*
 * Where a complete-mask order ships, and whether it is always held. The
 * province field is read first; a postal code in Quebec or a territory
 * holds the order even when the province field says otherwise, and that
 * region is the one recorded, so the worklist flags it too.
 */
export function rxMaskOrderRegion(
  stateOrProvince: string | null | undefined,
  postalCode?: string | null,
): { region: string | null; alwaysHold: boolean } {
  const region = canadianRegionCode(stateOrProvince);
  const postalHold = holdRegionOfPostalCode(postalCode);

  if (isRxMaskAlwaysHoldRegion(region)) {
    return { region, alwaysHold: true };
  }

  if (postalHold) {
    return { region: postalHold, alwaysHold: true };
  }

  return { region, alwaysHold: false };
}

/*
 * The first lines of the BigCommerce staff note on an order holding a
 * complete mask. Neutral words only: no prescription, patient or child
 * detail ever goes in a staff note.
 */
export function rxCheckStaffNoteLines(alwaysHold: boolean): string[] {
  return [
    'RX-CHECK: pharmacist sign-off required before shipping',
    ...(alwaysHold ? ['ALWAYS HOLD: QC/territory'] : []),
  ];
}

/* The day before a YYYY-MM-DD date, as YYYY-MM-DD. */
export function previousDay(day: string): string {
  const date = new Date(`${day}T12:00:00Z`);

  date.setUTCDate(date.getUTCDate() - 1);

  return date.toISOString().slice(0, 10);
}
