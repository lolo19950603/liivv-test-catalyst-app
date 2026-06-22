import 'server-only';

import type Stripe from 'stripe';

import {
  buildShippingAddressKey,
  formatShippingAddressLabel,
} from '~/lib/checkout/subscription-shipping-metadata';
import type { CheckoutAddressSnapshot } from '~/lib/checkout/types';

import type { CustomerSubscription } from './subscriptions';

export interface CustomerAddressRecord {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string | null;
  city: string;
  stateOrProvince?: string | null;
  countryCode: string;
  postalCode?: string | null;
}

export interface SubscriptionProductImage {
  src: string;
  alt: string;
}

function toCheckoutAddressSnapshot(address: CustomerAddressRecord): CheckoutAddressSnapshot {
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

function formatStripeShippingAddress(address: Stripe.Address): string {
  return formatShippingAddressLabel({
    firstName: '',
    lastName: '',
    email: '',
    address1: address.line1 ?? '',
    address2: address.line2 ?? undefined,
    city: address.city ?? '',
    stateOrProvince: address.state ?? undefined,
    countryCode: address.country ?? '',
    postalCode: address.postal_code ?? '',
  });
}

function resolveAddressFromMetadata(metadata: Stripe.Metadata): string | undefined {
  const address1 = metadata.shipping_address1?.trim();
  const countryCode = metadata.shipping_address_country_code?.trim();

  if (address1 && countryCode) {
    return formatShippingAddressLabel({
      firstName: metadata.shipping_address_first_name?.trim() ?? '',
      lastName: metadata.shipping_address_last_name?.trim() ?? '',
      email: '',
      address1,
      address2: metadata.shipping_address2?.trim() || undefined,
      city: metadata.shipping_address_city?.trim() ?? '',
      stateOrProvince: metadata.shipping_address_state_or_province?.trim() || undefined,
      countryCode,
      postalCode: metadata.shipping_address_postal_code?.trim() ?? '',
    });
  }

  return metadata.shipping_address_label?.trim() || undefined;
}

function resolveAddressFromCustomerAddresses(
  addressKey: string,
  customerAddresses: CustomerAddressRecord[],
): string | undefined {
  for (const address of customerAddresses) {
    const snapshot = toCheckoutAddressSnapshot(address);

    if (buildShippingAddressKey(snapshot) === addressKey) {
      return formatShippingAddressLabel(snapshot);
    }
  }

  const firstAddress = customerAddresses[0];

  if (firstAddress) {
    return formatShippingAddressLabel(toCheckoutAddressSnapshot(firstAddress));
  }

  return undefined;
}

export function enrichSubscriptionsForPortal(
  subscriptions: CustomerSubscription[],
  {
    customerAddresses = [],
    stripeCustomerShipping,
    productImagesByEntityId = new Map<number, SubscriptionProductImage>(),
  }: {
    customerAddresses?: CustomerAddressRecord[];
    stripeCustomerShipping?: Stripe.Address | null;
    productImagesByEntityId?: Map<number, SubscriptionProductImage>;
  },
): CustomerSubscription[] {
  const stripeShippingLabel = stripeCustomerShipping
    ? formatStripeShippingAddress(stripeCustomerShipping)
    : undefined;

  return subscriptions.map((subscription) => {
    const metadataLabel = resolveAddressFromMetadata(subscription.metadata);
    const matchedAddressLabel = resolveAddressFromCustomerAddresses(
      subscription.shippingAddressKey,
      customerAddresses,
    );
    const shippingAddressLabel =
      matchedAddressLabel ??
      metadataLabel ??
      stripeShippingLabel ??
      subscription.shippingAddressLabel;

    const image =
      subscription.productEntityId != null
        ? productImagesByEntityId.get(subscription.productEntityId)
        : undefined;

    return {
      ...subscription,
      shippingAddressLabel,
      image,
    };
  });
}
