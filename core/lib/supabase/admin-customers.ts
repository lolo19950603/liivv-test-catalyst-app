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
  listPrescriptionsByProfileId,
  listRefillRequestsByProfileId,
  type CarePackRequestRow,
  type PrescriptionRow,
  type RefillRequestRow,
} from '~/lib/supabase/prescriptions';
import { getSupabaseClient } from '~/lib/supabase/client';
import type { CustomerProfileRow } from '~/lib/supabase/profile';
import {
  customerSearchMinLength,
  type CustomerSearchField,
} from '~/lib/staff/customer-search';

export type AdminProfileSearchRow = Pick<
  CustomerProfileRow,
  'id' | 'bigcommerce_customer_id' | 'email' | 'first_name' | 'last_name' | 'phone' | 'created_at'
>;

export const ADMIN_CUSTOMER_PAGE_SIZE = 20;

const PROFILE_LIST_COLUMNS =
  'id, bigcommerce_customer_id, email, first_name, last_name, phone, created_at';

function ilikePattern(raw: string): string {
  const escaped = raw.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

  return `%${escaped}%`;
}

function quoteIlike(pattern: string): string {
  return `"${pattern.replace(/"/g, '\\"')}"`;
}

function phoneIlikePattern(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  if (digits.length < 3) {
    return null;
  }

  const chunks = digits.match(/\d{1,3}/g) ?? [digits];

  return `%${chunks.join('%')}%`;
}

function dateSearchRange(query: string): { start: string; end: string } | null {
  const q = query.trim();
  const iso = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(q);

  if (iso) {
    const year = Number(iso[1]);
    const month = iso[2] ? Number(iso[2]) : null;
    const day = iso[3] ? Number(iso[3]) : null;

    if (month !== null && (month < 1 || month > 12)) {
      return null;
    }

    if (day !== null && (day < 1 || day > 31)) {
      return null;
    }

    if (month !== null && day !== null) {
      return {
        start: new Date(Date.UTC(year, month - 1, day)).toISOString(),
        end: new Date(Date.UTC(year, month - 1, day + 1)).toISOString(),
      };
    }

    if (month !== null) {
      return {
        start: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
        end: new Date(Date.UTC(year, month, 1)).toISOString(),
      };
    }

    return {
      start: new Date(Date.UTC(year, 0, 1)).toISOString(),
      end: new Date(Date.UTC(year + 1, 0, 1)).toISOString(),
    };
  }

  const named = /^([a-z]+)\s+(\d{4})$/i.exec(q);

  if (!named || named[1].length < 3) {
    return null;
  }

  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  const monthIndex = months.findIndex((month) => month.startsWith(named[1].toLowerCase()));

  if (monthIndex < 0) {
    return null;
  }

  const year = Number(named[2]);

  return {
    start: new Date(Date.UTC(year, monthIndex, 1)).toISOString(),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)).toISOString(),
  };
}

function profileSearchFilter(query: string, field: CustomerSearchField): string | null {
  if (
    field === 'address' ||
    field === 'postal' ||
    field === 'company' ||
    field === 'city' ||
    field === 'province' ||
    field === 'country' ||
    field === 'notes' ||
    field === 'full_name'
  ) {
    return null;
  }

  const quoted = quoteIlike(ilikePattern(query));
  const phonePattern = phoneIlikePattern(query);
  const phoneQuoted = phonePattern ? quoteIlike(phonePattern) : null;

  if (field === 'first_name') {
    return `first_name.ilike.${quoted}`;
  }

  if (field === 'last_name') {
    return `last_name.ilike.${quoted}`;
  }

  if (field === 'email') {
    return `email.ilike.${quoted}`;
  }

  if (field === 'phone') {
    return phoneQuoted ? `phone.ilike.${phoneQuoted}` : `phone.ilike.${quoted}`;
  }

  if (field === 'customer_id') {
    const exact = `bigcommerce_customer_id.eq.${query.trim()}`;

    if (/^\d+$/.test(query.trim()) && query.trim().length >= 2) {
      return `${exact},bigcommerce_customer_id.like.${query.trim()}*`;
    }

    return exact;
  }

  const parts = [`first_name.ilike.${quoted}`, `last_name.ilike.${quoted}`, `email.ilike.${quoted}`, `phone.ilike.${quoted}`];

  if (phoneQuoted && phoneQuoted !== quoted) {
    parts.push(`phone.ilike.${phoneQuoted}`);
  }

  if (/^\d+$/.test(query.trim())) {
    parts.push(`bigcommerce_customer_id.eq.${query.trim()}`);
  }

  return parts.join(',');
}

