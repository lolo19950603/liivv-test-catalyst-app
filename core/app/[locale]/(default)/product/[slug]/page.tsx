import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchParams } from 'nuqs/server';
import type { CSSProperties } from 'react';
import { Suspense } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { FeaturedProductCarousel } from '@/vibes/soul/sections/featured-product-carousel';
import { auth, getSessionCustomerAccessToken } from '~/auth';
import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { productCardTransformer } from '~/data-transformers/product-card-transformer';
import { productOptionsTransformer } from '~/data-transformers/product-options-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import {
  CuratedKitCustomizer,
  type CuratedKitProduct,
  type CuratedKitSuggestedProduct,
} from '~/components/curated-kit-customizer';
import { getFeaturedProducts } from '~/client/queries/get-products';
import {
  isCuratedKitFromProductConnection,
  KIT_TYPE_FIELD,
  KIT_VARIANTS_FIELD,
  parseKitVariantOverridesFromConnection,
  resolveKitComponentVariantSelection,
} from '~/lib/kit';
import { getMakeswiftPageMetadata } from '~/lib/makeswift';
import { ProductDetail } from '~/lib/makeswift/components/product-detail';
import { Slot } from '~/lib/makeswift/slot';
import { getRecaptchaSiteKey } from '~/lib/recaptcha';
import { getMetadataAlternates } from '~/lib/seo/canonical';
import { isStripeConfigured } from '~/lib/stripe';
import {
  formatSubscriptionIntervalKey,
  getSubscriptionBillingIntervals,
  type SubscriptionBillingInterval,
} from '~/lib/stripe/subscription-interval';
import {
  getDefaultSubscriptionStartDateValue,
  getMaxSubscriptionStartDateValue,
  getMinSubscriptionStartDateValue,
} from '~/lib/stripe/subscription-start-date';

import './product-page-feel.css';
import './product-related-products.css';
import './product-reviews.css';

import { addToCart } from './_actions/add-to-cart';
import { getMoreProductImages } from './_actions/get-more-images';
import { submitReview } from './_actions/submit-review';
import { ProductAnalyticsProvider } from './_components/product-analytics-provider';
import { ProductSchema } from './_components/product-schema';
import { ProductViewed } from './_components/product-viewed';
import { Reviews } from './_components/reviews';
import { WishlistButton } from './_components/wishlist-button';
import { WishlistButtonForm } from './_components/wishlist-button/form';
import {
  getKitComponentConfiguredPrices,
  getKitComponentProducts,
  getProduct,
  getProductPageMetadata,
  getProductPricingAndRelatedProducts,
  getStreamableInventorySettingsQuery,
  getStreamableProduct,
  getStreamableProductInventory,
  getStreamableProductVariantInventory,
} from './page-data';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<SearchParams>;
}

