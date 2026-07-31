import { redirect } from 'next/navigation';

/**
 * Legacy DIY / hardcoded kit routes. Kits are now real BigCommerce products
 * (custom field kit_type=curated + related products) under their category.
 */
export default function LegacyBuildYourOwnKitRedirect() {
  redirect('/liivv-health/womens-health/shop-womens-health');
}
