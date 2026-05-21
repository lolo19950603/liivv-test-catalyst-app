'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import {
  comboboxEntityIdFromMakeswift,
  DiabetesCareCatalogProductCard,
} from '../diabetes-care-featured-collections/catalog-product-card';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import {
  DC_MOBILE_CAROUSEL_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import { ARCHIVE_SAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  FLOATING_PRODUCT_BUNDLE_BANNER_IMAGE_CSS,
  FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS,
  FLOATING_PRODUCT_BUNDLE_SECTION_ID,
  FLOATING_PRODUCT_BUNDLE_VARS,
} from './archive-styles';

const MAX_BUNDLE_PRODUCTS = 3;

export interface DiabetesCareFloatingProductBundleProduct {
  entityId?: unknown;
}

export type FloatingProductBundleBodyProps = BodyTextProps & {
  html?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export interface DiabetesCareFloatingProductBundleProps {
  className?: string;
  background?: SectionBackgroundProps;
  imageSrc?: unknown;
  /** @deprecated Use root `imageSrc`. */
  banner?: {
    imageSrc?: unknown;
    imageAlt?: string;
  };
  heading?: HeadingWithHighlightProps;
  body?: FloatingProductBundleBodyProps;
  products?: DiabetesCareFloatingProductBundleProduct[];
  buttons?: ButtonColorProps & { addToCartLabel?: string };
  /** @deprecated Use `body` text color fields. */
  bodyText?: BodyTextProps;
}

function resolveBannerImageSrc(props: {
  imageSrc?: unknown;
  banner?: DiabetesCareFloatingProductBundleProps['banner'];
  background?: SectionBackgroundProps & {
    imageSrc?: unknown;
    backgroundType?: unknown;
    type?: unknown;
  };
}): string {
  const nestedBackgroundSrc =
    props.background != null &&
    ('imageSrc' in props.background ||
      'backgroundType' in props.background ||
      'type' in props.background)
      ? resolveMakeswiftImageSrc(props.background.imageSrc)
      : '';

  return (
    resolveMakeswiftImageSrc(props.imageSrc) ||
    resolveMakeswiftImageSrc(props.banner?.imageSrc) ||
    nestedBackgroundSrc
  );
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

function resolvePromoBody(props: {
  body?: FloatingProductBundleBodyProps;
  bodyText?: BodyTextProps;
}): { html: string; style: CSSProperties | undefined } {
  const group = props.body;

  if (group != null && typeof group === 'object') {
    const html = group.html?.trim() ?? '';
    const color = resolveBodyTextColor(group) ?? resolveBodyTextColor(props.bodyText);
    const fontSize = resolveHeadingFontSizeCss(group.fontSize, group.fontSizeMobile);

    return {
      html,
      style:
        color != null || fontSize != null
          ? {
              ...(color != null ? { color } : {}),
              ...(fontSize != null ? { fontSize } : {}),
            }
          : undefined,
    };
  }

  const legacyColor = resolveBodyTextColor(props.bodyText);

  return {
    html: '',
    style: legacyColor != null ? { color: legacyColor } : undefined,
  };
}

function bundleProductSlots(products?: DiabetesCareFloatingProductBundleProduct[]) {
  return (products ?? [])
    .filter((p) => comboboxEntityIdFromMakeswift(p.entityId).length > 0)
    .slice(0, MAX_BUNDLE_PRODUCTS);
}

function productGridClassName(count: number) {
  return clsx(
    'product-grid swipe-on-mobile card-grid mobile:card-grid--1 grid justify-center',
    DC_MOBILE_CAROUSEL_CLASS,
    count === 1 && 'bfb-products--1',
    count === 2 && 'bfb-products--2',
    count >= 3 && 'card-grid--3',
  );
}

export function DiabetesCareFloatingProductBundle({
  className,
  background,
  imageSrc,
  banner,
  heading,
  body,
  products,
  buttons,
  bodyText,
}: DiabetesCareFloatingProductBundleProps) {
  const headingResolved = resolveHeadingTypography(heading);
  const bannerSrc = resolveBannerImageSrc({ imageSrc, banner, background });
  const showBannerImage = bannerSrc.length > 0;
  const promoBody = resolvePromoBody({ body, bodyText });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: FLOATING_PRODUCT_BUNDLE_SECTION_ID,
    sectionCss: `${FLOATING_PRODUCT_BUNDLE_VARS}${FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS}${
      showBannerImage ? FLOATING_PRODUCT_BUNDLE_BANNER_IMAGE_CSS : ''
    }`,
    background,
    defaultBackgroundChannels: showBannerImage
      ? undefined
      : ARCHIVE_SAGE_BACKGROUND_CHANNELS,
  });
  const title =
    headingResolved.text.length > 0 ? headingResolved.text : '🌱 Start Strong Kit';
  const promoHtml = promoBody.html;
  const cartLabel = buttons?.addToCartLabel?.trim() ?? 'Add to cart';
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const slots = bundleProductSlots(products);
  const productCount = slots.length;

  const bannerPicture: ReactNode =
    showBannerImage ? (
      <picture className="media media--height mobile:media--wide relative block h-full w-full overflow-hidden">
        <img
          alt=""
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
        'diabetes-care-floating-product-bundle',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div
        className={clsx(
          'shopify-section compact-product-bundle-section',
          showBannerImage && 'bfb-has-banner-image',
        )}
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
                <div className="page-width h-full w-full px-4 sm:px-5 lg:flex lg:items-center md:px-0">
                  <div className="compact-product-bundle-wrapper flex w-full flex-col gap-6 lg:grid lg:gap-10">
                    <div className="card product-card product-card--promo relative block overflow-hidden leading-none">
                      {bannerPicture != null ? (
                        <div className="product-card__media mobile:media--adapt relative left-0 top-0 h-full w-full lg:hidden">
                          {bannerPicture}
                        </div>
                      ) : null}

                      <div className="product-card__content z-1 absolute left-0 top-0 flex h-full w-full items-center justify-center md:items-center">
                        <div className="w-full text-center md:text-left">
                          <div className="promo-box inline-block">
                            <h2 className="banner__title heading title-md leading-none" style={headingStyle}>
                              <SplitWordsHeading text={title} />
                            </h2>
                            {promoHtml.length > 0 ? (
                              <div
                                className="rte body subtext-md leading-normal"
                                dangerouslySetInnerHTML={{ __html: promoHtml }}
                                style={promoBody.style}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>

                    <ScrollReveal className="compact-product-bundle flex w-full flex-col items-stretch gap-6 lg:mx-auto lg:w-fit lg:gap-10" delayMs={100}>
                      <div className={productGridClassName(productCount)}>
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
                          <ArchiveShopifyButton
                            as="button"
                            className="button--secondary w-full"
                            colors={buttons}
                            data-product-bundle-submit=""
                            type="button"
                            variant="secondary"
                          >
                            {cartLabel}
                            <span className="btn-loader">
                              <span />
                              <span />
                              <span />
                            </span>
                          </ArchiveShopifyButton>
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
