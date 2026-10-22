import 'server-only';

import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { customerSearchMinLength, type CustomerSearchField } from '~/lib/staff/customer-search';

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
  matchLabel?: string;
};

type BigCommerceAddress = {
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
};

type BigCommerceCustomer = {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  notes?: string;
  date_created?: string;
  addresses?: BigCommerceAddress[];
};

type BigCommerceCustomersResponse = {
  data?: BigCommerceCustomer[];
  meta?: { pagination?: { total_pages?: number } };
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

const CUSTOMER_SCAN_PAGE_SIZE = 250;
const CUSTOMER_SCAN_MAX_PAGES = 8;

function fold(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function compactCode(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function queryParts(query: string): string[] {
  return fold(query)
    .split(/[\s,]+/)
    .filter((part) => part.length > 0);
}

function textIncludes(haystack: string, needle: string): boolean {
  const h = fold(haystack);
  const n = fold(needle);

  return n.length > 0 && h.includes(n);
}

function valuesInclude(values: Array<string | undefined>, query: string): boolean {
  const blob = fold(values.filter((value): value is string => Boolean(value?.trim())).join(' '));
  const parts = queryParts(query);

  return parts.length > 0 && parts.every((part) => blob.includes(part));
}

function phoneHit(phones: Array<string | undefined>, query: string): string | null {
  const candidates = phones.map((phone) => phone?.trim() ?? '').filter(Boolean);

  for (const phone of candidates) {
    const phoneDigits = digitsOnly(phone);
    const parts = queryParts(query);
    const matched = parts.every((part) => {
      const partDigits = digitsOnly(part);

      if (partDigits.length >= 3) {
        return phoneDigits.includes(partDigits);
      }

      return textIncludes(phone, part);
    });

    if (matched) {
      return phone;
    }
  }

  return null;
}

function postalHit(addresses: BigCommerceAddress[], query: string): string | null {
  const parts = queryParts(query)
    .map(compactCode)
    .filter((part) => part.length >= 3);

  if (parts.length === 0) {
    return null;
  }

  for (const address of addresses) {
    const code = compactCode(address.postal_code ?? '');

    if (code && parts.every((part) => code.includes(part))) {
      return address.postal_code?.trim() || null;
    }
  }

  return null;
}

function locationHit(
  addresses: BigCommerceAddress[],
  query: string,
  pick: (address: BigCommerceAddress) => string | undefined,
): string | null {
  for (const address of addresses) {
    const value = pick(address)?.trim();

    if (value && valuesInclude([value], query)) {
      return value;
    }
  }

  return null;
}

function companyHit(customer: BigCommerceCustomer, addresses: BigCommerceAddress[], query: string): string | null {
  const companies = [customer.company, ...addresses.map((address) => address.company)];
  const match = companies.find((company) => company?.trim() && valuesInclude([company], query));

  return match?.trim() || null;
}

function customerIdHit(id: number, query: string): boolean {
  const q = query.trim();

  if (!/^\d+$/.test(q)) {
    return false;
  }

  const idText = String(id);

  return idText === q || (q.length >= 2 && idText.startsWith(q));
}

function formatAdded(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function addedHit(iso: string | undefined, query: string): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return textIncludes(iso, query) ? iso.slice(0, 10) : null;
  }

  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'America/Toronto' });
  const shortMonth = date.toLocaleString('en-US', { month: 'short', timeZone: 'America/Toronto' });
  const blob = `${iso.slice(0, 10)} ${month} ${shortMonth} ${formatAdded(iso)}`;

  return valuesInclude([blob], query) ? formatAdded(iso) : null;
}

function fullNameHit(firstName: string, lastName: string, addresses: BigCommerceAddress[], query: string): string | null {
  const pairs = [
    [firstName, lastName],
    ...addresses.map((address) => [address.first_name?.trim() ?? '', address.last_name?.trim() ?? '']),
  ];

  for (const [first, last] of pairs) {
    const full = [first, last].filter(Boolean).join(' ');
    const reversed = [last, first].filter(Boolean).join(' ');
    const comma = first && last ? `${last}, ${first}` : '';

    if (valuesInclude([full, reversed, comma], query)) {
      return full || reversed;
    }
  }

  return null;
}

function addressSummary(address: BigCommerceAddress): string {
  return [address.address1, address.city, address.state_or_province, address.postal_code]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
}

function addressHit(addresses: BigCommerceAddress[], query: string): string | null {
  for (const address of addresses) {
    if (
      valuesInclude(
        [address.address1, address.address2, address.city, address.state_or_province, address.country, address.company],
        query,
      )
    ) {
      return addressSummary(address);
    }
  }

  return null;
}

