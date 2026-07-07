import 'server-only';

import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';

export type AdminBigCommerceAddress = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type AdminBigCommerceCustomerSnapshot = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addresses: AdminBigCommerceAddress[];
};

export type AdminBigCommerceSearchHit = {
  bigcommerce_customer_id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type BigCommerceCustomer = {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  addresses?: Array<{
    first_name?: string;
    last_name?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state_or_province?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
  }>;
};

type BigCommerceCustomersResponse = {
  data?: BigCommerceCustomer[];
};

function mapAddress(addr: NonNullable<BigCommerceCustomer['addresses']>[number]): AdminBigCommerceAddress {
  return {
    firstName: addr.first_name?.trim() ?? '',
    lastName: addr.last_name?.trim() ?? '',
    company: addr.company?.trim() ?? '',
    address1: addr.address1?.trim() ?? '',
    address2: addr.address2?.trim() ?? '',
    city: addr.city?.trim() ?? '',
    stateOrProvince: addr.state_or_province?.trim() ?? '',
    postalCode: addr.postal_code?.trim() ?? '',
    country: addr.country?.trim() ?? '',
    phone: addr.phone?.trim() ?? '',
  };
}

export async function fetchAdminBigCommerceCustomerSnapshot(
  customerId: string,
): Promise<
  { ok: true; customer: AdminBigCommerceCustomerSnapshot } | { ok: false; message: string }
> {
  if (!isBigCommerceAdminConfigured()) {
    return { ok: false, message: 'BigCommerce Admin API is not configured.' };
  }

  try {
    const response = await bigCommerceAdminFetch<BigCommerceCustomersResponse>(
      `/v3/customers?id:in=${encodeURIComponent(customerId)}&include=addresses`,
    );
    const row = response.data?.[0];

    if (!row) {
      return { ok: false, message: 'Customer not found in BigCommerce.' };
    }

    return {
      ok: true,
      customer: {
        id: row.id,
        email: row.email?.trim() ?? '',
        firstName: row.first_name?.trim() ?? '',
        lastName: row.last_name?.trim() ?? '',
        phone: row.phone?.trim() ?? '',
        addresses: (row.addresses ?? []).map(mapAddress),
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Could not load BigCommerce customer.',
    };
  }
}

export async function searchBigCommerceCustomersForAdmin(
  query: string,
  limit = 25,
): Promise<{ ok: true; hits: AdminBigCommerceSearchHit[] } | { ok: false; message: string }> {
  if (!isBigCommerceAdminConfigured()) {
    return { ok: false, message: 'BigCommerce Admin API is not configured.' };
  }

  const q = query.trim();

  if (q.length < 2) {
    return { ok: true, hits: [] };
  }

  try {
    const path = q.includes('@')
      ? `/v3/customers?email:in=${encodeURIComponent(q)}&limit=${limit}`
      : `/v3/customers?name:like=${encodeURIComponent(`%${q}%`)}&limit=${limit}`;
    const response = await bigCommerceAdminFetch<BigCommerceCustomersResponse>(path);

    const hits = (response.data ?? []).map((row) => ({
      bigcommerce_customer_id: String(row.id),
      email: row.email?.trim() ?? '',
      firstName: row.first_name?.trim() ?? '',
      lastName: row.last_name?.trim() ?? '',
    }));

    return { ok: true, hits };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'BigCommerce customer search failed.',
    };
  }
}
