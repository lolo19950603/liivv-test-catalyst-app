import type { CheckoutAddressSnapshot } from './types';

export function parseSubscriptionShippingAddressFromMetadata(
  metadata: Record<string, string | undefined>,
  email: string,
  defaults?: Pick<CheckoutAddressSnapshot, 'firstName' | 'lastName' | 'phone'>,
): CheckoutAddressSnapshot | undefined {
  const address1 = metadata.shipping_address1?.trim();
  const countryCode = metadata.shipping_address_country_code?.trim();

  if (!address1 || !countryCode) {
    return undefined;
  }

  const stateOrProvince = metadata.shipping_address_state_or_province?.trim() || undefined;
  const metadataFirstName = metadata.shipping_address_first_name?.trim();
  const metadataLastName = metadata.shipping_address_last_name?.trim();

  return {
    firstName: metadataFirstName || defaults?.firstName || 'Customer',
    lastName: metadataLastName || defaults?.lastName || 'Subscriber',
    email,
    address1,
    address2: metadata.shipping_address2?.trim() || undefined,
    city: metadata.shipping_address_city?.trim() ?? '',
    stateOrProvince,
    stateOrProvinceCode:
      stateOrProvince && stateOrProvince.length <= 3 ? stateOrProvince : undefined,
    countryCode,
    postalCode: metadata.shipping_address_postal_code?.trim() ?? '',
    phone: defaults?.phone,
  };
}

export function buildShippingAddressKey(address: CheckoutAddressSnapshot): string {
  return [
    address.address1.trim().toLowerCase(),
    address.address2?.trim().toLowerCase() ?? '',
    address.city.trim().toLowerCase(),
    address.stateOrProvince?.trim().toLowerCase() ?? '',
    address.postalCode.trim().toLowerCase(),
    address.countryCode.trim().toLowerCase(),
  ].join('|');
}

export function formatShippingAddressLabel(address: CheckoutAddressSnapshot): string {
  const locality = [address.city, address.stateOrProvince, address.postalCode]
    .filter(Boolean)
    .join(', ');

  const street = [address.address1, address.address2].filter(Boolean).join(', ');
  const addressLine = [street, locality, address.countryCode].filter(Boolean).join(' · ');
  const recipientName = [address.firstName?.trim(), address.lastName?.trim()].filter(Boolean).join(' ');

  return recipientName ? `${recipientName} · ${addressLine}` : addressLine;
}

export function buildSubscriptionShippingMetadata(
  shippingAddress?: CheckoutAddressSnapshot,
  shippingMethodLabel?: string,
): Record<string, string> {
  if (!shippingAddress?.address1 || !shippingAddress.countryCode) {
    return {};
  }

  return {
    shipping_address_key: buildShippingAddressKey(shippingAddress),
    shipping_address_label: formatShippingAddressLabel(shippingAddress),
    shipping_address_first_name: shippingAddress.firstName,
    shipping_address_last_name: shippingAddress.lastName,
    shipping_address1: shippingAddress.address1,
    ...(shippingAddress.address2 ? { shipping_address2: shippingAddress.address2 } : {}),
    shipping_address_city: shippingAddress.city,
    ...(shippingAddress.stateOrProvince
      ? { shipping_address_state_or_province: shippingAddress.stateOrProvince }
      : {}),
    shipping_address_postal_code: shippingAddress.postalCode,
    shipping_address_country_code: shippingAddress.countryCode,
    ...(shippingMethodLabel ? { shipping_method_label: shippingMethodLabel } : {}),
  };
}
