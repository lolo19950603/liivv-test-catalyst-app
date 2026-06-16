export interface AddressParts {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateOrProvince?: string;
  countryCode?: string;
  postalCode?: string;
  phone?: string;
}

export function formatAddressInline(address: AddressParts): string {
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');
  const street = [address.address1, address.address2].filter(Boolean).join(', ');
  const locality = [address.city, address.stateOrProvince, address.postalCode]
    .filter(Boolean)
    .join(' ');
  const country = address.countryCode ?? '';

  return [name, street, locality, country].filter(Boolean).join(', ');
}

export function formatAddressMultiline(address: AddressParts): string[] {
  const lines: string[] = [];

  const name = [address.firstName, address.lastName].filter(Boolean).join(' ');

  if (name) {
    lines.push(name);
  }

  if (address.company) {
    lines.push(address.company);
  }

  if (address.address1) {
    lines.push(
      [address.address1, address.address2].filter(Boolean).join(', '),
    );
  }

  const locality = [address.city, address.stateOrProvince, address.postalCode, address.countryCode]
    .filter(Boolean)
    .join(' ');

  if (locality) {
    lines.push(locality);
  }

  if (address.phone) {
    lines.push(address.phone);
  }

  return lines;
}
