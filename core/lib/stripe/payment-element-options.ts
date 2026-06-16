import type { StripePaymentElementOptions } from '@stripe/stripe-js';

/** Billing is collected in the checkout form and synced before confirm. */
export const checkoutPaymentElementOptions: StripePaymentElementOptions = {
  wallets: {
    link: 'never',
  },
  fields: {
    billingDetails: 'never',
  },
};
