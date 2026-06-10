'use client';

import { useLocale } from 'next-intl';
import { useState, type ReactNode } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import type { Product, ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';
import { Image } from '~/components/image';
import { useStoreLogoFallback } from '~/lib/makeswift/utils/use-store-logo-fallback';
import bcCdnImageLoader from '~/lib/cdn-image-loader';
import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';
import { comboboxEntityIdFromMakeswift } from '~/lib/makeswift/utils/combobox-entity-id';

type BcProductData = z.infer<typeof BcProductSchema>;

function formatProductPrice(price: Product['price']): string {
  if (price == null) {
    return '';
  }

  if (typeof price === 'string') {
    return price;
  }

  switch (price.type) {
    case 'range': {
      return `${price.minValue} - ${price.maxValue}`;
    }

    case 'sale': {
      return price.currentValue;
    }

    default: {
      return '';
    }
  }
}

export function resolveBcProductImageUrl(url: string, width = 640): string {
  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return '';
  }

  if (trimmed.includes('{:size}')) {
    return bcCdnImageLoader({ src: trimmed, width });
  }

  return trimmed;
}

export { comboboxEntityIdFromMakeswift };

function CatalogProductCardMedia({
  altText,
  fallbackLogo,
  fallbackLogoLoading,
  imgRaw,
  mediaOverlay,
  safeHref,
  title,
}: {
  altText: string;
  fallbackLogo: ProductImageFallbackLogo | null;
  fallbackLogoLoading: boolean;
  imgRaw: string;
  mediaOverlay?: ReactNode;
  safeHref: string;
  title: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasProductImage = imgRaw.length > 0 && !imageFailed;
  const hasLogoImage = fallbackLogo?.src != null && fallbackLogo.src.length > 0;
  const hasLogoText = fallbackLogo?.text != null && fallbackLogo.text.length > 0;
  const showMedia =
    hasProductImage || hasLogoImage || hasLogoText || fallbackLogoLoading || mediaOverlay != null;

  if (!showMedia) {
    return null;
  }

  const mediaClassName =
    'media media--square fc-product-card-media relative block aspect-square size-full max-w-full overflow-hidden bg-[rgb(var(--color-base-background))]';

  const overlay =
    mediaOverlay != null ? (
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-3">
        {mediaOverlay}
      </div>
    ) : null;

  const mediaContent = hasProductImage ? (
    <Image
      alt={altText}
      className="object-cover object-center"
      fill
      onError={() => {
        setImageFailed(true);
      }}
      sizes="(max-width: 768px) 100vw, (max-width: 1023px) 100vw, 288px"
      src={imgRaw}
    />
  ) : hasLogoImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={fallbackLogo?.alt ?? title}
      className="fc-product-card-logo absolute inset-0 size-full object-contain object-center p-6"
      src={fallbackLogo.src}
    />
  ) : hasLogoText ? (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center p-6 text-center text-lg font-semibold leading-none sm:text-xl"
    >
      {fallbackLogo?.text}
    </span>
  ) : fallbackLogoLoading ? (
    <span aria-hidden className="absolute inset-0 animate-pulse bg-zinc-200/60" />
  ) : null;

  if (safeHref.length > 0) {
    return (
      <div className="product-card__media relative w-full">
        <a aria-hidden className={mediaClassName} href={safeHref} tabIndex={-1}>
          {overlay}
          {mediaContent}
        </a>
      </div>
    );
  }

  return (
    <div className="product-card__media relative w-full">
      <div className={mediaClassName}>
        {overlay}
        {mediaContent}
      </div>
    </div>
  );
}

