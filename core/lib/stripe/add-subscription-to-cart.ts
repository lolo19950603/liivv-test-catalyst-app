import 'server-only';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { TAGS } from '~/client/tags';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { parseProductOptionSelectionsFromFormData } from '~/lib/bigcommerce/product-options';
import { findMatchingCartLineItem } from '~/lib/checkout/find-cart-line-item';
import { mapCartSelectedOptionsToProductOptions } from '~/lib/checkout/map-cart-options';
import {
  addSubscriptionLineToCart,
  buildSubscriptionLineMeta,
} from '~/lib/checkout/subscription-lines';
import { addToOrCreateCart } from '~/lib/cart';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { isStripeConfigured } from './client';

const ProductSubscriptionCartQuery = graphql(
  `
    query ProductSubscriptionCartQuery(
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
          name
          sku
          ...PricingFragment
        }
      }
    }
  `,
  [PricingFragment],
);

export async function addSubscriptionProductToCart(formData: FormData): Promise<void> {
  const t = await getTranslations('Subscribe');

  if (!isStripeConfigured()) {
    throw new Error(t('errors.notConfigured'));
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  const productEntityId = Number(formData.get('productEntityId'));

  if (!Number.isFinite(productEntityId)) {
    throw new Error(t('errors.invalidPlan'));
  }

  if (formData.get('subscriptionPriceConsent') !== '1') {
    throw new Error(t('errors.priceConsentRequired'));
  }

  const productOptions = parseProductOptionSelectionsFromFormData(formData);
  const optionValueIds = productOptions.map((option) => ({
    optionEntityId: option.optionEntityId,
    valueEntityId: option.valueEntityId,
  }));
  const currencyCode = await getPreferredCurrencyCode();

  const { data } = await client.fetch({
    document: ProductSubscriptionCartQuery,
    variables: {
      entityId: productEntityId,
      optionValueIds: optionValueIds.length > 0 ? optionValueIds : undefined,
      useDefaultOptionSelections: optionValueIds.length === 0,
      currencyCode,
    },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  const product = data.site.product;

  if (!product) {
    throw new Error(t('errors.invalidPlan'));
  }

  const currency = product.prices?.price.currencyCode ?? currencyCode ?? 'USD';

  const { getSubscriptionBillingIntervals, resolveSelectedSubscriptionBillingInterval } =
    await import('./subscription-interval');
  const { parseSubscriptionStartDateInput } = await import('./subscription-start-date');

  const billingInterval = resolveSelectedSubscriptionBillingInterval(
    formData.get('subscriptionInterval'),
    getSubscriptionBillingIntervals(),
  );

  const billingCycleAnchor = parseSubscriptionStartDateInput(
    formData.get('subscriptionStartDate'),
  );

  const rawQuantity = Number(formData.get('quantity'));
  const quantity =
    Number.isFinite(rawQuantity) && rawQuantity > 0 ? Math.floor(rawQuantity) : 1;

  const { cartId, lineItems: cartItems } = await addToOrCreateCart({
    lineItems: [
      {
        productEntityId,
        quantity,
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
      },
    ],
  });

  const matchedLine = findMatchingCartLineItem(cartItems, product.entityId, productOptions);
  const resolvedProductOptions = matchedLine
    ? mapCartSelectedOptionsToProductOptions(matchedLine.selectedOptions)
    : productOptions;

  await addSubscriptionLineToCart(
    cartId,
    buildSubscriptionLineMeta({
      productEntityId: product.entityId,
      sku: product.sku ?? '',
      productName: product.name,
      productOptions:
        resolvedProductOptions.length > 0 ? resolvedProductOptions : productOptions,
      billingInterval,
      billingCycleAnchor,
      unitAmount: 0,
      currency,
      cartLineItemEntityId: matchedLine?.entityId,
      quantity,
    }),
  );

  revalidateTag(TAGS.cart, { expire: 0 });
}
