import 'server-only';

import { BigCommerceGQLError, removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import type Stripe from 'stripe';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { PricingFragment } from '~/client/fragments/pricing';
import {
  parseProductOptionSelectionsFromMetadata,
  parseVariantEntityIdFromMetadata,
  type ProductOptionSelection,
} from '~/lib/bigcommerce/product-options';
import { addShippingCost } from '~/app/[locale]/(default)/cart/_actions/add-shipping-cost';
import {
  addCheckoutShippingConsignments,
} from '~/app/[locale]/(default)/cart/_actions/add-shipping-info';
import { getCart, getShippingCountries } from '~/app/[locale]/(default)/cart/page-data';
import { addCheckoutBillingAddress } from '~/lib/checkout/billing-address';
import { pickSubscriptionShippingOption } from '~/lib/checkout/shipping-option-filters';
import {
  buildStatesByCountry,
  resolveStateOrProvinceCode,
} from '~/lib/checkout/resolve-state-or-province';
import { resolveShippingStateOrProvince } from '~/lib/checkout/resolve-shipping-state';
import { allocateAmountBySubtotal } from '~/lib/checkout/tax-allocation';
import { bigCommerceAdminFetch, isBigCommerceAdminConfigured } from '~/lib/bigcommerce/rest';
import { createCart } from '~/lib/cart/create-cart';
import { getPreferredCurrencyCode } from '~/lib/currency';

import type { CheckoutAddressSnapshot, CheckoutConsignmentAddressInput } from '../checkout/types';

export interface SubscriptionBillingQuote {
  inStock: boolean;
  currency: string;
  quantity: number;
  /** Line subtotal excluding tax, in cents. */
  unitAmountExTax: number;
  /** Line total including tax, in cents. */
  unitAmountIncTax: number;
  /** Tax amount for the line, in cents. */
  taxAmount: number;
  /** Per-unit ex-tax amount in cents. */
  unitAmountExTaxPerUnit: number;
}

interface AdminCatalogVariant {
  id: number;
  inventory_level?: number;
  option_values?: Array<{ id: number; option_id: number }>;
  price?: number;
  sale_price?: number | null;
  calculated_price?: number;
}

interface AdminCatalogProduct {
  id: number;
  inventory_level?: number;
  inventory_tracking?: 'none' | 'product' | 'variant';
  availability?: string;
  variants?: AdminCatalogVariant[];
}

const SubscriptionProductQuoteQuery = graphql(
  `
    query SubscriptionProductQuoteQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
      $currencyCode: currencyCode
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          entityId
          sku
          inventory {
            isInStock
            hasVariantInventory
          }
          variants(first: 50) {
            edges {
              node {
                entityId
                sku
              }
            }
          }
          ...PricingFragment
        }
      }
    }
  `,
  [PricingFragment],
);

async function normalizeQuoteAddressForCheckout(
  address: CheckoutAddressSnapshot,
): Promise<CheckoutAddressSnapshot> {
  const shippingCountries = await getShippingCountries();
  const statesByCountry = buildStatesByCountry(shippingCountries);
  const resolvedState = resolveStateOrProvinceCode(
    address.countryCode,
    address.stateOrProvince,
    statesByCountry,
  );

  return {
    ...address,
    stateOrProvince: resolvedState.stateOrProvince ?? address.stateOrProvince,
    stateOrProvinceCode: resolvedState.stateOrProvinceCode ?? address.stateOrProvinceCode,
  };
}

async function getCustomerQuoteAddress(customerId: number): Promise<CheckoutAddressSnapshot> {
  const customer = await bigCommerceAdminFetch<{
    email: string;
    first_name: string;
    last_name: string;
  }>(`/v2/customers/${customerId}`);

  const addresses = await bigCommerceAdminFetch<
    Array<{
      first_name?: string;
      last_name?: string;
      company?: string;
      street_1?: string;
      street_2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country_iso2?: string;
      phone?: string;
    }>
  >(`/v2/customers/${customerId}/addresses`);

  const address = addresses?.[0];

  return {
    firstName: address?.first_name || customer.first_name || 'Customer',
    lastName: address?.last_name || customer.last_name || 'Subscriber',
    email: customer.email,
    company: address?.company,
    address1: address?.street_1 || 'Subscription',
    address2: address?.street_2,
    city: address?.city || 'N/A',
    stateOrProvince: address?.state,
    countryCode: address?.country_iso2 || 'CA',
    postalCode: address?.zip || '00000',
    phone: address?.phone,
  };
}

function findMatchingVariant(
  product: AdminCatalogProduct,
  productOptions: ProductOptionSelection[],
): AdminCatalogVariant | undefined {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return undefined;
  }

  if (productOptions.length === 0) {
    return variants[0];
  }

  const selectedValueIds = new Set(productOptions.map((option) => option.valueEntityId));

  return variants.find((variant) => {
    const optionValues = variant.option_values ?? [];

    if (optionValues.length !== productOptions.length) {
      return false;
    }

    return optionValues.every((value) => selectedValueIds.has(value.id));
  });
}

