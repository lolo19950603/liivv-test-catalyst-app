export const CUSTOMER_SEARCH_FIELDS = [
  {
    id: 'smart',
    label: 'Smart search',
    group: 'Search',
    placeholder: 'Name, email, phone, company, city, postal code, customer ID',
  },
  { id: 'full_name', label: 'Full name', group: 'Contact', placeholder: 'First and last name' },
  { id: 'first_name', label: 'First name', group: 'Contact', placeholder: 'First name' },
  { id: 'last_name', label: 'Last name', group: 'Contact', placeholder: 'Last name' },
  { id: 'email', label: 'Email', group: 'Contact', placeholder: 'Email' },
  { id: 'phone', label: 'Phone', group: 'Contact', placeholder: 'Phone number' },
  { id: 'company', label: 'Company', group: 'Contact', placeholder: 'Company' },
  { id: 'address', label: 'Address', group: 'Location', placeholder: 'Street, city, or province' },
  { id: 'city', label: 'City', group: 'Location', placeholder: 'City' },
  { id: 'province', label: 'Province', group: 'Location', placeholder: 'Province or state' },
  { id: 'postal', label: 'Postal code', group: 'Location', placeholder: 'Postal code' },
  { id: 'country', label: 'Country', group: 'Location', placeholder: 'Country' },
  { id: 'customer_id', label: 'Customer ID', group: 'Account', placeholder: 'Store customer ID' },
  { id: 'created', label: 'Date added', group: 'Account', placeholder: '2026-05 or Oct 2026' },
  { id: 'notes', label: 'Notes', group: 'Account', placeholder: 'Note text' },
] as const;

export const CUSTOMER_SEARCH_GROUPS = ['Search', 'Contact', 'Location', 'Account'] as const;

export type CustomerSearchField = (typeof CUSTOMER_SEARCH_FIELDS)[number]['id'];

export function parseCustomerSearchField(raw: string | undefined): CustomerSearchField {
  const match = CUSTOMER_SEARCH_FIELDS.find((field) => field.id === raw);

  return match?.id ?? 'smart';
}

export function customerSearchMinLength(field: CustomerSearchField): number {
  if (field === 'customer_id') {
    return 1;
  }

  if (field === 'postal' || field === 'phone') {
    return 3;
  }

  if (field === 'created') {
    return 4;
  }

  return 2;
}
