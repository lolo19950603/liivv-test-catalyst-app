'use client';

import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import type { Product } from '@/vibes/soul/primitives/product-card';
import { Image } from '~/components/image';
import bcCdnImageLoader from '~/lib/cdn-image-loader';
import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

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
      return `${price.minValue} – ${price.maxValue}`;
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

function comboboxNestedValue(value: object): string {
  if (!('value' in value)) {
    return '';
  }

  const nested = value.value;

  if (typeof nested === 'string' || typeof nested === 'number') {
    return String(nested).trim();
  }

  return '';
}

export function comboboxEntityIdFromMakeswift(value?: unknown): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  if (typeof value === 'object') {
    return comboboxNestedValue(value);
  }

  return '';
}

export function DiabetesCareCatalogProductCard({ entityId }: { entityId?: unknown }) {
  const id = comboboxEntityIdFromMakeswift(entityId);
  const locale = useLocale();
  const bcToVibes = useBcProductToVibesProduct();

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
    <div className="card product-card product-card--card relative flex flex-col leading-none opacity-100 [--motion-translateY:0px] [visibility:visible]">
      {children}
    </div>
  );

  if (id.length === 0) {
    return null;
  }

  if (isLoading && data == null) {
    return cardShell(
      <>
        <div className="product-card__media relative h-auto">
          <div className="media media--square relative block aspect-square animate-pulse overflow-hidden bg-zinc-200" />
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
      <div className="product-card__media relative h-auto">
        {imgRaw.length > 0 ? (
          <a
            aria-hidden
            className="media media--square mobile:media--wide relative block aspect-square overflow-hidden md:aspect-square"
            href={safeHref}
            tabIndex={-1}
          >
            <Image
              alt={altText}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 74vw, (max-width: 1023px) 300px, 33vw"
              src={imgRaw}
            />
          </a>
        ) : null}
      </div>
      <div className="product-card__content flex w-full grow flex-col justify-start text-center">
        {vendor.length > 0 ? (
          <div className="product-card__top w-full">
            {vendorHrefRaw.length > 0 ? (
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
            )}
          </div>
        ) : null}
        <div className="product-card__details flex w-full flex-col items-baseline gap-2 lg:flex-row">
          <p className="grow">
            <a
              className="product-card__title reversed-link text-base-xl font-medium leading-tight"
              href={safeHref}
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
