import type { CheckoutAddressSnapshot } from '../checkout/types';

function getCountryName(countryCode: string): string {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (!normalizedCode) {
    return 'United States';
  }

  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return displayNames.of(normalizedCode) ?? normalizedCode;
  } catch {
    return normalizedCode;
  }
}

export function toBigCommerceOrderAddress(address: CheckoutAddressSnapshot) {
  const countryCode = address.countryCode.trim().toUpperCase() || 'US';

  return {
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.company,
    street_1: address.address1,
    street_2: address.address2,
    city: address.city,
    state: address.stateOrProvinceCode ?? address.stateOrProvince,
    zip: address.postalCode,
    country: getCountryName(countryCode),
    country_iso2: countryCode,
    phone: address.phone,
    email: address.email,
  };
}
