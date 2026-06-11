'use server';

import { startProductSubscriptionCheckout } from '~/lib/stripe/product-checkout';

export async function subscribeFromProduct(formData: FormData) {
  const productPath = String(formData.get('productPath') ?? '/');

  await startProductSubscriptionCheckout(formData, {
    loginRedirectTo: productPath,
    successPath: '/subscribe/success/',
    cancelPath: productPath,
  });
}
