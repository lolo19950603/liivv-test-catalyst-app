'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import type { Price } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import type { Product, ProductCardProps, ProductImageFallbackLogo } from './index';
import {
  ProductCardOverlayActions,
  type ProductCardOverlayActionsProps,
} from './overlay-actions';
import {
  ProductCardAddToCartAction,
  ProductCardQuickAdd,
} from './quick-add-form';

export interface ArchiveCatalogProductCardQuickActions {
  addToCartAction?: ProductCardAddToCartAction;
  addToCartLabel?: string;
  chooseOptionsLabel?: string;
  showWishlist?: boolean;
  showSubscribe?: boolean;
  isLoggedIn?: boolean;
  subscribeLabel?: string;
  wishlistLabel?: string;
  addToNewWishlistLabel?: string;
  newWishlistTitle?: string;
  cancelLabel?: string;
  createLabel?: string;
  nameLabel?: string;
  requiredError?: string;
  wishlistAction?: ProductCardOverlayActionsProps['wishlistAction'];
  addToNewWishlistAction?: ProductCardOverlayActionsProps['addToNewWishlistAction'];
  getWishlistsAction?: ProductCardOverlayActionsProps['getWishlistsAction'];
}

type ArchiveCatalogProductCardProps = Pick<
  ProductCardProps,
  'className' | 'imageSizes' | 'imagePriority'
> & {
  fallbackLogo?: ProductImageFallbackLogo | null;
  product: Product;
  quickActions?: ArchiveCatalogProductCardQuickActions;
};

function ArchiveCatalogProductCardPrice({ price }: { price: Price }) {
  if (typeof price === 'string') {
    return (
      <div className="price flex flex-wrap justify-center gap-2 md:gap-1.5">
        <span className="price__regular whitespace-nowrap">{price}</span>
      </div>
    );
  }

  switch (price.type) {
    case 'range':
      return (
        <div className="price flex flex-wrap justify-center gap-2 md:gap-1.5">
          <span className="price__regular whitespace-nowrap">From {price.minValue}</span>
        </div>
      );

    case 'sale':
      return (
        <div className="price price--on-sale flex flex-wrap justify-center gap-2 md:gap-1.5">
          <span className="price__regular whitespace-nowrap">{price.currentValue}</span>
          <span className="price__sale relative inline-flex h-auto items-center text-red-600 line-through decoration-red-600/80">
            {price.previousValue}
          </span>
        </div>
      );

    default:
      return null;
  }
}

function ArchiveCatalogProductCardMedia({
  fallbackLogo,
  image,
  imagePriority,
  imageSizes,
  productTitle,
  safeHref,
  overlay,
}: {
  fallbackLogo?: ProductImageFallbackLogo | null;
  image?: { src: string; alt: string };
  imagePriority: boolean;
  imageSizes: string;
  productTitle: string;
  safeHref: string;
  overlay?: React.ReactNode;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imgSrc = image?.src.trim() ?? '';
  const hasProductImage = imgSrc.length > 0 && !imageFailed;
  const hasLogoImage = fallbackLogo?.src != null && fallbackLogo.src.length > 0;
  const hasLogoText = fallbackLogo?.text != null && fallbackLogo.text.length > 0;

  if (!hasProductImage && !hasLogoImage && !hasLogoText) {
    return null;
  }

  return (
    <div className="liivv-archive-product-card__media relative w-full shrink-0">
      <Link
        aria-hidden
        className="relative block aspect-square size-full max-w-full overflow-hidden bg-[rgb(var(--color-base-background,252_248_244))]"
        href={safeHref}
        tabIndex={-1}
      >
        {hasProductImage && image != null ? (
          <Image
            alt={image.alt}
            className="object-cover object-center"
            fill
            onError={() => setImageFailed(true)}
            preload={imagePriority}
            sizes={imageSizes}
            src={imgSrc}
          />
        ) : hasLogoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={fallbackLogo?.alt ?? productTitle}
            className="absolute inset-0 size-full object-contain object-center p-6"
            src={fallbackLogo.src}
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-semibold uppercase leading-tight text-[rgb(var(--color-base-text,40_40_40)/0.7)]"
          >
            {fallbackLogo?.text}
          </span>
        )}
      </Link>
      {overlay}
    </div>
  );
}