function formatSubscriptionIntervalOption(
  interval: SubscriptionBillingInterval,
  t: Awaited<ReturnType<typeof getTranslations<'Subscribe'>>>,
) {
  const label =
    interval.intervalCount === 1
      ? t(`intervals.${interval.interval}` as 'intervals.month')
      : t(`intervals.${interval.interval}Plural` as 'intervals.monthPlural', {
          count: interval.intervalCount,
        });

  return {
    value: formatSubscriptionIntervalKey(interval),
    label,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const productId = Number(slug);

  const product = await getProductPageMetadata(productId, customerAccessToken);

  if (!product) {
    return notFound();
  }

  const makeswiftMetadata = await getMakeswiftPageMetadata({ path: product.path, locale });

  const { pageTitle, metaDescription, metaKeywords } = product.seo;
  const { url, altText: alt } = product.defaultImage || {};

  return {
    title: makeswiftMetadata?.title || pageTitle || product.name,
    description:
      makeswiftMetadata?.description ||
      metaDescription ||
      `${product.plainTextDescription.replaceAll(/\s+/g, ' ').trim().slice(0, 150)}...`,
    ...(metaKeywords && { keywords: metaKeywords.split(',') }),
    alternates: await getMetadataAlternates({ path: product.path, locale }),
    ...(url && { openGraph: { images: [{ url, alt }] } }),
  };
}

export default async function Product({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  const detachedWishlistFormId = 'product-add-to-wishlist-form';

  setRequestLocale(locale);

  const t = await getTranslations('Product');
  const format = await getFormatter();

  const productId = Number(slug);

  const [{ product: baseProduct, settings }, recaptchaSiteKey] = await Promise.all([
    getProduct(productId, customerAccessToken),
    getRecaptchaSiteKey(),
  ]);

  const reviewsEnabled = Boolean(settings?.reviews.enabled && !settings.display.showProductRating);
  const showRating = Boolean(settings?.reviews.enabled && settings.display.showProductRating);

  if (!baseProduct) {
    return notFound();
  }

  const streamableProduct = Streamable.from(async () => {
    const options = await searchParams;

    const optionValueIds = Object.keys(options)
      .map((option) => ({
        optionEntityId: Number(option),
        valueEntityId: Number(options[option]),
      }))
      .filter(
        (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
      );

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
    };

    const product = await getStreamableProduct(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductSku = Streamable.from(async () => (await streamableProduct).sku);

  const streamableProductInventory = Streamable.from(async () => {
    const variables = {
      entityId: Number(productId),
    };

    const product = await getStreamableProductInventory(variables, customerAccessToken);

    if (!product) {
      return notFound();
    }

    return product;
  });

  const streamableProductVariantInventory = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (!product.inventory.hasVariantInventory) {
      return undefined;
    }

    const variables = {
      productId,
      sku: product.sku,
    };

    const variants = await getStreamableProductVariantInventory(variables, customerAccessToken);

    if (!variants) {
      return undefined;
    }

    return removeEdgesAndNodes(variants).find((v) => v.sku === product.sku);
  });

  const streamableProductPricingAndRelatedProducts = Streamable.from(async () => {
    const options = await searchParams;

    const optionValueIds = Object.keys(options)
      .map((option) => ({
        optionEntityId: Number(option),
        valueEntityId: Number(options[option]),
      }))
      .filter(
        (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
      );

    const currencyCode = await getPreferredCurrencyCode();

    const variables = {
      entityId: Number(productId),
      optionValueIds,
      useDefaultOptionSelections: true,
      currencyCode,
    };

    return await getProductPricingAndRelatedProducts(variables, customerAccessToken);
  });

  const streamablePrices = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return null;
    }

    return pricesTransformer(product.prices, format) ?? null;
  });

  const streamableImages = Streamable.from(async () => {
    const product = await streamableProduct;

    const images = removeEdgesAndNodes(product.images)
      .filter((image) => image.url !== product.defaultImage?.url)
      .map((image) => ({
        src: image.url,
        alt: image.altText,
      }));

    return {
      images: product.defaultImage
        ? [{ src: product.defaultImage.url, alt: product.defaultImage.altText }, ...images]
        : images,
      pageInfo: product.images.pageInfo,
    };
  });

  const streameableCtaLabel = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return t('ProductDetails.Submit.unavailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('ProductDetails.Submit.preorder');
    }

    if (!product.inventory.isInStock) {
      return t('ProductDetails.Submit.outOfStock');
    }

    return t('ProductDetails.Submit.addToCart');
  });

  const streameableCtaDisabled = Streamable.from(async () => {
    const product = await streamableProductInventory;

    if (product.availabilityV2.status === 'Unavailable') {
      return true;
    }

    if (product.availabilityV2.status === 'Preorder') {
      return false;
    }

    if (!product.inventory.isInStock) {
      return true;
    }

    return false;
  });

  const streamableInventorySettings = Streamable.from(async () => {
    return await getStreamableInventorySettingsQuery(customerAccessToken);
  });

  const getBackorderAvailabilityPrompt = ({
    showBackorderAvailabilityPrompt,
    backorderAvailabilityPrompt,
    availableForBackorder,
    unlimitedBackorder,
  }: {
    showBackorderAvailabilityPrompt: boolean;
    backorderAvailabilityPrompt: string | null;
    availableForBackorder?: number | null;
    unlimitedBackorder?: boolean;
  }) => {
    if (!showBackorderAvailabilityPrompt || !backorderAvailabilityPrompt) {
      return null;
    }

    const hasBackorderAvailablity = !!availableForBackorder || unlimitedBackorder;

    if (!hasBackorderAvailablity) {
      return null;
    }

    return backorderAvailabilityPrompt;
  };

  const streamableStockDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    if (!inventorySetting) {
      return null;
    }

    let inventory;

    if (product.inventory.hasVariantInventory) {
      inventory = variant?.inventory;
    } else {
      inventory = product.inventory;
    }

    if (!inventory) {
      return null;
    }

    const {
      showOutOfStockMessage,
      stockLevelDisplay,
      defaultOutOfStockMessage,
      showBackorderAvailabilityPrompt,
      showBackorderMessage,
      showQuantityOnBackorder,
      backorderAvailabilityPrompt,
    } = inventorySetting;

    if (!inventory.isInStock) {
      return showOutOfStockMessage
        ? { stockLevelMessage: defaultOutOfStockMessage, backorderAvailabilityPrompt: null }
        : null;
    }

    const {
      availableToSell,
      warningLevel,
      availableOnHand,
      availableForBackorder,
      unlimitedBackorder,
    } = inventory.aggregated ?? {};

    if (stockLevelDisplay === 'DONT_SHOW') {
      return null;
    }

    const showsBackorderInfo =
      showBackorderAvailabilityPrompt || showBackorderMessage || showQuantityOnBackorder;

    // if no backorder info is to be displayed, then availableToSell is the stock quantity to be used
    const stockQuantity = showsBackorderInfo ? availableOnHand : availableToSell;

    if (!showsBackorderInfo && !stockQuantity) {
      return null;
    }

    if (stockLevelDisplay === 'SHOW_WHEN_LOW') {
      if (!warningLevel) {
        return null;
      }

      if (stockQuantity && stockQuantity > warningLevel) {
        return null;
      }
    }

    const availabilityMessage = getBackorderAvailabilityPrompt({
      showBackorderAvailabilityPrompt,
      backorderAvailabilityPrompt,
      availableForBackorder,
      unlimitedBackorder,
    });

    if (!availabilityMessage && stockQuantity === undefined) {
      return null;
    }

    return {
      stockLevelMessage: t('ProductDetails.currentStock', {
        quantity: stockQuantity ?? 0,
      }),
      backorderAvailabilityPrompt: availabilityMessage,
    };
  });

  const streamableBackorderDisplayData = Streamable.from(async () => {
    const [product, variant, inventorySetting] = await Streamable.all([
      streamableProductInventory,
      streamableProductVariantInventory,
      streamableInventorySettings,
    ]);

    let inventory;

    if (!product.inventory.hasVariantInventory) {
      inventory = product.inventory;
    } else {
      inventory = variant?.inventory;
    }

    if (!inventory?.aggregated || !inventorySetting) {
      return {
        availableOnHand: 0,
        availableForBackorder: 0,
        unlimitedBackorder: false,
        showQuantityOnBackorder: false,
        backorderMessage: null,
      };
    }

    const inventoryData = {
      availableOnHand: inventory.aggregated.availableOnHand,
      availableForBackorder: inventory.aggregated.availableForBackorder ?? 0,
      unlimitedBackorder: inventory.aggregated.unlimitedBackorder,
    };

    const { showQuantityOnBackorder, showBackorderMessage } = inventorySetting;

    const hasBackorderAvailablity =
      inventoryData.availableForBackorder > 0 || inventoryData.unlimitedBackorder;

    if (!hasBackorderAvailablity || !showBackorderMessage) {
      return {
        ...inventoryData,
        showQuantityOnBackorder: showQuantityOnBackorder && hasBackorderAvailablity,
        backorderMessage: null,
      };
    }

    let variantLocations;

    if (product.inventory.hasVariantInventory) {
      variantLocations = variant?.inventory?.byLocation;
    } else {
      const variants = removeEdgesAndNodes(product.variants);
      const baseVariant = variants.find((v) => v.sku === product.sku);

      variantLocations = baseVariant?.inventory?.byLocation;
    }

    if (!variantLocations) {
      return {
        ...inventoryData,
        showQuantityOnBackorder,
        backorderMessage: null,
      };
    }

    const inventoryByLocation = removeEdgesAndNodes(variantLocations).at(0);

    return {
      ...inventoryData,
      showQuantityOnBackorder,
      backorderMessage: inventoryByLocation?.backorderMessage || null,
    };
  });

  const isCuratedKit = isCuratedKitFromProductConnection(baseProduct);

  const streameableAccordions = Streamable.from(async () => {
    const product = await streamableProduct;

    const customFields = removeEdgesAndNodes(product.customFields).filter((field) => {
      const name = field.name.trim().toLowerCase();

      // Kit internals — never show on the storefront.
      if (name === KIT_TYPE_FIELD || name === KIT_VARIANTS_FIELD) {
        return false;
      }

      // Curated kits: hide all custom fields from specs.
      if (isCuratedKit) {
        return false;
      }

      return true;
    });

    const specifications = [
      {
        name: t('ProductDetails.Accordions.sku'),
        value: product.sku,
      },
      {
        name: t('ProductDetails.Accordions.weight'),
        value: `${product.weight?.value} ${product.weight?.unit}`,
      },
      {
        name: t('ProductDetails.Accordions.condition'),
        value: product.condition,
      },
      ...customFields.map((field) => ({
        name: field.name,
        value: field.value,
      })),
    ];

    return [
      ...(specifications.length
        ? [
            {
              title: t('ProductDetails.Accordions.specifications'),
              content: (
                <div className="prose @container">
                  <dl className="flex flex-col gap-4">
                    {specifications.map((field, index) => (
                      <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2" key={index}>
                        <dt>
                          <strong>{field.name}</strong>
                        </dt>
                        <dd>{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ),
            },
          ]
        : []),
      ...(product.warranty
        ? [
            {
              title: t('ProductDetails.Accordions.warranty'),
              content: (
                <div className="prose" dangerouslySetInnerHTML={{ __html: product.warranty }} />
              ),
            },
          ]
        : []),
    ];
  });

  const streameableRelatedProducts = Streamable.from(async () => {
    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return [];
    }

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);

    return productCardTransformer(relatedProducts, format);
  });

  const streamableKitProducts = Streamable.from(async (): Promise<CuratedKitProduct[]> => {
    if (!isCuratedKit) {
      return [];
    }

    const product = await streamableProductPricingAndRelatedProducts;

    if (!product) {
      return [];
    }

    const relatedProducts = removeEdgesAndNodes(product.relatedProducts);
    const entityIds = relatedProducts.map((related) => related.entityId);

    if (entityIds.length === 0) {
      return [];
    }

    const variantOverrides = parseKitVariantOverridesFromConnection(baseProduct);
    const currencyCode = await getPreferredCurrencyCode();
    const components = await getKitComponentProducts({
      entityIds,
      currencyCode,
      customerAccessToken,
    });

    // Preserve related-products order from the kit parent.
    const byId = new Map(components.map((component) => [component.entityId, component] as const));

    const kitProducts = (
      await Promise.all(
        entityIds.map(async (entityId): Promise<CuratedKitProduct | null> => {
          const component = byId.get(entityId);

          if (!component) {
            return null;
          }

          const options = removeEdgesAndNodes(component.productOptions).flatMap((option) => {
            if (option.__typename !== 'MultipleChoiceOption') {
              return [];
            }

            const values = removeEdgesAndNodes(option.values).map((value) => ({
              entityId: value.entityId,
              label: value.label,
              isDefault: value.isDefault,
            }));

            if (values.length === 0) {
              return [];
            }

            return [
              {
                entityId: option.entityId,
                displayName: option.displayName,
                isRequired: option.isRequired,
                values,
              },
            ];
          });

          const overrideSelection = await resolveKitComponentVariantSelection(
            entityId,
            variantOverrides,
          );

          const fallbackMultipleChoices = options.flatMap((option) => {
            const preferred =
              option.values.find((value) => value.isDefault) ?? option.values[0];

            if (!preferred) {
              return [];
            }

            return [
              {
                optionEntityId: option.entityId,
                optionValueEntityId: preferred.entityId,
              },
            ];
          });

          const selectedOptions =
            overrideSelection?.selectedOptions ??
            (fallbackMultipleChoices.length > 0
              ? { multipleChoices: fallbackMultipleChoices }
              : undefined);

          const optionValueIds = selectedOptions?.multipleChoices.map((choice) => ({
            optionEntityId: choice.optionEntityId,
            valueEntityId: choice.optionValueEntityId,
          }));

          const configuredPrices = await getKitComponentConfiguredPrices({
            entityId,
            optionValueIds,
            currencyCode,
            customerAccessToken,
          });

          const prices = configuredPrices ?? component.prices;
          const unitPrice = prices?.salePrice?.value ?? prices?.price.value ?? 0;
          const componentCurrency = prices?.price.currencyCode ?? 'USD';

          // Configured/variant prices should be a single amount — avoid range labels.
          const displayPrices =
            prices && prices.priceRange.min.value !== prices.priceRange.max.value
              ? {
                  ...prices,
                  priceRange: {
                    min: prices.price,
                    max: prices.price,
                  },
                }
              : prices;

          return {
            productEntityId: component.entityId,
            title: component.name,
            href: component.path,
            image: component.defaultImage
              ? { src: component.defaultImage.url, alt: component.defaultImage.altText }
              : undefined,
            price: pricesTransformer(displayPrices, format),
            unitPrice,
            currencyCode: componentCurrency,
            sku: component.sku,
            defaultQuantity: 1,
            options,
            ...(overrideSelection?.variantEntityId
              ? { variantEntityId: overrideSelection.variantEntityId }
              : {}),
            ...(selectedOptions ? { selectedOptions } : {}),
          };
        }),
      )
    ).filter((item): item is CuratedKitProduct => item != null);

    return kitProducts;
  });

  const streamableSuggestedKitProducts = Streamable.from(
    async (): Promise<CuratedKitSuggestedProduct[]> => {
      if (!isCuratedKit) {
        return [];
      }

      const kitProducts = await streamableKitProducts;
      const excludeIds = new Set(kitProducts.map((product) => product.productEntityId));
      excludeIds.add(baseProduct.entityId);

      const featured = await getFeaturedProducts({});

      if (featured.status !== 'success' || !featured.products) {
        return [];
      }

      return featured.products
        .filter((product) => !excludeIds.has(product.entityId))
        .slice(0, 6)
        .map((product) => {
          const optionEdges = product.productOptions?.edges ?? [];

          return {
            productEntityId: product.entityId,
            title: product.name,
            href: product.path,
            image: product.defaultImage
              ? { src: product.defaultImage.url, alt: product.defaultImage.altText }
              : undefined,
            price: pricesTransformer(product.prices, format),
            hasOptions: optionEdges.length > 0,
          } satisfies CuratedKitSuggestedProduct;
        });
    },
  );

  const streamableMinQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.minPurchaseQuantity;
  });

  const streamableMaxQuantity = Streamable.from(async () => {
    const product = await streamableProduct;

    return product.maxPurchaseQuantity;
  });

  const streamableAnalyticsData = Streamable.from(async () => {
    const [extendedProduct, pricingProduct] = await Streamable.all([
      streamableProduct,
      streamableProductPricingAndRelatedProducts,
    ]);

    return {
      id: extendedProduct.entityId,
      name: extendedProduct.name,
      sku: extendedProduct.sku,
      brand: extendedProduct.brand?.name ?? '',
      price: pricingProduct?.prices?.price.value ?? 0,
      currency: pricingProduct?.prices?.price.currencyCode ?? '',
    };
  });

  const streamableUser = Streamable.from(async () => {
    const session = await auth();
    const firstName = session?.user?.firstName ?? '';
    const lastName = session?.user?.lastName ?? '';

    if (!firstName || !lastName) {
      return { email: session?.user?.email ?? '', name: '' };
    }

    const lastInitial = lastName.charAt(0).toUpperCase();
    const obfuscatedName = `${firstName} ${lastInitial}.`;

    return { email: session?.user?.email ?? '', name: obfuscatedName };
  });

  const showPurchaseOptions = isStripeConfigured();
  const resolvedSearchParams = await searchParams;
  const defaultPurchaseType: 'one-time' | 'subscription' =
    resolvedSearchParams.purchaseType === 'subscription' ? 'subscription' : 'one-time';
  const subscribeT = await getTranslations('Subscribe');
  const subscriptionBillingIntervals = getSubscriptionBillingIntervals();
  const subscriptionIntervalOptions = subscriptionBillingIntervals.map((interval) =>
    formatSubscriptionIntervalOption(interval, subscribeT),
  );
  const pricingProduct = await streamableProductPricingAndRelatedProducts;
  const purchasePriceValue =
    pricingProduct?.prices?.salePrice?.value ?? pricingProduct?.prices?.price.value ?? 0;
  const purchaseCurrencyCode = pricingProduct?.prices?.price.currencyCode ?? 'USD';
  const purchaseOptions = showPurchaseOptions
    ? {
        title: t('ProductDetails.purchaseOptions.title'),
        oneTimeLabel: t('ProductDetails.purchaseOptions.oneTime'),
        subscribeLabel: t('ProductDetails.purchaseOptions.subscribeAndSave'),
        formattedPrice: format.number(purchasePriceValue, {
          style: 'currency',
          currency: purchaseCurrencyCode,
        }),
        deliverEveryLabel: t('ProductDetails.purchaseOptions.deliverEvery'),
        startDateLabel: t('ProductDetails.subscriptionStartDate'),
        startDateHint: t('ProductDetails.subscriptionStartDateHint'),
        intervalOptions: subscriptionIntervalOptions,
        startDateMin: getMinSubscriptionStartDateValue(),
        startDateMax: getMaxSubscriptionStartDateValue(),
        startDateDefault: getDefaultSubscriptionStartDateValue(),
        defaultInterval: formatSubscriptionIntervalKey(subscriptionBillingIntervals[0]!),
        defaultPurchaseType,
        priceConsentLabel: t('ProductDetails.purchaseOptions.priceConsent'),
        productPath: baseProduct.path,
      }
    : undefined;

  return (
    <>
      <Slot label="Product (all products) — top" snapshotId="product-page-top-content" />

      <div className="liivv-product-page-feel">
        <ProductAnalyticsProvider data={streamableAnalyticsData}>
          <ProductDetail
            action={addToCart}
            additionalActions={
              <WishlistButton
                formId={detachedWishlistFormId}
                productId={productId}
                productSku={streamableProductSku}
              />
            }
            additionalInformationTitle={t('ProductDetails.additionalInformation')}
            buyRowVariant="archive"
            ctaDisabled={streameableCtaDisabled}
            ctaLabel={streameableCtaLabel}
            decrementLabel={t('ProductDetails.decreaseQuantity')}
            emptySelectPlaceholder={t('ProductDetails.emptySelectPlaceholder')}
            fields={isCuratedKit ? [] : productOptionsTransformer(baseProduct.productOptions)}
            incrementLabel={t('ProductDetails.increaseQuantity')}
            loadMoreImagesAction={getMoreProductImages}
            prefetch={true}
            product={{
              id: baseProduct.entityId.toString(),
              title: baseProduct.name,
              description: (
                <div dangerouslySetInnerHTML={{ __html: baseProduct.description }} />
              ),
              href: baseProduct.path,
              images: streamableImages,
              price: streamablePrices,
              reviewsEnabled,
              showRating,
              numberOfReviews: baseProduct.reviewSummary.numberOfReviews,
              subtitle: baseProduct.brand?.name,
              rating: baseProduct.reviewSummary.averageRating,
              accordions: streameableAccordions,
              minQuantity: streamableMinQuantity,
              maxQuantity: streamableMaxQuantity,
              stockDisplayData: streamableStockDisplayData,
              backorderDisplayData: streamableBackorderDisplayData,
            }}
            productId={baseProduct.entityId}
            purchaseOptions={isCuratedKit ? undefined : purchaseOptions}
            purchaseSlot={
              isCuratedKit ? (
                <Stream
                  fallback={
                    <div className="py-8 text-sm text-[var(--contrast-500)]">Loading kit…</div>
                  }
                  value={Streamable.all([streamableKitProducts, streamableSuggestedKitProducts])}
                >
                  {([kitProducts, suggestedProducts]) => (
                    <Suspense
                      fallback={
                        <div className="py-8 text-sm text-[var(--contrast-500)]">Loading kit…</div>
                      }
                    >
                      <CuratedKitCustomizer
                        kitHref={baseProduct.path}
                        kitImage={
                          baseProduct.defaultImage
                            ? {
                                src: baseProduct.defaultImage.url,
                                alt: baseProduct.defaultImage.altText,
                              }
                            : undefined
                        }
                        kitName={baseProduct.name}
                        products={kitProducts}
                        suggestedProducts={suggestedProducts}
                      />
                    </Suspense>
                  )}
                </Stream>
              ) : undefined
            }
            quantityLabel={t('ProductDetails.quantity')}
            recaptchaSiteKey={recaptchaSiteKey}
            reviewFormAction={submitReview}
            showPurchaseOptions={isCuratedKit ? false : showPurchaseOptions}
            thumbnailLabel={t('ProductDetails.thumbnail')}
            user={streamableUser}
          />
        </ProductAnalyticsProvider>
      </div>

      {!isCuratedKit ? (
        <FeaturedProductCarousel
          appearance="liivv-archive"
          emptyStateSubtitle={t('RelatedProducts.browseCatalog')}
          emptyStateTitle={t('RelatedProducts.noRelatedProducts')}
          nextLabel={t('RelatedProducts.nextProducts')}
          previousLabel={t('RelatedProducts.previousProducts')}
          products={streameableRelatedProducts}
          scrollbarLabel={t('RelatedProducts.scrollbar')}
          title={t('RelatedProducts.title')}
        />
      ) : null}

      <Slot
        label="Product (all products) — between related and reviews"
        snapshotId="product-page-mid-content"
      />

      {showRating && (
        <div className="liivv-product-reviews dc-section-root max-w-full" id="reviews">
          <div
            className="shopify-section"
            id="liivv-product-reviews-section"
            style={
              {
                '--color-background': '245 242 237',
                '--section-padding-top': '52px',
                '--section-padding-bottom': '52px',
              } as CSSProperties
            }
          >
            <div className="section section--padding section--rounded relative">
              <div className="page-width relative">
                <Reviews
                  productId={productId}
                  recaptchaSiteKey={recaptchaSiteKey}
                  searchParams={searchParams}
                  streamableImages={streamableImages}
                  streamableProduct={streamableProduct}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Slot label="Product (all products) — bottom" snapshotId="product-page-bottom-content" />

      <Stream
        fallback={null}
        value={Streamable.from(async () =>
          Streamable.all([streamableProduct, streamableProductPricingAndRelatedProducts]),
        )}
      >
        {([extendedProduct, pricingProduct]) => (
          <>
            <ProductSchema
              product={{ ...extendedProduct, prices: pricingProduct?.prices ?? null }}
            />
            <ProductViewed
              product={{ ...extendedProduct, prices: pricingProduct?.prices ?? null }}
            />
          </>
        )}
      </Stream>

      <WishlistButtonForm
        formId={detachedWishlistFormId}
        productId={productId}
        productSku={streamableProductSku}
        searchParams={searchParams}
      />
    </>
  );
}
