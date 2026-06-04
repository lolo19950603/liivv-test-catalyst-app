import { clsx } from 'clsx';

import type { Price } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import type { Product, ProductCardProps } from './index';

type ArchiveCatalogProductCardProps = Pick<ProductCardProps, 'className' | 'imageSizes' | 'imagePriority'> & {
  product: Product;
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

export function ArchiveCatalogProductCard({
  product,
  className,
  imagePriority = false,
  imageSizes = '(min-width: 42rem) 25vw, (min-width: 32rem) 33vw, (min-width: 28rem) 50vw, 100vw',
}: ArchiveCatalogProductCardProps) {
  const { title, subtitle, price, image, href } = product;
  const imgSrc = image?.src.trim() ?? '';
  const hasImage = imgSrc.length > 0;
  const safeHref = href.trim().length > 0 && href !== '#' ? href : '/';
  const vendor = subtitle?.trim() ?? '';
  const productTitle = title.trim() || 'Product';

  return (
    <div
      className={clsx(
        'liivv-archive-product-card fc-product-card relative flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden rounded-[var(--card-radius,1.25rem)] bg-[rgb(var(--color-base-background,252_248_244))] leading-none',
        !hasImage && 'aspect-square',
        className,
      )}
    >
      {hasImage && image != null ? (
        <div className="liivv-archive-product-card__media relative w-full shrink-0">
          <Link
            aria-hidden
            className="relative block aspect-square size-full max-w-full overflow-hidden bg-[rgb(var(--color-base-background,252_248_244))]"
            href={safeHref}
            tabIndex={-1}
          >
            <Image
              alt={image.alt}
              className="object-cover object-center"
              fill
              preload={imagePriority}
              sizes={imageSizes}
              src={imgSrc}
            />
          </Link>
        </div>
      ) : null}

      <div
        className={clsx(
          'liivv-archive-product-card__content flex w-full min-w-0 max-w-full flex-col bg-[rgb(var(--color-base-background,252_248_244))]',
          hasImage ? 'grow justify-start gap-2 p-4 pt-3' : 'h-full flex-1 items-center justify-center gap-3 p-5',
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
      </div>
    </div>
  );
}