export function ArchiveCatalogProductCard({
  product,
  className,
  fallbackLogo,
  imagePriority = false,
  imageSizes = '(min-width: 42rem) 25vw, (min-width: 32rem) 33vw, (min-width: 28rem) 50vw, 100vw',
  quickActions,
}: ArchiveCatalogProductCardProps) {
  const { title, subtitle, price, image, href, hasVariants, sku, id } = product;
  const imgSrc = image?.src.trim() ?? '';
  const hasImage = imgSrc.length > 0;
  const hasLogoFallback =
    fallbackLogo?.src != null || (fallbackLogo?.text != null && fallbackLogo.text.length > 0);
  const hasMedia = hasImage || hasLogoFallback;
  const safeHref = href.trim().length > 0 && href !== '#' ? href : '/';
  const vendor = subtitle?.trim() ?? '';
  const productTitle = title.trim() || 'Product';

  const showQuickAdd = quickActions?.addToCartAction != null;
  const showOverlay =
    (quickActions?.showWishlist === true && Boolean(sku)) || quickActions?.showSubscribe === true;

  const overlayActions =
    showOverlay && quickActions ? (
      <ProductCardOverlayActions
        addToNewWishlistAction={quickActions.addToNewWishlistAction}
        getWishlistsAction={quickActions.getWishlistsAction}
        href={safeHref}
        isLoggedIn={quickActions.isLoggedIn ?? false}
        labels={{
          wishlist: quickActions.wishlistLabel ?? 'Save to wish list',
          addToNewWishlist: quickActions.addToNewWishlistLabel ?? 'Add to new wish list',
          newWishlistTitle: quickActions.newWishlistTitle ?? 'Create a new wish list',
          cancelLabel: quickActions.cancelLabel ?? 'Cancel',
          createLabel: quickActions.createLabel ?? 'Create',
          nameLabel: quickActions.nameLabel ?? 'Name',
          requiredError: quickActions.requiredError ?? 'Wish list name cannot be empty.',
        }}
        productId={id}
        productSku={sku ?? ''}
        showSubscribe={quickActions.showSubscribe}
        showWishlist={Boolean(quickActions.showWishlist && sku)}
        subscribeLabel={quickActions.subscribeLabel ?? 'Subscribe & save'}
        wishlistAction={quickActions.wishlistAction}
      />
    ) : null;

  return (
    <div
      className={clsx(
        'liivv-archive-product-card fc-product-card relative flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-[var(--card-radius,1.25rem)] bg-[rgb(var(--color-base-background,252_248_244))] leading-none',
        !hasMedia && 'aspect-square',
        className,
      )}
    >
      {hasMedia ? (
        <ArchiveCatalogProductCardMedia
          fallbackLogo={fallbackLogo}
          image={image}
          imagePriority={imagePriority}
          imageSizes={imageSizes}
          overlay={overlayActions}
          productTitle={productTitle}
          safeHref={safeHref}
        />
      ) : (
        overlayActions
      )}

      <div
        className={clsx(
          'liivv-archive-product-card__content flex w-full min-w-0 max-w-full flex-col bg-[rgb(var(--color-base-background,252_248_244))]',
          hasMedia ? 'grow justify-start gap-2 p-4 pt-3' : 'h-full flex-1 items-center justify-center gap-3 p-5',
        )}
      >
        {vendor.length > 0 ? (
          <p className="liivv-archive-product-card__vendor caption m-0 w-full text-center uppercase leading-none tracking-widest text-[rgb(var(--color-base-text,40_40_40)/0.55)]">
            <span className="sr-only">Vendor:</span>
            {vendor}
          </p>
        ) : null}

        <div className="liivv-archive-product-card__details flex w-full min-w-0 max-w-full flex-col items-center gap-2 text-center">
          <Link
            className="liivv-archive-product-card__title block w-full min-w-0 max-w-full text-base-xl font-medium leading-snug text-center"
            href={safeHref}
            title={productTitle}
          >
            <span className="reversed-link">{productTitle}</span>
          </Link>
          {price != null ? <ArchiveCatalogProductCardPrice price={price} /> : null}
        </div>

        {showQuickAdd && quickActions?.addToCartAction ? (
          <div className="liivv-archive-product-card__cta mt-auto w-full pt-2">
            <ProductCardQuickAdd
              addToCartAction={quickActions.addToCartAction}
              addToCartLabel={quickActions.addToCartLabel ?? 'Add to cart'}
              chooseOptionsLabel={quickActions.chooseOptionsLabel ?? 'Choose options'}
              hasVariants={hasVariants === true}
              href={safeHref}
              productId={id}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
