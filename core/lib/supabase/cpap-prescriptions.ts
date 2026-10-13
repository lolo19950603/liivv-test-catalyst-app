import 'server-only';

import type { CpapPrescriptionFacts } from '~/lib/pharmacy/cpap-prescription';
import { getSupabaseClient, isSupabaseConfigured } from '~/lib/supabase/client';
import { assertRxOrderChecksReachable } from '~/lib/supabase/rx-order-checks';

/*
 * =============================================================================
 * A CUSTOMER'S CPAP PRESCRIPTIONS, FOR THE CHECKOUT GATE
 * =============================================================================
 * The checkout refuses a complete CPAP mask unless the signed-in customer's
 * Supabase profile holds an approved, in-date CPAP prescription
 * (~/lib/checkout/checkout-gates.ts, ~/lib/pharmacy/cpap-prescription.ts).
 *
 * Fails closed: every failure throws (Supabase not configured, a query error,
 * the rx_kind column missing because cpap-prescriptions-migration.sql has not
 * run), so the gate refuses rather than lets a mask through unchecked. A
 * customer with no profile simply has no prescription.
 * =============================================================================
 */

export interface CustomerCpapPrescriptions {
  /** The customer's Supabase profile id, or null when they have none yet. */
  profileId: string | null;
  rows: CpapPrescriptionFacts[];
}

const CPAP_COLUMNS = 'id, approval_status, status, end_date, created_at, submission_method';

/* Whether a value read from Supabase has what the CPAP rule reads. */
function isCpapFacts(value: unknown): value is CpapPrescriptionFacts {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'approval_status' in value &&
    'end_date' in value
  );
}

/* A profile's CPAP prescriptions, newest first. Throws on any failure. */
export async function listCpapPrescriptionsByProfileId(
  profileId: string,
): Promise<CpapPrescriptionFacts[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .select(CPAP_COLUMNS)
    .eq('profile_id', profileId)
    .eq('rx_kind', 'cpap')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`CPAP prescriptions could not be read: ${error.message}`);
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  // A row missing what the rule reads fails closed: it is not counted.
  return rows.filter(isCpapFacts);
}

/*
 * The CPAP prescriptions on a BigCommerce customer's account. Throws on any
 * failure, including a customer id that is not a signed-in customer's.
 */
export async function listCpapPrescriptionsForCustomer(
  bigcommerceCustomerId: number,
): Promise<CustomerCpapPrescriptions> {
  if (!Number.isInteger(bigcommerceCustomerId) || bigcommerceCustomerId <= 0) {
    throw new Error('A signed-in customer is needed to check a CPAP prescription.');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured, so a CPAP prescription cannot be checked.');
  }

  const supabase = getSupabaseClient();
  const result = await supabase
    .from('profiles')
    .select('id')
    .eq('bigcommerce_customer_id', String(bigcommerceCustomerId))
    .maybeSingle();

  if (result.error) {
    throw new Error(`Customer profile could not be read: ${result.error.message}`);
  }

  const profile: unknown = result.data;
  const profileId =
    typeof profile === 'object' &&
    profile !== null &&
    'id' in profile &&
    typeof profile.id === 'string'
      ? profile.id
      : null;

  if (!profileId) {
    return { profileId: null, rows: [] };
  }

  return { profileId, rows: await listCpapPrescriptionsByProfileId(profileId) };
}

/*
 * What the checkout gate reads for a cart holding a complete mask: the
 * customer's CPAP prescriptions, after making sure the sign-off table
 * (rx_order_checks) can be reached, so a paid mask order can always be
 * recorded for the pharmacist. Throws on any failure (fails closed).
 */
export async function listCpapPrescriptionsForCheckout(
  bigcommerceCustomerId: number,
): Promise<CustomerCpapPrescriptions> {
  const [onFile] = await Promise.all([
    listCpapPrescriptionsForCustomer(bigcommerceCustomerId),
    isSupabaseConfigured() ? assertRxOrderChecksReachable() : Promise.resolve(),
  ]);

  return onFile;
}
