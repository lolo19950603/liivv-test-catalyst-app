'use server';

import { startSubscriptionCheckoutFromForm } from '~/lib/stripe/start-checkout';

export async function startSubscriptionCheckout(formData: FormData) {
  await startSubscriptionCheckoutFromForm(formData, {
    loginRedirectTo: '/subscribe/',
    successPath: '/subscribe/success/',
    cancelPath: '/subscribe/',
  });
}
