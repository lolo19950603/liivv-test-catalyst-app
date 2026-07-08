'use server';

import { revalidateTag } from 'next/cache';

import { saveCheckoutAddress } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';
import { TAGS } from '~/client/tags';
import { updateSubscriptionShippingAddress } from '~/lib/stripe/subscriptions';
import type { SaveCheckoutAddressInput } from '~/app/[locale]/(default)/checkout/_actions/save-checkout-address';

import { resolveStripeCustomerIdForAccount } from '../page-data';

export async function saveAndApplySubscriptionAddressAction(
  subscriptionId: string,
  input: SaveCheckoutAddressInput,
): Promise<{ success: boolean; addressId?: string; error?: string }> {
  const stripeCustomerId = await resolveStripeCustomerIdForAccount();

  if (!stripeCustomerId || !subscriptionId) {
    return { success: false, error: 'Unable to update shipping address' };
  }

  const saveResult = await saveCheckoutAddress(input);

  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  try {
    await updateSubscriptionShippingAddress({
      stripeCustomerId,
      subscriptionId,
      shippingAddress: {
        ...input,
        email: '',
      },
    });
    revalidateTag(TAGS.customer);

    return { success: true, addressId: saveResult.address.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to update shipping address',
    };
  }
}
