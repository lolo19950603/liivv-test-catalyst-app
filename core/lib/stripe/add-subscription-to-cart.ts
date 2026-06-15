import 'server-only';

import { getLocale, getTranslations } from 'next-intl/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql } from '~/client/graphql';
import { parseProductOptionSelectionsFromFormData } from '~/lib/bigcommerce/product-options';
import {
  addSubscriptionLineToCart,
  buildSubscriptionLineMeta,
} from '~/lib/checkout/subscription-lines';
import { addToOrCreateCart, getCartId } from '~/lib/cart';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { redirect as appRedirect } from '~/i18n/routing';

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

export async function addSubscriptionProductToCart(
  formData: FormData,
  { loginRedirectTo }: { loginRedirectTo: string },
): Promise<void> {
  const locale = await getLocale();
  const t = await getTranslations('Subscribe');

  if (!isStripeConfigured()) {
    throw new Error(t('errors.notConfigured'));
  }

  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!customerAccessToken) {
    appRedirect({ href: `/login?redirectTo=${encodeURIComponent(loginRedirectTo)}`, locale });
  }

  const productEntityId = Number(formData.get('productEntityId'));

  if (!Number.isFinite(productEntityId)) {
    throw new Error(t('errors.invalidPlan'));
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

  const priceValue = product.prices?.salePrice?.value ?? product.prices?.price.value;
  const currency = product.prices?.price.currencyCode ?? currencyCode;
  const unitAmount = Math.round((priceValue ?? 0) * 100);

  if (!unitAmount) {
    throw new Error(t('errors.unavailablePrice'));
  }

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

  await addToOrCreateCart({
    lineItems: [
      {
        productEntityId,
        quantity: 1,
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

  const cartId = await getCartId();

  if (!cartId) {
    throw new Error(t('errors.invalidPlan'));
  }

  await addSubscriptionLineToCart(
    cartId,
    buildSubscriptionLineMeta({
      productEntityId: product.entityId,
      sku: product.sku ?? '',
      productName: product.name,
      productOptions,
      billingInterval,
      billingCycleAnchor,
      unitAmount,
      currency,
    }),
  );

  appRedirect({ href: '/cart/', locale });
}
