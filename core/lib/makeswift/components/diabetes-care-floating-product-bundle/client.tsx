'use client';

import { clsx } from 'clsx';
import { Fragment, useEffect, useId, useRef, useState, type CSSProperties } from 'react';

import { useCarouselScrollSync } from '~/lib/makeswift/diabetes-care-carousel-controls';

import { DiabetesCareCatalogProductCard } from '../diabetes-care-featured-collections/catalog-product-card';

import { ArchiveShopifyButton } from '~/lib/makeswift/components/archive-shopify-button';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { comboboxEntityIdFromMakeswift } from '~/lib/makeswift/utils/combobox-entity-id';
import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  resolveArchiveButton,
  type ArchiveButtonProps,
} from '~/lib/makeswift/utils/archive-button';
import type { ButtonColorProps } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import { hsl } from '~/lib/makeswift/utils/color';
import {
  ARCHIVE_BUTTON_SECONDARY_ON_BANNER,
  ARCHIVE_BUTTON_SECONDARY_ON_SAGE,
} from '~/lib/makeswift/utils/archive-button-presets';
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
  FLOATING_PRODUCT_BUNDLE_BANNER_CSS,
  FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS,
  FLOATING_PRODUCT_BUNDLE_PRODUCTS_CSS,
  FLOATING_PRODUCT_BUNDLE_SECTION_ID,
  FLOATING_PRODUCT_BUNDLE_VARS,
} from './archive-styles';

/** Desktop: static row for ≤3 products; horizontal scroll only above that. */
const BUNDLE_DESKTOP_SCROLL_THRESHOLD = 3;

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
  roundedTop?: boolean;
  imageSrc?: unknown;
  /** @deprecated Use root `imageSrc`. */
  banner?: {
    imageSrc?: unknown;
    imageAlt?: string;
  };
  heading?: HeadingWithHighlightProps;
  body?: FloatingProductBundleBodyProps;
  products?: DiabetesCareFloatingProductBundleProduct[];
  button?: ArchiveButtonProps;
  /** @deprecated Use `button`. */
  buttons?: ButtonColorProps & { addToCartLabel?: string; buttonText?: string };
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
      className="icon icon-plus-3 icon-xl icon-bundle-plus pointer-events-none block shrink-0"
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
  return (products ?? []).filter((p) => comboboxEntityIdFromMakeswift(p.entityId).length > 0);
}

function presetPickerColor(channels: string | undefined): string | undefined {
  return channels != null && channels.length > 0 ? hsl(channels) : undefined;
}

function resolveBundleButtonColors(
  colors: ButtonColorProps | null | undefined,
  showBannerImage: boolean,
): ButtonColorProps | undefined {
  const defaults = showBannerImage
    ? ARCHIVE_BUTTON_SECONDARY_ON_BANNER
    : ARCHIVE_BUTTON_SECONDARY_ON_SAGE;

  const fallback: ButtonColorProps = {
    outlineColor: presetPickerColor(defaults.outlineHsl ?? defaults.backgroundHsl),
    backgroundColor: presetPickerColor(defaults.backgroundHsl),
    textColor: presetPickerColor(defaults.textHsl),
    hoverBackgroundColor: presetPickerColor(defaults.hoverBackgroundHsl),
    hoverTextColor: presetPickerColor(defaults.hoverTextHsl),
  };

  if (colors == null) {
    return fallback;
  }

  return {
    ...fallback,
    ...colors,
    outlineColor: colors.outlineColor ?? fallback.outlineColor,
    backgroundColor: colors.backgroundColor ?? fallback.backgroundColor,
    textColor: colors.textColor ?? fallback.textColor,
    hoverBackgroundColor: colors.hoverBackgroundColor ?? fallback.hoverBackgroundColor,
    hoverTextColor: colors.hoverTextColor ?? fallback.hoverTextColor,
    outlineColorHex: colors.outlineColorHex,
    backgroundColorHex: colors.backgroundColorHex,
    textColorHex: colors.textColorHex,
    hoverBackgroundColorHex: colors.hoverBackgroundColorHex,
    hoverTextColorHex: colors.hoverTextColorHex,
  };
}