function isCatalogProductInStock(
  product: AdminCatalogProduct,
  variant: AdminCatalogVariant | undefined,
  quantity: number,
): boolean {
  if (product.availability === 'disabled') {
    return false;
  }

  if (product.inventory_tracking === 'none') {
    return true;
  }

  const inventoryLevel =
    product.inventory_tracking === 'variant'
      ? (variant?.inventory_level ?? 0)
      : (product.inventory_level ?? 0);

  return inventoryLevel >= quantity;
}

async function fetchCatalogProductState({
  productEntityId,
  productOptions,
}: {
  productEntityId: number;
  productOptions: ProductOptionSelection[];
}): Promise<{ inStock: boolean; unitPrice: number; currency: string } | null> {
  if (!isBigCommerceAdminConfigured()) {
    return null;
  }

  try {
    const product = await bigCommerceAdminFetch<AdminCatalogProduct>(
      `/v3/catalog/products/${productEntityId}?include=variants`,
    );

    const variant = findMatchingVariant(product, productOptions);

    if (!isCatalogProductInStock(product, variant, 1)) {
      return { inStock: false, unitPrice: 0, currency: 'CAD' };
    }

    const unitPrice =
      variant?.sale_price ??
      variant?.calculated_price ??
      variant?.price ??
      0;

    return {
      inStock: true,
      unitPrice,
      currency: 'CAD',
    };
  } catch {
    return null;
  }
}

async function tryGetCustomerQuoteAddress(
  customerId: number,
): Promise<CheckoutAddressSnapshot | null> {
  if (!isBigCommerceAdminConfigured()) {
    return null;
  }

  try {
    return await getCustomerQuoteAddress(customerId);
  } catch {
    return null;
  }
}

function resolveVariantEntityIdFromQuotedProduct(product: {
  sku?: string | null;
  inventory: { hasVariantInventory: boolean };
  variants?: {
    edges: Array<{ node: { entityId: number; sku: string } }> | null;
  } | null;
}): number | undefined {
  const variants = removeEdgesAndNodes(product.variants);

  if (variants.length === 0) {
    return undefined;
  }

  if (product.sku) {
    const matchedVariant = variants.find((variant) => variant.sku === product.sku);

    if (matchedVariant) {
      return matchedVariant.entityId;
    }
  }

  return variants[0]?.entityId;
}

function buildQuoteCartLineItem({
  productEntityId,
  productOptions,
  quantity,
  variantEntityId,
}: {
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  quantity: number;
  variantEntityId?: number;
}) {
  const optionValueIds = productOptions.map((option) => ({
    optionEntityId: option.optionEntityId,
    valueEntityId: option.valueEntityId,
  }));

  return {
    productEntityId,
    quantity,
    ...(variantEntityId != null ? { variantEntityId } : {}),
    ...(optionValueIds.length > 0
      ? {
          selectedOptions: {
            multipleChoices: optionValueIds.map((option) => ({
              optionEntityId: option.optionEntityId,
              optionValueEntityId: option.valueEntityId,
            })),
          },
        }
      : {}),
  };
}

function extractProductTaxFromCheckout({
  productSubtotal,
  shippingCost,
  checkoutTax,
}: {
  productSubtotal: number;
  shippingCost: number;
  checkoutTax: number;
}): number {
  if (checkoutTax <= 0 || shippingCost <= 0) {
    return checkoutTax;
  }

  const [productTax] = allocateAmountBySubtotal([productSubtotal, shippingCost], checkoutTax);

  return productTax;
}