function profileMatchLabel(profile: AdminProfileSearchRow, query: string, field: CustomerSearchField): string {
  const needle = query.trim().toLowerCase();
  const includes = (value: string | null | undefined) => (value ?? '').toLowerCase().includes(needle);
  const phoneDigits = query.replace(/\D/g, '');
  const phoneMatches =
    phoneDigits.length >= 3 && (profile.phone ?? '').replace(/\D/g, '').includes(phoneDigits);

  if (field === 'first_name' || (field === 'smart' && includes(profile.first_name))) {
    return `First name · ${profile.first_name ?? query}`;
  }

  if (field === 'last_name' || (field === 'smart' && includes(profile.last_name))) {
    return `Last name · ${profile.last_name ?? query}`;
  }

  if (field === 'email' || (field === 'smart' && includes(profile.email))) {
    return `Email · ${profile.email ?? query}`;
  }

  if (field === 'phone' || phoneMatches) {
    return `Phone · ${profile.phone ?? query}`;
  }

  if (field === 'customer_id' || (field === 'smart' && profile.bigcommerce_customer_id === query.trim())) {
    return `Customer ID · ${profile.bigcommerce_customer_id}`;
  }

  if (
    field === 'created' ||
    (field === 'smart' && dateSearchRange(query))
  ) {
    const added = new Date(profile.created_at);

    return `Added · ${
      Number.isNaN(added.getTime())
        ? profile.created_at.slice(0, 10)
        : new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Toronto',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(added)
    }`;
  }

  return 'Match';
}

export async function searchProfilesForAdmin(
  query: string,
  field: CustomerSearchField = 'smart',
  limit = 50,
): Promise<{ ok: true; rows: AdminProfileSearchRow[] } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const q = query.trim();

  if (q.length < customerSearchMinLength(field)) {
    return { ok: true, rows: [] };
  }

  const filter = field === 'created' ? null : profileSearchFilter(q, field);
  const createdRange = field === 'created' || field === 'smart' ? dateSearchRange(q) : null;

  if (!filter && !createdRange) {
    return { ok: true, rows: [] };
  }

  try {
    const supabase = getSupabaseClient();
    const queries = [];

    if (filter) {
      queries.push(supabase.from('profiles').select(PROFILE_LIST_COLUMNS).or(filter).limit(limit));
    }

    if (createdRange) {
      queries.push(
        supabase
          .from('profiles')
          .select(PROFILE_LIST_COLUMNS)
          .gte('created_at', createdRange.start)
          .lt('created_at', createdRange.end)
          .limit(limit),
      );
    }

    const results = await Promise.all(queries);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      return { ok: false, message: failed.error.message };
    }

    const seen = new Set<string>();
    const rows: AdminProfileSearchRow[] = [];

    for (const result of results) {
      for (const row of (result.data ?? []) as AdminProfileSearchRow[]) {
        if (seen.has(row.id)) {
          continue;
        }

        seen.add(row.id);
        rows.push(row);
      }
    }

    return { ok: true, rows: rows.slice(0, limit) };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Search failed.',
    };
  }
}

export type AdminMergedSearchRow =
  | { source: 'supabase'; profile: AdminProfileSearchRow; matchLabel?: string }
  | { source: 'bigcommerce_only'; hit: AdminBigCommerceSearchHit; matchLabel?: string };

async function profilesByBigCommerceIds(
  ids: string[],
): Promise<{ ok: true; rows: AdminProfileSearchRow[] } | { ok: false; message: string }> {
  if (ids.length === 0) {
    return { ok: true, rows: [] };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_LIST_COLUMNS)
      .in('bigcommerce_customer_id', ids);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, rows: (data ?? []) as AdminProfileSearchRow[] };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not match customer profiles.',
    };
  }
}

function rowSortName(row: AdminMergedSearchRow): string {
  if (row.source === 'supabase') {
    return [row.profile.last_name, row.profile.first_name, row.profile.email].filter(Boolean).join(' ');
  }

  return [row.hit.lastName, row.hit.firstName, row.hit.email].filter(Boolean).join(' ');
}

export async function searchMergedCustomersForAdmin(
  query: string,
  field: CustomerSearchField = 'smart',
  limit = 50,
): Promise<
  | { ok: true; rows: AdminMergedSearchRow[]; bigcommerceSearchError: string | null }
  | { ok: false; message: string }
