import 'server-only';

import {
  fetchAdminBigCommerceCustomerSnapshot,
  searchBigCommerceCustomersForAdmin,
  type AdminBigCommerceCustomerSnapshot,
  type AdminBigCommerceSearchHit,
} from '~/lib/bigcommerce/admin-customers';
import { isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { getHealthProfileByProfileId, type HealthProfileRow } from '~/lib/supabase/health-profile';
import { listInsuranceByProfileId, type InsuranceInfoRow } from '~/lib/supabase/insurance';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  listCarePackRequestsByProfileId,
  listPrescriptionsByProfileIdWithSignedPhotos,
  listRefillRequestsByProfileId,
  type CarePackRequestRow,
  type PrescriptionRow,
  type RefillRequestRow,
} from '~/lib/supabase/prescriptions';
import { getSupabaseClient } from '~/lib/supabase/client';
import type { CustomerProfileRow } from '~/lib/supabase/profile';

export type AdminProfileSearchRow = Pick<
  CustomerProfileRow,
  'id' | 'bigcommerce_customer_id' | 'email' | 'first_name' | 'last_name' | 'created_at'
>;

function ilikePattern(raw: string): string {
  const escaped = raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

  return `%${escaped}%`;
}

export async function searchProfilesForAdmin(
  query: string,
  limit = 50,
): Promise<{ ok: true; rows: AdminProfileSearchRow[] } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const q = query.trim();

  if (q.length < 2) {
    return { ok: true, rows: [] };
  }

  try {
    const supabase = getSupabaseClient();
    const pattern = ilikePattern(q);
    const cols = 'id, bigcommerce_customer_id, email, first_name, last_name, created_at';

    const [fn, ln, em] = await Promise.all([
      supabase.from('profiles').select(cols).ilike('first_name', pattern).limit(limit),
      supabase.from('profiles').select(cols).ilike('last_name', pattern).limit(limit),
      supabase.from('profiles').select(cols).ilike('email', pattern).limit(limit),
    ]);

    const err = fn.error ?? ln.error ?? em.error;

    if (err) {
      return { ok: false, message: err.message };
    }

    const byId = new Map<string, AdminProfileSearchRow>();

    for (const row of [...(fn.data ?? []), ...(ln.data ?? []), ...(em.data ?? [])]) {
      const r = row as AdminProfileSearchRow;

      byId.set(r.id, r);
    }

    return { ok: true, rows: [...byId.values()].slice(0, limit) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Search failed.',
    };
  }
}

export type AdminMergedSearchRow =
  | { source: 'supabase'; profile: AdminProfileSearchRow }
  | { source: 'bigcommerce_only'; hit: AdminBigCommerceSearchHit };

export async function searchMergedCustomersForAdmin(
  query: string,
  limit = 50,
): Promise<
  | { ok: true; rows: AdminMergedSearchRow[]; bigcommerceSearchError: string | null }
  | { ok: false; message: string }
> {
  const supa = await searchProfilesForAdmin(query, limit);

  if (!supa.ok) {
    return supa;
  }

  const rows: AdminMergedSearchRow[] = supa.rows.map((profile) => ({
    source: 'supabase',
    profile,
  }));

  if (!isBigCommerceAdminConfigured()) {
    return { ok: true, rows, bigcommerceSearchError: null };
  }

  const bc = await searchBigCommerceCustomersForAdmin(query, limit);

  if (!bc.ok) {
    return { ok: true, rows, bigcommerceSearchError: bc.message };
  }

  const seenBc = new Set(
    supa.rows
      .map((r) => r.bigcommerce_customer_id?.trim())
      .filter((id): id is string => Boolean(id)),
  );

  for (const hit of bc.hits) {
    if (seenBc.has(hit.bigcommerce_customer_id)) {
      continue;
    }

    seenBc.add(hit.bigcommerce_customer_id);
    rows.push({ source: 'bigcommerce_only', hit });
  }

  return {
    ok: true,
    rows: rows.slice(0, limit),
    bigcommerceSearchError: null,
  };
}

export type PrescriptionRowWithPhoto = PrescriptionRow & { photoDisplayUrl: string | null };

export type AdminCustomerDetail = {
  profile: CustomerProfileRow | null;
  health: HealthProfileRow | null;
  insurances: InsuranceInfoRow[];
  prescriptions: PrescriptionRowWithPhoto[];
  refillRequests: RefillRequestRow[];
  carePackRequests: CarePackRequestRow[];
  bigcommerce: AdminBigCommerceCustomerSnapshot | null;
  bigcommerceLoadError: string | null;
};

export async function getAdminCustomerDetail(
  profileId: string,
): Promise<{ ok: true; detail: AdminCustomerDetail } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    if (!data) {
      return { ok: false, message: 'Customer not found.' };
    }

    const profile = data as CustomerProfileRow;
    const [health, insurances, prescriptions, refillRequests, carePackRequests] = await Promise.all([
      getHealthProfileByProfileId(profileId),
      listInsuranceByProfileId(profileId),
      listPrescriptionsByProfileIdWithSignedPhotos(profileId),
      listRefillRequestsByProfileId(profileId),
      listCarePackRequestsByProfileId(profileId),
    ]);

    let bigcommerce: AdminBigCommerceCustomerSnapshot | null = null;
    let bigcommerceLoadError: string | null = null;
    const bcId = profile.bigcommerce_customer_id?.trim();

    if (bcId && isBigCommerceAdminConfigured()) {
      const snap = await fetchAdminBigCommerceCustomerSnapshot(bcId);

      if (snap.ok) {
        bigcommerce = snap.customer;
      } else {
        bigcommerceLoadError = snap.message;
      }
    }

    return {
      ok: true,
      detail: {
        profile,
        health,
        insurances,
        prescriptions,
        refillRequests,
        carePackRequests,
        bigcommerce,
        bigcommerceLoadError,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Load failed.',
    };
  }
}

export async function getAdminCustomerDetailByBigCommerceId(
  bigcommerceCustomerId: string,
): Promise<{ ok: true; detail: AdminCustomerDetail } | { ok: false; message: string }> {
  if (!isBigCommerceAdminConfigured()) {
    return { ok: false, message: 'BigCommerce Admin API is not configured.' };
  }

  const snap = await fetchAdminBigCommerceCustomerSnapshot(bigcommerceCustomerId);

  if (!snap.ok) {
    return { ok: false, message: snap.message };
  }

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('bigcommerce_customer_id', bigcommerceCustomerId)
      .maybeSingle();

    if (data?.id) {
      return getAdminCustomerDetail(data.id);
    }
  }

  return {
    ok: true,
    detail: {
      profile: null,
      health: null,
      insurances: [],
      prescriptions: [],
      refillRequests: [],
      carePackRequests: [],
      bigcommerce: snap.customer,
      bigcommerceLoadError: null,
    },
  };
}
