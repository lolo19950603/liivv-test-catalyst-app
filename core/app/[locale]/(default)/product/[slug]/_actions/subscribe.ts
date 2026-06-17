'use server';

import { addSubscriptionProductToCart } from '~/lib/stripe/add-subscription-to-cart';

export async function subscribeFromProduct(formData: FormData) {
  const productPath = String(formData.get('productPath') ?? '/');

  await addSubscriptionProductToCart(formData, {
    loginRedirectTo: productPath,
  });
}