async function buildQuoteConsignmentAddress(
  address: CheckoutAddressSnapshot,
): Promise<CheckoutConsignmentAddressInput> {
  return {
    countryCode: address.countryCode,
    city: address.city,
    postalCode: address.postalCode,
    stateOrProvince: await resolveShippingStateOrProvince(
      address.countryCode,
      address.stateOrProvince ?? address.stateOrProvinceCode,
    ),
  };
}

function formatQuoteError(error: unknown): Record<string, unknown> {
  if (error instanceof BigCommerceGQLError) {
    return {
      errorType: 'BigCommerceGQLError',
      messages: error.errors.map(({ message }) => message),
    };
  }

  if (error instanceof Error) {
    return {
      errorType: error.name,
      message: error.message,
    };
  }

  return {
    errorType: typeof error,
    message: String(error),
  };
}

function formatQuoteAddressForLog(address: CheckoutAddressSnapshot): string {
  return [
    address.city,
    address.stateOrProvince ?? address.stateOrProvinceCode,
    address.postalCode,
    address.countryCode,
  ]
    .filter(Boolean)
    .join(', ');
}

function logQuoteCheckoutStep(
  step: string,
  details: Record<string, unknown>,
  level: 'info' | 'warn' | 'error' = 'warn',
): void {
  const message = `[subscription-billing-quote] ${step}`;

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(message, details);
    return;
  }

  if (level === 'info') {
    // eslint-disable-next-line no-console
    console.info(message, details);
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(message, details);
}

