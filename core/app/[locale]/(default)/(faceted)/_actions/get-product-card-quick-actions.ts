import { getTranslations } from 'next-intl/server';

import type { ArchiveCatalogProductCardQuickActions } from '@/vibes/soul/primitives/product-card';
import { isLoggedIn } from '~/auth';
import { isStripeConfigured } from '~/lib/stripe';

import { addToCart } from './add-to-cart';
import { getWishlistsForProduct } from './get-wishlists-for-product';
import {
  addToNewWishlist,
  wishlistAction,
} from '../../product/[slug]/_actions/wishlist-action';

export async function getFacetedProductCardQuickActions(): Promise<ArchiveCatalogProductCardQuickActions> {
  const [compareT, productT, wishlistT, loggedIn] = await Promise.all([
    getTranslations('Compare'),
    getTranslations('Product.ProductDetails'),
    getTranslations('Wishlist'),
    isLoggedIn(),
  ]);

  return {
    addToCartAction: addToCart,
    addToCartLabel: compareT('addToCart'),
    chooseOptionsLabel: 'Choose options',
    showWishlist: true,
    showSubscribe: isStripeConfigured(),
    isLoggedIn: loggedIn,
    subscribeLabel: productT('purchaseOptions.subscribeAndSave'),
    wishlistLabel: wishlistT('Button.label'),
    addToNewWishlistLabel: wishlistT('Button.addToNewWishlist'),
    newWishlistTitle: wishlistT('Modal.newTitle'),
    cancelLabel: wishlistT('Modal.cancel'),
    createLabel: wishlistT('Modal.create'),
    nameLabel: wishlistT('Form.nameLabel'),
    requiredError: wishlistT('Errors.nameRequired'),
    wishlistAction,
    addToNewWishlistAction: addToNewWishlist,
    getWishlistsAction: getWishlistsForProduct,
  };
}