export function DiabetesCareFloatingProductBundle({
  className,
  background,
  roundedTop = true,
  imageSrc,
  banner,
  heading,
  body,
  products,
  button,
  buttons,
  bodyText,
}: DiabetesCareFloatingProductBundleProps) {
  const reactId = useId().replace(/:/g, '');
  const productStripRef = useRef<HTMLDivElement>(null);
  const [productIndex, setProductIndex] = useState(0);
  const headingResolved = resolveHeadingTypography(heading);
  const bannerSrc = resolveBannerImageSrc({ imageSrc, banner, background });
  const showBannerImage = bannerSrc.length > 0;
  const promoBody = resolvePromoBody({ body, bodyText });
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: FLOATING_PRODUCT_BUNDLE_SECTION_ID,
    sectionCss: `${FLOATING_PRODUCT_BUNDLE_VARS}${FLOATING_PRODUCT_BUNDLE_BANNER_CSS}${FLOATING_PRODUCT_BUNDLE_LAYOUT_CSS}${FLOATING_PRODUCT_BUNDLE_PRODUCTS_CSS}`,
    background,
    defaultBackgroundChannels: showBannerImage
      ? undefined
      : ARCHIVE_SAGE_BACKGROUND_CHANNELS,
  });
  const title =
    headingResolved.text.length > 0 ? headingResolved.text : '🌱 Start Strong Kit';
  const promoHtml = promoBody.html;
  const cartButton = resolveArchiveButton(
    button ??
      (buttons != null
        ? { ...buttons, buttonText: buttons.buttonText ?? buttons.addToCartLabel }
        : undefined),
    { defaultText: 'Add kit to cart', requireHref: false },
  );
  const bundleButtonColors = resolveBundleButtonColors(cartButton.colors, showBannerImage);
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const slots = bundleProductSlots(products);
  const productCount = slots.length;
  const bundleSliderId = `bfb-products-${reactId}`;
  const clampedProductIndex = Math.min(productIndex, Math.max(0, productCount - 1));
  const multiProduct = productCount > 1;
  const desktopScroll = productCount > BUNDLE_DESKTOP_SCROLL_THRESHOLD;
  const showProductCounter = multiProduct;

  useEffect(() => {
    setProductIndex(0);

    const frameId = requestAnimationFrame(() => {
      const strip = productStripRef.current;

      if (strip != null) {
        strip.scrollLeft = 0;
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [productCount]);

  const { setItemRef } = useCarouselScrollSync(
    productStripRef,
    productCount,
    setProductIndex,
    multiProduct,
    { scrollInline: 'start' },
  );

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
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="relative">
            <div
              className={clsx(
                'banner bfb-banner relative w-full',
                showBannerImage && 'bfb-banner--has-image',
              )}
            >
              {showBannerImage ? (
                <>
                  <div className="banner__media block h-full w-full overflow-hidden">
                    <picture className="media relative block h-full w-full overflow-hidden">
                      <img
                        alt={banner?.imageAlt?.trim() ?? ''}
                        className="absolute inset-0 block h-full w-full object-cover object-center"
                        decoding="async"
                        height={1200}
                        loading="lazy"
                        src={bannerSrc}
                        width={2000}
                      />
                    </picture>
                  </div>
                  <span className="banner__overlay pointer-events-none absolute inset-0" />
                </>
              ) : null}

              <div
                className={clsx(
                  'banner__content z-1 w-full',
                  showBannerImage
                    ? 'relative overflow-x-clip overflow-y-visible'
                    : 'relative overflow-visible',
                )}
              >
                <div className="page-width w-full px-4 sm:px-5 md:px-0">
                  <div className="bfb-banner__inner">
                    <div className="bfb-promo text-center">
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

                    <ScrollReveal
                      className="bfb-products-col w-full min-w-0 max-w-full"
                      delayMs={100}
                    >
                      <div
                        className={clsx(
                          'bfb-product-carousel-host w-full min-w-0 max-w-full',
                          multiProduct && 'bfb-product-carousel-host--peek overflow-x-clip',
                          desktopScroll && 'bfb-product-carousel-host--scroll',
                        )}
                      >
                        <div
                          aria-label={
                            multiProduct ? 'Bundle products. Scroll to browse.' : undefined
                          }
                          className={clsx(
                            'bfb-product-strip touch-pan-x overscroll-x-contain scroll-smooth',
                            multiProduct && 'bfb-product-strip--peek-carousel',
                            productCount === 1 && 'bfb-product-strip--single',
                            productCount > 1 &&
                              productCount <= BUNDLE_DESKTOP_SCROLL_THRESHOLD &&
                              'bfb-product-strip--desktop-static',
                            desktopScroll && 'bfb-product-strip--desktop-scroll',
                          )}
                          id={bundleSliderId}
                          ref={productStripRef}
                          role={multiProduct ? 'region' : undefined}
                          tabIndex={multiProduct ? 0 : undefined}
                        >
                          {slots.length === 0 ? (
                            <p className="subtext-md py-10 text-center text-contrast-500">
                              Add catalog products for this bundle in Makeswift.
                            </p>
                          ) : (
                            slots.map((p, i) => (
                              <Fragment key={`bfb-slot-${String(i)}`}>
                                {i > 0 ? (
                                  <div
                                    aria-hidden
                                    className="bfb-bundle-plus flex shrink-0 items-center justify-center"
                                  >
                                    <BundlePlusDivider />
                                  </div>
                                ) : null}
                                <div
                                  className="bfb-product-slide relative min-w-0"
                                  ref={(el) => {
                                    setItemRef(el, i);
                                  }}
                                >
                                  <DiabetesCareCatalogProductCard entityId={p.entityId} />
                                </div>
                              </Fragment>
                            ))
                          )}
                        </div>

                        {showProductCounter ? (
                          <p
                            aria-live="polite"
                            className="text-opacity mt-2 text-center text-sm tabular-nums"
                          >
                            Product {clampedProductIndex + 1} of {productCount}
                          </p>
                        ) : null}
                      </div>

                      {slots.length > 0 ? (
                        <ArchiveShopifyButton
                          as="button"
                          className="button--secondary w-full max-w-full md:max-w-sm"
                          colors={bundleButtonColors}
                          data-product-bundle-submit=""
                          type="button"
                          variant="secondary"
                        >
                          {cartButton.text}
                          <span className="btn-loader">
                            <span />
                            <span />
                            <span />
                          </span>
                        </ArchiveShopifyButton>
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