function matchCustomer(
  customer: BigCommerceCustomer,
  query: string,
  field: CustomerSearchField,
): string | null {
  const addresses = customer.addresses ?? [];
  const firstName = customer.first_name?.trim() ?? '';
  const lastName = customer.last_name?.trim() ?? '';
  const email = customer.email?.trim() ?? '';
  const phones = [customer.phone, ...addresses.map((address) => address.phone)];
  const firstNames = [firstName, ...addresses.map((address) => address.first_name)];
  const lastNames = [lastName, ...addresses.map((address) => address.last_name)];

  if (field === 'full_name') {
    const name = fullNameHit(firstName, lastName, addresses, query);

    return name ? `Name · ${name}` : null;
  }

  if (field === 'first_name') {
    return valuesInclude(firstNames, query) ? `First name · ${firstName || query}` : null;
  }

  if (field === 'last_name') {
    return valuesInclude(lastNames, query) ? `Last name · ${lastName || query}` : null;
  }

  if (field === 'email') {
    return valuesInclude([email], query) ? `Email · ${email}` : null;
  }

  if (field === 'phone') {
    const phone = phoneHit(phones, query);

    return phone ? `Phone · ${phone}` : null;
  }

  if (field === 'company') {
    const company = companyHit(customer, addresses, query);

    return company ? `Company · ${company}` : null;
  }

  if (field === 'city') {
    const city = locationHit(addresses, query, (address) => address.city);

    return city ? `City · ${city}` : null;
  }

  if (field === 'province') {
    const province = locationHit(addresses, query, (address) => address.state_or_province);

    return province ? `Province · ${province}` : null;
  }

  if (field === 'country') {
    const country = locationHit(addresses, query, (address) => address.country);

    return country ? `Country · ${country}` : null;
  }

  if (field === 'customer_id') {
    return customerIdHit(customer.id, query) ? `Customer ID · ${customer.id}` : null;
  }

  if (field === 'created') {
    const added = addedHit(customer.date_created, query);

    return added ? `Added · ${added}` : null;
  }

  if (field === 'notes') {
    const notes = customer.notes?.trim() ?? '';

    return notes && valuesInclude([notes], query) ? `Notes · ${notes}` : null;
  }

  if (field === 'address') {
    const address = addressHit(addresses, query);

    return address ? `Address · ${address}` : null;
  }

  if (field === 'postal') {
    const postal = postalHit(addresses, query);

    return postal ? `Postal code · ${postal}` : null;
  }

  const reasons: string[] = [];

  for (const part of queryParts(query)) {
    if (valuesInclude(firstNames, part)) {
      reasons.push(`First name · ${firstName || part}`);
      continue;
    }

    if (valuesInclude(lastNames, part)) {
      reasons.push(`Last name · ${lastName || part}`);
      continue;
    }

    if (valuesInclude([`${firstName} ${lastName}`, `${lastName} ${firstName}`], part)) {
      reasons.push(`Name · ${[firstName, lastName].filter(Boolean).join(' ')}`);
      continue;
    }

    if (valuesInclude([email], part)) {
      reasons.push(`Email · ${email}`);
      continue;
    }

    if (/^\d+$/.test(part) && String(customer.id) === part) {
      reasons.push(`Customer ID · ${customer.id}`);
      continue;
    }

    if (/^(19|20)\d{2}(-\d{2}){0,2}$/.test(part)) {
      const added = addedHit(customer.date_created, part);

      if (added) {
        reasons.push(`Added · ${added}`);
        continue;
      }
    }

    const phone = phoneHit(phones, part);

    if (phone) {
      reasons.push(`Phone · ${phone}`);
      continue;
    }

    const postal = postalHit(addresses, part);

    if (postal) {
      reasons.push(`Postal code · ${postal}`);
      continue;
    }

    const company = companyHit(customer, addresses, part);

    if (company) {
      reasons.push(`Company · ${company}`);
      continue;
    }

    const city = locationHit(addresses, part, (address) => address.city);

    if (city) {
      reasons.push(`City · ${city}`);
      continue;
    }

    const province = locationHit(addresses, part, (address) => address.state_or_province);

    if (province) {
      reasons.push(`Province · ${province}`);
      continue;
    }

    const country = locationHit(addresses, part, (address) => address.country);

    if (country) {
      reasons.push(`Country · ${country}`);
      continue;
    }

    const address = addressHit(addresses, part);

    if (address) {
      reasons.push(`Address · ${address}`);
      continue;
    }

    const notes = customer.notes?.trim();

    if (notes && valuesInclude([notes], part)) {
      reasons.push(`Notes · ${notes}`);
      continue;
    }

    return null;
  }

  return [...new Set(reasons)].slice(0, 2).join(' · ') || null;
}

export async function searchBigCommerceCustomersForAdmin(
  query: string,
  field: CustomerSearchField = 'smart',
  limit = 50,
): Promise<{ ok: true; hits: AdminBigCommerceSearchHit[] } | { ok: false; message: string }> {
  if (!isBigCommerceAdminConfigured()) {
    return { ok: false, message: 'BigCommerce Admin API is not configured.' };
  }

  const q = query.trim();

  if (q.length < customerSearchMinLength(field)) {
    return { ok: true, hits: [] };
  }

  try {
    const hits: AdminBigCommerceSearchHit[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= CUSTOMER_SCAN_MAX_PAGES && hits.length < limit) {
      const response = await bigCommerceAdminFetch<BigCommerceCustomersResponse>(
        `/v3/customers?include=addresses&limit=${CUSTOMER_SCAN_PAGE_SIZE}&page=${page}`,
        { timeoutMs: 8_000 },
      );

      totalPages = response.meta?.pagination?.total_pages ?? 1;

      for (const customer of response.data ?? []) {
        const matchLabel = matchCustomer(customer, q, field);

        if (!matchLabel) {
          continue;
        }

        hits.push({
          bigcommerce_customer_id: String(customer.id),
          email: customer.email?.trim() ?? '',
          firstName: customer.first_name?.trim() ?? '',
          lastName: customer.last_name?.trim() ?? '',
          matchLabel,
        });

        if (hits.length >= limit) {
          break;
        }
      }

      page += 1;
    }

    return { ok: true, hits };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'BigCommerce customer search failed.',
    };
  }
}
