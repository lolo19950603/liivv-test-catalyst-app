'use server';

import { addSubscriptionProductToCart } from '~/lib/stripe/add-subscription-to-cart';

export async function subscribeFromProduct(formData: FormData) {
  await addSubscriptionProductToCart(formData);
}
