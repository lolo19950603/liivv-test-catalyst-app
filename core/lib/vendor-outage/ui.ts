import type { VendorName } from './index';

export const VENDOR_OUTAGE_COPY = {
  bigcommerce: {
    title: 'The store is temporarily unavailable',
    body: 'We cannot load the catalog, cart, or checkout right now. Please try again in a few minutes.',
    cta: 'Try again',
  },
  supabase: {
    title: 'Health tools are temporarily unavailable',
    body: 'Shopping still works. Health profile, pharmacy, and care chat cannot load until this service is back.',
    cta: 'Continue shopping',
  },
  stripe: {
    title: 'Payments are temporarily unavailable',
    body: 'You can still browse and use your cart. Checkout cannot take payment until this service is back. Your cart is saved.',
    cta: 'Back to cart',
  },
} as const;

export function vendorOutageCopy(vendor: VendorName) {
  return VENDOR_OUTAGE_COPY[vendor];
}
