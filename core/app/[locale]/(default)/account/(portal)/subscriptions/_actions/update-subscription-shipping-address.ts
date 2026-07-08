'use server';

import { revalidateTag } from 'next/cache';

import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import { TAGS } from '~/client/tags';
import { customerAddressToSnapshot } from '~/lib/account/saved-shipping-addresses';
import { updateSubscriptionShippingAddress } from '~/lib/stripe/subscriptions';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function updateSubscriptionShippingAddressAction(
  subscriptionId: string,
  addressId: string,
): Promise<{ success: boolean; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId || !addressId) {
    return { success: false, error: 'Unable to update shipping address' };
  }

  const addressData = await getCustomerAddresses({ limit: 50 });
  const address = addressData?.addresses.find(
    (entry) => String(entry.entityId) === addressId,
  );

  if (!address) {
    return { success: false, error: 'Address not found' };
  }

  try {
    await updateSubscriptionShippingAddress({
      stripeCustomerId,
      subscriptionId,
      shippingAddress: customerAddressToSnapshot(address),
    });
    revalidateTag(TAGS.customer);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update shipping address',
    };
  }
}