async function quoteCheckoutTaxTotals({
  productEntityId,
  productOptions,
  quantity,
  quoteAddress,
  variantEntityId,
}: {
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  quantity: number;
  quoteAddress: CheckoutAddressSnapshot;
  variantEntityId?: number;
}): Promise<{
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  currencyCode: string;
} | null> {
  const quoteContext = {
    productEntityId,
    quantity,
    variantEntityId,
    optionCount: productOptions.length,
    address: formatQuoteAddressForLog(quoteAddress),
  };

  logQuoteCheckoutStep('quoteCheckoutTaxTotals: start', quoteContext, 'info');

  try {
    const createResponse = await createCart({
      lineItems: [
        buildQuoteCartLineItem({
          productEntityId,
          productOptions,
          quantity,
          variantEntityId,
        }),
      ],
    });

    const cartEntityId = createResponse.data.cart.createCart?.cart?.entityId;
    const createdCartData = cartEntityId ? await getCart({ cartId: cartEntityId }) : null;
    const createdCart = createdCartData?.site.cart;
    const consignmentLineItems = createdCart
      ? [...createdCart.lineItems.physicalItems, ...createdCart.lineItems.digitalItems]
          .filter((item) => !item.parentEntityId)
          .map((item) => ({
            lineItemEntityId: item.entityId,
            quantity: item.quantity,
          }))
      : [];

    if (!cartEntityId || consignmentLineItems.length === 0) {
      logQuoteCheckoutStep('quoteCheckoutTaxTotals: failed at createCart', {
        ...quoteContext,
        cartEntityId: cartEntityId ?? null,
        lineItemCount: consignmentLineItems.length,
      });

      return null;
    }

    logQuoteCheckoutStep('quoteCheckoutTaxTotals: cart created', {
      ...quoteContext,
      cartEntityId,
      lineItemCount: consignmentLineItems.length,
      lineItemEntityIds: consignmentLineItems.map((item) => item.lineItemEntityId),
    });

    const normalizedQuoteAddress = await normalizeQuoteAddressForCheckout(quoteAddress);
    const consignmentAddress = await buildQuoteConsignmentAddress(normalizedQuoteAddress);

    logQuoteCheckoutStep('quoteCheckoutTaxTotals: address normalized', {
      ...quoteContext,
      cartEntityId,
      normalizedAddress: formatQuoteAddressForLog(normalizedQuoteAddress),
      consignmentAddress,
      stateOrProvinceCode: normalizedQuoteAddress.stateOrProvinceCode ?? null,
    });

    const shippingCheckout = await addCheckoutShippingConsignments({
      checkoutEntityId: cartEntityId,
      address: consignmentAddress,
      lineItems: consignmentLineItems,
      skipCacheRevalidation: true,
    });

    const consignment = shippingCheckout?.shippingConsignments?.[0];
    const availableShippingOptions = consignment?.availableShippingOptions ?? [];
    const shippingOption = pickSubscriptionShippingOption(availableShippingOptions);

    if (!consignment?.entityId || !shippingOption?.entityId) {
      logQuoteCheckoutStep('quoteCheckoutTaxTotals: failed at shipping consignment', {
        ...quoteContext,
        cartEntityId,
        consignmentEntityId: consignment?.entityId ?? null,
        shippingOptionCount: availableShippingOptions.length,
        shippingOptions: availableShippingOptions.map((option) => ({
          entityId: option.entityId,
          description: option.description,
          cost: option.cost?.value ?? null,
          isRecommended: option.isRecommended ?? false,
        })),
      });

      return null;
    }

    logQuoteCheckoutStep('quoteCheckoutTaxTotals: shipping option selected', {
      ...quoteContext,
      cartEntityId,
      consignmentEntityId: consignment.entityId,
      shippingOptionEntityId: shippingOption.entityId,
      shippingDescription: shippingOption.description,
      shippingCost: shippingOption.cost?.value ?? null,
      isRecommended: shippingOption.isRecommended ?? false,
    });

    await addShippingCost({
      checkoutEntityId: cartEntityId,
      consignmentEntityId: consignment.entityId,
      shippingOptionEntityId: shippingOption.entityId,
      skipCacheRevalidation: true,
    });

    await addCheckoutBillingAddress({
      checkoutEntityId: cartEntityId,
      address: normalizedQuoteAddress,
      skipCacheRevalidation: true,
    });

    const cartData = await getCart({ cartId: cartEntityId });
    const checkout = cartData.site.checkout;

    if (!checkout?.subtotal || !checkout.grandTotal) {
      logQuoteCheckoutStep('quoteCheckoutTaxTotals: failed at readCheckoutTotals', {
        ...quoteContext,
        cartEntityId,
        hasCheckout: Boolean(checkout),
        subtotal: checkout?.subtotal?.value ?? null,
        taxTotal: checkout?.taxTotal?.value ?? null,
        grandTotal: checkout?.grandTotal?.value ?? null,
      });

      return null;
    }

    const productSubtotal = checkout.subtotal.value;
    const shippingCost =
      checkout.shippingCostTotal?.value ??
      checkout.shippingConsignments?.[0]?.selectedShippingOption?.cost?.value ??
      shippingOption.cost?.value ??
      0;
    const checkoutTax = checkout.taxTotal?.value ?? 0;
    const productTax = extractProductTaxFromCheckout({
      productSubtotal,
      shippingCost,
      checkoutTax,
    });

    const totals = {
      subtotal: productSubtotal,
      taxTotal: productTax,
      grandTotal: productSubtotal + productTax,
      currencyCode:
        checkout.grandTotal.currencyCode ??
        checkout.subtotal.currencyCode ??
        createdCart?.currencyCode ??
        'USD',
    };

    logQuoteCheckoutStep('quoteCheckoutTaxTotals: success', {
      ...quoteContext,
      cartEntityId,
      ...totals,
      checkoutTax,
      shippingCost,
    }, 'info');

    return totals;
  } catch (error) {
    logQuoteCheckoutStep(
      'quoteCheckoutTaxTotals: unexpected error',
      {
        ...quoteContext,
        ...formatQuoteError(error),
      },
      'error',
    );

    return null;
  }
}

