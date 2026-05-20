'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import {
  comboboxEntityIdFromMakeswift,
  DiabetesCareCatalogProductCard,
} from '../diabetes-care-featured-collections/catalog-product-card';

import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { ARCHIVE_SAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import {
  FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS,
  FLOATING_PRODUCT_BUNDLE_SECTION_ID,
  FLOATING_PRODUCT_BUNDLE_VARS,
} from './archive-styles';

export interface DiabetesCareFloatingProductBundleProduct {
  entityId?: unknown;
}

export interface DiabetesCareFloatingProductBundleProps {
  className?: string;
  background?: SectionBackgroundProps;
  banner?: {
    imageSrc?: string;
    imageAlt?: string;
  };
  heading?: HeadingWithHighlightProps;
  body?: { html?: string };
  products?: DiabetesCareFloatingProductBundleProduct[];
  buttons?: { addToCartLabel?: string };
  bodyText?: BodyTextProps;
}

function BundlePlusDivider() {
  return (
    <svg
      className="icon icon-plus-3 icon-xl icon-bundle-plus pointer-events-none absolute"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66663 16H16M25.3333 16H16M16 16V6.66663M16 16V25.3333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function productSlots(products?: DiabetesCareFloatingProductBundleProduct[]) {
  if (products != null && products.length > 0) {
    return products;
  }

  return [{ entityId: undefined }, { entityId: undefined }, { entityId: undefined }];
}

export function DiabetesCareFloatingProductBundle({
  className,
  background,
  banner,
  heading,
  body,
  products,
  buttons,
  bodyText,
}: DiabetesCareFloatingProductBundleProps) {
  const headingResolved = resolveHeadingTypography(heading);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: FLOATING_PRODUCT_BUNDLE_SECTION_ID,
    sectionCss: `${FLOATING_PRODUCT_BUNDLE_VARS}${FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS}`,
    background,
    highlight: heading,
    defaultBackgroundChannels: ARCHIVE_SAGE_BACKGROUND_CHANNELS,
  });
  const bodyColor = resolveBodyTextColor(bodyText);
  const bannerSrc = banner?.imageSrc?.trim() ?? '';
  const bannerAlt = banner?.imageAlt?.trim() ?? '';
  const title =
    headingResolved.text.length > 0 ? headingResolved.text : '🌱 Start Strong Kit';
  const promoHtml = body?.html?.trim() ?? '';
  const cartLabel = buttons?.addToCartLabel?.trim() ?? 'Add to cart';
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const slots = productSlots(products).filter(
    (p) => comboboxEntityIdFromMakeswift(p.entityId).length > 0,
  );

  const bannerPicture: ReactNode =
    bannerSrc.length > 0 ? (
      <picture className="media media--height relative block h-full w-full overflow-hidden">
        <img
          alt={bannerAlt}
          className="h-full w-full object-cover object-center"
          decoding="async"
          height={1200}
          loading="lazy"
          src={bannerSrc}
          width={2000}
        />
      </picture>
    ) : null;

  return (
    <div
      className={clsx(
        'diabetes-care-floating-product-bundle max-w-full overflow-x-hidden',
        className,
      )}
    >
      <div
        className="shopify-section compact-product-bundle-section"
        id={FLOATING_PRODUCT_BUNDLE_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding">
          <div className="relative">
            <div className="banner media--adapt relative">
              {bannerPicture != null ? (
                <div className="banner__media hidden h-full w-full overflow-hidden lg:block">
                  {bannerPicture}
                </div>
              ) : null}

              <span className="banner__overlay pointer-events-none absolute left-0 top-0 hidden h-full w-full lg:block" />

              <div className="banner__content z-1 absolute left-0 top-0 h-full w-full overflow-hidden">
                <div className="page-width h-full w-full lg:flex lg:items-center">
                  <div className="compact-product-bundle-wrapper flex w-full flex-col gap-6 lg:grid lg:gap-10">
                    <div className="card product-card product-card--promo relative block overflow-hidden leading-none">
                      {bannerPicture != null ? (
                        <div className="product-card__media mobile:media--adapt relative left-0 top-0 h-full w-full lg:hidden">
                          {bannerPicture}
                        </div>
                      ) : null}

                      <div className="product-card__content z-1 absolute left-0 top-0 flex h-full w-full items-center justify-center md:items-center">
                        <div className="w-full text-center md:text-left">
                          <div
                            className="promo-box inline-block"
                            style={bodyColor != null ? { color: bodyColor } : undefined}
                          >
                            <h2 className="banner__title heading title-md leading-none" style={headingStyle}>
                              <AccentSplitWordsHeading accentColors={heading} text={title} />
                            </h2>
                            {promoHtml.length > 0 ? (
                              <div
                                className="rte body subtext-md leading-normal"
                                dangerouslySetInnerHTML={{ __html: promoHtml }}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <ScrollReveal className="compact-product-bundle flex w-full flex-col items-stretch gap-6 lg:mx-auto lg:w-fit lg:gap-10" delayMs={100}>
                      <div className="product-grid swipe-on-mobile card-grid card-grid--3 mobile:card-grid--1 grid justify-center">
                        {slots.length === 0 ? (
                          <p className="subtext-md col-span-full py-10 text-center text-contrast-500">
                            Add catalog products for this bundle in Makeswift.
                          </p>
                        ) : (
                          slots.map((p, i) => (
                            <div className="relative grid" key={`bfb-slot-${String(i)}`}>
                              {i > 0 ? <BundlePlusDivider /> : null}
                              <DiabetesCareCatalogProductCard entityId={p.entityId} />
                            </div>
                          ))
                        )}
                      </div>

                      {slots.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          <button
                            className="button button--secondary w-full"
                            data-product-bundle-submit=""
                            type="button"
                          >
                            <span className="btn-fill" data-fill />
                            <span className="btn-text">{cartLabel}</span>
                            <span className="btn-loader">
                              <span />
                              <span />
                              <span />
                            </span>
                          </button>
                        </div>
                      ) : null}
                    </ScrollReveal>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
