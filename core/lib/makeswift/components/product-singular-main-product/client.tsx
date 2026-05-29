'use client';

import { clsx } from 'clsx';
import { useMemo, useState, type CSSProperties } from 'react';

import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveProductSingularSectionDomId } from '~/lib/makeswift/product-singular-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  PRODUCT_SINGULAR_MAIN_PRODUCT_SECTION_ID,
  PRODUCT_SINGULAR_MAIN_PRODUCT_VARS,
} from './archive-styles';

export type ProductSingularMainProductImage = {
  image?: unknown;
  altText?: string;
};

export type ProductSingularMainProductProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  galleryImages?: ProductSingularMainProductImage[];
  vendor?: string;
  vendorUrl?: string;
  title?: string;
  sku?: string;
  price?: string;
  inventoryMessage?: string;
  inventoryPercent?: number;
  addToCartLabel?: string;
  showInventory?: boolean;
  showShare?: boolean;
  roundedTop?: boolean;
};

export function ProductSingularMainProduct({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  galleryImages,
  vendor = 'Fisher & Paykel',
  vendorUrl = '/collections/vendors',
  title = 'Fisher & Paykel Nova Nasal CPAP Mask - FitPack COMING SOON',
  sku = 'NVN1SMLA',
  price = '$170.00',
  inventoryMessage = 'Hurry, only 8 items left in stock!',
  inventoryPercent = 53,
  addToCartLabel = 'Add to cart',
  showInventory = true,
  showShare = true,
  roundedTop = true,
}: ProductSingularMainProductProps) {
  const resolvedSectionId = resolveProductSingularSectionDomId(
    sectionDomId ?? PRODUCT_SINGULAR_MAIN_PRODUCT_SECTION_ID,
    instanceSuffix,
  );
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: PRODUCT_SINGULAR_MAIN_PRODUCT_VARS,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  const images = useMemo(() => {
    const resolved = (galleryImages ?? [])
      .map((item) => ({
        src: resolveMakeswiftImageSrc(item.image),
        alt: item.altText?.trim() ?? title,
      }))
      .filter((item) => item.src.length > 0);

    return resolved;
  }, [galleryImages, title]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  const stockPercent = Math.min(100, Math.max(0, inventoryPercent));

  return (
    <div
      className={clsx(
        'product-singular-main-product',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width page-width--full relative">
            <div className="featured-product product product--thumbnail relative flex w-full flex-col items-start gap-5 lg:grid">
              <div className="product__gallery-container relative flex w-full flex-col gap-0 md:gap-8 lg:sticky">
                <div
                  aria-label="Gallery Viewer"
                  className="product__gallery product__gallery--full_width relative block w-full"
                  role="region"
                >
                  <div className="product__media-container flex flex-col items-start gap-4">
                    <div className="relative h-full w-full">
                      {activeImage != null ? (
                        <div className="product__media card media media--square relative flex w-full shrink-0 overflow-hidden">
                          <img
                            alt={activeImage.alt}
                            className="w-full"
                            decoding="async"
                            fetchPriority="high"
                            height={610}
                            loading="eager"
                            src={activeImage.src}
                            width={610}
                          />
                        </div>
                      ) : (
                        <div className="product__media card media media--square relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden bg-contrast-100">
                          <span className="text-sm text-contrast-500">Add gallery images</span>
                        </div>
                      )}
                    </div>
                    {images.length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <button
                            aria-label={`Show image ${String(index + 1)}`}
                            className={clsx(
                              'media relative h-16 w-16 overflow-hidden rounded border',
                              index === activeIndex ? 'border-foreground' : 'border-transparent',
                            )}
                            key={`${image.src}-${index}`}
                            onClick={() => {
                              setActiveIndex(index);
                            }}
                            type="button"
                          >
                            <img
                              alt=""
                              className="h-full w-full object-cover"
                              src={image.src}
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="product__info animated block w-full lg:sticky">
                {vendor.trim().length > 0 ? (
                  <p className="product__vendor text-base">
                    <a className="reversed-link" href={vendorUrl} title={vendor}>
                      <span className="sr-only">Vendor:</span>
                      {vendor}
                    </a>
                  </p>
                ) : null}

                {sku.trim().length > 0 ? (
                  <p className="product__sku">{sku}</p>
                ) : null}

                <div className="product__title with-price grid gap-3">
                  <h1 className="heading product-title-md mobile:product-title-md col-span-full leading-none">
                    <SplitWordsHeading text={title} />
                  </h1>
                  {price.trim().length > 0 ? (
                    <div className="product__price">
                      <div className="price flex flex-wrap items-baseline gap-2 lg:flex-col lg:items-end lg:gap-1d5">
                        <span className="price__regular whitespace-nowrap">{price}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {showInventory && inventoryMessage.trim().length > 0 ? (
                  <div className="product__inventory" role="status">
                    <div className="grid w-full gap-3">
                      <span className="text-sm leading-tight">{inventoryMessage}</span>
                      <div
                        className="progress-bar accent-1 block h-1 overflow-hidden rounded-full"
                        style={{ '--progress': `${String(stockPercent)}%`, width: `${String(stockPercent)}%` } as CSSProperties}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="product-form-wrapper">
                  <form className="product-form grid gap-8">
                    <div className="product-form__buttons grid gap-4" id="QuantityForm">
                      <div className="buy-buttons back-in-stock flex flex-wrap gap-4">
                        <div className="quantity relative inline-flex shrink-0">
                          <button
                            aria-label="Decrease quantity"
                            className="quantity__button"
                            name="minus"
                            type="button"
                          >
                            −
                          </button>
                          <input
                            className="quantity__input text-center text-sm font-medium sm:text-base"
                            defaultValue={1}
                            inputMode="numeric"
                            min={1}
                            name="quantity"
                            type="number"
                          />
                          <button
                            aria-label="Increase quantity"
                            className="quantity__button"
                            name="plus"
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="product-form__submit button button--primary button--fixed grow"
                          type="button"
                          {...{ is: 'hover-button' }}
                        >
                          <span className="btn-fill" data-fill="" />
                          <span className="btn-text">
                            <span>{addToCartLabel}</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {showShare ? (
                  <div className="flex items-center justify-between">
                    <div className="hidden items-center gap-3 sm:flex">
                      <p className="leading-none">Share:</p>
                      <ul className="social-sharing flex flex-wrap items-center">
                        <li>
                          <span className="social-sharing__link block text-sm">Facebook</span>
                        </li>
                        <li>
                          <span className="social-sharing__link block text-sm">X</span>
                        </li>
                        <li>
                          <span className="social-sharing__link block text-sm">Pinterest</span>
                        </li>
                        <li>
                          <span className="social-sharing__link block text-sm">Email</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