export async function resolveSubscriptionBillingQuote({
  customerId,
  productEntityId,
  productOptions,
  quantity,
  billingAddress,
  variantEntityId: variantEntityIdFromContext,
  forPortalDisplay = false,
}: {
  customerId: number;
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  quantity: number;
  billingAddress?: CheckoutAddressSnapshot;
  variantEntityId?: number;
  forPortalDisplay?: boolean;
}): Promise<SubscriptionBillingQuote | null> {
  const currencyCode = await getPreferredCurrencyCode();
  const optionValueIds = productOptions.map((option) => ({
    optionEntityId: option.optionEntityId,
    valueEntityId: option.valueEntityId,
  }));

  const catalogState = await fetchCatalogProductState({ productEntityId, productOptions });

  if (catalogState && !catalogState.inStock && !forPortalDisplay) {
    return {
      inStock: false,
      currency: currencyCode,
      quantity,
      unitAmountExTax: 0,
      unitAmountIncTax: 0,
      taxAmount: 0,
      unitAmountExTaxPerUnit: 0,
    };
  }

  const { data } = await client.fetch({
    document: SubscriptionProductQuoteQuery,
    variables: {
      entityId: productEntityId,
      optionValueIds: optionValueIds.length > 0 ? optionValueIds : undefined,
      useDefaultOptionSelections: optionValueIds.length === 0,
      currencyCode,
    },
    fetchOptions: { cache: 'no-store' },
  });

  const product = data.site.product;
  const inStock = product?.inventory.isInStock ?? catalogState?.inStock ?? false;

  if (!product) {
    return null;
  }

  if (!inStock && !forPortalDisplay) {
    return {
      inStock: false,
      currency: currencyCode,
      quantity,
      unitAmountExTax: 0,
      unitAmountIncTax: 0,
      taxAmount: 0,
      unitAmountExTaxPerUnit: 0,
    };
  }

  const quoteAddress = billingAddress ?? (await tryGetCustomerQuoteAddress(customerId));
  const variantEntityId =
    variantEntityIdFromContext ??
    (product ? resolveVariantEntityIdFromQuotedProduct(product) : undefined);
  const checkoutTotals = quoteAddress
    ? await quoteCheckoutTaxTotals({
        productEntityId,
        productOptions,
        quantity,
        quoteAddress,
        variantEntityId,
      })
    : null;

  if (checkoutTotals) {
    const unitAmountExTax = Math.round(checkoutTotals.subtotal * 100);
    const taxAmount = Math.round(checkoutTotals.taxTotal * 100);
    const unitAmountIncTax = unitAmountExTax + taxAmount;
    const quoteCurrency =
      currencyCode ?? checkoutTotals.currencyCode ?? product.prices?.price.currencyCode ?? 'USD';

    logQuoteCheckoutStep('resolveSubscriptionBillingQuote: using checkout quote', {
      customerId,
      productEntityId,
      quantity,
      unitAmountExTax,
      taxAmount,
      unitAmountIncTax,
      currencyCode: quoteCurrency,
    }, 'info');

    return {
      inStock,
      currency: quoteCurrency,
      quantity,
      unitAmountExTax,
      unitAmountIncTax,
      taxAmount,
      unitAmountExTaxPerUnit: Math.round((checkoutTotals.subtotal / quantity) * 100),
    };
  }

  const unitPrice = product.prices?.salePrice?.value ?? product.prices?.price.value ?? 0;
  const unitAmountExTaxPerUnit = Math.round(unitPrice * 100);
  const unitAmountExTax = unitAmountExTaxPerUnit * quantity;
  const quoteCurrency = currencyCode ?? product.prices?.price.currencyCode ?? 'USD';

  logQuoteCheckoutStep('resolveSubscriptionBillingQuote: falling back to catalog price', {
    customerId,
    productEntityId,
    quantity,
    hasQuoteAddress: Boolean(quoteAddress),
    unitAmountExTax,
    taxAmount: 0,
    currencyCode: quoteCurrency,
  });

  return {
    inStock,
    currency: quoteCurrency,
    quantity,
    unitAmountExTax,
    unitAmountIncTax: unitAmountExTax,
    taxAmount: 0,
    unitAmountExTaxPerUnit,
  };
}

export function parseSubscriptionBillingContext(metadata: Stripe.Metadata | null | undefined): {
  customerId: number;
  productEntityId: number;
  productOptions: ProductOptionSelection[];
  quantity: number;
  variantEntityId?: number;
} | null {
  const customerId = Number(metadata?.bigcommerce_customer_id);
  const productEntityId = Number(metadata?.bigcommerce_product_id);
  const quantity = Number(metadata?.subscription_quantity ?? '1');

  if (!Number.isFinite(customerId) || !Number.isFinite(productEntityId)) {
    return null;
  }

  return {
    customerId,
    productEntityId,
    productOptions: parseProductOptionSelectionsFromMetadata(
      metadata?.bigcommerce_product_options,
    ),
    quantity: Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1,
    variantEntityId: parseVariantEntityIdFromMetadata(metadata ?? undefined),
  };
}