export function DiabetesCareCatalogProductCard({
  entityId,
  mediaOverlay,
}: {
  entityId?: unknown;
  /** Carousel prev/next controls; centered on the product image. */
  mediaOverlay?: ReactNode;
}) {
  const id = comboboxEntityIdFromMakeswift(entityId);
  const locale = useLocale();
  const bcToVibes = useBcProductToVibesProduct();
  const { fallbackLogo, isLoading: fallbackLogoLoading } = useStoreLogoFallback();

  const { data, error, isLoading } = useSWR<BcProductData, Error>(
    id.length > 0 ? `/api/products/${id}?locale=${locale}` : null,
    async (url: string): Promise<BcProductData> => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Product request failed: ${String(response.status)}`);
      }

      const json: unknown = await response.json();

      return BcProductSchema.parse(json);
    },
  );

  const cardShell = (children: ReactNode) => (
    <div className="card product-card product-card--card fc-product-card relative flex h-full flex-col leading-none opacity-100 [--motion-translateY:0px] [visibility:visible]">
      {children}
    </div>
  );

  if (id.length === 0) {
    return null;
  }

  if (isLoading && data == null) {
    return cardShell(
      <>
        <div className="product-card__media relative w-full">
          <div className="media media--square fc-product-card-media relative block aspect-square size-full max-w-full animate-pulse overflow-hidden bg-[rgb(var(--color-base-background))]" />
        </div>
        <div className="product-card__content flex w-full grow flex-col justify-start gap-3 p-4 text-center">
          <div className="mx-auto h-4 w-[75%] max-w-[12rem] animate-pulse rounded bg-zinc-200" />
          <div className="mx-auto h-4 w-1/2 max-w-[8rem] animate-pulse rounded bg-zinc-200" />
        </div>
      </>,
    );
  }

  if (error != null || data == null) {
    return cardShell(
      <div className="product-card__content p-4 text-center">
        <p className="text-sm text-red-800">Could not load this product.</p>
      </div>,
    );
  }

  const vibes = bcToVibes(data);
  const thumb = vibes.image;
  const hrefRaw = vibes.href.trim();
  const safeHref = hrefRaw.length > 0 && hrefRaw !== '#' ? hrefRaw : '/';
  const imgRaw = thumb != null ? thumb.src.trim() : '';
  const altText = thumb != null ? thumb.alt : '';
  const title = vibes.title.trim() || 'Product';
  const vendor = vibes.subtitle?.trim() ?? '';
  const vendorHrefRaw = data.brand != null ? data.brand.path.trim() : '';
  const price = formatProductPrice(vibes.price);

  return cardShell(
    <>
      <CatalogProductCardMedia
        altText={altText}
        fallbackLogo={fallbackLogo}
        fallbackLogoLoading={fallbackLogoLoading}
        imgRaw={imgRaw}
        mediaOverlay={mediaOverlay}
        safeHref={safeHref}
        title={title}
      />
      <div className="product-card__content flex w-full grow flex-col justify-start gap-2 p-4 pt-3 text-center">
        <div className="product-card__top w-full min-h-[1.25rem]">
          {vendor.length > 0 ? (
            vendorHrefRaw.length > 0 ? (
              <a
                className="caption reversed-link uppercase leading-none tracking-widest"
                href={vendorHrefRaw}
                title={vendor}
              >
                <span className="sr-only">Vendor:</span>
                {vendor}
              </a>
            ) : (
              <span className="caption uppercase leading-none tracking-widest">
                <span className="sr-only">Vendor:</span>
                {vendor}
              </span>
            )
          ) : (
            <span aria-hidden className="caption block uppercase leading-none tracking-widest opacity-0">
              &nbsp;
            </span>
          )}
        </div>
        <div className="product-card__details flex w-full min-w-0 flex-col items-baseline gap-2 lg:flex-row">
          <p className="min-w-0 grow">
            <a
              className="product-card__title fc-product-card-title reversed-link line-clamp-1 block text-base-xl font-medium leading-tight"
              href={safeHref}
              title={title}
            >
              {title}
            </a>
          </p>
          {price.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="price md:gap-1d5 flex flex-wrap gap-2 lg:flex-col lg:items-end">
                <span className="price__regular whitespace-nowrap">{price}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>,
  );
}
