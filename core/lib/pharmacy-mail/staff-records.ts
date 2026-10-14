import 'server-only';

import { fetchAdminBigCommerceCustomerSnapshot } from '~/lib/bigcommerce/admin-customers';
import { isCpapPrescriptionRow } from '~/lib/pharmacy/pharmacy-mappers';
import { getStaffAccessContext } from '~/lib/staff-access';
import { getSupabaseClient } from '~/lib/supabase/client';
import { getPrescriptionById } from '~/lib/supabase/prescriptions';
import { getRxOrderCheckById } from '~/lib/supabase/rx-order-checks';
import type { ThreadTopic } from '~/lib/supabase/pharmacy-threads';

import { type PharmacyRegion, pharmacyRegionOf } from './regions';

/*
 * Server helpers for the Pharmacy admin's message actions (owner decision
 * Q10, 2026-10-14): who is acting, and which customer and province a CPAP
 * prescription or mask order belongs to.
 */

const REVIEWER_MAX = 120;

/* A form field as trimmed text; anything that is not text reads as empty. */
export function formText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

/*
 * Who is acting: the pharmacist's own name and licence number as typed (the
 * admin is one shared login), with the login. Same rule as the CPAP decisions.
 */
export async function staffActor(
  formData: FormData,
  options: { requireName: boolean },
): Promise<{ actor: string; login: string } | { unauthorized: true } | { error: string }> {
  const login = (await getStaffAccessContext())?.username;

  if (!login) {
    return { unauthorized: true };
  }

  const typed = formText(formData, 'reviewerName').replace(/\s+/g, ' ').slice(0, REVIEWER_MAX);

  if (typed.length < 3) {
    return options.requireName
      ? { error: 'Enter your name and licence number.' }
      : { actor: `(login: ${login})`, login };
  }

  return { actor: `${typed} (login: ${login})`, login };
}

export interface StaffRecord {
  topic: ThreadTopic;
  recordId: string;
  profileId: string;
  /** The province hint for a thread that doesn't exist yet. */
  provinceHint: string | null;
}

/* The first saved BigCommerce address's province of a profile, or null. */
async function savedAddressProvince(profileId: string): Promise<string | null> {
  const { data } = await getSupabaseClient()
    .from('profiles')
    .select('bigcommerce_customer_id')
    .eq('id', profileId)
    .maybeSingle();
  const row: unknown = data;
  const customerId =
    typeof row === 'object' &&
    row !== null &&
    'bigcommerce_customer_id' in row &&
    typeof row.bigcommerce_customer_id === 'string'
      ? row.bigcommerce_customer_id.trim()
      : '';

  if (!customerId) {
    return null;
  }

  const snapshot = await fetchAdminBigCommerceCustomerSnapshot(customerId).catch(() => null);

  return snapshot?.ok ? (snapshot.customer.addresses[0]?.stateOrProvince ?? null) : null;
}

/*
 * The customer and province behind a CPAP prescription or a mask order, or
 * null when it isn't one. A CPAP prescription uses the province recorded at
 * intake (the fax went to that pharmacy); older rows use the first saved
 * address. A mask order uses its delivery province.
 */
export async function resolveStaffRecord(
  topic: string,
  recordId: string,
): Promise<StaffRecord | null> {
  if (topic === 'cpap_prescription') {
    const rx = await getPrescriptionById(recordId);

    if (!rx || !isCpapPrescriptionRow(rx)) {
      return null;
    }

    return {
      topic,
      recordId,
      profileId: rx.profile_id,
      provinceHint: rx.pharmacy_region ?? (await savedAddressProvince(rx.profile_id)),
    };
  }

  if (topic === 'mask_order') {
    const check = await getRxOrderCheckById(recordId);

    return check
      ? { topic, recordId, profileId: check.profile_id, provinceHint: check.region }
      : null;
  }

  return null;
}

export function recordRegion(record: StaffRecord): PharmacyRegion {
  return pharmacyRegionOf(record.provinceHint);
}
