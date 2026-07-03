import {
  buildShippingAddressKey,
  formatShippingAddressLabel,
} from '~/lib/checkout/subscription-shipping-metadata';
import type { CheckoutAddressSnapshot } from '~/lib/checkout/types';

export interface SavedShippingAddress {
  id: string;
  label: string;
  addressKey: string;
}

export interface CustomerAddressInput {
  entityId: number;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string | null;
  city: string;
  stateOrProvince?: string | null;
  countryCode: string;
  postalCode?: string | null;
}

function toCheckoutAddressSnapshot(address: CustomerAddressInput): CheckoutAddressSnapshot {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    email: '',
    address1: address.address1,
    address2: address.address2 ?? undefined,
    city: address.city,
    stateOrProvince: address.stateOrProvince ?? undefined,
    countryCode: address.countryCode,
    postalCode: address.postalCode ?? '',
  };
}

export function mapCustomerAddressesToSaved(
  addresses: CustomerAddressInput[],
): SavedShippingAddress[] {
  return addresses.map((address) => {
    const snapshot = toCheckoutAddressSnapshot(address);

    return {
      id: String(address.entityId),
      label: formatShippingAddressLabel(snapshot),
      addressKey: buildShippingAddressKey(snapshot),
    };
  });
}

export function customerAddressToSnapshot(
  address: CustomerAddressInput,
  email = '',
): CheckoutAddressSnapshot {
  return {
    ...toCheckoutAddressSnapshot(address),
    email,
  };
}