> {
  const bcConfigured = isBigCommerceAdminConfigured();

  const [supa, bc] = await Promise.all([
    searchProfilesForAdmin(query, field, limit),
    bcConfigured
      ? searchBigCommerceCustomersForAdmin(query, field, limit)
      : Promise.resolve({ ok: true as const, hits: [] as AdminBigCommerceSearchHit[] }),
  ]);

  if (!supa.ok) {
    return supa;
  }

  const rows: AdminMergedSearchRow[] = supa.rows.map((profile) => ({
    source: 'supabase',
    profile,
    matchLabel: profileMatchLabel(profile, query, field),
  }));
  const seenProfiles = new Set(supa.rows.map((row) => row.id));
  const seenBc = new Set(
    supa.rows
      .map((row) => row.bigcommerce_customer_id?.trim())
      .filter((id): id is string => Boolean(id)),
  );

  if (!bcConfigured) {
    return { ok: true, rows, bigcommerceSearchError: null };
  }

  if (!bc.ok) {
    return { ok: true, rows, bigcommerceSearchError: bc.message };
  }

  const missingIds = bc.hits
    .map((hit) => hit.bigcommerce_customer_id)
    .filter((id) => !seenBc.has(id));
  const linked = await profilesByBigCommerceIds(missingIds);
  const linkedByBc = new Map(
    (linked.ok ? linked.rows : [])
      .map((profile) => [profile.bigcommerce_customer_id?.trim() ?? '', profile] as const)
      .filter((entry): entry is [string, AdminProfileSearchRow] => Boolean(entry[0])),
  );

  for (const hit of bc.hits) {
    if (seenBc.has(hit.bigcommerce_customer_id)) {
      continue;
    }

    const profile = linkedByBc.get(hit.bigcommerce_customer_id);

    if (profile && !seenProfiles.has(profile.id)) {
      seenProfiles.add(profile.id);
      seenBc.add(hit.bigcommerce_customer_id);
      rows.push({ source: 'supabase', profile, matchLabel: hit.matchLabel });
      continue;
    }

    seenBc.add(hit.bigcommerce_customer_id);
    rows.push({ source: 'bigcommerce_only', hit, matchLabel: hit.matchLabel });
  }

  rows.sort((a, b) => rowSortName(a).localeCompare(rowSortName(b), undefined, { sensitivity: 'base' }));

  return {
    ok: true,
    rows: rows.slice(0, limit),
    bigcommerceSearchError: linked.ok ? null : linked.message,
  };
}

export async function listProfilesPageForAdmin(
  page: number,
  pageSize = ADMIN_CUSTOMER_PAGE_SIZE,
): Promise<
  | { ok: true; rows: AdminMergedSearchRow[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'Supabase is not configured.' };
  }

  const size = Math.min(100, Math.max(1, pageSize));
  const requested = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  try {
    const listed = await fetchProfilesPage(requested, size);

    if (!listed.ok) {
      return listed;
    }

    const pageCount = Math.max(1, Math.ceil(listed.total / size));
    const safePage = Math.min(requested, pageCount);

    if (safePage !== requested && listed.total > 0) {
      return fetchProfilesPage(safePage, size);
    }

    return { ...listed, page: safePage };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not load customers.',
    };
  }
}

async function fetchProfilesPage(
  page: number,
  pageSize: number,
): Promise<
  | { ok: true; rows: AdminMergedSearchRow[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from('profiles')
    .select(PROFILE_LIST_COLUMNS, { count: 'exact' })
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .order('email', { ascending: true })
    .range(from, to);

  if (error) {
    return { ok: false, message: error.message };
  }

  const rows: AdminMergedSearchRow[] = ((data ?? []) as AdminProfileSearchRow[]).map((profile) => ({
    source: 'supabase',
    profile,
  }));

  return {
    ok: true,
    rows,
    total: count ?? rows.length,
    page,
    pageSize,
  };
}

export async function countProfilesForAdmin(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });

    if (error) {
      return 0;
    }

    return count ?? 0;
  } catch {
    return 0;
  }
}

export type AdminCustomerDetail = {
  profile: CustomerProfileRow | null;
  health: HealthProfileRow | null;
  insurances: InsuranceInfoRow[];
  prescriptions: PrescriptionRow[];
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
    const bcId = profile.bigcommerce_customer_id?.trim();

    const [health, insurances, prescriptions, refillRequests, carePackRequests, bcResult] =
      await Promise.all([
        getHealthProfileByProfileId(profileId),
        listInsuranceByProfileId(profileId),
        listPrescriptionsByProfileId(profileId),
        listRefillRequestsByProfileId(profileId),
        listCarePackRequestsByProfileId(profileId),
        bcId && isBigCommerceAdminConfigured()
          ? fetchAdminBigCommerceCustomerSnapshot(bcId)
          : Promise.resolve(null),
      ]);

    let bigcommerce: AdminBigCommerceCustomerSnapshot | null = null;
    let bigcommerceLoadError: string | null = null;

    if (bcResult) {
      if (bcResult.ok) {
        bigcommerce = bcResult.customer;
      } else {
        bigcommerceLoadError = bcResult.message;
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
